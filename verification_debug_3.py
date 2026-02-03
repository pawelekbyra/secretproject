from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_game(page: Page):
    page.goto("http://localhost:3000")
    time.sleep(10)

    # Try to find the error message
    try:
        error_msg = page.locator("[data-nextjs-dialog-header-text]").inner_text()
        print(f"Next.js Error Header: {error_msg}")
        error_body = page.locator("[data-nextjs-container-errors]").inner_text()
        print(f"Next.js Error Body: {error_body}")
    except:
        print("Could not find Next.js error overlay with locators.")
        # Fallback: get all text from body
        print("Page Body Text:")
        print(page.locator("body").inner_text())

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_game(page)
        finally:
            browser.close()
