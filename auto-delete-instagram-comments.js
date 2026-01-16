/**
 * Instagram Bulk Comments Deletion Script
 *
 * Purpose:
 * Automates the selection and deletion of comments using Instagram’s
 * current Bloks-based UI and the confirmation React modal.
 *
 * Execution:
 * 1. Open Instagram in a desktop browser.
 * 2. Navigate to the comments activity page:
 *    https://www.instagram.com/your_activity/interactions/comments
 * 3. Open your browser developer console (preferable Chrome).
 * 4. Paste this script and execute it.
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
   * Dispatches pointer events to simulate a real user click.
   * Required for Bloks UI elements which ignore .click().
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
   * Locates the "Select" control that enables multi-selection mode.
   */
  function findSelectButton() {
    return [
      ...document.querySelectorAll(
        'div[data-bloks-name="bk.components.Flexbox"]',
      ),
    ].find((el) => el.innerText?.trim() === "Select");
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
   * Retrieves selectable comment icons (unchecked radio buttons).
   */
  function getSelectableIcons() {
    return document.querySelectorAll(
      'div[data-bloks-name="ig.components.Icon"][style*="circle__outline"]',
    );
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
   * Locates the Bloks-level Delete control.
   * The visible text is not clickable; the parent container is.
   */
  function findBloksDeleteButton() {
    const deleteText = [
      ...document.querySelectorAll(
        'span[data-bloks-name="bk.components.TextSpan"]',
      ),
    ].find((span) => span.innerText?.trim() === "Delete");

    if (!deleteText) return null;

    return deleteText.closest('div[style*="pointer-events: auto"]');
  }

  /**
   * Triggers the initial delete action in the Bloks UI.
   */
  async function clickBloksDelete() {
    await sleep(SELECT_DELAY);

    const deleteBtn = findBloksDeleteButton();
    if (!deleteBtn) {
      throw new Error("Bloks Delete control not found");
    }

    realClick(deleteBtn);
  }

  /**
   * Locates the confirmation button in the React modal dialog.
   */
  function findModalDeleteButton() {
    return [...document.querySelectorAll("button")].find(
      (btn) => btn.innerText?.trim() === "Delete",
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
