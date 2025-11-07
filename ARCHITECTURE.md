# Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Browser                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Instagram    │  │ Instagram    │  │ Instagram    │    │
│  │ Tab 1        │  │ Tab 2        │  │ Tab 3        │    │
│  │              │  │              │  │              │    │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │    │
│  │ │Content.js│ │  │ │Content.js│ │  │ │Content.js│ │    │
│  │ └────┬─────┘ │  │ └────┬─────┘ │  │ └────┬─────┘ │    │
│  └──────┼───────┘  └──────┼───────┘  └──────┼───────┘    │
│         │                 │                 │             │
│         └─────────────────┼─────────────────┘             │
│                           │                               │
│                    ┌──────▼──────┐                        │
│                    │ Background  │                        │
│                    │ Service     │                        │
│                    │ Worker      │                        │
│                    └──────┬──────┘                        │
│                           │                               │
│                    ┌──────▼──────┐                        │
│                    │   Popup     │                        │
│                    │   UI        │                        │
│                    └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Single Tab Sorting

```
User Action
    │
    ▼
┌─────────────────┐
│ Click Button    │
│ or Extension    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Content Script  │
│ Activated       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Auto-Scroll     │
│ Page Down       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Reels   │
│ from DOM        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse View      │
│ Counts          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sort Array      │
│ by Views        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Reorder DOM     │
│ Elements        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show Success    │
│ Notification    │
└─────────────────┘
```

### Multi-Tab Sorting

```
User Clicks "Sort All Tabs"
         │
         ▼
┌─────────────────┐
│ Popup.js        │
│ Sends Message   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Background.js   │
│ Receives        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query All       │
│ Instagram Tabs  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Broadcast "startSort" Message  │
│ to All Tabs                     │
└────────┬────────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ Tab 1 │ │ Tab 2 │ │ Tab 3 │ │ Tab N │
│ Sorts │ │ Sorts │ │ Sorts │ │ Sorts │
└───────┘ └───────┘ └───────┘ └───────┘
```

## Component Details

### Content Script (content.js)

**Responsibilities:**
- Inject sort button into Instagram UI
- Listen for user clicks
- Auto-scroll page to load reels
- Extract reel data from DOM
- Parse view counts
- Sort reels by views
- Reorder DOM elements
- Show notifications

**Key Functions:**
```javascript
injectSortButton()        // Add button to page
isProfileReelsPage()      // Check if on profile page
parseViewCount(text)      // "1.2M" → 1200000
extractReelData(element)  // Get data from DOM
autoScrollAndCollect()    // Scroll and collect
sortReelsByViews()        // Sort and reorder
showNotification(msg)     // Show status
```

**Lifecycle:**
```
Page Load → Init → Inject Button → Wait for Click →
Execute Sort → Show Result → Reset
```

### Background Worker (background.js)

**Responsibilities:**
- Track active Instagram tabs
- Coordinate multi-tab operations
- Relay messages between tabs
- Handle extension icon clicks (if no popup)

**Key Functions:**
```javascript
sortAllInstagramTabs()    // Trigger all tabs
registerTab()             // Track new tab
unregisterTab()           // Remove closed tab
syncScroll()              // Sync scroll positions
```

**State:**
```javascript
activeTabs = Set([tabId1, tabId2, ...])
```

### Popup UI (popup.html/js)

**Responsibilities:**
- Provide user interface
- List Instagram tabs
- Trigger sorting actions
- Show status messages

**Actions:**
```javascript
sortCurrentTab()          // Sort active tab
sortAllTabs()             // Sort all tabs
refreshTabs()             // Update tab list
showStatus(msg, type)     // Display status
```

## Message Passing

### Content → Background
```javascript
chrome.runtime.sendMessage({
  action: 'registerTab'
})

chrome.runtime.sendMessage({
  action: 'unregisterTab'
})

chrome.runtime.sendMessage({
  action: 'sortAllTabs'
})
```

### Background → Content
```javascript
chrome.tabs.sendMessage(tabId, {
  action: 'startSort'
})

chrome.tabs.sendMessage(tabId, {
  action: 'scrollTo',
  position: 1000
})
```

### Popup → Background → Content
```javascript
// Popup clicks button
popup.js: sortAllTabs()
    ↓
// Background receives
background.js: chrome.runtime.onMessage
    ↓
// Background broadcasts
background.js: chrome.tabs.sendMessage()
    ↓
// Content receives
content.js: chrome.runtime.onMessage
    ↓
// Content executes
content.js: startSortingProcess()
```

## DOM Manipulation

### Instagram's Structure (Simplified)
```html
<div class="profile-container">
  <div class="reels-grid">
    <div class="reel-item">
      <a href="/reel/ABC123/">
        <img src="thumbnail.jpg">
      </a>
      <span>1.2M views</span>
    </div>
    <div class="reel-item">
      <a href="/reel/DEF456/">
        <img src="thumbnail.jpg">
      </a>
      <span>500K views</span>
    </div>
    <!-- More reels... -->
  </div>
</div>
```

### After Sorting
```html
<div class="reels-grid" style="display: flex; flex-wrap: wrap;">
  <div class="reel-item" style="order: 0">
    <!-- Highest views (1.2M) -->
  </div>
  <div class="reel-item" style="order: 1">
    <!-- Second highest (500K) -->
  </div>
  <!-- More reels in sorted order... -->
</div>
```

## Data Structures

### Reel Object
```javascript
{
  element: DOMElement,      // Reference to DOM node
  url: "instagram.com/reel/ABC123/",
  views: 1200000,           // Parsed integer
  viewsText: "1.2M views"   // Original text
}
```

### Reels Array
```javascript
reelsData = [
  { element: ..., url: ..., views: 1200000, ... },
  { element: ..., url: ..., views: 500000, ... },
  { element: ..., url: ..., views: 100000, ... }
]
```

### After Sorting
```javascript
reelsData.sort((a, b) => b.views - a.views)
// Now ordered: [1200000, 500000, 100000, ...]
```

## Performance Considerations

### Memory
- Each reel object: ~200 bytes
- 100 reels: ~20KB
- DOM references: Minimal overhead
- Total per tab: ~50-100MB

### CPU
- Scrolling: Moderate (400ms intervals)
- DOM queries: Batched for efficiency
- Sorting: O(n log n) - very fast
- Reordering: O(n) - linear time

### Network
- No additional requests
- Uses Instagram's loaded data
- Zero network overhead

## Error Handling

### Graceful Degradation
```javascript
try {
  extractReelData(element)
} catch (error) {
  // Skip this reel, continue with others
  return null
}
```

### User Feedback
```javascript
if (reelsData.length === 0) {
  showNotification('No reels found')
  return
}
```

### Timeout Protection
```javascript
const maxScrolls = 100
if (scrollAttempts >= maxScrolls) {
  clearInterval(scrollInterval)
  resolve()
}
```

## Security

### Content Security Policy
- No eval() or inline scripts
- No external resources
- All code in extension files

### Permissions
- Minimal required permissions
- Only instagram.com domain
- No broad host permissions

### Data Privacy
- No data sent to external servers
- No analytics or tracking
- All processing local

## Testing Strategy

### Unit Testing
- parseViewCount() with various inputs
- extractReelData() with mock DOM
- sortReelsByViews() with test data

### Integration Testing
- Full sort flow on test profile
- Multi-tab coordination
- Message passing between components

### Manual Testing
- Various Instagram profiles
- Different reel counts
- Edge cases (no reels, private profile)

## Deployment

### Development
```bash
chrome://extensions/ → Load unpacked
```

### Production
```bash
1. Zip extension folder
2. Upload to Chrome Web Store
3. Submit for review
4. Publish
```

## Maintenance

### Instagram Updates
Monitor for:
- DOM structure changes
- Class name changes
- React component updates
- API changes

### Browser Updates
- Test with new Chrome versions
- Update manifest if needed
- Check deprecated APIs

### User Feedback
- Monitor console errors
- Track success rates
- Gather feature requests
