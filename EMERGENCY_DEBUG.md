# Emergency Debug - Find Instagram's Grid Structure

## Run This in Console

After clicking "Sort by Views", run this in the browser console (F12):

```javascript
// Find all elements that contain reel links
console.log('=== FINDING INSTAGRAM GRID STRUCTURE ===');

const reelLinks = document.querySelectorAll('a[href*="/reel/"]');
console.log('Total reel links found:', reelLinks.length);

// Analyze the structure
const structures = new Map();

reelLinks.forEach((link, index) => {
  if (index > 5) return; // Only analyze first 5
  
  console.log(`\n--- Reel ${index + 1} ---`);
  console.log('Link:', link.href);
  
  let element = link;
  for (let level = 0; level < 10; level++) {
    if (!element) break;
    
    const parent = element.parentElement;
    if (!parent) break;
    
    const siblings = parent.children.length;
    const reelSiblings = Array.from(parent.children).filter(c => 
      c.querySelector('a[href*="/reel/"]')
    ).length;
    
    console.log(`  Level ${level}: ${element.tagName} -> Parent has ${siblings} children (${reelSiblings} with reels)`);
    
    // Track this structure
    const key = `${level}-${siblings}-${reelSiblings}`;
    structures.set(key, { level, siblings, reelSiblings, element: parent });
    
    element = parent;
  }
});

console.log('\n=== STRUCTURE SUMMARY ===');
structures.forEach((value, key) => {
  console.log(`Level ${value.level}: ${value.siblings} children, ${value.reelSiblings} with reels`);
});

// Find the most likely grid container
console.log('\n=== FINDING GRID CONTAINER ===');
let bestContainer = null;
let maxReels = 0;

document.querySelectorAll('div').forEach((div, index) => {
  const directChildren = Array.from(div.children);
  const childrenWithReels = directChildren.filter(c => 
    c.querySelector('a[href*="/reel/"]')
  ).length;
  
  if (childrenWithReels > maxReels) {
    maxReels = childrenWithReels;
    bestContainer = div;
  }
  
  if (childrenWithReels >= 20) {
    console.log(`Div ${index}: ${div.children.length} children, ${childrenWithReels} have reels`);
  }
});

console.log('\n=== BEST CONTAINER ===');
console.log('Container:', bestContainer);
console.log('Total children:', bestContainer?.children.length);
console.log('Children with reels:', maxReels);
console.log('Container classes:', bestContainer?.className);

// Show the structure
if (bestContainer) {
  console.log('\nContainer HTML structure:');
  console.log(bestContainer.outerHTML.substring(0, 500) + '...');
}
```

## What to Look For

### Good Signs:
```
Best Container:
Total children: 72-73
Children with reels: 72-73
```

### Bad Signs:
```
Best Container:
Total children: 4-5
Children with reels: 4-5
```

## Share Results

After running the script, share:
1. "Total reel links found: X"
2. "Best Container: Total children: X, Children with reels: X"
3. The structure summary showing levels

## Alternative Manual Sort

If extension still doesn't work, use this manual sort:

```javascript
console.log('=== MANUAL SORT ===');

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
}
```

## Expected Output

### If Working:
```
=== BEST CONTAINER ===
Container: div
Total children: 72
Children with reels: 72
```

### If Not Working:
```
=== BEST CONTAINER ===
Container: div
Total children: 4
Children with reels: 4
```

This means Instagram has another wrapper level we're missing.

## Next Steps

1. Run the debug script
2. Share the output
3. If manual sort works, we'll update the extension to match
4. If manual sort doesn't work, we'll investigate further
