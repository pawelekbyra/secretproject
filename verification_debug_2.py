from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_game(page: Page):
    page.goto("http://localhost:3000")
    print("Navigated to localhost:3000")
    time.sleep(30) # Wait for R3F and assets
    page.screenshot(path="/home/jules/verification_game_2.png")
    print("Screenshot taken")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_game(page)
        finally:
            browser.close()
