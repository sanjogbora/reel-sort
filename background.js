// Background service worker for multi-tab control
let activeTabs = new Set();

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sortAllTabs') {
    sortAllInstagramTabs();
  } else if (message.action === 'registerTab') {
    activeTabs.add(sender.tab.id);
  } else if (message.action === 'unregisterTab') {
    activeTabs.delete(sender.tab.id);
  }
  return true;
});

// Sort all Instagram tabs simultaneously
async function sortAllInstagramTabs() {
  const tabs = await chrome.tabs.query({ url: 'https://www.instagram.com/*' });
  
  for (const tab of tabs) {
    try {
      chrome.tabs.sendMessage(tab.id, { action: 'startSort' });
    } catch (error) {
      console.log(`Could not message tab ${tab.id}`);
    }
  }
}

// Sync scroll across multiple tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'syncScroll') {
    const scrollPosition = message.scrollPosition;
    
    // Broadcast scroll to all active tabs except sender
    activeTabs.forEach(tabId => {
      if (tabId !== sender.tab.id) {
        chrome.tabs.sendMessage(tabId, {
          action: 'scrollTo',
          position: scrollPosition
        }).catch(() => {});
      }
    });
  }
});
