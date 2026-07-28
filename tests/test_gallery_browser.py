import asyncio
import os
from urllib.parse import parse_qs, urlparse

import pytest
from playwright.async_api import expect, async_playwright


def optimized_image_width(url: str) -> int | None:
    if "/_next/image" not in url:
        return None

    width = parse_qs(urlparse(url).query).get("w", [None])[0]
    return int(width) if width and width.isdigit() else None


def optimized_image_source(url: str) -> str | None:
    if "/_next/image" not in url:
        return None

    return parse_qs(urlparse(url).query).get("url", [None])[0]


async def open_gallery_page(browser, base_url: str, *, save_data: bool = False):
    context = await browser.new_context(
        base_url=base_url,
        device_scale_factor=1,
        viewport={"width": 1280, "height": 900},
    )

    if save_data:
        await context.add_init_script(
            """
            Object.defineProperty(navigator, "connection", {
              configurable: true,
              value: { effectiveType: "4g", saveData: true },
            });
            """
        )

    page = await context.new_page()
    await page.goto("/galeria", wait_until="domcontentloaded")
    feed_photo = page.locator('[data-slot="gallery-feed-photo"]').first

    if await feed_photo.count() == 0:
        await context.close()
        pytest.skip("A galeria precisa ter ao menos uma imagem publicada")

    await expect(feed_photo).to_have_attribute(
        "data-image-state", "ready", timeout=120_000
    )
    feed_image = feed_photo.locator("img").first
    feed_source = await feed_image.evaluate("image => image.currentSrc")
    feed_width = optimized_image_width(feed_source)
    source_url = optimized_image_source(feed_source)

    assert feed_source
    assert feed_width
    assert source_url

    return context, page, feed_photo, feed_source, feed_width, source_url


@pytest.mark.browser
def test_gallery_reuses_cached_feed_image_while_high_resolution_loads():
    asyncio.run(_test_cached_preview_and_loading_state())


async def _test_cached_preview_and_loading_state():
    base_url = os.environ.get("PAYLOAD_TEST_BASE_URL", "http://localhost:3000")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context, page, feed_photo, feed_source, feed_width, source_url = (
            await open_gallery_page(browser, base_url)
        )
        large_requests: list[str] = []
        preview_response = await context.request.get(feed_source)
        assert preview_response.ok
        preview_body = await preview_response.body()
        preview_content_type = preview_response.headers.get(
            "content-type", "image/webp"
        )

        async def delay_large_variant(route):
            request_url = route.request.url
            request_width = optimized_image_width(request_url)

            if (
                optimized_image_source(request_url) == source_url
                and request_width
                and request_width > feed_width
            ):
                large_requests.append(request_url)
                await asyncio.sleep(0.7)
                await route.fulfill(
                    body=preview_body,
                    content_type=preview_content_type,
                    status=200,
                )
                return

            await route.continue_()

        await page.route("**/_next/image*", delay_large_variant)

        preview_delay_ms = await feed_photo.evaluate(
            """
            element => new Promise(resolve => {
              const startedAt = performance.now();
              const finish = () => {
                if (!document.querySelector('[data-slot="gallery-cached-preview"]')) {
                  return false;
                }

                resolve(performance.now() - startedAt);
                return true;
              };
              const observer = new MutationObserver(() => {
                if (finish()) observer.disconnect();
              });

              observer.observe(document.body, { childList: true, subtree: true });
              element.click();

              if (finish()) observer.disconnect();
            })
            """
        )
        preview = page.locator('[data-slot="gallery-cached-preview"]')
        await expect(preview).to_have_attribute("src", feed_source)
        assert preview_delay_ms < 100

        await page.wait_for_timeout(300)
        await expect(
            page.locator('[data-slot="gallery-viewer-loading"]')
        ).to_be_visible()

        high_resolution_image = page.locator(
            '[data-slot="gallery-photo-stage"] img[data-image-state]'
        )
        await expect(high_resolution_image).to_have_attribute(
            "data-image-state", "ready", timeout=60_000
        )
        await expect(preview).to_have_css("opacity", "0")
        assert len(set(large_requests)) == 1

        await context.close()
        await browser.close()


@pytest.mark.browser
def test_gallery_retries_automatically_and_keeps_preview_after_third_error():
    asyncio.run(_test_viewer_automatic_retry_and_fallback())


@pytest.mark.browser
def test_gallery_uses_discrete_feed_loading_state_without_skeleton_overlay():
    asyncio.run(_test_discrete_feed_loading_state())


@pytest.mark.browser
def test_gallery_warms_one_large_variant_on_hover_and_reuses_the_request():
    asyncio.run(_test_hover_warmup_is_reused_on_open())


async def _test_hover_warmup_is_reused_on_open():
    base_url = os.environ.get("PAYLOAD_TEST_BASE_URL", "http://localhost:3000")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context, page, feed_photo, feed_source, feed_width, source_url = (
            await open_gallery_page(browser, base_url)
        )
        large_requests: list[str] = []

        page.on(
            "request",
            lambda request: large_requests.append(request.url)
            if (
                optimized_image_source(request.url) == source_url
                and (optimized_image_width(request.url) or 0) > feed_width
            )
            else None,
        )

        await feed_photo.hover()

        for _ in range(30):
            if large_requests:
                break
            await page.wait_for_timeout(100)

        assert len(set(large_requests)) == 1

        await feed_photo.click()
        await expect(
            page.locator('[data-slot="gallery-cached-preview"]')
        ).to_have_attribute("src", feed_source)
        await page.wait_for_timeout(500)
        assert len(large_requests) == 1

        await context.close()
        await browser.close()


async def _test_discrete_feed_loading_state():
    base_url = os.environ.get("PAYLOAD_TEST_BASE_URL", "http://localhost:3000")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(
            base_url=base_url,
            device_scale_factor=1,
            viewport={"width": 1280, "height": 900},
        )
        page = await context.new_page()

        async def delay_optimized_images(route):
            await asyncio.sleep(3)
            await route.continue_()

        await page.route("**/_next/image*", delay_optimized_images)
        await page.goto("/galeria", wait_until="domcontentloaded")
        feed_photo = page.locator('[data-slot="gallery-feed-photo"]').first

        if await feed_photo.count() == 0:
            await context.close()
            await browser.close()
            pytest.skip("A galeria precisa ter ao menos uma imagem publicada")

        loading_status = feed_photo.locator('[data-slot="gallery-feed-loading"]')
        await expect(loading_status).to_be_visible(timeout=10_000)
        assert await feed_photo.locator('[data-slot="skeleton"]').count() == 0

        await loading_status.hover()
        await expect(page.get_by_role("tooltip")).to_contain_text(
            "Carregando foto 1"
        )
        await expect(feed_photo).to_have_attribute(
            "data-image-state", "ready", timeout=120_000
        )

        await context.close()
        await browser.close()


async def _test_viewer_automatic_retry_and_fallback():
    base_url = os.environ.get("PAYLOAD_TEST_BASE_URL", "http://localhost:3000")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context, page, feed_photo, feed_source, feed_width, source_url = (
            await open_gallery_page(browser, base_url)
        )
        failed_requests = 0

        async def fail_large_variant(route):
            nonlocal failed_requests
            request_url = route.request.url
            request_width = optimized_image_width(request_url)

            if (
                optimized_image_source(request_url) == source_url
                and request_width
                and request_width > feed_width
            ):
                failed_requests += 1
                await route.abort("failed")
                return

            await route.continue_()

        await page.route("**/_next/image*", fail_large_variant)
        await feed_photo.evaluate("element => element.click()")

        preview = page.locator('[data-slot="gallery-cached-preview"]')
        await expect(preview).to_have_attribute("src", feed_source)
        fallback_status = page.locator('[data-slot="gallery-viewer-fallback"]')
        await expect(fallback_status).to_be_visible(timeout=30_000)
        await expect(preview).to_be_visible()
        await expect(
            page.locator('[data-slot="gallery-photo-stage"] img[data-image-state]')
        ).to_have_attribute("data-image-state", "fallback")
        assert await page.get_by_role("button", name="Tentar novamente").count() == 0
        assert failed_requests == 3

        await fallback_status.hover()
        await expect(page.get_by_role("tooltip")).to_contain_text(
            "Exibindo a prévia em baixa resolução"
        )

        await context.close()
        await browser.close()


@pytest.mark.browser
def test_gallery_does_not_warm_large_images_when_data_saver_is_enabled():
    asyncio.run(_test_data_saver_disables_speculative_warmup())


async def _test_data_saver_disables_speculative_warmup():
    base_url = os.environ.get("PAYLOAD_TEST_BASE_URL", "http://localhost:3000")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context, page, feed_photo, _, feed_width, source_url = (
            await open_gallery_page(browser, base_url, save_data=True)
        )
        large_requests: list[str] = []

        page.on(
            "request",
            lambda request: large_requests.append(request.url)
            if (
                optimized_image_source(request.url) == source_url
                and (optimized_image_width(request.url) or 0) > feed_width
            )
            else None,
        )

        await feed_photo.hover()
        await page.wait_for_timeout(400)
        assert large_requests == []

        await context.close()
        await browser.close()
