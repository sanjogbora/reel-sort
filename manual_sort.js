// Manual Instagram Reels Sort Script
// Copy and paste this entire file into browser console (F12)

console.log('=== MANUAL INSTAGRAM REELS SORT ===');

// Find the grid container
let gridContainer = null;
let maxReels = 0;

document.querySelectorAll('div').forEach(div => {
  const childrenWithReels = Array.from(div.children).filter(c => 
    c.querySelector('a[href*="/reel/"]')
  ).length;
  
  if (childrenWithReels > maxReels) {
    maxReels = childrenWithReels;
    gridContainer = div;
  }
});

console.log('Grid container found:', gridContainer);
console.log('Children with reels:', maxReels);

if (!gridContainer) {
  console.log('ERROR: Could not find grid container');
  alert('Could not find grid container. Make sure you are on a profile page with reels.');
} else {
  // Collect all children with reels and their view counts
  const items = [];
  
  Array.from(gridContainer.children).forEach(child => {
    const reelLink = child.querySelector('a[href*="/reel/"]');
    if (!reelLink) return;
    
    // Find view count
    let views = 0;
    const spans = child.querySelectorAll('span');
    spans.forEach(span => {
      const text = span.textContent.trim();
      if (text.match(/^[\d,]+$/)) {
        views = parseInt(text.replace(/,/g, ''));
      }
    });
    
    items.push({ element: child, views, url: reelLink.href });
  });
  
  console.log('Items collected:', items.length);
  console.log('Sample:', items.slice(0, 3));
  
  // Sort by views
  items.sort((a, b) => b.views - a.views);
  
  console.log('Top 3 after sort:', items.slice(0, 3).map(i => ({ views: i.views })));
  
  // Reorder DOM
  gridContainer.innerHTML = '';
  items.forEach(item => {
    gridContainer.appendChild(item.element);
  });
  
  console.log('✅ MANUALLY SORTED!');
  console.log('Top reel should have', items[0].views, 'views');
  
  // Add medals
  items.slice(0, 3).forEach((item, index) => {
    const badge = document.createElement('div');
    badge.textContent = ['🥇', '🥈', '🥉'][index];
    badge.style.cssText = `
      position: absolute;
      top: 5px;
      left: 5px;
      z-index: 100;
      font-size: 24px;
      background: rgba(0,0,0,0.7);
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const reelContainer = item.element.querySelector('a[href*="/reel/"]')?.parentElement;
    if (reelContainer) {
      reelContainer.style.position = 'relative';
      reelContainer.appendChild(badge);
    }
  });
  
  console.log('✅ Medals added!');
  alert(`Sorted ${items.length} reels! Look for 🥇🥈🥉 medals on top 3.`);
}
