from playwright.sync_api import sync_playwright
import time

def verify_game():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000", timeout=60000)

            print("Waiting 10s...")
            time.sleep(10)

            # Take screenshot regardless
            print("Taking screenshot...")
            page.screenshot(path="verification/game_screenshot.png")
            print("Screenshot saved.")

            content = page.content()
            print("Page content length:", len(content))
            # print(content[:500]) # Print beginning of content to check for errors

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_game()
