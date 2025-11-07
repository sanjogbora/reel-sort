#!/usr/bin/env python3
"""Generate extension icons"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL not installed. Install with: pip install Pillow")
    print("Or open create-icons.html in a browser to generate icons manually")
    exit(1)

def create_icon(size, filename):
    # Create image with gradient-like background
    img = Image.new('RGB', (size, size), color='#dc2743')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple chart icon
    bar_width = size // 5
    spacing = size // 10
    
    # Three bars of different heights
    bars = [
        (spacing, size - size//3, spacing + bar_width, size - spacing),
        (spacing*2 + bar_width, size - size//2, spacing*2 + bar_width*2, size - spacing),
        (spacing*3 + bar_width*2, size - size//1.5, spacing*3 + bar_width*3, size - spacing)
    ]
    
    for bar in bars:
        draw.rectangle(bar, fill='white')
    
    img.save(filename)
    print(f"Created {filename}")

if __name__ == '__main__':
    create_icon(16, 'icon16.png')
    create_icon(48, 'icon48.png')
    create_icon(128, 'icon128.png')
    print("\nIcons generated successfully!")
