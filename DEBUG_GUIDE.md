# Debug Guide - Instagram Reels Sorter

## Issue: "Could not find reels container"

This happens when the extension can't locate Instagram's reels grid container.

## Quick Fix Applied

The code has been updated with:
1. Better view count extraction (looks for numbers next to SVG icons)
2. Multiple fallback methods for finding the container
3. Alternative reordering if container isn't found
4. Debug logging to console

## How to Test the Fix

### 1. Reload Extension
```
1. Go to chrome://extensions/
2. Find "Instagram Reels Sorter"
3. Click the reload icon (circular arrow)
```

### 2. Test on Profile
```
1. Go to https://www.instagram.com/nickprocaccio/
2. Open browser console (F12)
3. Click "📊 Sort by Views" button
4. Watch console for debug messages
```

### 3. Check Console Output
You should see:
```
[Reels Sorter] Collected reels: X
[Reels Sorter] Sample data: [...]
```

## Manual Debug Commands

### Check if reels are detected:
```javascript
// In browser console (F12)
document.querySelectorAll('a[href*="/reel/"]').length
```
Should show number > 0

### Check view counts:
```javascript
// Find all text that looks like view counts
const texts = [];
document.querySelectorAll('span, div').forEach(el => {
  const text = el.textContent.trim();
  if (text.match(/^[\d,.]+[KMB]?$/i) && text.length < 10) {
    texts.push(text);
  }
});
console.log('Found view counts:', texts);
```

### Check container:
```javascript
// Find potential containers
const containers = document.querySelectorAll('[style*="grid"], [style*="flex"]');
console.log('Found containers:', containers.length);
containers.forEach((c, i) => {
  const reels = c.querySelectorAll('a[href*="/reel/"]').length;
  console.log(`Container ${i}: ${reels} reels`);
});
```

### Manually trigger sort:
```javascript
document.getElementById('reels-sort-btn').click()
```

## Common Issues & Solutions

### Issue 1: Button doesn't appear
**Solution:**
- Refresh the page
- Wait 3-5 seconds
- Check you're on a profile page (not home feed)

### Issue 2: No reels collected
**Possible causes:**
- Profile has no public reels
- View counts are hidden
- Instagram changed their DOM structure

**Debug:**
```javascript
// Check if reels exist
console.log('Reel links:', document.querySelectorAll('a[href*="/reel/"]').length);

// Check if view counts are visible
const viewCounts = [];
document.querySelectorAll('span').forEach(s => {
  if (s.textContent.match(/[\d,]+/)) {
    viewCounts.push(s.textContent);
  }
});
console.log('Possible view counts:', viewCounts);
```

### Issue 3: Container not found
**What the extension does:**
1. Tries to find by article parent
2. Tries to find grid/flex containers
3. Tries to find divs with multiple reel links
4. Falls back to individual element reordering

**Manual check:**
```javascript
// Find the grid container
const articles = document.querySelectorAll('article');
console.log('Articles found:', articles.length);
if (articles.length > 0) {
  console.log('First article parent:', articles[0].parentElement);
  console.log('Grandparent:', articles[0].parentElement?.parentElement);
}
```

## Instagram's Current Structure (2024)

Based on your screenshot, Instagram uses:
```html
<div> <!-- Grid container -->
  <div> <!-- Reel item -->
    <a href="/reel/...">
      <img>
    </a>
    <svg>...</svg> <!-- Play icon -->
    <span>7,125</span> <!-- View count -->
  </div>
  <!-- More reel items... -->
</div>
```

## If Still Not Working

### Step 1: Inspect Element
1. Right-click on a reel
2. Click "Inspect"
3. Look at the HTML structure
4. Find where the view count is displayed

### Step 2: Share Structure
Take a screenshot of:
- The HTML structure in DevTools
- The console output
- Any error messages

### Step 3: Alternative Approach
If sorting still fails, try:
```javascript
// Manual sort in console
const reels = [];
document.querySelectorAll('a[href*="/reel/"]').forEach(link => {
  const parent = link.closest('div');
  const viewText = parent.querySelector('span')?.textContent;
  if (viewText) {
    reels.push({ element: parent, views: viewText });
  }
});
console.log('Collected:', reels);
```

## Updated Features

The extension now:
- ✅ Looks for numbers next to SVG icons (Instagram's current pattern)
- ✅ Tries multiple container detection methods
- ✅ Falls back to individual element ordering
- ✅ Logs debug info to console
- ✅ Handles various view count formats (7,125 or 7.1K or 1.2M)

## Test Profiles

Try these profiles:
- @nickprocaccio (your screenshot)
- @instagram
- @natgeo
- @nike

## Next Steps

1. Reload the extension
2. Test on the profile from your screenshot
3. Check console for debug messages
4. If it works: Great!
5. If not: Share console output and I'll fix it further

## Emergency Workaround

If extension doesn't work, you can manually sort in console:
```javascript
// Copy-paste this into browser console
const reels = [];
document.querySelectorAll('a[href*="/reel/"]').forEach((link, i) => {
  const parent = link.closest('div');
  const spans = parent.querySelectorAll('span');
  let views = 0;
  spans.forEach(s => {
    const text = s.textContent.trim();
    if (text.match(/^[\d,]+$/)) {
      views = parseInt(text.replace(/,/g, ''));
    }
  });
  reels.push({ element: parent, views, index: i });
});
reels.sort((a, b) => b.views - a.views);
reels.forEach((r, i) => {
  r.element.style.order = i;
  let p = r.element.parentElement;
  for (let j = 0; j < 3; j++) {
    if (p) {
      p.style.order = i;
      p.style.display = 'flex';
      p.style.flexWrap = 'wrap';
      p = p.parentElement;
    }
  }
});
console.log('Sorted!', reels.length, 'reels');
```
