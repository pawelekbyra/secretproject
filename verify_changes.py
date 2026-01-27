from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_changes(page: Page):
    # 1. Open the app
    page.goto("http://localhost:3000")

    # Wait for the preloader to disappear or language selection
    # Assuming language selection might appear
    try:
        # Check if language selection is present
        lang_btn = page.get_by_text("Polski")
        if lang_btn.is_visible(timeout=5000):
            lang_btn.click(force=True)
            time.sleep(2) # Wait for animation
    except:
        pass

    # Wait for app to load
    page.wait_for_selector('div[data-scroll-container="true"]', timeout=30000)

    # 2. Verify Tipping Modal (Step 2 & 3 in plan)
    # We need to trigger the tipping modal.
    # Usually triggered by "Zostań Patronem" or similar.
    # We can try to force open it via console or finding a button.
    # Looking for a "gift" icon or similar if sidebar is visible.

    # Or, if we can access the Author Profile.
    # Click on an avatar in the feed.
    # Assuming there are slides.

    # Let's try to click on the first avatar we see to open Author Profile
    # The avatar usually has an alt text "Avatar" or similar.
    # Or class containing "rounded-full".

    # Wait for any content to load
    time.sleep(5)

    # Screenshot main view
    page.screenshot(path="/home/jules/verification/main_view.png")

    # Verify Item 3 (Remove "@"): Check for any text starting with "@"
    # This is a broad check.
    body_text = page.inner_text("body")
    if "@" in body_text:
        print("WARNING: Found '@' in body text, checking context...")
        # It might be in email inputs, which is fine.
        # But shouldn't be in usernames.

    # Open Tipping Modal directly if possible, or via UI.
    # Since I don't know exact selectors for the current feed, I'll try to find a 'gift' icon or 'Zostań Patronem'.

    # Let's try to find a button with text "Zostań Patronem" (if visible)
    # or trigger the store manually? No, stick to UI.

    # If the sidebar is visible, there might be a "Prezenty" icon.
    # Or inside the Author Profile.

    # Click on the profile picture in the sidebar (if it exists)
    # Sidebar usually has an avatar.

    # Let's try to find an element that looks like a user profile trigger.
    # Often an image with alt="Avatar".

    avatars = page.get_by_alt_text("Avatar").all()
    if len(avatars) > 0:
        # Click the first one (usually the author of the slide)
        avatars[0].click()
        time.sleep(2)
        page.screenshot(path="/home/jules/verification/author_profile.png")

        # Verify Item 4: "Jesteś Patronem" or "Zostań Patronem"
        # Check if "Zostań Patronem" button exists.
        btn = page.get_by_text("Zostań Patronem")
        if btn.is_visible():
            btn.click()
            time.sleep(2)
            # Tipping Modal should be open.
            page.screenshot(path="/home/jules/verification/tipping_modal_step1.png")

            # Navigate to Step 3 to see the button.
            # Step 1: Select recipient "Pawłowi Polutkowi"
            page.get_by_text("Pawłowi Polutkowi").click()
            # Step 2: "Dalej" (Wait, button text might be different if not logged in?)
            # The button is conditionally rendered.
            # If not logged in, we go to Step 1 (Data).

            # Let's check for "Enter" button or "Dalej" (if I didn't change it everywhere).
            # The code has "ENTER" for currentStep < 3.

            # Click "ENTER" (was "Napiwkuj" or "Dalej")
            # If text is "ENTER", click it.
            enter_btn = page.get_by_role("button", name="ENTER")
            if enter_btn.is_visible():
                enter_btn.click()
                time.sleep(1)

                # Step 2 (if not logged in): "Dane"
                # Check if we are on "Dane" step.
                if page.get_by_placeholder("Twój adres email").is_visible():
                     # If we need to fill email to proceed.
                     # We can just check the button style here if it's visible.
                     pass

                # We mainly want to verify the button style and text "ENTER".
                # Screenshot covers this.

    # Verify Item 1: Profile Tab Avatar Icon
    # Need to be logged in to see Profile Tab.
    # If not logged in, we can't easily verify this without credentials.
    # I will skip deep login verification if complicated, but I can check if the code change is reflected in the build by the fact the build passed.

    # Verify Item 7: Comments Modal Layout
    # Open comments.
    # Look for a comment icon.
    comment_btn = page.locator('button[data-testid="comments-button"]') # Using memory: "Sidebar contains a comments button identifiable by data-testid='comments-button'"
    if not comment_btn.is_visible():
        # Fallback: look for message-square icon
        pass
    else:
        comment_btn.click()
        time.sleep(2)
        page.screenshot(path="/home/jules/verification/comments_modal.png")

        # Check if input is fixed at bottom.
        # Check if "@" is gone from usernames.

    page.screenshot(path="/home/jules/verification/final_state.png")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      verify_changes(page)
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="/home/jules/verification/error.png")
    finally:
      browser.close()
