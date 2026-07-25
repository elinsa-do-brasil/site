import os
import re
import secrets
import time
from pathlib import Path

import pytest
from playwright.sync_api import BrowserContext, Page, expect, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
UPLOAD_FIXTURE = PROJECT_ROOT / "public/images/eletricistas.webp"


def login_context(browser, base_url: str, email: str, password: str):
    context = browser.new_context(base_url=base_url)
    response = context.request.post(
        f"{base_url}/api/users/login",
        data={"email": email, "password": password},
    )
    assert response.ok, f"Login failed ({response.status}): {response.text()}"
    token = response.json().get("token")
    assert token, "Payload login did not return a JWT"
    context.set_extra_http_headers({"Authorization": f"JWT {token}"})
    return context


def create_user(
    context: BrowserContext,
    base_url: str,
    *,
    email: str,
    name: str,
    password: str,
    role: str,
):
    response = context.request.post(
        f"{base_url}/api/users",
        data={
            "email": email,
            "name": name,
            "password": password,
            "role": role,
        },
    )
    assert response.status == 201, response.text()
    return response.json()["doc"]


def assert_collection_link(page: Page, slug: str, visible: bool):
    locator = page.locator(f'a[href*="/collections/{slug}"]')
    if visible:
        expect(locator.first).to_be_visible()
    else:
        expect(locator).to_have_count(0)


def open_dashboard(context: BrowserContext) -> Page:
    page = context.new_page()
    page.goto("/payload", wait_until="domcontentloaded")
    expect(page.locator("body")).to_be_visible()
    return page


@pytest.mark.browser
def test_payload_fixed_role_workflow_and_media_upload():
    base_url = os.environ.get("PAYLOAD_TEST_BASE_URL", "http://127.0.0.1:3000")
    admin_email = os.environ.get("PAYLOAD_TEST_EMAIL")
    admin_password = os.environ.get("PAYLOAD_TEST_PASSWORD")

    if not admin_email or not admin_password:
        pytest.skip("PAYLOAD_TEST_EMAIL and PAYLOAD_TEST_PASSWORD are required")

    run_id = f"{int(time.time())}-{secrets.token_hex(3)}"
    author_password = f"RBAC-{secrets.token_urlsafe(18)}-A1!"
    editor_email = f"payload-browser-editor-{run_id}@example.invalid"
    publisher_email = f"payload-browser-publisher-{run_id}@example.invalid"
    recruiter_email = f"payload-browser-recruiter-{run_id}@example.invalid"
    new_draft_title = f"RBAC navegador revisado {run_id}"
    changed_draft_title = f"RBAC navegador com revisão pendente {run_id}"
    created_ids: dict[str, list[int | str]] = {
        "blog": [],
        "media": [],
        "users": [],
    }

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        admin_context = login_context(
            browser, base_url, admin_email, admin_password
        )

        try:
            admin_page = open_dashboard(admin_context)
            assert_collection_link(admin_page, "users", True)
            assert_collection_link(admin_page, "redirects", True)
            assert_collection_link(admin_page, "activity-log", True)
            expect(
                admin_page.locator('[data-testid="editorial-review-card"]')
            ).to_be_visible()
            expect(admin_page.locator("#nav-editorial-review")).to_be_visible()

            editor = create_user(
                admin_context,
                base_url,
                email=editor_email,
                name="Editor browser RBAC",
                password=author_password,
                role="editor",
            )
            created_ids["users"].append(editor["id"])
            publisher = create_user(
                admin_context,
                base_url,
                email=publisher_email,
                name="Publisher browser RBAC",
                password=author_password,
                role="publisher",
            )
            created_ids["users"].append(publisher["id"])
            recruiter = create_user(
                admin_context,
                base_url,
                email=recruiter_email,
                name="Recruiter browser RBAC",
                password=author_password,
                role="recruiter",
            )
            created_ids["users"].append(recruiter["id"])

            editor_context = login_context(
                browser, base_url, editor_email, author_password
            )
            try:
                editor_page = open_dashboard(editor_context)
                assert_collection_link(editor_page, "blog", True)
                assert_collection_link(editor_page, "imprensa", True)
                assert_collection_link(editor_page, "media", True)
                assert_collection_link(editor_page, "galeria", True)
                assert_collection_link(editor_page, "vagas", False)
                assert_collection_link(editor_page, "users", False)
                assert_collection_link(editor_page, "redirects", False)
                assert_collection_link(editor_page, "activity-log", False)
                expect(
                    editor_page.locator(
                        '[data-testid="editorial-review-card"]'
                    )
                ).to_have_count(0)
                expect(
                    editor_page.locator("#nav-editorial-review")
                ).to_have_count(0)

                editor_page.goto(
                    "/payload/pendencias-editoriais",
                    wait_until="domcontentloaded",
                )
                expect(
                    editor_page.get_by_role(
                        "heading", name="Acesso não autorizado"
                    )
                ).to_be_visible()

                draft_response = editor_context.request.post(
                    f"{base_url}/api/blog?draft=true",
                    data={
                        "_status": "draft",
                        "author": editor["id"],
                        "publishedAt": "2026-07-25T12:00:00.000Z",
                        "summary": "Rascunho criado pelo teste de navegador.",
                        "title": f"RBAC navegador {run_id}",
                    },
                )
                assert draft_response.status == 201, draft_response.text()
                blog_id = draft_response.json()["doc"]["id"]
                created_ids["blog"].append(blog_id)

                editor_page.goto(
                    f"/payload/collections/blog/{blog_id}",
                    wait_until="domcontentloaded",
                )
                expect(
                    editor_page.get_by_role(
                        "button", name=re.compile(r"^Salvar rascunho$", re.I)
                    )
                ).to_be_visible()
                expect(
                    editor_page.get_by_role(
                        "button", name=re.compile(r"^Publicar", re.I)
                    )
                ).to_have_count(0)
                editor_page.locator('input[name="title"]').fill(
                    new_draft_title
                )
                with editor_page.expect_response(
                    lambda response: (
                        f"/api/blog/{blog_id}" in response.url
                        and response.request.method == "PATCH"
                    ),
                    timeout=60_000,
                ) as save_info:
                    editor_page.get_by_role(
                        "button", name=re.compile(r"^Salvar rascunho$", re.I)
                    ).click()
                assert save_info.value.ok, save_info.value.text()

                published_response = admin_context.request.post(
                    f"{base_url}/api/blog",
                    data={
                        "_status": "published",
                        "author": editor["id"],
                        "publishedAt": "2026-07-25T12:00:00.000Z",
                        "subject": "comunicados",
                        "summary": (
                            "Conteúdo publicado que receberá uma revisão "
                            "pelo teste de navegador."
                        ),
                        "title": f"RBAC navegador publicado {run_id}",
                    },
                )
                assert published_response.status == 201, (
                    published_response.text()
                )
                changed_blog_id = published_response.json()["doc"]["id"]
                created_ids["blog"].append(changed_blog_id)
                changed_response = editor_context.request.patch(
                    f"{base_url}/api/blog/{changed_blog_id}?draft=true",
                    data={
                        "_status": "draft",
                        "title": changed_draft_title,
                    },
                )
                assert changed_response.ok, changed_response.text()

                editor_page.goto(
                    "/payload/collections/media/create",
                    wait_until="domcontentloaded",
                )
                editor_page.locator('input[type="file"]').set_input_files(
                    str(UPLOAD_FIXTURE)
                )
                editor_page.locator('input[name="alt"]').fill(
                    f"Upload temporário RBAC {run_id}"
                )
                with editor_page.expect_response(
                    lambda response: (
                        "/api/media" in response.url
                        and response.request.method == "POST"
                    ),
                    timeout=120_000,
                ) as upload_info:
                    editor_page.get_by_role(
                        "button", name=re.compile(r"^Salvar$", re.I)
                    ).click()
                upload_response = upload_info.value
                assert upload_response.status == 201, upload_response.text()
                created_ids["media"].append(upload_response.json()["doc"]["id"])
            finally:
                editor_context.close()

            recruiter_context = login_context(
                browser, base_url, recruiter_email, author_password
            )
            try:
                recruiter_page = open_dashboard(recruiter_context)
                expect(
                    recruiter_page.locator(
                        '[data-testid="editorial-review-card"]'
                    )
                ).to_have_count(0)
                expect(
                    recruiter_page.locator("#nav-editorial-review")
                ).to_have_count(0)
                recruiter_page.goto(
                    "/payload/pendencias-editoriais",
                    wait_until="domcontentloaded",
                )
                expect(
                    recruiter_page.get_by_role(
                        "heading", name="Acesso não autorizado"
                    )
                ).to_be_visible()
            finally:
                recruiter_context.close()

            publisher_context = login_context(
                browser, base_url, publisher_email, author_password
            )
            try:
                publisher_page = open_dashboard(publisher_context)
                assert_collection_link(publisher_page, "vagas", True)
                assert_collection_link(publisher_page, "users", False)
                assert_collection_link(publisher_page, "redirects", True)
                assert_collection_link(publisher_page, "activity-log", True)
                expect(
                    publisher_page.locator(
                        '[data-testid="editorial-review-card"]'
                    )
                ).to_be_visible()
                expect(
                    publisher_page.locator("#nav-editorial-review")
                ).to_be_visible()

                publisher_page.goto(
                    "/payload/pendencias-editoriais",
                    wait_until="domcontentloaded",
                )
                review_view = publisher_page.locator(
                    ".editorial-review-view"
                )
                expect(
                    review_view.get_by_role(
                        "heading", name="Pendências editoriais"
                    )
                ).to_be_visible()
                expect(
                    review_view.locator('[data-review-state="new"]').first
                ).to_be_visible()
                expect(
                    review_view.locator('[data-review-state="changed"]').first
                ).to_be_visible()
                expect(
                    review_view.get_by_role(
                        "button", name=re.compile(r"^Publicar", re.I)
                    )
                ).to_have_count(0)
                expect(
                    review_view.locator('a[href*="/create"]')
                ).to_have_count(0)

                publisher_page.locator("#editorial-review-search").fill(
                    run_id
                )
                publisher_page.locator("#editorial-review-area").select_option(
                    "imprensa"
                )
                publisher_page.get_by_role(
                    "button", name="Filtrar"
                ).click()
                expect(
                    publisher_page.get_by_role(
                        "heading", name="Nenhuma pendência editorial"
                    )
                ).to_be_visible()

                publisher_page.locator(
                    "#editorial-review-search"
                ).fill(changed_draft_title)
                publisher_page.locator(
                    "#editorial-review-area"
                ).select_option("blog")
                publisher_page.get_by_role(
                    "button", name="Filtrar"
                ).click()
                expect(
                    publisher_page.get_by_role(
                        "link", name=changed_draft_title
                    )
                ).to_be_visible()
                expect(
                    publisher_page.get_by_role(
                        "link", name=new_draft_title
                    )
                ).to_have_count(0)

                publisher_page.get_by_role(
                    "link", name=changed_draft_title
                ).click()
                publisher_page.wait_for_url(
                    re.compile(
                        rf"/payload/collections/blog/{changed_blog_id}(?:\?.*)?$"
                    )
                )
                expect(
                    publisher_page.locator('input[name="title"]')
                ).to_have_value(changed_draft_title)

                blog_id = created_ids["blog"][0]
                publisher_page.goto(
                    f"/payload/collections/blog/{blog_id}",
                    wait_until="domcontentloaded",
                )
                take_over_button = publisher_page.locator(
                    "#take-over, #document-locked-take-over"
                ).last
                expect(take_over_button).to_be_visible(timeout=15_000)
                with publisher_page.expect_response(
                    lambda response: (
                        "/api/payload-locked-documents/" in response.url
                        and response.request.method == "PATCH"
                    ),
                    timeout=30_000,
                ) as take_over_info:
                    take_over_button.click()
                assert take_over_info.value.ok, take_over_info.value.text()
                expect(take_over_button).to_be_hidden()
                publish_button = publisher_page.get_by_role(
                    "button", name=re.compile(r"^Publicar", re.I)
                )
                expect(publish_button).to_be_visible()
                expect(publish_button).to_be_enabled()
                with publisher_page.expect_response(
                    lambda response: (
                        f"/api/blog/{blog_id}" in response.url
                        and response.request.method == "PATCH"
                    ),
                    timeout=60_000,
                ) as publish_info:
                    publish_button.click()
                assert publish_info.value.ok, publish_info.value.text()

                published = publisher_context.request.get(
                    f"{base_url}/api/blog/{blog_id}?draft=false"
                )
                assert published.ok, published.text()
                assert published.json()["_status"] == "published"

                publisher_page.goto(
                    "/payload/pendencias-editoriais",
                    wait_until="domcontentloaded",
                )
                expect(
                    publisher_page.get_by_role(
                        "link", name=new_draft_title
                    )
                ).to_have_count(0)
                expect(
                    publisher_page.get_by_role(
                        "link", name=changed_draft_title
                    )
                ).to_be_visible()
            finally:
                publisher_context.close()
        finally:
            for collection in ("media", "blog", "users"):
                for document_id in reversed(created_ids[collection]):
                    admin_context.request.post(
                        f"{base_url}/api/{collection}/{document_id}/unlock"
                    )
                    delete_response = admin_context.request.delete(
                        f"{base_url}/api/{collection}/{document_id}"
                        "?trash=true&overrideLock=true"
                    )
                    assert delete_response.ok, delete_response.text()
            admin_context.close()
            browser.close()
