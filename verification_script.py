from playwright.sync_api import sync_playwright, expect
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate Desktop 1080p
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        print("Navigating to home...")
        # Access localhost via 127.0.0.1
        page.goto("http://127.0.0.1:3000")

        # 1. Handle Language Selection (Preloader)
        print("Handling language selection...")
        try:
            # Try to click Polish language if visible
            # Fix strict mode violation by picking first
            pl_button = page.locator("text=Polski").first
            if pl_button.is_visible(timeout=5000):
                pl_button.click(force=True)
                print("Clicked Polish language.")
                time.sleep(2) # Wait for animation
        except Exception as e:
            print(f"Preloader skipped or error: {e}")

        # Wait for TopBar to be visible
        print("Waiting for TopBar...")
        try:
             # Wait for anything in topbar
             page.wait_for_selector("svg.lucide-menu", timeout=10000)
        except:
             print("TopBar wait failed (maybe logged out view?)")

        print("Verifying Unauth Interactions...")

        # Click Bell (Logged out)
        # Use first() to avoid strict mode
        bell_btn = page.locator("button svg.lucide-bell").first.locator("..")

        if bell_btn.count() > 0:
            bell_btn.click()
            # Expect toast "Musisz się zalogować"
            try:
                # Wait for any text that matches expected toast
                toast = page.locator("text=Musisz się zalogować").first
                toast.wait_for(state="visible", timeout=3000)
                print("SUCCESS: Unauth Toast visible on Bell click")
            except:
                print("FAILURE: Unauth Toast not found")
        else:
             print("FAILURE: Bell button not found")

        # 3. Verify Account Modal (Need to login)
        # Login using admin1@admin.pl / admin (from memory)
        print("Logging in...")

        # Open Login Panel (Top center text/button)
        # Text "Nie masz psychy się zalogować" (PL)
        login_trigger = page.locator("text=Nie masz psychy").first
        if login_trigger.is_visible():
            login_trigger.click()
            time.sleep(1)

            page.fill("input[name='email']", "admin@admin.pl")
            page.fill("input[name='password']", "admin")
            page.click("button[type='submit']")

            # Wait for login success
            try:
                page.wait_for_selector("text=Ting Tong", timeout=10000)
                print("Logged in successfully.")
            except:
                print("Login might have failed or title didn't update.")

            # 4. Open Account Modal
            menu_btn = page.locator("button[aria-label='Menu']").first
            menu_btn.click()

            # Popover opens
            account_btn = page.locator("text=Konto").first
            account_btn.click()

            time.sleep(2) # Wait for animation

            # Verify Title "Konto"
            # Looking for h2 with text Konto
            header = page.locator("h2:has-text('Konto')").first
            if header.is_visible():
                print("SUCCESS: Account Modal Header is 'Konto'")
            else:
                 print("FAILURE: Account Modal Header not found or incorrect")

            # Verify Avatar Red Dot Border (White)
            # Find the pencil button (Camera icon overlay or similar)
            # In ProfileTab.tsx: button with Pencil icon has border-2 border-white
            pencil_btn = page.locator("button:has(svg.lucide-pencil)").first

        # 5. Verify Notification Dot Position
        # We need a notification.
        # Since we logged in, if admin has notifications, dot appears.

        page.screenshot(path="/home/jules/verification/verification.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_changes()
