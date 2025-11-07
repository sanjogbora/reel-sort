# Testing Guide

## Quick Test

1. **Load Extension**
   ```
   - Open Chrome
   - Go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this folder
   ```

2. **Test Single Profile**
   ```
   - Go to https://www.instagram.com/instagram/
   - Wait for page to load
   - Look for "📊 Sort by Views" button in top-right
   - Click it
   - Watch auto-scroll and sorting happen
   ```

3. **Test Extension Popup**
   ```
   - Click extension icon in toolbar
   - Click "Sort Current Tab"
   - Should see status messages
   ```

4. **Test Multi-Tab**
   ```
   - Open 3-4 Instagram profile pages in different tabs
   - Click extension icon
   - Click "Sort All Instagram Tabs"
   - Switch between tabs to see them all sorting
   ```

## Expected Behavior

### Successful Sort
- Button changes to "⏳ Collecting..."
- Page auto-scrolls down progressively
- Notification appears: "🔄 Auto-scrolling and collecting reels..."
- Page scrolls back to top
- Reels reorder visually
- Notification: "✅ Sorted X reels by views!"
- Button returns to "📊 Sort by Views"

### Common Issues

**Button doesn't appear:**
- Wait 2-3 seconds after page load
- Refresh the page
- Make sure you're on a profile page (URL like instagram.com/username)
- Check console for errors (F12 → Console tab)

**No reels found:**
- Profile may not have public reels
- Try a different profile (e.g., @instagram, @natgeo)
- Manually scroll down first to load some reels

**Sorting doesn't work:**
- Instagram may have changed their HTML structure
- Check console for errors
- Try refreshing and sorting again

**Multi-tab not working:**
- Make sure all tabs are Instagram profile pages
- Refresh tabs and try again
- Check that extension has permissions

## Debug Mode

To see what's happening:

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Run the extension
4. Look for any red error messages

Common console messages:
- "No reels found to sort" - Profile has no reels or they didn't load
- "Could not find reels container" - DOM structure changed
- Network errors - Instagram may be blocking requests

## Test Profiles

Good profiles to test with:
- @instagram - Official Instagram account
- @natgeo - National Geographic
- @nike - Nike
- @redbull - Red Bull

These typically have many public reels with visible view counts.

## Performance

- Typical scroll time: 10-30 seconds
- Reels collected: 50-100 (depends on profile)
- Memory usage: ~50-100MB per tab
- CPU usage: Moderate during scrolling, minimal after

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Opera
- ❌ Firefox (uses different extension API)
- ❌ Safari (uses different extension API)

## Troubleshooting Commands

Check if extension is loaded:
```javascript
// In console on Instagram page
chrome.runtime.id
```

Check if content script is running:
```javascript
// In console on Instagram page
document.getElementById('reels-sort-btn')
```

Manually trigger sort:
```javascript
// In console on Instagram page
document.getElementById('reels-sort-btn').click()
```

## Known Limitations

1. **View count visibility**: Can only sort reels where view counts are visible in the DOM
2. **Scroll limit**: Limited to ~100 reels to prevent Instagram rate limiting
3. **DOM changes**: May break if Instagram updates their HTML structure
4. **Private profiles**: Cannot access private profiles
5. **Rate limiting**: Instagram may throttle if you sort too many profiles quickly

## Reporting Issues

If something doesn't work:

1. Check console for errors (F12)
2. Note which profile you were testing
3. Take a screenshot of the error
4. Check if Instagram's layout has changed
5. Try with a different profile

## Advanced Testing

### Test DOM Extraction
```javascript
// In console on Instagram profile page
const links = document.querySelectorAll('a[href*="/reel/"]');
console.log(`Found ${links.length} reel links`);
```

### Test View Count Parsing
```javascript
// In console
function parseViewCount(text) {
  if (!text) return 0;
  const match = text.match(/([\d,.]+)\s*([KMB]?)/i);
  if (!match) return 0;
  let num = parseFloat(match[1].replace(/,/g, ''));
  const suffix = match[2].toUpperCase();
  if (suffix === 'K') num *= 1000;
  else if (suffix === 'M') num *= 1000000;
  else if (suffix === 'B') num *= 1000000000;
  return Math.floor(num);
}

console.log(parseViewCount('1.2M views')); // Should output 1200000
console.log(parseViewCount('500K views')); // Should output 500000
```

### Monitor Scroll Progress
```javascript
// In console during sorting
setInterval(() => {
  console.log(`Scroll position: ${window.scrollY}, Height: ${document.documentElement.scrollHeight}`);
}, 1000);
```
