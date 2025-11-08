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

      // Extract thumbnail - Instagram uses background-image on div elements
      let thumbnail = '';

      // Look for divs with background-image style
      const allDivs = element.querySelectorAll('div[style*="background-image"]');

      for (const div of allDivs) {
        const style = div.getAttribute('style');
        if (!style) continue;

        // Extract URL from background-image: url('...')
        const match = style.match(/background-image:\s*url\(['"]?([^'"()]+)['"]?\)/i);
        if (match && match[1]) {
          const url = match[1];
          // Validate it's a real Instagram image URL
          if (url.includes('cdninstagram') || url.includes('fbcdn')) {
            thumbnail = url;
            break;
          }
        }
      }

      // Fallback: Try img tags if background-image not found
      if (!thumbnail) {
        const imgs = element.querySelectorAll('img');
        for (const img of imgs) {
          // Skip profile pictures
          if (img.alt && img.alt.toLowerCase().includes('profile')) continue;

          const imgSrc = img.src || img.dataset.src || '';
          if (imgSrc && (imgSrc.includes('cdninstagram') || imgSrc.includes('fbcdn'))) {
            thumbnail = imgSrc;
            break;
          }
        }
      }

      // Try multiple methods to find views, likes, comments
      let viewsText = '';
      let views = 0;
      let likesText = '';
      let likes = 0;
      let commentsText = '';
      let comments = 0;

      // Collect all text content
      const allSpans = element.querySelectorAll('span, div');
      const textContents = [];

      for (const el of allSpans) {
        const text = el.textContent.trim();
        if (text && text.length < 20) { // Reasonable length for stats
          textContents.push(text);
        }
      }

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
              const parsedValue = parseViewCount(text);

              // Heuristic: largest number is likely views, smaller ones are likes/comments
              if (parsedValue > views) {
                // Shift current views to likes if new value is larger
                if (views > 0) {
                  if (likes === 0) {
                    likes = views;
                    likesText = viewsText;
                  }
                }
                views = parsedValue;
                viewsText = text;
              } else if (parsedValue > likes) {
                if (likes > 0 && comments === 0) {
                  comments = likes;
                  commentsText = likesText;
                }
                likes = parsedValue;
                likesText = text;
              } else if (parsedValue > comments) {
                comments = parsedValue;
                commentsText = text;
              }
            }
          }
        }
      }

      // Method 2: Search all text nodes for numbers
      if (!viewsText) {
        let maxViews = 0;
        const numbers = [];

        for (const el of allSpans) {
          const text = el.textContent.trim();
          // Match patterns like "7,125" or "5.5K" or "1.2M" (exactly, no extra text)
          if (text.match(/^[\d,]+$/) || text.match(/^[\d,.]+[KMB]$/i)) {
            const parsedValue = parseViewCount(text);
            numbers.push({ value: parsedValue, text: text });
          }
        }

        // Sort by value descending
        numbers.sort((a, b) => b.value - a.value);

        // Assign: largest = views, second = likes, third = comments
        if (numbers.length > 0) {
          views = numbers[0].value;
          viewsText = numbers[0].text;
        }
        if (numbers.length > 1) {
          likes = numbers[1].value;
          likesText = numbers[1].text;
        }
        if (numbers.length > 2) {
          comments = numbers[2].value;
          commentsText = numbers[2].text;
        }
      }

      return {
        url: url,
        views: views,
        viewsText: viewsText,
        likes: likes,
        likesText: likesText,
        comments: comments,
        commentsText: commentsText,
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

  // Inject sorted reels into Instagram's feed area
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

    // Find Instagram's grid container (prefer _ac7v class, or fallback to main)
    let gridContainer = document.querySelector('._ac7v');
    let targetContainer;

    if (gridContainer) {
      // Found Instagram's grid container - replace only this
      targetContainer = gridContainer;
      targetContainer.dataset.originalContent = targetContainer.innerHTML;
    } else {
      // Fallback: use main but try to preserve profile header
      const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
      if (!mainContent) {
        console.log('[Reels Sorter] Could not find main content area');
        showNotification('Could not find Instagram content area');
        return;
      }
      targetContainer = mainContent;
      targetContainer.dataset.originalContent = targetContainer.innerHTML;
    }

    // Create our sorted grid container
    const container = document.createElement('div');
    container.id = 'reels-sorter-grid';
    container.style.cssText = `
      max-width: 935px;
      margin: 0 auto;
      padding: 30px 20px;
    `;

    // Add header with close button
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgb(38, 38, 38);
    `;

    const title = document.createElement('h2');
    title.textContent = `Sorted by Views (${sortedReels.length} reels)`;
    title.style.cssText = `
      color: rgb(var(--ig-primary-text, 0, 0, 0));
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Show Original';
    closeBtn.style.cssText = `
      background: transparent;
      border: 1px solid rgb(var(--ig-secondary-button-background, 219, 219, 219));
      color: rgb(var(--ig-primary-text, 0, 0, 0));
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      padding: 7px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      transition: all 0.2s;
    `;
    closeBtn.onmouseover = () => {
      closeBtn.style.background = 'rgba(var(--ig-secondary-button-background, 219, 219, 219), 0.1)';
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.background = 'transparent';
    };
    closeBtn.onclick = () => {
      targetContainer.innerHTML = targetContainer.dataset.originalContent;
      delete targetContainer.dataset.originalContent;
    };

    header.appendChild(title);
    header.appendChild(closeBtn);
    container.appendChild(header);

    // Create grid (5 columns for compact view)
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1px;
    `;

    // Create grid items for each reel
    sortedReels.forEach((reel, index) => {
      const item = document.createElement('a');
      item.href = reel.url;
      item.style.cssText = `
        position: relative;
        display: block;
        overflow: hidden;
        cursor: pointer;
        text-decoration: none;
      `;

      // Create aspect ratio container using padding-top technique (Instagram style)
      const aspectContainer = document.createElement('div');
      aspectContainer.style.cssText = `
        position: relative;
        width: 100%;
        padding-top: 155.66%;
        background: rgb(38, 38, 38);
      `;

      // Create content wrapper (absolutely positioned inside aspect container)
      const contentWrapper = document.createElement('div');
      contentWrapper.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      `;

      // Add thumbnail or placeholder
      if (reel.thumbnail) {
        const img = document.createElement('img');
        img.src = reel.thumbnail;
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        `;
        img.onerror = () => {
          // If image fails to load, show placeholder
          img.style.display = 'none';
          contentWrapper.appendChild(createPlaceholder());
        };
        contentWrapper.appendChild(img);
      } else {
        // No thumbnail - show placeholder
        contentWrapper.appendChild(createPlaceholder());
      }

      // Placeholder function
      function createPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgb(38, 38, 38);
        `;

        const reelIconPlaceholder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        reelIconPlaceholder.setAttribute('width', '48');
        reelIconPlaceholder.setAttribute('height', '48');
        reelIconPlaceholder.setAttribute('viewBox', '0 0 24 24');
        reelIconPlaceholder.setAttribute('fill', 'rgb(115, 115, 115)');
        reelIconPlaceholder.innerHTML = '<path d="m12.823 1 2.974 5.002h-5.58l-2.65-4.971c.206-.013.419-.022.642-.027L8.55 1Zm2.327 0h.298c3.06 0 4.468.754 5.64 1.887a6.007 6.007 0 0 1 1.596 2.82l.07.295h-4.629L15.15 1Zm-9.667.377L7.95 6.002H1.244a6.01 6.01 0 0 1 3.942-4.53Zm9.735 12.834-4.545-2.624a.909.909 0 0 0-1.356.668l-.008.12v5.248a.91.91 0 0 0 1.255.84l.109-.053 4.545-2.624a.909.909 0 0 0 .1-1.507l-.1-.068-4.545-2.624Zm-14.2-6.209h21.964l.015.36.003.189v6.899c0 3.061-.755 4.469-1.888 5.64-1.151 1.114-2.5 1.856-5.33 1.909l-.334.003H8.551c-3.06 0-4.467-.755-5.64-1.889-1.114-1.15-1.854-2.498-1.908-5.33L1 15.45V8.551l.003-.189Z"></path>';

        placeholder.appendChild(reelIconPlaceholder);
        return placeholder;
      }

      // Add reel icon (top right - indicates it's a video)
      const reelIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      reelIcon.setAttribute('width', '18');
      reelIcon.setAttribute('height', '18');
      reelIcon.setAttribute('viewBox', '0 0 24 24');
      reelIcon.setAttribute('fill', 'white');
      reelIcon.innerHTML = '<path d="m12.823 1 2.974 5.002h-5.58l-2.65-4.971c.206-.013.419-.022.642-.027L8.55 1Zm2.327 0h.298c3.06 0 4.468.754 5.64 1.887a6.007 6.007 0 0 1 1.596 2.82l.07.295h-4.629L15.15 1Zm-9.667.377L7.95 6.002H1.244a6.01 6.01 0 0 1 3.942-4.53Zm9.735 12.834-4.545-2.624a.909.909 0 0 0-1.356.668l-.008.12v5.248a.91.91 0 0 0 1.255.84l.109-.053 4.545-2.624a.909.909 0 0 0 .1-1.507l-.1-.068-4.545-2.624Zm-14.2-6.209h21.964l.015.36.003.189v6.899c0 3.061-.755 4.469-1.888 5.64-1.151 1.114-2.5 1.856-5.33 1.909l-.334.003H8.551c-3.06 0-4.467-.755-5.64-1.889-1.114-1.15-1.854-2.498-1.908-5.33L1 15.45V8.551l.003-.189Z"></path>';
      reelIcon.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
      `;
      contentWrapper.appendChild(reelIcon);

      // Add view count badge (bottom left)
      const viewBadge = document.createElement('div');
      viewBadge.style.cssText = `
        position: absolute;
        bottom: 8px;
        left: 8px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      `;

      // Add play icon
      const playIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      playIcon.setAttribute('width', '14');
      playIcon.setAttribute('height', '14');
      playIcon.setAttribute('viewBox', '0 0 24 24');
      playIcon.setAttribute('fill', 'white');
      playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      playIcon.style.cssText = 'filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));';

      viewBadge.appendChild(playIcon);
      viewBadge.appendChild(document.createTextNode(reel.viewsText || reel.views.toLocaleString()));

      contentWrapper.appendChild(viewBadge);

      // Hover overlay with stats
      const hoverOverlay = document.createElement('div');
      hoverOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      `;

      // Add likes stat
      if (reel.likes > 0) {
        const likesStat = document.createElement('div');
        likesStat.style.cssText = `
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 16px;
          font-weight: 600;
        `;

        const heartIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        heartIcon.setAttribute('width', '19');
        heartIcon.setAttribute('height', '19');
        heartIcon.setAttribute('viewBox', '0 0 48 48');
        heartIcon.setAttribute('fill', 'white');
        heartIcon.innerHTML = '<path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>';

        likesStat.appendChild(heartIcon);
        likesStat.appendChild(document.createTextNode(reel.likesText || reel.likes.toLocaleString()));
        hoverOverlay.appendChild(likesStat);
      }

      // Add comments stat
      if (reel.comments > 0) {
        const commentsStat = document.createElement('div');
        commentsStat.style.cssText = `
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 16px;
          font-weight: 600;
        `;

        const commentIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        commentIcon.setAttribute('width', '19');
        commentIcon.setAttribute('height', '19');
        commentIcon.setAttribute('viewBox', '0 0 48 48');
        commentIcon.setAttribute('fill', 'white');
        commentIcon.innerHTML = '<path d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z"></path>';

        commentsStat.appendChild(commentIcon);
        commentsStat.appendChild(document.createTextNode(reel.commentsText || reel.comments.toLocaleString()));
        hoverOverlay.appendChild(commentsStat);
      }

      contentWrapper.appendChild(hoverOverlay);

      item.onmouseenter = () => {
        hoverOverlay.style.opacity = '1';
      };
      item.onmouseleave = () => {
        hoverOverlay.style.opacity = '0';
      };

      // Assemble the structure
      aspectContainer.appendChild(contentWrapper);
      item.appendChild(aspectContainer);

      grid.appendChild(item);
    });

    container.appendChild(grid);

    // Replace grid container content
    targetContainer.innerHTML = '';
    targetContainer.appendChild(container);

    console.log('[Reels Sorter] ✅ Injected', sortedReels.length, 'sorted reels into feed');
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
