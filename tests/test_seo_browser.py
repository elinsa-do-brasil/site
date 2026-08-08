import os
import re
from urllib.parse import urlparse

import pytest
from playwright.sync_api import expect, sync_playwright


CANONICAL_ORIGIN = "https://elinsadobrasil.com.br"


def assert_indexable_metadata(page, path: str, heading: str):
    response = page.goto(path, wait_until="domcontentloaded")
    assert response is not None
    assert response.ok
    expect(page.get_by_role("heading", name=heading, exact=True)).to_be_visible()
    assert page.title().strip()
    expect(page.locator('meta[name="description"]')).to_have_attribute(
        "content", re.compile(r".+")
    )
    expect(page.locator('link[rel="canonical"]')).to_have_attribute(
        "href", f"{CANONICAL_ORIGIN}{path}"
    )
    expect(page.locator('meta[name="robots"]')).not_to_have_attribute(
        "content", re.compile(r"noindex", re.IGNORECASE)
    )


@pytest.mark.browser
def test_seo_routes_sitemap_robots_and_googlebot_html():
    base_url = os.environ.get("AUTH_TEST_BASE_URL", "http://127.0.0.1:3000")

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(
            base_url=base_url,
            user_agent=(
                "Mozilla/5.0 (compatible; Googlebot/2.1; "
                "+http://www.google.com/bot.html)"
            ),
        )
        page = context.new_page()
        page.set_default_navigation_timeout(120_000)

        try:
            robots_response = context.request.get("/robots.txt")
            assert robots_response.ok
            robots_text = robots_response.text()
            assert "User-Agent: *" in robots_text
            assert "/_next" not in robots_text
            assert (
                "Disallow: /" in robots_text
                or f"Sitemap: {CANONICAL_ORIGIN}/sitemap.xml" in robots_text
            )

            sitemap_response = context.request.get("/sitemap.xml")
            assert sitemap_response.ok
            sitemap_text = sitemap_response.text()
            assert f"<loc>{CANONICAL_ORIGIN}/</loc>" in sitemap_text
            assert f"<loc>{CANONICAL_ORIGIN}/denunciar</loc>" in sitemap_text
            assert (
                f"<loc>{CANONICAL_ORIGIN}/amper-cuida</loc>"
                in sitemap_text
            )
            assert "/denunciar/formulario" not in sitemap_text
            assert "/acompanhar-denuncia" not in sitemap_text
            assert "ampercuida" not in sitemap_text
            assert "/acolhimento" not in sitemap_text
            assert "/portal/" not in sitemap_text

            public_urls = re.findall(r"<loc>([^<]+)</loc>", sitemap_text)
            for canonical_url in public_urls:
                public_response = page.goto(
                    urlparse(canonical_url).path, wait_until="domcontentloaded"
                )
                assert public_response is not None
                assert public_response.ok
                assert page.title().strip()
                expect(page.locator('meta[name="description"]')).to_have_attribute(
                    "content", re.compile(r".+")
                )
                rendered_canonical = page.locator(
                    'link[rel="canonical"]'
                ).get_attribute("href")
                assert rendered_canonical is not None
                assert rendered_canonical.rstrip("/") == canonical_url.rstrip("/")
                expect(page.locator("h1")).to_have_count(1)
                expect(page.locator('meta[name="robots"]')).not_to_have_attribute(
                    "content", re.compile(r"noindex", re.IGNORECASE)
                )

            assert_indexable_metadata(
                page,
                "/denunciar",
                "Vai fazer uma denúncia? Veja o que é importante saber.",
            )
            assert_indexable_metadata(
                page,
                "/amper-cuida",
                "Amper Cuida: apoio psicológico para colaboradores",
            )

            form_response = page.goto(
                "/acolhimento/hjvx6e", wait_until="domcontentloaded"
            )
            assert form_response is not None
            assert form_response.ok
            assert form_response.headers.get("x-robots-tag") == "noindex, nofollow"
            expect(page.locator('meta[name="robots"]')).to_have_attribute(
                "content", re.compile(r"noindex", re.IGNORECASE)
            )

            # A rota antiga do formulário deixou de existir e não redireciona
            # para a nova (evita revelar o endereço não óbvio automaticamente).
            old_form_response = page.goto(
                "/ampercuida", wait_until="domcontentloaded"
            )
            assert old_form_response is not None
            assert old_form_response.status == 404
            assert old_form_response.url.rstrip("/").endswith("/ampercuida")

            # A antiga página institucional foi renomeada e redireciona (301/308)
            # para a nova, já que ela é pública/indexada por design.
            old_about_response = page.goto(
                "/ampercuida/sobre", wait_until="domcontentloaded"
            )
            assert old_about_response is not None
            assert old_about_response.ok
            assert old_about_response.url.rstrip("/").endswith("/amper-cuida")

            for sensitive_path in (
                "/denunciar/formulario",
                "/acompanhar-denuncia",
            ):
                sensitive_response = page.goto(
                    sensitive_path, wait_until="domcontentloaded"
                )
                assert sensitive_response is not None
                assert sensitive_response.ok
                assert (
                    sensitive_response.headers.get("x-robots-tag")
                    == "noindex, nofollow"
                )
                assert "no-store" in sensitive_response.headers.get(
                    "cache-control", ""
                )
                expect(page.locator('meta[name="robots"]')).to_have_attribute(
                    "content", re.compile(r"noindex", re.IGNORECASE)
                )

            news_url = next(
                (
                    url
                    for url in public_urls
                    if re.search(r"/imprensa/[^/]+$", url)
                ),
                None,
            )
            job_url = next(
                (
                    url
                    for url in public_urls
                    if re.search(r"/vagas/[^/]+$", url)
                ),
                None,
            )

            for url, schema_type in (
                (news_url, "NewsArticle"),
                (job_url, "JobPosting"),
            ):
                if not url:
                    continue

                dynamic_response = page.goto(
                    urlparse(url).path, wait_until="domcontentloaded"
                )
                assert dynamic_response is not None
                assert dynamic_response.ok
                expect(page.locator("h1")).to_have_count(1)
                expect(page.locator('link[rel="canonical"]')).to_have_attribute(
                    "href", url
                )
                structured_data = page.locator(
                    'script[type="application/ld+json"]'
                ).evaluate(
                    "element => element.textContent"
                )
                assert schema_type in structured_data
        finally:
            context.close()
            browser.close()
