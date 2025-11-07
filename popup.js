// Popup script for multi-tab control
let instagramTabs = [];

document.getElementById('sortCurrent').addEventListener('click', sortCurrentTab);
document.getElementById('sortAll').addEventListener('click', sortAllTabs);
document.getElementById('refreshTabs').addEventListener('click', loadInstagramTabs);

async function sortCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url || !tab.url.includes('instagram.com')) {
    showStatus('❌ Not an Instagram page', 'error');
    return;
  }
  
  showStatus('🔄 Sorting current tab...', 'info');
  
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'startSort' });
    showStatus('✅ Sorting started!', 'success');
  } catch (error) {
    showStatus('❌ Error: ' + error.message, 'error');
  }
}

async function sortAllTabs() {
  const tabs = await chrome.tabs.query({ url: 'https://www.instagram.com/*' });
  
  if (tabs.length === 0) {
    showStatus('❌ No Instagram tabs found', 'error');
    return;
  }
  
  showStatus(`🔄 Sorting ${tabs.length} tabs...`, 'info');
  
  let successCount = 0;
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'startSort' });
      successCount++;
    } catch (error) {
      console.log(`Failed to sort tab ${tab.id}`);
    }
  }
  
  showStatus(`✅ Started sorting ${successCount}/${tabs.length} tabs`, 'success');
}

async function loadInstagramTabs() {
  const tabs = await chrome.tabs.query({ url: 'https://www.instagram.com/*' });
  instagramTabs = tabs;
  
  const tabList = document.getElementById('tabList');
  
  if (tabs.length === 0) {
    tabList.style.display = 'none';
    showStatus('No Instagram tabs open', 'info');
    return;
  }
  
  tabList.style.display = 'block';
  tabList.innerHTML = '';
  
  tabs.forEach(tab => {
    const item = document.createElement('div');
    item.className = 'tab-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.dataset.tabId = tab.id;
    
    const label = document.createElement('span');
    label.textContent = tab.title || 'Instagram';
    label.style.flex = '1';
    label.style.overflow = 'hidden';
    label.style.textOverflow = 'ellipsis';
    label.style.whiteSpace = 'nowrap';
    
    item.appendChild(checkbox);
    item.appendChild(label);
    tabList.appendChild(item);
  });
  
  showStatus(`Found ${tabs.length} Instagram tabs`, 'success');
}

function showStatus(message, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = message;
  
  // Optional: add color coding
  if (type === 'error') {
    status.style.background = 'rgba(255,0,0,0.2)';
  } else if (type === 'success') {
    status.style.background = 'rgba(0,255,0,0.2)';
  } else {
    status.style.background = 'rgba(255,255,255,0.1)';
  }
}

// Load tabs on popup open
loadInstagramTabs();
