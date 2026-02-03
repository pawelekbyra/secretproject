from playwright.sync_api import sync_playwright
import time

def verify_game():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000", timeout=60000)

            print("Waiting for game overlay...")
            page.wait_for_selector("text=PROJECT GENIE", timeout=30000)

            print("Waiting 5s for 3D...")
            time.sleep(5)

            print("Taking screenshot...")
            page.screenshot(path="verification/game_screenshot_2.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_game()
