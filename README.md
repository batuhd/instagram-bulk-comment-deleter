# Instagram Bulk Comment Deleter

Browser-based JavaScript utility for bulk deleting Instagram comments
from the comments activity page.

## Usage

1. Open Instagram in a desktop browser.
2. Go to:
   https://www.instagram.com/your_activity/interactions/comments
3. Open the browser developer console.
4. Copy the script from `auto-delete-instagram-comments.js`
   and paste it into the console.
5. Press Enter.

## Stop execution

To stop repeated delete cycles, run:
```js
window.__STOP_IG_BULK_DELETE__ = true;
