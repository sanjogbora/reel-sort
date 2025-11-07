# Console Scripts - Easy Copy/Paste

## How to Use

1. Open Instagram profile page
2. Press F12 to open console
3. Copy one of the scripts below
4. Paste into console and press Enter

---

## Script 1: Debug Instagram Structure

**Purpose:** Find out where Instagram's grid container is

**How to use:**
1. Open `debug_instagram.js` file
2. Select all (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into console (Ctrl+V)
5. Press Enter
6. Share the output with me

**What it does:**
- Finds all reel links
- Analyzes DOM structure
- Identifies the grid container
- Shows how many children it has

---

## Script 2: Manual Sort (Quick Fix)

**Purpose:** Sort reels manually right now

**How to use:**
1. Open `manual_sort.js` file
2. Select all (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into console (Ctrl+V)
5. Press Enter
6. Reels should sort immediately!

**What it does:**
- Finds the grid container
- Collects all reels and view counts
- Sorts by views (highest first)
- Adds 🥇🥈🥉 medals to top 3
- Shows alert when done

---

## Expected Results

### Debug Script Output:
```
=== FINDING INSTAGRAM GRID STRUCTURE ===
Total reel links found: 73

--- Reel 1 ---
Link: https://www.instagram.com/reel/...
  Level 0: A -> Parent has X children (X with reels)
  Level 1: DIV -> Parent has X children (X with reels)
  ...

=== BEST CONTAINER ===
Container: div
Total children: 73
Children with reels: 73

=== DONE ===
Share these numbers:
1. Total reel links: 73
2. Best container children: 73
3. Children with reels: 73
```

### Manual Sort Output:
```
=== MANUAL INSTAGRAM REELS SORT ===
Grid container found: div
Children with reels: 73
Items collected: 73
Top 3 after sort: [{views: 7125}, {views: 5597}, {views: 5495}]
✅ MANUALLY SORTED!
✅ Medals added!
```

Plus an alert: "Sorted 73 reels! Look for 🥇🥈🥉 medals on top 3."

---

## Troubleshooting

### "Unexpected identifier" error
- Make sure you copied the ENTIRE file
- Don't copy from the markdown file (EMERGENCY_DEBUG.md)
- Use the .js files instead

### "Cannot read property" error
- Make sure you're on an Instagram profile page
- Make sure the profile has reels
- Try refreshing the page first

### No reels found
- Check you're on the right page (should see reels grid)
- Try scrolling down to load some reels first
- Profile might not have public reels

---

## Quick Test

Paste this one-liner to test if console works:

```javascript
console.log('Console is working! Reel links found:', document.querySelectorAll('a[href*="/reel/"]').length);
```

Should output: "Console is working! Reel links found: 73" (or similar number)

---

## Files to Use

1. **debug_instagram.js** - For debugging (share output with me)
2. **manual_sort.js** - For immediate sorting (works right now)

Both files are in the project folder. Open them, copy all content, paste in console.
