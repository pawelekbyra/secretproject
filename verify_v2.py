import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_aesthetics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        page.goto("http://localhost:3000")

        # Wait for preloader buttons
        try:
            page.wait_for_selector("button:has-text('Polski')", timeout=10000)
            page.screenshot(path="verification/preloader_final.png")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()

if __name__ == "__main__":
    os.makedirs("verification", exist_ok=True)
    verify_aesthetics()
