# Visual Guide

## What You'll See

### 1. Installation
```
Chrome Browser
├── Address Bar: chrome://extensions/
├── Toggle: Developer mode [ON]
├── Button: "Load unpacked"
└── Select: This folder
```

### 2. Extension Loaded
```
Chrome Toolbar
└── 📊 Icon appears (Instagram Reels Sorter)

Extensions Page
└── Instagram Reels Sorter
    ├── Status: Enabled ✓
    ├── Version: 1.0.0
    └── Permissions: tabs, scripting, storage, activeTab
```

### 3. Instagram Profile Page
```
┌─────────────────────────────────────────────────────┐
│ Instagram                                    [📊 Sort by Views] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Profile Header                                     │
│  ┌─────────┐                                       │
│  │ Avatar  │  Username                             │
│  └─────────┘  Bio text...                          │
│                                                     │
│  ┌─────────┬─────────┬─────────┐                  │
│  │ Posts   │ Reels   │ Tagged  │                  │
│  └─────────┴─────────┴─────────┘                  │
│                                                     │
│  Reels Grid:                                       │
│  ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │ 1.2M│ │ 800K│ │ 500K│  ← Sorted by views       │
│  │views│ │views│ │views│                           │
│  └─────┘ └─────┘ └─────┘                          │
│  ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │ 300K│ │ 200K│ │ 100K│                           │
│  │views│ │views│ │views│                           │
│  └─────┘ └─────┘ └─────┘                          │
└─────────────────────────────────────────────────────┘
```

### 4. Sort Button States

**Before Sorting:**
```
┌──────────────────┐
│ 📊 Sort by Views │  ← Click me!
└──────────────────┘
```

**During Sorting:**
```
┌──────────────────┐
│ ⏳ Collecting... │  ← Auto-scrolling
└──────────────────┘
```

**After Sorting:**
```
┌──────────────────┐
│ 📊 Sort by Views │  ← Ready again
└──────────────────┘
```

### 5. Notifications

**Starting:**
```
┌─────────────────────────────────────┐
│ 🔄 Auto-scrolling and collecting... │
└─────────────────────────────────────┘
```

**Success:**
```
┌─────────────────────────────────┐
│ ✅ Sorted 47 reels by views!    │
└─────────────────────────────────┘
```

**Error:**
```
┌─────────────────────────────────┐
│ ❌ No reels found to sort       │
└─────────────────────────────────┘
```

### 6. Extension Popup

```
┌────────────────────────────────┐
│  📊 Instagram Reels Sorter     │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │  Sort Current Tab        │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  Sort All Instagram Tabs │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  Refresh Tab List        │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ ✅ Sorting started!      │ │
│  └──────────────────────────┘ │
└────────────────────────────────┘
```

### 7. Multi-Tab View

```
Tab 1: @instagram     Tab 2: @natgeo      Tab 3: @nike
┌─────────────┐      ┌─────────────┐     ┌─────────────┐
│ Sorting...  │      │ Sorting...  │     │ Sorting...  │
│ ⏳          │      │ ⏳          │     │ ⏳          │
│             │      │             │     │             │
│ [Reels]     │      │ [Reels]     │     │ [Reels]     │
│ [Reels]     │      │ [Reels]     │     │ [Reels]     │
│ [Reels]     │      │ [Reels]     │     │ [Reels]     │
└─────────────┘      └─────────────┘     └─────────────┘
        ↓                   ↓                    ↓
All sorting simultaneously!
```

## User Journey

### Journey 1: First Time User

```
1. Install Extension
   └─→ See icon in toolbar ✓

2. Visit Instagram Profile
   └─→ See sort button appear ✓

3. Click Sort Button
   └─→ Page auto-scrolls ✓
   └─→ Reels reorder ✓
   └─→ Success notification ✓

4. Enjoy Sorted Reels!
   └─→ Highest views first ✓
```

### Journey 2: Power User

```
1. Open Multiple Profiles
   ├─→ Tab 1: @instagram
   ├─→ Tab 2: @natgeo
   ├─→ Tab 3: @nike
   └─→ Tab 4: @redbull

2. Click Extension Icon
   └─→ Popup opens ✓

3. Click "Sort All Tabs"
   └─→ All tabs sort ✓
   └─→ Status shows progress ✓

4. Switch Between Tabs
   └─→ All sorted! ✓
```

## Visual Indicators

### Button Appearance
```
Normal State:
┌──────────────────┐
│ 📊 Sort by Views │  ← Gradient background
└──────────────────┘    White text
                        Rounded corners
                        Shadow effect

Hover State:
┌──────────────────┐
│ 📊 Sort by Views │  ← Slightly larger
└──────────────────┘    More shadow

Active State:
┌──────────────────┐
│ ⏳ Collecting... │  ← Disabled
└──────────────────┘    Different text
```

### Notification Styles
```
Info:
┌─────────────────────────────────┐
│ 🔄 Processing...                │  ← Blue-ish
└─────────────────────────────────┘

Success:
┌─────────────────────────────────┐
│ ✅ Done!                         │  ← Green-ish
└─────────────────────────────────┘

Error:
┌─────────────────────────────────┐
│ ❌ Failed!                       │  ← Red-ish
└─────────────────────────────────┘
```

## Before & After

### Before Sorting
```
Reels in random order:
┌─────┐ ┌─────┐ ┌─────┐
│ 500K│ │ 1.2M│ │ 200K│
└─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐
│ 800K│ │ 100K│ │ 300K│
└─────┘ └─────┘ └─────┘
```

### After Sorting
```
Reels sorted by views (high to low):
┌─────┐ ┌─────┐ ┌─────┐
│ 1.2M│ │ 800K│ │ 500K│  ← Highest first
└─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐
│ 300K│ │ 200K│ │ 100K│  ← Lowest last
└─────┘ └─────┘ └─────┘
```

## Animation Flow

### Sorting Process
```
Step 1: Click Button
   │
   ▼
Step 2: Auto-Scroll Down
   │  ┌─────────┐
   │  │ Scroll  │
   │  │   ↓     │
   │  │   ↓     │
   │  │   ↓     │
   │  └─────────┘
   ▼
Step 3: Collect Reels
   │  [Reel 1] → Collected
   │  [Reel 2] → Collected
   │  [Reel 3] → Collected
   ▼
Step 4: Scroll Back Up
   │  ┌─────────┐
   │  │   ↑     │
   │  │   ↑     │
   │  │ Scroll  │
   │  └─────────┘
   ▼
Step 5: Reorder Reels
   │  [Reel 2] (1.2M) → Position 1
   │  [Reel 3] (800K) → Position 2
   │  [Reel 1] (500K) → Position 3
   ▼
Step 6: Show Success
   │  ✅ Sorted!
   ▼
Done!
```

## Color Scheme

### Extension Colors
```
Primary: Instagram Gradient
  #f09433 → #e6683c → #dc2743 → #cc2366 → #bc1888

Button Background: Gradient
Button Text: White (#FFFFFF)
Button Shadow: rgba(0,0,0,0.3)

Notification Background: rgba(0,0,0,0.9)
Notification Text: White (#FFFFFF)

Popup Background: Purple Gradient
  #667eea → #764ba2
Popup Text: White (#FFFFFF)
```

## Icon Design

### Extension Icon
```
┌────────┐
│ ██████ │  ← Gradient background
│ ██  ██ │     (Instagram colors)
│ ██████ │
│ ██  ██ │  ← Chart bars (white)
│ ██  ██ │
└────────┘
```

## Screen Positions

### Desktop Layout
```
┌─────────────────────────────────────────────┐
│ Chrome Toolbar                    [📊]      │  ← Extension icon
├─────────────────────────────────────────────┤
│ Instagram                  [📊 Sort Button] │  ← Sort button
│                                             │     (top-right)
│                                             │
│  Profile Content                            │
│                                             │
│  Reels Grid                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │     │ │     │ │     │                   │
│  └─────┘ └─────┘ └─────┘                   │
│                                             │
│                        [Notification]       │  ← Notifications
│                                             │     (top-right)
└─────────────────────────────────────────────┘
```

## Success Indicators

### Visual Feedback
```
✅ Button returns to normal
✅ Notification shows success
✅ Reels are visibly reordered
✅ Highest views at top
✅ Page scrolled to top
✅ No console errors
```

## Error States

### Common Errors
```
No Reels Found:
  ┌─────────────────────────────┐
  │ ❌ No reels found to sort   │
  └─────────────────────────────┘

Not Profile Page:
  ┌─────────────────────────────────┐
  │ ❌ Please navigate to profile   │
  └─────────────────────────────────┘

Already Sorting:
  ┌─────────────────────────────┐
  │ ⚠️ Already sorting...       │
  └─────────────────────────────┘
```

## Mobile View (Not Supported)

```
┌──────────────┐
│ Instagram    │
│              │
│ ⚠️ Extension │
│ only works   │
│ on desktop   │
│ Chrome       │
│              │
└──────────────┘
```

---

**This visual guide shows what you'll see when using the extension!**
