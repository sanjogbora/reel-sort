# Feature Details

## Core Features

### 1. Auto-Scroll Collection
- **Smart scrolling**: Progressively loads reels without overwhelming Instagram's servers
- **Duplicate detection**: Prevents collecting the same reel multiple times
- **Stuck detection**: Automatically stops if page stops loading new content
- **Configurable limits**: Max 100 scrolls to prevent infinite loops

### 2. View Count Extraction
Multiple fallback methods to find view counts:

**Method 1: Text Search**
- Searches all span/div elements for text matching "X views"
- Handles formats: "1.2M views", "500K views", "1,234 views"

**Method 2: ARIA Labels**
- Checks aria-label attributes for accessibility text
- Fallback for when view counts are hidden in regular DOM

**Method 3: React Props**
- Accesses Instagram's internal React component data
- Most reliable but may break with Instagram updates

### 3. Intelligent Parsing
Converts human-readable numbers to sortable integers:
- "1.2M" → 1,200,000
- "500K" → 500,000
- "1,234" → 1,234
- Handles commas, decimals, and suffixes (K, M, B)

### 4. DOM Reordering
- Uses CSS flexbox `order` property for visual reordering
- Non-destructive: doesn't modify Instagram's actual data
- Preserves all functionality (clicking, liking, etc.)

### 5. Multi-Tab Coordination
- Background service worker tracks all Instagram tabs
- Can trigger sorting across multiple tabs simultaneously
- Useful for comparing multiple profiles or batch processing

### 6. Silent Operation
- No user interaction required after clicking button
- Runs entirely in background
- Shows progress notifications
- Auto-scrolls back to top when complete

## Technical Architecture

### Content Script (content.js)
- Runs on all Instagram pages
- Injects UI button
- Handles scrolling and data collection
- Performs DOM manipulation
- Communicates with background worker

### Background Worker (background.js)
- Coordinates multi-tab operations
- Tracks active Instagram tabs
- Relays messages between tabs
- Handles extension icon clicks

### Popup (popup.html/js)
- User interface for extension
- Shows list of Instagram tabs
- Provides sorting controls
- Displays status messages

## Privacy & Security

### What Data is Collected?
- Reel URLs (only from current page)
- View counts (only from visible DOM)
- Temporary storage in browser memory

### What Data is Sent?
- **Nothing!** All processing happens locally
- No external API calls
- No analytics or tracking
- No data leaves your browser

### Permissions Explained
- `tabs`: To detect Instagram tabs and coordinate multi-tab sorting
- `scripting`: To inject content script into Instagram pages
- `storage`: To temporarily store sorting preferences (future feature)
- `activeTab`: To interact with the currently active tab
- `host_permissions`: Only for instagram.com domain

## Performance Optimization

### Memory Management
- Clears collected data after sorting
- Uses dataset attributes to mark processed elements
- Limits scroll attempts to prevent memory leaks

### CPU Efficiency
- Throttled scrolling (400ms intervals)
- Batch DOM queries instead of individual lookups
- Minimal DOM manipulation (only reordering, not recreating)

### Network Impact
- No additional network requests
- Works with data already loaded by Instagram
- Respects Instagram's rate limiting

## Future Enhancements

Potential features for future versions:

### Sorting Options
- [ ] Sort by likes
- [ ] Sort by comments
- [ ] Sort by engagement rate
- [ ] Sort by date posted
- [ ] Custom sort combinations

### UI Improvements
- [ ] Progress bar during collection
- [ ] Reel count display
- [ ] Sort direction toggle (ascending/descending)
- [ ] Filter options (min views, date range)

### Advanced Features
- [ ] Export sorted list to CSV
- [ ] Save sorting preferences per profile
- [ ] Keyboard shortcuts
- [ ] Dark mode for popup
- [ ] Statistics dashboard

### Platform Support
- [ ] TikTok support
- [ ] YouTube Shorts support
- [ ] Twitter/X video sorting
- [ ] Facebook Reels support

### Performance
- [ ] Lazy loading for large collections
- [ ] Virtual scrolling for better performance
- [ ] Caching of collected data
- [ ] Background sorting without page interaction

## Compatibility

### Instagram Features
- ✅ Profile pages
- ✅ Public reels
- ✅ Desktop view
- ⚠️ Mobile view (limited)
- ❌ Private profiles
- ❌ Stories
- ❌ Home feed
- ❌ Explore page

### Browser Support
- ✅ Chrome 88+ (Manifest V3)
- ✅ Edge 88+
- ✅ Brave
- ✅ Opera
- ❌ Firefox (different API)
- ❌ Safari (different API)

### Instagram Updates
The extension may break if Instagram:
- Changes their HTML class names
- Modifies their DOM structure
- Updates their React component architecture
- Changes how view counts are displayed

When this happens, the extension will need updates to adapt to the new structure.

## Development

### File Structure
```
instagram-reels-sorter/
├── manifest.json          # Extension configuration
├── content.js            # Main sorting logic
├── background.js         # Multi-tab coordinator
├── popup.html           # Extension popup UI
├── popup.js             # Popup logic
├── icon16.png           # Extension icons
├── icon48.png
├── icon128.png
├── README.md            # User documentation
├── TESTING.md           # Testing guide
├── FEATURES.md          # This file
└── generate_icons.py    # Icon generator script
```

### Key Functions

**content.js:**
- `parseViewCount(text)` - Converts "1.2M" to 1200000
- `extractReelData(element)` - Extracts data from DOM element
- `autoScrollAndCollect()` - Auto-scrolls and collects reels
- `sortReelsByViews()` - Sorts and reorders DOM
- `injectSortButton()` - Adds button to Instagram UI

**background.js:**
- `sortAllInstagramTabs()` - Triggers sorting on all tabs
- Message relay for multi-tab coordination

**popup.js:**
- `sortCurrentTab()` - Sort active tab
- `sortAllTabs()` - Sort all Instagram tabs
- `loadInstagramTabs()` - List Instagram tabs

### Debugging

Enable debug mode by adding to content.js:
```javascript
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log('[Reels Sorter]', ...args);
}
```

### Contributing

To contribute:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly on multiple profiles
4. Submit pull request with description

### Testing Checklist
- [ ] Works on @instagram profile
- [ ] Works on @natgeo profile
- [ ] Handles profiles with few reels (<10)
- [ ] Handles profiles with many reels (>50)
- [ ] Multi-tab sorting works
- [ ] Button appears on page load
- [ ] Button appears after navigation
- [ ] No console errors
- [ ] Popup opens and functions
- [ ] Icons display correctly

## License

MIT License - Free to use, modify, and distribute
