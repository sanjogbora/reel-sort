# Instagram Reels Sorter Extension

Chrome extension that automatically sorts Instagram Reels by view count on profile pages.

## Features

- 📊 **Auto-sort by views** - Automatically scrolls and collects all reels, then sorts by view count
- 🎯 **Simple UI** - Click the floating button on any Instagram profile or click the extension icon
- 🚀 **Multi-tab support** - Can control multiple Instagram tabs simultaneously
- 🔇 **Silent operation** - Works in background without user interaction needed

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder

## Usage

### Method 1: In-page Button (Recommended)
1. Navigate to any Instagram profile page
2. Click the **"📊 Sort by Views"** button (appears in top-right corner)
3. Extension will auto-scroll, collect all reels, and sort them by views
4. Watch as reels are automatically reordered from highest to lowest views

### Method 2: Extension Popup
1. Navigate to any Instagram profile page
2. Click the extension icon in your Chrome toolbar
3. Choose from:
   - **Sort Current Tab** - Sort only the active tab
   - **Sort All Instagram Tabs** - Sort all open Instagram tabs simultaneously
   - **Refresh Tab List** - Update the list of Instagram tabs

### Multi-Tab Sorting
1. Open multiple Instagram profile pages in different tabs
2. Click extension icon
3. Click "Sort All Instagram Tabs"
4. All tabs will scroll and sort simultaneously in the background

## How It Works

1. **Auto-scroll**: Progressively scrolls down the profile to load all reels
2. **Data extraction**: Parses view counts from each reel's DOM elements
3. **Sorting**: Orders reels by view count (highest first)
4. **DOM reordering**: Visually reorders the reels grid using CSS flexbox

## Technical Details

- **Manifest V3** compatible
- **No external API calls** - all processing happens client-side
- **Privacy-friendly** - no data leaves your browser
- Works by manipulating Instagram's DOM structure

## Limitations

- Only works on profile pages (not Explore or Home feed)
- Limited to reels that Instagram loads (typically 50-100 max)
- View counts must be visible in DOM to be parsed
- May break if Instagram significantly changes their HTML structure

## Troubleshooting

**Button doesn't appear:**
- Refresh the page
- Make sure you're on a profile page (not home feed)
- Check that extension is enabled in chrome://extensions/

**"Could not find reels container" error:**
- Extension will try alternative sorting method automatically
- Check browser console (F12) for debug messages
- See DEBUG_GUIDE.md for detailed troubleshooting

**Sorting doesn't work:**
- Instagram may have changed their DOM structure
- Try refreshing and clicking again
- Check browser console for errors (F12)
- Reload extension: chrome://extensions/ → click reload icon

**No reels found:**
- Make sure the profile has public reels
- Scroll manually first to load some reels
- Profile may have reels disabled
- Check console: `document.querySelectorAll('a[href*="/reel/"]').length`

## Development

Files:
- `manifest.json` - Extension configuration
- `content.js` - Main sorting logic, runs on Instagram pages
- `background.js` - Service worker for multi-tab coordination
- `icon*.png` - Extension icons (need to be created)

## License

MIT License - Feel free to modify and use
