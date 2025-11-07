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

      // Method 2: Search all text nodes for numbers (most reliable)
      if (!viewsText) {
        const allSpans = element.querySelectorAll('span, div');
        let maxViews = 0;

        for (const el of allSpans) {
          const text = el.textContent.trim();
          // Match patterns like "7,125" or "5.5K" or "1.2M" (exactly, no extra text)
          if (text.match(/^[\d,]+$/) || text.match(/^[\d,.]+[KMB]$/i)) {
            const parsedViews = parseViewCount(text);
            // Take the highest number found (likely the view count)
            if (parsedViews > maxViews) {
              maxViews = parsedViews;
              viewsText = text;
              views = parsedViews;
            }
          }
          // Also try with "views" text
          if (text.match(/[\d,.]+[KMB]?\s*(views?|Views?)/i)) {
            const parsedViews = parseViewCount(text);
            if (parsedViews > maxViews) {
              maxViews = parsedViews;
              viewsText = text;
              views = parsedViews;
            }
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

      // DON'T store element reference - it will become stale!
      return {
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

            const data = extractReelData(parent);
            if (data && data.url && !reelsData.find(r => r.url === data.url)) {
              reelsData.push(data);
              break; // Found data for this link, move to next
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

    // Create a map of URL -> view count for quick lookup
    const viewsMap = new Map();
    reelsData.forEach(reel => {
      viewsMap.set(reel.url, reel);
    });

    console.log('[Reels Sorter] View data collected for', viewsMap.size, 'reels');
    console.log('[Reels Sorter] Top 5 reels:', reelsData.sort((a, b) => b.views - a.views).slice(0, 5).map(r => ({
      url: r.url.split('/').pop(),
      views: r.views,
      viewsText: r.viewsText
    })));

    // CRITICAL: Query FRESH DOM elements (don't use stored references!)
    // Find all individual reel containers currently in the DOM
    const reelContainers = [];
    const processedUrls = new Set();

    // Find all reel links currently visible in DOM
    const allReelLinks = document.querySelectorAll('a[href*="/reel/"]');
    console.log('[Reels Sorter] Found reel links in current DOM:', allReelLinks.length);

    // First pass: find what level the containers are at
    let containerLevel = -1;
    const firstLink = allReelLinks[0];
    if (firstLink) {
      let testContainer = firstLink;
      for (let i = 0; i < 10; i++) {
        testContainer = testContainer.parentElement;
        if (!testContainer) break;

        const reelLinks = testContainer.querySelectorAll('a[href*="/reel/"]');
        if (reelLinks.length === 1) {
          containerLevel = i + 1; // +1 because we start from the link itself
          console.log('[Reels Sorter] Container level detected:', containerLevel);
          break;
        }
      }
    }

    // Second pass: collect all containers at the SAME level
    allReelLinks.forEach(link => {
      const url = link.href;
      if (processedUrls.has(url)) return;

      // Navigate to the exact container level we detected
      let container = link;
      for (let i = 0; i < containerLevel; i++) {
        if (!container) break;
        container = container.parentElement;
      }

      if (!container) return;

      // Verify this container has exactly 1 reel link
      const reelLinks = container.querySelectorAll('a[href*="/reel/"]');
      if (reelLinks.length === 1 && reelLinks[0].href === url) {
        // Check if we have view data for this URL
        const reelData = viewsMap.get(url);
        reelContainers.push({
          element: container,
          url: url,
          views: reelData ? reelData.views : 0,
          viewsText: reelData ? reelData.viewsText : 'Unknown',
          level: containerLevel
        });
        processedUrls.add(url);
      }
    });

    console.log('[Reels Sorter] Found individual reel containers:', reelContainers.length);

    if (reelContainers.length === 0) {
      showNotification('⚠️ Could not find reel containers in current view');
      console.log('[Reels Sorter] No containers found. Try scrolling up to load reels.');
      return;
    }

    // Sort by views descending
    reelContainers.sort((a, b) => b.views - a.views);

    console.log('[Reels Sorter] Top 5 after sort:', reelContainers.slice(0, 5).map(r => ({
      url: r.url.split('/').pop(),
      views: r.views,
      viewsText: r.viewsText
    })));

    // NEW APPROACH: Content swapping instead of element moving
    // This preserves the exact grid structure by swapping innerHTML between containers
    console.log('[Reels Sorter] Using content-swap approach to preserve grid structure');

    // Create a map of current position -> sorted position
    const originalPositions = reelContainers.map((item, index) => ({
      element: item.element,
      originalIndex: index,
      views: item.views,
      innerHTML: item.element.innerHTML,
      attributes: Array.from(item.element.attributes).map(attr => ({
        name: attr.name,
        value: attr.value
      }))
    }));

    // Sort by views
    const sortedByViews = [...originalPositions].sort((a, b) => b.views - a.views);

    console.log('[Reels Sorter] Swapping content between containers...');
    console.log('[Reels Sorter] Will swap content of', originalPositions.length, 'containers');

    // Swap content: Put highest view content in first container, etc.
    originalPositions.forEach((target, index) => {
      const source = sortedByViews[index];

      // Replace the entire innerHTML and attributes
      target.element.innerHTML = source.innerHTML;

      // Copy over any data attributes or classes that might affect styling
      // But preserve position-related attributes
      source.attributes.forEach(attr => {
        if (!attr.name.includes('style') && !attr.name.includes('data-collected')) {
          try {
            target.element.setAttribute(attr.name, attr.value);
          } catch(e) {
            // Some attributes can't be set, skip them
          }
        }
      });
    });

    console.log('[Reels Sorter] ✅ Content swapped successfully');
    console.log('[Reels Sorter] Grid structure preserved, reels sorted by views');
    console.log('[Reels Sorter] Top 3 reels (after sorting):');
    console.log('#1:', sortedByViews[0].views, 'views');
    console.log('#2:', sortedByViews[1].views, 'views');
    console.log('#3:', sortedByViews[2].views, 'views');

    showNotification(`✅ Sorted ${reelContainers.length} reels by views!`);
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
