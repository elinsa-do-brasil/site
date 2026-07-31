import asyncio
import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pytest
from playwright.async_api import async_playwright, expect


def load_netscape_cookies(path: str):
    cookies = []

    for raw_line in Path(path).read_text(encoding="utf-8").splitlines():
        http_only = raw_line.startswith("#HttpOnly_")
        line = raw_line.removeprefix("#HttpOnly_") if http_only else raw_line

        if not line or line.startswith("#"):
            continue

        domain, _, cookie_path, secure, expires, name, value = line.split("\t", 6)
        cookie = {
            "domain": domain,
            "httpOnly": http_only,
            "name": name,
            "path": cookie_path,
            "secure": secure == "TRUE",
            "value": value,
        }

        if expires.isdigit() and int(expires) > 0:
            cookie["expires"] = int(expires)

        cookies.append(cookie)

    return cookies


@pytest.mark.browser
def test_otp_linked_account_registers_signs_in_and_removes_passkey():
    asyncio.run(_test_passwordless_round_trip())


async def _test_passwordless_round_trip():
    base_url = os.environ.get("AUTH_TEST_BASE_URL", "http://localhost:3000")
    cookie_file = os.environ.get("AUTH_TEST_COOKIE_FILE")

    if not cookie_file:
        pytest.skip("AUTH_TEST_COOKIE_FILE não foi informado")

    passkey_name = "Teste automatizado Codex"

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(base_url=base_url)
        await context.add_cookies(load_netscape_cookies(cookie_file))
        page = await context.new_page()
        page.set_default_navigation_timeout(120_000)
        page.set_default_timeout(120_000)
        cdp = await context.new_cdp_session(page)

        await cdp.send("WebAuthn.enable")
        await cdp.send(
            "WebAuthn.addVirtualAuthenticator",
            {
                "options": {
                    "automaticPresenceSimulation": True,
                    "hasResidentKey": True,
                    "hasUserVerification": True,
                    "isUserVerified": True,
                    "protocol": "ctap2",
                    "transport": "internal",
                }
            },
        )

        try:
            await page.goto("/configuracoes", wait_until="networkidle")
            await expect(page.get_by_text("Código por e-mail")).to_be_visible()
            await expect(page.get_by_text("Microsoft", exact=True).first).to_be_visible()
            await expect(page.get_by_text("Vinculada", exact=True)).to_be_visible()

            await page.get_by_label("Nome da nova passkey").fill(passkey_name)
            await page.get_by_role("button", name="Adicionar passkey").click()
            await expect(page.get_by_text("Passkey cadastrada.")).to_be_visible(
                timeout=30_000
            )
            await expect(page.get_by_text(passkey_name)).to_be_visible()

            await page.evaluate(
                """
                async () => {
                  const response = await fetch('/api/auth/sign-out', {
                    body: '{}',
                    credentials: 'include',
                    headers: { 'content-type': 'application/json' },
                    method: 'POST',
                  });
                  if (!response.ok) throw new Error(`sign-out failed: ${response.status}`);
                }
                """
            )
            await page.goto(
                "/entrar?redirectTo=%2Fconfiguracoes%3Fpasskey-test%3D1",
                wait_until="networkidle",
            )
            await page.get_by_role("button", name="Entrar com Passkey").click()
            await page.wait_for_url("**/configuracoes?passkey-test=1", timeout=30_000)
            await expect(page.get_by_text(passkey_name)).to_be_visible()

            await page.get_by_role("button", name="Remover passkey").click()
            await expect(page.get_by_text("Passkey removida.")).to_be_visible(
                timeout=30_000
            )
            await expect(page.get_by_text(passkey_name)).to_have_count(0)
        finally:
            await context.close()
            await browser.close()


@pytest.mark.browser
def test_microsoft_oauth_uses_corporate_tenant_callback_and_hint():
    asyncio.run(_test_microsoft_oauth_initialization())


@pytest.mark.browser
def test_login_otp_uses_accessible_fields_and_six_digit_control():
    asyncio.run(_test_login_otp_form())


async def _test_login_otp_form():
    base_url = os.environ.get("AUTH_TEST_BASE_URL", "http://localhost:3000")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(base_url=base_url)
        page = await context.new_page()
        otp_requests: list[dict] = []
        sign_in_requests: list[dict] = []
        release_portal_navigation = asyncio.Event()

        async def capture_otp_request(route):
            otp_requests.append(route.request.post_data_json)
            await route.fulfill(
                body='{"success":true}',
                content_type="application/json",
                status=200,
            )

        async def capture_sign_in_request(route):
            sign_in_requests.append(route.request.post_data_json)
            await route.fulfill(
                body=(
                    '{"token":"test-session","user":{'
                    '"id":"test-user","name":"Raave Aires",'
                    '"email":"raave.aires@grupoamperelinsa.com",'
                    '"emailVerified":true,'
                    '"createdAt":"2026-07-31T00:00:00.000Z",'
                    '"updatedAt":"2026-07-31T00:00:00.000Z"}}'
                ),
                content_type="application/json",
                status=200,
            )

        async def hold_portal_navigation(route):
            await release_portal_navigation.wait()
            await route.abort()

        await page.route(
            "**/api/auth/email-otp/send-verification-otp",
            capture_otp_request,
        )
        await page.route("**/api/auth/sign-in/email-otp", capture_sign_in_request)
        await page.route("**/portal**", hold_portal_navigation)

        try:
            await page.goto("/entrar", wait_until="networkidle")

            microsoft_button = page.get_by_role(
                "button", name="Entrar com a Microsoft"
            )
            passkey_button = page.get_by_role("button", name="Entrar com Passkey")
            await expect(microsoft_button).to_be_visible()
            await expect(passkey_button).to_be_visible()

            await page.get_by_label("E-mail", exact=True).fill("email-invalido")
            await page.get_by_role("button", name="Enviar código").click()
            await expect(page.get_by_text("Informe um e-mail válido.")).to_be_visible()
            assert otp_requests == []

            await page.get_by_label("E-mail", exact=True).fill(
                "raave.aires@grupoamperelinsa.com"
            )
            await page.get_by_role("button", name="Enviar código").click()

            await expect(page.get_by_label("Código", exact=True)).to_be_visible()
            await expect(page.locator('[data-slot="input-otp"]')).to_have_count(1)
            await expect(page.locator('[data-slot="input-otp-slot"]')).to_have_count(6)
            await expect(microsoft_button).to_have_count(0)
            await expect(passkey_button).to_have_count(0)
            assert otp_requests == [
                {
                    "email": "raave.aires@grupoamperelinsa.com",
                    "type": "sign-in",
                }
            ]

            await page.get_by_label("Código", exact=True).fill("123")
            await page.get_by_role("button", name="Entrar", exact=True).click()
            await expect(page.get_by_text("Digite os 6 dígitos.")).to_be_visible()

            await page.get_by_role("button", name="Alterar e-mail").click()
            await expect(page.get_by_label("E-mail", exact=True)).to_be_visible()
            await expect(microsoft_button).to_be_visible()
            await expect(passkey_button).to_be_visible()

            await page.get_by_role("button", name="Enviar código").click()
            await page.get_by_label("Código", exact=True).fill("123456")
            await page.get_by_role("button", name="Entrar", exact=True).click()

            await expect(page.get_by_text("Acesso confirmado")).to_be_visible()
            await expect(page.get_by_text("Abrindo sua área…")).to_be_visible()
            await expect(microsoft_button).to_have_count(0)
            await expect(passkey_button).to_have_count(0)
            assert sign_in_requests == [
                {
                    "email": "raave.aires@grupoamperelinsa.com",
                    "otp": "123456",
                }
            ]
        finally:
            release_portal_navigation.set()
            await context.close()
            await browser.close()


async def _test_microsoft_oauth_initialization():
    base_url = os.environ.get("AUTH_TEST_BASE_URL", "http://localhost:3000")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(base_url=base_url)
        page = await context.new_page()
        page.set_default_navigation_timeout(120_000)
        microsoft_requests: list[str] = []

        async def capture_microsoft_authorization(route):
            microsoft_requests.append(route.request.url)
            await route.fulfill(
                body="<html><body>Microsoft authorization captured</body></html>",
                content_type="text/html",
                status=200,
            )

        await page.route(
            "https://login.microsoftonline.com/**",
            capture_microsoft_authorization,
        )

        try:
            await page.goto(
                "/entrar?redirectTo=%2Fconfiguracoes%3Foauth-test%3D1",
                wait_until="networkidle",
            )
            await page.get_by_role("button", name="Entrar com a Microsoft").click()
            await expect(page.get_by_text("Microsoft authorization captured")).to_be_visible(
                timeout=30_000
            )

            assert len(microsoft_requests) == 1
            authorization_url = urlparse(microsoft_requests[0])
            query = parse_qs(authorization_url.query)
            scopes = set(query.get("scope", [""])[0].split())

            assert authorization_url.hostname == "login.microsoftonline.com"
            assert "/oauth2/v2.0/authorize" in authorization_url.path
            assert query.get("domain_hint") == ["grupoamperelinsa.com"]
            assert query.get("redirect_uri") == [
                "http://localhost:3000/api/auth/callback/microsoft"
            ]
            assert {"openid", "profile", "email"}.issubset(scopes)
            assert "User.Read" not in scopes
            assert "offline_access" not in scopes
        finally:
            await context.close()
            await browser.close()
