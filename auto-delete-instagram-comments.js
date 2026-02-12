/**
 * Instagram Bulk Comments Deletion Script
 *
 * Purpose:
 * Automates the selection and deletion of comments using Instagram's
 * current React-based UI and confirmation modal.
 * Uses text-based selectors for resilience against DOM changes.
 * Supports both English and Turkish (Seç/Sil) locales.
 *
 * Execution:
 * 1. Open Instagram in a desktop browser.
 * 2. Navigate to the comments activity page:
 *    https://www.instagram.com/your_activity/interactions/comments
 * 3. Use Instagram's "Sort & filter" to select the date range you want to delete.
 * 4. Open your browser developer console (preferable Chrome).
 * 5. Paste this script and execute it.
 *
 * Notes:
 * - Deletions are irreversible.
 * - Instagram allows selecting up to 100 comments per action, but
 *   smaller batches are more reliable.
 * - Recommended batch size is 5–50 to reduce the risk of temporary
 *   action limits or account restrictions.
 *
 * Configuration:
 * - Modify the MAX constant in the script to control how many comments
 *   are deleted per execution.
 * - Adjust delays (CYCLE_DELAY, SELECT_DELAY, ICON_DELAY, DELETE_DELAY)
 *
 *
 * Troubleshooting:
 * - If pasting is blocked, type `allow pasting` in the console and
 *   press Enter, then paste the script again.
 *
 * - To stop repeated execution, set `window.__STOP_IG_BULK_DELETE__ = true` in the console.
 *
 * Disclaimer:
 * Use at your own risk. The author is not responsible for any account restrictions,
 * issues or data loss resulting from the use of this script.
 */

(async function instagramBulkDelete() {
  window.__STOP_IG_BULK_DELETE__ = false;

  /**
   * Runtime configuration.
   * Keep MAX low for reliability.
   */
  const MAX = 10;
  const CYCLE_DELAY = 20000;
  const SELECT_DELAY = 1200;
  const ICON_DELAY = 700;
  const DELETE_DELAY = 1500;

  /**
   * Utility: async sleep helper.
   */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Localized button labels (English + Turkish).
   */
  const SELECT_LABELS = ["Select", "Seç"];
  const DELETE_LABELS = ["Delete", "Sil"];

  /**
   * Dispatches pointer events to simulate a real user click.
   * Required for React UI elements which ignore .click().
   */
  function realClick(element) {
    element.scrollIntoView({ block: "center" });

    ["mousedown", "mouseup", "click"].forEach((eventType) => {
      element.dispatchEvent(
        new MouseEvent(eventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1,
        }),
      );
    });
  }

  /**
   * Locates the "Select" / "Seç" control that enables multi-selection mode.
   * Uses text-based search across all spans since data-bloks-name is removed.
   */
  function findSelectButton() {
    for (const span of document.querySelectorAll("span")) {
      if (SELECT_LABELS.includes(span.textContent?.trim())) {
        return (
          span.closest('[role="button"]') ||
          span.closest("div[tabindex]") ||
          span.parentElement ||
          span
        );
      }
    }
    return null;
  }

  /**
   * Activates comment selection mode.
   */
  async function activateSelectMode() {
    const selectBtn = findSelectButton();
    if (!selectBtn) {
      throw new Error("Select control not found");
    }

    realClick(selectBtn);
    await sleep(SELECT_DELAY);
  }

  /**
   * Retrieves selectable comment icons (unchecked checkboxes/radio buttons).
   * Uses multiple fallback strategies since Instagram changes attributes frequently.
   */
  function getSelectableIcons() {
    // Strategy 1: data-testid checkboxes
    let icons = document.querySelectorAll('[data-testid="bulk_action_checkbox"]');
    if (icons.length) return icons;

    // Strategy 2: role=checkbox with unchecked state
    icons = document.querySelectorAll('[role="checkbox"][aria-checked="false"]');
    if (icons.length) return icons;

    // Strategy 3: unfilled circle icons (legacy style attribute)
    icons = document.querySelectorAll('div[style*="circle__outline"]');
    if (icons.length) return icons;

    // Strategy 4: generic unchecked input checkboxes
    icons = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
    if (icons.length) return icons;

    // Strategy 5: any unchecked radio-style icons in the comment list
    icons = document.querySelectorAll('[role="radio"][aria-checked="false"]');
    return icons;
  }

  /**
   * Selects up to `max` comments.
   */
  async function selectComments(max) {
    const icons = getSelectableIcons();
    if (!icons.length) {
      return 0;
    }

    let selected = 0;

    for (const icon of icons) {
      if (selected >= max) break;

      icon.scrollIntoView({ behavior: "smooth", block: "center" });
      await sleep(400);

      const button = icon.closest('[role="button"]');
      if (!button) continue;

      realClick(button);
      selected++;
      await sleep(ICON_DELAY);
    }

    return selected;
  }

  /**
   * Locates the Delete / Sil control in the main UI.
   * The visible text is not clickable; the parent container is.
   */
  function findBloksDeleteButton() {
    for (const span of document.querySelectorAll("span")) {
      if (DELETE_LABELS.includes(span.textContent?.trim())) {
        const btn =
          span.closest('[role="button"]') ||
          span.closest('div[style*="pointer-events"]') ||
          span.parentElement;
        if (btn) return btn;
      }
    }
    return null;
  }

  /**
   * Triggers the initial delete action in the main UI.
   */
  async function clickBloksDelete() {
    await sleep(SELECT_DELAY);

    const deleteBtn = findBloksDeleteButton();
    if (!deleteBtn) {
      throw new Error("Delete control not found (looked for: " + DELETE_LABELS.join("/") + ")");
    }

    realClick(deleteBtn);
  }

  /**
   * Locates the confirmation button in the React modal dialog.
   */
  function findModalDeleteButton() {
    return [...document.querySelectorAll("button")].find((btn) =>
      DELETE_LABELS.includes(btn.innerText?.trim()),
    );
  }

  /**
   * Confirms deletion in the modal dialog.
   */
  async function confirmFinalDelete() {
    await sleep(DELETE_DELAY);

    const modalDeleteBtn = findModalDeleteButton();
    if (!modalDeleteBtn) {
      throw new Error("Final confirmation button not found");
    }

    modalDeleteBtn.focus();
    await sleep(100);
    modalDeleteBtn.click();
  }

  /**
   * Main execution loop.
   */
  let cycle = 1;

  while (!window.__STOP_IG_BULK_DELETE__) {
    try {
      await activateSelectMode();
      const deletedCount = await selectComments(MAX);

      if (!deletedCount) {
        console.log("No comments left to delete");
        break;
      }

      await clickBloksDelete();
      await confirmFinalDelete();

      console.log(`Cycle ${cycle}: deleted ${deletedCount} comments`);
      cycle++;

      await sleep(CYCLE_DELAY);
    } catch (error) {
      console.warn("Execution stopped:", error.message);
      break;
    }
  }
})();
