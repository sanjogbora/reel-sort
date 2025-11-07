// Content script for Instagram Reels sorting
(function() {
  'use strict';

  let isSorting = false;
  let reelsData = [];
  
  // Register this tab with background
  chrome.runtime.sendMessage({ action: 'registerTab' });

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'startSort') {
      startSortingProcess();
    } else if (message.action === 'scrollTo') {
      window.scrollTo({ top: message.position, behavior: 'instant' });
    }
  });

  // Check if we're on a profile page with reels
  function isProfileReelsPage() {
    return window.location.pathname.match(/^\/[^\/]+\/?$/) || 
           window.location.pathname.includes('/reels');
  }

  // Inject sort button into Instagram UI
  function injectSortButton() {
    if (document.getElementById('reels-sort-btn')) return;
    
    // Wait for profile header to load
    const checkHeader = setInterval(() => {
      const header = document.querySelector('header') || 
                     document.querySelector('[role="banner"]');
      
      if (header && isProfileReelsPage()) {
        clearInterval(checkHeader);
        
        const sortBtn = document.createElement('button');
        sortBtn.id = 'reels-sort-btn';
        sortBtn.textContent = '📊 Sort by Views';
        sortBtn.style.cssText = `
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 9999;
          padding: 10px 20px;
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-size: 14px;
          transition: transform 0.2s;
        `;
        
        sortBtn.onmouseover = () => sortBtn.style.transform = 'scale(1.05)';
        sortBtn.onmouseout = () => sortBtn.style.transform = 'scale(1)';
        sortBtn.onclick = startSortingProcess;
        
        document.body.appendChild(sortBtn);
      }
    }, 500);
    
    setTimeout(() => clearInterval(checkHeader), 10000);
  }

  // Parse view count from text
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

  // Extract reel data from DOM element
  function extractReelData(element) {
    try {
      const link = element.querySelector('a[href*="/reel/"]') || 
                   element.querySelector('a[href*="/p/"]');
      if (!link) return null;
      
      const url = link.href;
      
      // Try multiple methods to find views
      let viewsText = '';
      let views = 0;
      
      // Method 1: Look for SVG icon followed by text (Instagram's current structure)
      const svgParents = element.querySelectorAll('svg');
      for (const svg of svgParents) {
        const parent = svg.parentElement;
        if (parent) {
          const nextSibling = parent.nextElementSibling;
          if (nextSibling) {
            const text = nextSibling.textContent.trim();
            // Check if it's a number with K/M/B suffix
            if (text.match(/^[\d,.]+[KMB]?$/i)) {
              viewsText = text;
              views = parseViewCount(text);
              break;
            }
          }
        }
      }
      
      // Method 2: Search all text nodes for "views" or just numbers
      if (!viewsText) {
        const allSpans = element.querySelectorAll('span, div');
        for (const el of allSpans) {
          const text = el.textContent.trim();
          // Match patterns like "7,125" or "5.5K" or "1.2M"
          if (text.match(/^[\d,.]+[KMB]?$/i) && text.length < 10) {
            viewsText = text;
            views = parseViewCount(text);
            break;
          }
          // Also try with "views" text
          if (text.match(/[\d,.]+[KMB]?\s*(views?|Views?)/i)) {
            viewsText = text;
            views = parseViewCount(text);
            break;
          }
        }
      }
      
      // Method 3: Check aria-labels
      if (!viewsText) {
        const ariaElements = element.querySelectorAll('[aria-label]');
        for (const el of ariaElements) {
          const label = el.getAttribute('aria-label');
          if (label && label.toLowerCase().includes('views')) {
            viewsText = label;
            views = parseViewCount(label);
            break;
          }
        }
      }
      
      return {
        element: element,
        url: url,
        views: views,
        viewsText: viewsText
      };
    } catch (error) {
      return null;
    }
  }

  // Auto-scroll and collect reels
  async function autoScrollAndCollect() {
    return new Promise((resolve) => {
      let lastHeight = 0;
      let scrollAttempts = 0;
      let stuckCount = 0;
      const maxScrolls = 100; // Increased limit
      
      const scrollInterval = setInterval(() => {
        // Multiple selectors for Instagram's changing structure
        const selectors = [
          'a[href*="/reel/"]',
          'a[href*="/p/"]',
          'article a',
          '[role="link"][href*="/reel/"]'
        ];
        
        let reelLinks = [];
        for (const selector of selectors) {
          const found = document.querySelectorAll(selector);
          if (found.length > 0) {
            reelLinks = Array.from(found);
            break;
          }
        }
        
        reelLinks.forEach(link => {
          // Find the parent container (usually 2-3 levels up)
          let parent = link.parentElement;
          for (let i = 0; i < 5; i++) {
            if (!parent) break;
            
            if (!parent.dataset.collected) {
              const data = extractReelData(parent);
              if (data && data.url && !reelsData.find(r => r.url === data.url)) {
                reelsData.push(data);
                parent.dataset.collected = 'true';
              }
            }
            parent = parent.parentElement;
          }
        });
        
        // Scroll down smoothly
        window.scrollBy({ top: 1000, behavior: 'smooth' });
        scrollAttempts++;
        
        const currentHeight = document.documentElement.scrollHeight;
        
        // Check if stuck
        if (currentHeight === lastHeight) {
          stuckCount++;
        } else {
          stuckCount = 0;
        }
        
        // Stop if reached bottom, max scrolls, or stuck
        if (stuckCount >= 3 || scrollAttempts >= maxScrolls) {
          clearInterval(scrollInterval);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(resolve, 500);
        }
        
        lastHeight = currentHeight;
      }, 400);
    });
  }

  // Sort and reorder reels in DOM
  function sortReelsByViews() {
    if (reelsData.length === 0) {
      showNotification('No reels found to sort');
      return;
    }
    
    // Sort by views descending
    reelsData.sort((a, b) => b.views - a.views);
    
    console.log('[Reels Sorter] Top 5 reels:', reelsData.slice(0, 5).map(r => ({
      url: r.url.split('/').pop(),
      views: r.views,
      viewsText: r.viewsText
    })));
    
    // Strategy: Find individual reel containers (each contains exactly 1 reel)
    const gridItems = [];
    const processedUrls = new Set();
    
    reelsData.forEach(reel => {
      if (processedUrls.has(reel.url)) return;
      processedUrls.add(reel.url);
      
      // Use the element we already stored during collection
      if (!reel.element) {
        console.log('[Reels Sorter] No element for reel:', reel.url);
        return;
      }
      
      // Walk up from the stored element to find the individual reel container
      // This container should have exactly 1 reel link
      let element = reel.element;
      let foundContainer = null;
      
      for (let i = 0; i < 10; i++) {
        if (!element) break;
        
        // Check if this element contains exactly 1 reel link
        const reelLinks = element.querySelectorAll('a[href*="/reel/"]');
        
        if (reelLinks.length === 1) {
          // This is an individual reel container
          foundContainer = element;
          break;
        }
        
        element = element.parentElement;
      }
      
      if (foundContainer) {
        gridItems.push({ element: foundContainer, reel: reel });
      } else {
        console.log('[Reels Sorter] Could not find container for:', reel.url.split('/').pop());
      }
    });
    
    console.log('[Reels Sorter] Found grid items:', gridItems.length);
    
    if (gridItems.length === 0) {
      console.log('[Reels Sorter] Trying alternative method...');
      
      // Alternative: Find all reel links currently in DOM
      const allReelLinks = document.querySelectorAll('a[href*="/reel/"]');
      console.log('[Reels Sorter] Found reel links in DOM:', allReelLinks.length);
      
      allReelLinks.forEach(link => {
        let element = link;
        
        for (let i = 0; i < 10; i++) {
          if (!element) break;
          
          const reelLinks = element.querySelectorAll('a[href*="/reel/"]');
          
          if (reelLinks.length === 1) {
            // Find matching reel data
            const matchingReel = reelsData.find(r => element.querySelector(`a[href="${r.url}"]`));
            
            if (matchingReel) {
              gridItems.push({ element: element, reel: matchingReel });
            }
            break;
          }
          
          element = element.parentElement;
        }
      });
      
      console.log('[Reels Sorter] Alternative method found:', gridItems.length);
    }
    
    if (gridItems.length === 0) {
      showNotification('⚠️ Could not identify grid items');
      return;
    }
    
    // Find common parent - EXACT logic from working fixed_sort.js
    console.log('[Reels Sorter] Finding common parent...');
    
    let container = null;
    let current = gridItems[0].element;
    
    for (let level = 0; level < 15; level++) {
      if (!current) break;
      
      // Check how many of our containers this level contains
      let containsCount = 0;
      gridItems.forEach(item => {
        if (current.contains(item.element)) {
          containsCount++;
        }
      });
      
      console.log(`[Reels Sorter] Level ${level}: Contains ${containsCount}/${gridItems.length} containers`);
      
      // If this level contains all our containers, use it
      if (containsCount === gridItems.length) {
        container = current;
        console.log(`[Reels Sorter] ✓ Found common parent at level ${level}`);
        break;
      }
      
      current = current.parentElement;
    }
    
    if (!container) {
      showNotification('⚠️ Could not find common parent');
      console.log('[Reels Sorter] Failed to find common parent');
      return;
    }
    
    console.log('[Reels Sorter] Common parent has', container.children.length, 'direct children');
    
    // Reorder using remove() and insertBefore() - EXACT logic from working script
    // Detach all our containers
    gridItems.forEach(item => {
      if (item.element.parentElement) {
        item.element.remove();
      }
    });
    
    // Find where to insert them back
    const insertPoint = container.firstChild;
    
    // Insert in sorted order
    gridItems.forEach(item => {
      if (insertPoint) {
        container.insertBefore(item.element, insertPoint);
      } else {
        container.appendChild(item.element);
      }
    });
    
    console.log('[Reels Sorter] DOM reordered successfully');
    console.log('[Reels Sorter] Top 3 after sort:', gridItems.slice(0, 3).map(item => ({
      views: item.reel.views,
      text: item.reel.viewsText
    })));
    
    // Add visual indicators to top reels
    gridItems.slice(0, 3).forEach((item, index) => {
      const badge = document.createElement('div');
      badge.textContent = ['🥇', '🥈', '🥉'][index];
      badge.className = 'sort-medal';
      badge.style.cssText = `
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 1000;
        font-size: 28px;
        background: rgba(0,0,0,0.8);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      `;
      
      // Find the link container and make it relative
      const linkContainer = item.element.querySelector('a[href*="/reel/"]');
      if (linkContainer) {
        linkContainer.style.position = 'relative';
        linkContainer.appendChild(badge);
      }
    });
    
    console.log('[Reels Sorter] Medals added!');
    console.log('[Reels Sorter] Top 3 reels:');
    console.log('🥇', gridItems[0].reel.views, 'views');
    console.log('🥈', gridItems[1].reel.views, 'views');
    console.log('🥉', gridItems[2].reel.views, 'views');
    
    showNotification(`✅ Sorted ${gridItems.length} reels by views!`);
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 10000;
      padding: 15px 25px;
      background: rgba(0,0,0,0.9);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // Main sorting process
  async function startSortingProcess() {
    if (isSorting) {
      showNotification('Already sorting...');
      return;
    }
    
    if (!isProfileReelsPage()) {
      showNotification('Please navigate to a profile page');
      return;
    }
    
    isSorting = true;
    reelsData = [];
    
    const btn = document.getElementById('reels-sort-btn');
    if (btn) {
      btn.textContent = '⏳ Collecting...';
      btn.disabled = true;
    }
    
    showNotification('🔄 Auto-scrolling and collecting reels...');
    
    await autoScrollAndCollect();
    
    // Debug: Log collected data
    console.log('[Reels Sorter] Collected reels:', reelsData.length);
    console.log('[Reels Sorter] Sample data:', reelsData.slice(0, 3));
    
    sortReelsByViews();
    
    if (btn) {
      btn.textContent = '📊 Sort by Views';
      btn.disabled = false;
    }
    
    isSorting = false;
  }

  // Initialize
  function init() {
    if (isProfileReelsPage()) {
      injectSortButton();
    }
    
    // Re-inject button on navigation
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(injectSortButton, 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    chrome.runtime.sendMessage({ action: 'unregisterTab' });
  });
})();
