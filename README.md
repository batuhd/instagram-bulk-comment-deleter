# Instagram Bulk Comment Deleter

Browser-based JavaScript utility for bulk deleting Instagram comments
from the comments activity page using Instagram’s current Bloks UI.

⚠️ **Use at your own risk. Deletions are irreversible.**

## What this script does

- Enables multi-select mode on Instagram’s comments activity page
- Selects comments in small, safe batches
- Deletes them using the Bloks UI + confirmation modal
- Automatically repeats until no comments remain

The script is intentionally conservative to reduce the risk of
temporary action limits.


## Usage

1. Open Instagram in a desktop browser.
2. Go to:
   https://www.instagram.com/your_activity/interactions/comments
3. Open the browser developer console  
- **Mac:** `Cmd + Option + I`  
- **Windows/Linux:** `Ctrl + Shift + I`
4. Copy the script from `auto-delete-instagram-comments.js`
   and paste it into the console.
5. Press Enter.

## Stop execution

To stop repeated delete cycles, run:
```js
window.__STOP_IG_BULK_DELETE__ = true;
