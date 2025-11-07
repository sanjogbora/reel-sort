// Instagram Grid Structure Debug Script
// Copy and paste this entire file into browser console (F12)

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

console.log('\n=== DONE ===');
console.log('Share these numbers:');
console.log('1. Total reel links:', reelLinks.length);
console.log('2. Best container children:', bestContainer?.children.length);
console.log('3. Children with reels:', maxReels);
