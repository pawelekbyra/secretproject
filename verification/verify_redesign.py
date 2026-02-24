from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True)
        page = context.new_page()

        try:
            print("Navigating to home page...")
            page.goto("http://localhost:3000")
            page.wait_for_timeout(5000)
            page.screenshot(path="./verification/home_page.png")
            print("Home page screenshot taken.")

            login_trigger = page.get_by_text("Nie masz psychy się zalogować").first
            if login_trigger.is_visible():
                print("Clicking login trigger...")
                login_trigger.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="./verification/login_panel.png")
                print("Login panel screenshot taken.")
            else:
                print("Login trigger not visible.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="./verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
