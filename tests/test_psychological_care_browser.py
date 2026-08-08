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
            "/portal/atendimento-psicologico/solicitar",
            r"/entrar\?redirectTo=%2Fportal%2Fatendimento-psicologico%2Fsolicitar$",
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
            response = page.goto(
                "/acolhimento/hjvx6e", wait_until="domcontentloaded"
            )
            assert response is not None
            assert response.ok
            assert "no-store" in response.headers.get("cache-control", "")
            assert response.headers.get("referrer-policy") == "no-referrer"
            assert response.headers.get("x-robots-tag") == "noindex, nofollow"
            expect(page).to_have_url(re.compile(r"/acolhimento/hjvx6e$"))
            expect(
                page.get_by_role(
                    "heading",
                    name="Solicitação de atendimento psicológico",
                    exact=True,
                )
            ).to_be_visible()
            # O formulário deixou de ser divulgado pela navegação pública:
            # o menu "Apoio" não deve mais conter um link para ele.
            page.get_by_role("button", name="Apoio", exact=True).click()
            expect(
                page.get_by_text("Recursos de apoio", exact=True)
            ).to_be_visible()
            expect(
                page.locator("header").get_by_role(
                    "link", name=re.compile(r"^Amper ?Cuida", re.IGNORECASE)
                )
            ).to_have_count(0)
            page.keyboard.press("Escape")
            expect(page.locator("main")).not_to_contain_text(
                re.compile(r"lideran", re.IGNORECASE)
            )
            expect(
                page.get_by_role("heading", name="Quem precisa de apoio")
            ).to_be_visible()
            expect(page.get_by_role("heading", name="Lotação")).to_be_visible()
            expect(
                page.get_by_role("heading", name="Solicitação", exact=True)
            ).to_be_visible()
            immediate_help = page.locator("aside")
            expect(
                immediate_help.get_by_text(
                    "Precisa de ajuda imediata?", exact=True
                )
            ).to_be_visible()
            expect(
                immediate_help.get_by_role("link", name="Ligar para o CVV no número 188")
            ).to_have_attribute("href", "tel:188")
            cvv_chat = immediate_help.get_by_role(
                "link", name="Acessar o chat do CVV", exact=True
            )
            expect(cvv_chat).to_have_attribute("href", "https://cvv.org.br/chat/")
            expect(cvv_chat).to_have_attribute("target", "_blank")
            expect(
                page.get_by_role("textbox", name="Base", exact=True)
            ).to_be_visible()
            expect(
                page.get_by_role(
                    "textbox", name="Motivo da solicitação", exact=True
                )
            ).to_be_visible()
            expect(
                page.get_by_role("button", name="Enviar solicitação")
            ).to_be_visible()

            page.get_by_role("button", name="Enviar solicitação").click()
            expect(
                page.get_by_text(
                    "Revise os campos destacados."
                )
            ).to_be_visible()
            person_name = page.get_by_role(
                "textbox", name="Nome completo", exact=True
            )
            expect(person_name).to_be_focused()

            person_name.fill("Maria da Silva")
            phone = page.get_by_role(
                "textbox", name="Telefone ou WhatsApp", exact=True
            )
            phone.fill("98987654321")
            expect(phone).to_have_value("(98) 98765-4321")

            # A rota interna legada de solicitação foi aposentada: hoje cai na
            # mesma checagem de autenticação de qualquer página de /portal (não
            # há mais nenhum atalho que redirecione para o formulário público,
            # o que evitaria abrir uma porta lateral revelando o endereço não
            # óbvio). Coberta pelo loop de protected_routes abaixo.

            for route, expected_redirect in protected_routes:
                page.goto(route, wait_until="domcontentloaded")
                expect(page).to_have_url(re.compile(expected_redirect))
                expect(page.locator('[name="reason"]')).to_have_count(0)
        finally:
            context.close()
            browser.close()
