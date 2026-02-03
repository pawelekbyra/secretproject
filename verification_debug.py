from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_game(page: Page):
    page.goto("http://localhost:3000", wait_until="networkidle")
    time.sleep(10) # Wait for R3F
    page.screenshot(path="/home/jules/verification_game.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_game(page)
        finally:
            browser.close()
