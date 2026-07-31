import os
import re

import pytest
from playwright.sync_api import expect, sync_playwright


@pytest.mark.browser
def test_psychological_care_routes_require_authentication():
    base_url = os.environ.get("AUTH_TEST_BASE_URL", "http://127.0.0.1:3000")

    protected_routes = (
        (
            "/portal/atendimento-psicologico/solicitar",
            r"/entrar\?redirectTo=%2Fportal%2Fatendimento-psicologico%2Fsolicitar$",
        ),
        (
            "/portal/atendimento-psicologico",
            r"/entrar\?redirectTo=%2Fportal%2Fatendimento-psicologico$",
        ),
        (
            "/portal/atendimento-psicologico/00000000-0000-4000-8000-000000000000",
            r"/entrar\?redirectTo=%2Fportal%2Fatendimento-psicologico%2F00000000-0000-4000-8000-000000000000$",
        ),
    )

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(base_url=base_url)
        page = context.new_page()
        page.set_default_navigation_timeout(120_000)

        try:
            for route, expected_redirect in protected_routes:
                page.goto(route, wait_until="domcontentloaded")
                expect(page).to_have_url(re.compile(expected_redirect))
                expect(page.get_by_text("Motivo principal da solicitação")).to_have_count(
                    0
                )
        finally:
            context.close()
            browser.close()
