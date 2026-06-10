from re import compile


def test_homepage_loads(page):
    page.goto("http://127.0.0.1:3000/", wait_until="domcontentloaded")

    heading = page.get_by_role(
        "heading", name=compile("energia|elinsa", flags=2)
    ).first
    heading.wait_for(state="visible")

    assert heading.is_visible()
