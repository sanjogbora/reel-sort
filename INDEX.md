# Instagram Reels Sorter - Documentation Index

## 🚀 Getting Started

**New User? Start Here:**
1. [INSTALL.txt](INSTALL.txt) - Simple installation instructions
2. [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
3. [VISUAL_GUIDE.md](VISUAL_GUIDE.md) - See what to expect

## 📚 Documentation

### User Guides
- **[README.md](README.md)** - Main documentation, features, usage
- **[QUICKSTART.md](QUICKSTART.md)** - Fast setup and first use
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Visual walkthrough with diagrams
- **[INSTALL.txt](INSTALL.txt)** - Plain text installation guide

### Technical Documentation
- **[FEATURES.md](FEATURES.md)** - Detailed feature explanations
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and data flow
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

### Testing & Deployment
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-launch checklist

## 📁 Core Files

### Extension Files (Required)
```
manifest.json       - Extension configuration
content.js          - Main sorting logic (runs on Instagram)
background.js       - Service worker (multi-tab coordination)
popup.html          - Extension popup interface
popup.js            - Popup functionality
icon16.png          - Extension icon (16x16)
icon48.png          - Extension icon (48x48)
icon128.png         - Extension icon (128x128)
```

### Utility Files
```
generate_icons.py   - Python script to generate icons
create-icons.html   - HTML-based icon generator
```

## 🎯 Quick Reference

### Installation
```
1. chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder
```

### Usage
```
Method 1: Click "📊 Sort by Views" button on Instagram profile
Method 2: Click extension icon → "Sort Current Tab"
Method 3: Click extension icon → "Sort All Instagram Tabs"
```

### Test Profiles
```
@instagram - Official Instagram account
@natgeo    - National Geographic
@nike      - Nike
@redbull   - Red Bull
```

## 📖 Documentation by Purpose

### I want to...

**Install the extension**
→ Read: [INSTALL.txt](INSTALL.txt) or [QUICKSTART.md](QUICKSTART.md)

**Learn how to use it**
→ Read: [README.md](README.md) or [VISUAL_GUIDE.md](VISUAL_GUIDE.md)

**Understand how it works**
→ Read: [FEATURES.md](FEATURES.md) or [ARCHITECTURE.md](ARCHITECTURE.md)

**Test it thoroughly**
→ Read: [TESTING.md](TESTING.md)

**Deploy to production**
→ Read: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**Get a complete overview**
→ Read: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**See visual examples**
→ Read: [VISUAL_GUIDE.md](VISUAL_GUIDE.md)

**Troubleshoot issues**
→ Read: [TESTING.md](TESTING.md) → Troubleshooting section

## 🔧 Technical Details

### Technologies Used
- Chrome Extensions API (Manifest V3)
- Vanilla JavaScript (no frameworks)
- CSS Flexbox (for reordering)
- DOM Manipulation
- Message Passing API

### Browser Support
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Opera
- ❌ Firefox (different API)
- ❌ Safari (different API)

### Permissions Required
- `tabs` - Detect Instagram tabs
- `scripting` - Inject content script
- `storage` - Store preferences
- `activeTab` - Interact with active tab
- `host_permissions` - instagram.com only

## 📊 Features at a Glance

- ✅ Auto-scroll and collect reels
- ✅ Sort by view count (high to low)
- ✅ Multi-tab support
- ✅ Silent operation
- ✅ Privacy-friendly (no external calls)
- ✅ Non-destructive (doesn't modify Instagram data)
- ✅ Visual notifications
- ✅ Simple UI

## 🎨 File Structure

```
instagram-reels-sorter/
│
├── Core Extension Files
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── popup.html
│   └── popup.js
│
├── Assets
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── User Documentation
│   ├── INSTALL.txt
│   ├── README.md
│   ├── QUICKSTART.md
│   └── VISUAL_GUIDE.md
│
├── Technical Documentation
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   └── PROJECT_SUMMARY.md
│
├── Testing & Deployment
│   ├── TESTING.md
│   └── DEPLOYMENT_CHECKLIST.md
│
├── Utilities
│   ├── generate_icons.py
│   └── create-icons.html
│
└── This File
    └── INDEX.md
```

## 🆘 Help & Support

### Common Issues

**Button doesn't appear**
→ See: [TESTING.md](TESTING.md) → Troubleshooting

**No reels found**
→ See: [README.md](README.md) → Limitations

**Extension won't load**
→ See: [INSTALL.txt](INSTALL.txt) → Troubleshooting

**Sorting doesn't work**
→ See: [TESTING.md](TESTING.md) → Common Issues

### Debug Mode
Open browser console (F12) to see error messages and debug info.

### Contact
- Check documentation first
- Look for error messages in console
- Verify Instagram hasn't changed their layout

## 📝 Version History

### v1.0.0 (Current)
- Initial release
- Sort by views
- Multi-tab support
- Auto-scroll collection
- Visual notifications

## 🔮 Future Plans

Potential features:
- Sort by likes, comments, engagement
- TikTok support
- YouTube Shorts support
- Export to CSV
- Statistics dashboard
- Keyboard shortcuts

## 📄 License

MIT License - Free to use, modify, and distribute

## 🎉 Ready to Start?

1. **First time?** → Read [QUICKSTART.md](QUICKSTART.md)
2. **Want details?** → Read [README.md](README.md)
3. **Need visuals?** → Read [VISUAL_GUIDE.md](VISUAL_GUIDE.md)
4. **Technical user?** → Read [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Choose your path and start sorting Instagram Reels! 📊**
