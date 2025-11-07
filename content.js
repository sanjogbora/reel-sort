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

      // Extract thumbnail image
      let thumbnail = '';
      const img = element.querySelector('img');
      if (img && img.src) {
        thumbnail = img.src;
      }

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

      return {
        url: url,
        views: views,
        viewsText: viewsText,
        thumbnail: thumbnail
      };
    } catch (error) {
      return null;
    }
  }

  // Show loading overlay during collection
  function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'reels-sorter-loading';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 99998;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    const text = document.createElement('div');
    text.id = 'loading-text';
    text.style.cssText = `
      color: white;
      font-size: 16px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    text.textContent = 'Collecting reels...';

    const count = document.createElement('div');
    count.id = 'loading-count';
    count.style.cssText = `
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    count.textContent = '0 reels found';

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    overlay.appendChild(spinner);
    overlay.appendChild(text);
    overlay.appendChild(count);
    document.body.appendChild(overlay);

    return overlay;
  }

  // Auto-scroll and collect reels
  async function autoScrollAndCollect() {
    const loadingOverlay = showLoadingOverlay();
    const loadingCount = document.getElementById('loading-count');

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
              // Update loading count
              if (loadingCount) {
                loadingCount.textContent = `${reelsData.length} reels found`;
              }
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

          // Update loading text
          if (loadingCount) {
            loadingCount.textContent = `Found ${reelsData.length} reels! Preparing view...`;
          }

          // Scroll to top and resolve
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            // Remove loading overlay
            if (loadingOverlay) {
              loadingOverlay.remove();
            }
            resolve();
          }, 500);
        }

        lastHeight = currentHeight;
      }, 400);
    });
  }

  // Create Instagram-like overlay with sorted reels
  function sortReelsByViews() {
    if (reelsData.length === 0) {
      showNotification('No reels found to sort');
      return;
    }

    // Sort all collected reels by views
    const sortedReels = [...reelsData].sort((a, b) => b.views - a.views);

    console.log('[Reels Sorter] Sorted', sortedReels.length, 'reels');
    console.log('[Reels Sorter] Top 5:', sortedReels.slice(0, 5).map(r => ({
      url: r.url.split('/').pop(),
      views: r.views,
      viewsText: r.viewsText
    })));

    // Create full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'reels-sorter-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgb(0, 0, 0);
      z-index: 99999;
      overflow-y: auto;
      overflow-x: hidden;
    `;

    // Create header (like Instagram's)
    const header = document.createElement('div');
    header.style.cssText = `
      position: sticky;
      top: 0;
      background: rgb(0, 0, 0);
      border-bottom: 1px solid rgb(38, 38, 38);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100000;
    `;

    const title = document.createElement('h2');
    title.textContent = `Sorted by Views (${sortedReels.length} reels)`;
    title.style.cssText = `
      color: rgb(255, 255, 255);
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: transparent;
      border: none;
      color: rgb(255, 255, 255);
      font-size: 24px;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 4px;
      transition: background 0.2s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.1)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'transparent';
    closeBtn.onclick = () => overlay.remove();

    header.appendChild(title);
    header.appendChild(closeBtn);
    overlay.appendChild(header);

    // Create grid container (Instagram uses 3 columns on desktop)
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
      max-width: 975px;
      margin: 0 auto;
      padding: 20px;
    `;

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
    `;

    // Create grid items for each reel
    sortedReels.forEach((reel, index) => {
      const item = document.createElement('a');
      item.href = reel.url;
      item.target = '_self';
      item.style.cssText = `
        position: relative;
        display: block;
        aspect-ratio: 1;
        overflow: hidden;
        background: rgb(38, 38, 38);
        cursor: pointer;
        text-decoration: none;
      `;

      // Add thumbnail
      if (reel.thumbnail) {
        const img = document.createElement('img');
        img.src = reel.thumbnail;
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        `;
        item.appendChild(img);
      }

      // Add view count overlay (always visible)
      const viewBadge = document.createElement('div');
      viewBadge.style.cssText = `
        position: absolute;
        bottom: 8px;
        left: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      `;

      // Add play icon SVG (like Instagram)
      const playIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      playIcon.setAttribute('width', '12');
      playIcon.setAttribute('height', '12');
      playIcon.setAttribute('viewBox', '0 0 24 24');
      playIcon.setAttribute('fill', 'white');
      playIcon.innerHTML = '<path d="M5.888 22.5a3.46 3.46 0 0 1-1.721-.46l-.003-.002a3.451 3.451 0 0 1-1.72-2.982V4.943a3.445 3.445 0 0 1 5.163-2.987l12.226 7.059a3.444 3.444 0 0 1-.001 5.967l-12.22 7.056a3.462 3.462 0 0 1-1.724.462Z"></path>';

      viewBadge.appendChild(playIcon);
      viewBadge.appendChild(document.createTextNode(reel.viewsText || reel.views.toLocaleString()));

      item.appendChild(viewBadge);

      // Add rank badge for top 3
      if (index < 3) {
        const rankBadge = document.createElement('div');
        rankBadge.textContent = ['🥇', '🥈', '🥉'][index];
        rankBadge.style.cssText = `
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 24px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        `;
        item.appendChild(rankBadge);
      }

      // Hover effect overlay
      const hoverOverlay = document.createElement('div');
      hoverOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0);
        transition: background 0.2s;
        pointer-events: none;
      `;
      item.appendChild(hoverOverlay);

      item.onmouseover = () => hoverOverlay.style.background = 'rgba(0, 0, 0, 0.3)';
      item.onmouseout = () => hoverOverlay.style.background = 'rgba(0, 0, 0, 0)';

      grid.appendChild(item);
    });

    gridContainer.appendChild(grid);
    overlay.appendChild(gridContainer);

    // Add to page
    document.body.appendChild(overlay);

    // Scroll to top of overlay
    overlay.scrollTop = 0;

    console.log('[Reels Sorter] ✅ Overlay created with', sortedReels.length, 'sorted reels');
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
