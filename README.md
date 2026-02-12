# Instagram Bulk Comment Deleter

![Animation](https://github.com/user-attachments/assets/9b7804fd-f26c-41f5-ac81-b962297fbf21)

Browser-based JavaScript utility for bulk deleting Instagram comments from the comments activity page.

> ⚠️ **Use at your own risk. Deletions are irreversible.**

## Features

- Uses **text-based selectors** — resilient against Instagram DOM changes
- Supports **English and Turkish** UI locales (Select/Seç, Delete/Sil)
- Enables multi-select mode and deletes comments in safe batches
- Multiple fallback strategies for finding UI elements
- Automatically repeats until no comments remain
- Conservative defaults to reduce the risk of action limits

## Usage

1. Open Instagram in a desktop browser.
2. Navigate to:  
   `https://www.instagram.com/your_activity/interactions/comments`
3. **(Optional)** Click **Sort & filter** to select a specific date range — only filtered comments will be deleted.
4. Open the browser developer console:
   - **Mac:** `Cmd + Option + I`
   - **Windows/Linux:** `Ctrl + Shift + I`
5. Copy the script from [`auto-delete-instagram-comments.js`](auto-delete-instagram-comments.js) and paste it into the console.
6. Press Enter.

> 💡 If pasting is blocked, type `allow pasting` in the console and press Enter, then try again.

## Configuration

Edit these constants at the top of the script:

| Constant       | Default  | Description                              |
|----------------|----------|------------------------------------------|
| `MAX`          | `10`     | Comments to delete per cycle             |
| `CYCLE_DELAY`  | `20000`  | Delay between delete cycles (ms)         |
| `SELECT_DELAY` | `1200`   | Delay after clicking Select (ms)         |
| `ICON_DELAY`   | `700`    | Delay between selecting comments (ms)    |
| `DELETE_DELAY` | `1500`   | Delay before confirming deletion (ms)    |

## Stop Execution

To stop the script mid-run, execute in the console:

```js
window.__STOP_IG_BULK_DELETE__ = true;
```

## How It Works

1. Finds the **Select/Seç** button by scanning all `<span>` elements for matching text
2. Enters multi-selection mode
3. Locates comment checkboxes using multiple selector strategies (`data-testid`, `role="checkbox"`, etc.)
4. Selects up to `MAX` comments per cycle
5. Clicks **Delete/Sil** and confirms in the modal dialog
6. Repeats until no comments remain or the stop flag is set

## Notes

- Instagram frequently changes its HTML structure. This script uses text-based and ARIA-based selectors instead of `data-bloks-name` attributes for better resilience.
- Start with a low `MAX` value (5–10) and increase gradually.
- Keep the browser tab **visible and focused** while the script runs.
- This script is provided as-is. No guarantees are made regarding long-term compatibility.

## Credits

Originally forked from [iamceeso/instagram-bulk-comment-deleter](https://github.com/iamceeso/instagram-bulk-comment-deleter).

## License

[MIT](LICENSE)
