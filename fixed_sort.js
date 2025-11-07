// Fixed Instagram Reels Sort - Handles Nested Structure
// Copy and paste this entire file into browser console (F12)

console.log('=== FIXED INSTAGRAM REELS SORT ===');

// Step 1: Find ALL individual reel containers (not the wrapper)
const reelContainers = [];

document.querySelectorAll('a[href*="/reel/"]').forEach(link => {
  // Find the container that holds this specific reel
  // It's usually 2-4 levels up from the link
  let container = link;
  
  for (let i = 0; i < 6; i++) {
    container = container.parentElement;
    if (!container) break;
    
    // Check if this container has exactly 1 reel link (individual reel container)
    const reelLinks = container.querySelectorAll('a[href*="/reel/"]');
    if (reelLinks.length === 1) {
      // This is an individual reel container
      reelContainers.push({
        element: container,
        link: link.href
      });
      break;
    }
  }
});

console.log('Found individual reel containers:', reelContainers.length);

// Step 2: Extract view counts
reelContainers.forEach(item => {
  let views = 0;
  const spans = item.element.querySelectorAll('span');
  
  spans.forEach(span => {
    const text = span.textContent.trim();
    // Match patterns like "7,127" or "26K" or "3,264"
    if (text.match(/^[\d,]+$/) || text.match(/^[\d,.]+[KMB]$/i)) {
      let num = text.replace(/,/g, '');
      
      if (text.includes('K')) {
        num = parseFloat(num) * 1000;
      } else if (text.includes('M')) {
        num = parseFloat(num) * 1000000;
      } else {
        num = parseInt(num);
      }
      
      if (num > views) {
        views = num;
      }
    }
  });
  
  item.views = views;
});

console.log('Sample view counts:', reelContainers.slice(0, 5).map(r => r.views));

// Step 3: Sort by views
reelContainers.sort((a, b) => b.views - a.views);

console.log('Top 5 after sort:', reelContainers.slice(0, 5).map(r => r.views));

// Step 4: Find the common parent that contains all these containers
let commonParent = null;

// Start from first container and go up
let current = reelContainers[0].element;
for (let level = 0; level < 15; level++) {
  if (!current) break;
  
  // Check how many of our containers this level contains
  let containsCount = 0;
  reelContainers.forEach(item => {
    if (current.contains(item.element)) {
      containsCount++;
    }
  });
  
  console.log(`Level ${level}: Contains ${containsCount}/${reelContainers.length} containers`);
  
  // If this level contains all our containers, use it
  if (containsCount === reelContainers.length) {
    commonParent = current;
    console.log(`✓ Found common parent at level ${level}`);
    break;
  }
  
  current = current.parentElement;
}

if (!commonParent) {
  console.log('ERROR: Could not find common parent');
  alert('Could not find common parent container');
} else {
  console.log('Common parent has', commonParent.children.length, 'direct children');
  
  // Step 5: Reorder by moving elements
  // We need to move the containers in sorted order
  const fragment = document.createDocumentFragment();
  
  // Detach all our containers
  reelContainers.forEach(item => {
    if (item.element.parentElement) {
      item.element.remove();
    }
  });
  
  // Find where to insert them back
  // We'll insert at the beginning of the common parent
  const insertPoint = commonParent.firstChild;
  
  // Insert in sorted order
  reelContainers.forEach(item => {
    if (insertPoint) {
      commonParent.insertBefore(item.element, insertPoint);
    } else {
      commonParent.appendChild(item.element);
    }
  });
  
  console.log('✅ Reordered DOM!');
  
  // Step 6: Add medals to top 3
  reelContainers.slice(0, 3).forEach((item, index) => {
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
  
  console.log('✅ Medals added!');
  console.log('\nTop 3 reels:');
  console.log('🥇', reelContainers[0].views, 'views');
  console.log('🥈', reelContainers[1].views, 'views');
  console.log('🥉', reelContainers[2].views, 'views');
  
  alert(`✅ Sorted ${reelContainers.length} reels!\n\n🥇 ${reelContainers[0].views} views\n🥈 ${reelContainers[1].views} views\n🥉 ${reelContainers[2].views} views`);
}
