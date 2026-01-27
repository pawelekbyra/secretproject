
import time
from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a desktop device to see the full UI or mobile for modals?
        # The prompt mentions "Author Profile Modal" and "Tipping Modal", which are mobile-first but responsive.
        # Let's use a standard viewport.
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            storage_state=None
        )
        page = context.new_page()

        # 1. Navigate to the app
        print("Navigating to app...")
        try:
            page.goto("http://127.0.0.1:3000", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        # Handle Language Preloader if present
        try:
            lang_btn = page.get_by_role("button", name="Polski").first
            if lang_btn.is_visible(timeout=5000):
                print("Clicking language button...")
                lang_btn.click(force=True)
                # Wait for preloader to disappear
                page.wait_for_timeout(2000)
        except Exception:
            print("No language preloader found or already passed.")

        # 2. Open Tipping Modal to verify layout and validation message
        # We need to find a way to open the tipping modal. Usually via a "Tip" button on a profile or sidebar.
        # Let's try to open the Author Profile first, then Tip.
        # Or look for a direct trigger if available.

        # NOTE: Without a specific user logged in, some actions might differ.
        # But the validation message "Minimalna kwota..." can be tested as anonymous.

        # Let's try to find a button that opens the tipping modal.
        # Based on memory: Sidebar has a "Like" button, maybe "Tip"?
        # Or typically on the Author Profile.

        # Let's look for an author profile trigger.
        # Usually clicking an avatar in the feed.

        print("Attempting to open Tipping Modal...")

        # Strategy: Inject script to open modal via store if UI interaction is complex to find blindly
        # But we should try UI first.
        # Let's try to find a "Zostań Patronem" button or similar.

        # If we can't find it easily, we might need to rely on the fact that I changed the code.
        # However, let's try to open the Tipping Modal by invoking the store directly if possible,
        # or just finding a trigger.

        # Common trigger: A button with text "Wspieraj" or icon.
        # Let's try to find the "Comments" button to see if we can get to a profile,
        # or just look for "Zostań Patronem" on the page if it's there.

        # Actually, let's try to execute javascript to open the modal for verification speed.
        # This requires exposing the store or just triggering a click on a known element.
        # The sidebar usually has a "Gift" or "Tip" icon.

        # Let's try to find a button with a Gift icon or similar.
        # Or just "Sponsoruj" / "Napiwek".

        # Force open via console might be easier if I knew the global exposed.
        # Let's try clicking the "Zostań Patronem" button if visible.

        # Wait for page load
        page.wait_for_timeout(3000)

        # Take a screenshot of the main page to see what we have
        page.screenshot(path="verification/main_page.png")

        # Try to find a trigger for Tipping Modal.
        # Often it's in the Sidebar or Author Profile.
        # Let's try to click the avatar in the sidebar to open Author Profile, then click "Zostań Patronem".

        sidebar_avatar = page.locator('[data-testid="sidebar-avatar"]').first
        if not sidebar_avatar.is_visible():
             # fallback to any avatar
             sidebar_avatar = page.locator('img[alt="Avatar"]').first

        if sidebar_avatar.is_visible():
            print("Clicking avatar...")
            sidebar_avatar.click()
            page.wait_for_timeout(1000)

            # Now inside Author Profile (hopefully)
            # Look for "Zostań Patronem"
            tip_btn = page.get_by_role("button", name="Zostań Patronem").first
            if tip_btn.is_visible():
                print("Clicking 'Zostań Patronem'...")
                tip_btn.click()
                page.wait_for_timeout(1000)

                # Now inside Tipping Modal
                # 3. Verify Layout and Validation

                # Click "Dalej" or "Enter" to trigger validation (Step 0 -> Step 1 -> Step 2)
                # Step 0: Recipient. Default might be selected or not.
                # If "Nikt" is selected, it closes.
                # Select "Pawłowi"

                recipient_btn = page.locator("text=Pawłowi Polutkowi")
                if recipient_btn.is_visible():
                    recipient_btn.click()

                # Click Enter/Dalej
                enter_btn = page.locator("button:has-text('ENTER'), button:has-text('DALEJ')").first
                if enter_btn.is_visible():
                    enter_btn.click()
                    page.wait_for_timeout(500)

                    # Step 1: Data (if not logged in)
                    # Skip create account or fill it?
                    # If we just click Enter, it might validate email if "create account" is checked.
                    # Let's uncheck "create account" if checked, or just proceed.
                    # By default "No jacha!" (Create account) might be unchecked?
                    # Let's click Enter again to go to Amount step.

                    if enter_btn.is_visible():
                         enter_btn.click()
                         page.wait_for_timeout(500)

                         # Step 2: Amount
                         # Now we are at the amount step.
                         # Try to set a low amount (e.g. 1 PLN)

                         amount_input = page.locator("input[type='number']")
                         if amount_input.is_visible():
                             amount_input.fill("1")

                             # Click Enter to trigger validation
                             enter_btn.click()
                             page.wait_for_timeout(500)

                             # Capture screenshot of validation error
                             print("Capturing validation error...")
                             page.screenshot(path="verification/tipping_validation.png")

                             # Check for text "Minimalna kwota napiwku to 5 PLN"
                             content = page.content()
                             if "Minimalna kwota napiwku to 5 PLN" in content:
                                 print("SUCCESS: Validation message found.")
                             else:
                                 print("FAILURE: Validation message not found.")

            else:
                print("Zostań Patronem button not found.")
        else:
             print("Avatar not found.")

        # 4. Verify Profile Tab Changes (Avatar message position)
        # This requires logging in, which is hard in this env.
        # We can try to mock the state or just rely on code review for that part if login is complex.
        # There is a 'scripts/fix-login.ts', maybe we can use a test account?
        # User: admin@admin.pl Pass: admin

        # Let's try to login.
        print("Attempting login...")
        # Reload to start fresh
        page.goto("http://127.0.0.1:3000")
        page.wait_for_timeout(2000)

        # Open Login Panel (often via sidebar "Like" or hidden trigger)
        # Or look for a "Zaloguj" button.

        # Try to trigger login by clicking "Like" on sidebar (heart icon)
        heart_icon = page.locator('button svg.lucide-heart').first
        if heart_icon.is_visible():
            heart_icon.click()
            page.wait_for_timeout(1000)

            # Should see login panel
            email_input = page.locator("input[type='email']")
            pass_input = page.locator("input[type='password']")
            submit_btn = page.locator("button:has-text('ENTER')")

            if email_input.is_visible():
                email_input.fill("admin@admin.pl")
                pass_input.fill("admin")
                submit_btn.click()
                page.wait_for_timeout(3000)

                # Check if logged in (avatar should change or panel disappear)
                # Open Profile Tab
                # Click Avatar in sidebar (now user avatar)
                if sidebar_avatar.is_visible():
                    sidebar_avatar.click()
                    page.wait_for_timeout(1000)

                    # Verify "Konto" tab is active or click "Konto" / "Settings" icon?
                    # The AuthorProfileModal is for *Authors*. The User Profile is different?
                    # Wait, usually the user clicks their own avatar to see their profile?
                    # Or there is a "Profile" button.

                    # Assuming we are in a modal where we can edit profile.
                    # Look for "Edytuj" or "Konto"

                    # Screenshot to see where we are
                    page.screenshot(path="verification/logged_in_view.png")

                    # If we are in AuthorProfileModal (our own profile), we should see "Konto" tab or settings.
                    # Look for gear icon or "Ustawienia".

                    settings_tab = page.locator("text=Konto").first
                    if settings_tab.is_visible():
                        settings_tab.click()
                        page.wait_for_timeout(1000)

                        # Now in ProfileTab.
                        # We can verify the Settings form layout (no huge gap).
                        page.screenshot(path="verification/profile_settings.png")
                        print("Captured Profile Settings view.")

                    else:
                        print("Settings tab not found.")
            else:
                print("Login inputs not found.")
        else:
            print("Heart icon not found.")

        browser.close()

if __name__ == "__main__":
    verify_changes()
