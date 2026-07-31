import os
import re

import pytest
from playwright.sync_api import expect, sync_playwright


@pytest.mark.browser
def test_psychological_care_public_form_and_protected_panel():
    base_url = os.environ.get("AUTH_TEST_BASE_URL", "http://127.0.0.1:3000")

    protected_routes = (
        (
            "/portal/atendimento-psicologico",
            r"/entrar\?redirectTo=%2Fportal%2Fatendimento-psicologico$",
        ),
        (
            "/portal/atendimento-psicologico/00000000-0000-4000-8000-000000000000",
            r"/entrar\?redirectTo=%2Fportal%2Fatendimento-psicologico%2F00000000-0000-4000-8000-000000000000$",
        ),
        (
            "/portal/atendimento-psicologico/00000000-0000-4000-8000-000000000000/historico",
            r"/entrar\?redirectTo=%2Fportal%2Fatendimento-psicologico%2F00000000-0000-4000-8000-000000000000%2Fhistorico$",
        ),
    )

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(base_url=base_url)
        page = context.new_page()
        page.set_default_navigation_timeout(120_000)

        try:
            response = page.goto("/ampercuida", wait_until="domcontentloaded")
            assert response is not None
            assert response.ok
            page.wait_for_load_state("networkidle")
            assert "no-store" in response.headers.get("cache-control", "")
            assert response.headers.get("referrer-policy") == "no-referrer"
            assert response.headers.get("x-robots-tag") == "noindex, nofollow"
            expect(page).to_have_url(re.compile(r"/ampercuida$"))
            expect(
                page.get_by_role(
                    "heading",
                    name="Atendimento psicológico — Solicitação da liderança",
                    exact=True,
                )
            ).to_be_visible()
            expect(page.get_by_label("Base", exact=True)).to_be_visible()
            expect(
                page.get_by_label("Motivo principal da solicitação", exact=True)
            ).to_be_visible()
            expect(
                page.get_by_role("button", name="Enviar solicitação")
            ).to_be_visible()

            page.get_by_role("button", name="Enviar solicitação").click()
            expect(
                page.get_by_text(
                    "Revise os campos destacados antes de enviar a solicitação."
                )
            ).to_be_visible()
            expect(page.get_by_label("Base", exact=True)).to_be_focused()

            page.get_by_label("Base", exact=True).fill("Base São Luís")
            phone = page.get_by_label("Telefone/WhatsApp", exact=True)
            phone.fill("98987654321")
            expect(phone).to_have_value("(98) 98765-4321")

            page.get_by_role("button", name="Limpar formulário").click()
            expect(page.get_by_label("Base", exact=True)).to_have_value("")
            expect(phone).to_have_value("")

            page.goto(
                "/portal/atendimento-psicologico/solicitar?origem=portal",
                wait_until="domcontentloaded",
            )
            expect(page).to_have_url(re.compile(r"/ampercuida\?origem=portal$"))

            for route, expected_redirect in protected_routes:
                page.goto(route, wait_until="domcontentloaded")
                expect(page).to_have_url(re.compile(expected_redirect))
                expect(page.get_by_text("Motivo principal da solicitação")).to_have_count(
                    0
                )
        finally:
            context.close()
            browser.close()
