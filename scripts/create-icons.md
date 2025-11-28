# Creating Application Icons

Open UML requires icons for Windows (.ico) and macOS (.icns) formats.

## Quick Method (Online Tools)

1. **Create a 512x512 PNG icon** with your design
2. **Convert to .ico** (Windows):
   - Use [ConvertICO](https://convertio.co/png-ico/)
   - Or [ICO Convert](https://icoconvert.com/)
   - Upload your PNG and download the .ico file
   - Place it at `app/assets/icon.ico`

3. **Convert to .icns** (macOS):
   - Use [CloudConvert](https://cloudconvert.com/png-to-icns)
   - Or [iConvert Icons](https://iconverticons.com/)
   - Upload your PNG and download the .icns file
   - Place it at `app/assets/icon.icns`

## Using ImageMagick (Command Line)

If you have ImageMagick installed:

### Windows (.ico)
```bash
magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 app/assets/icon.ico
```

### macOS (.icns)
```bash
# Create iconset directory
mkdir -p icon.iconset

# Generate different sizes
for size in 16 32 64 128 256 512; do
  magick convert icon.png -resize ${size}x${size} icon.iconset/icon_${size}x${size}.png
  magick convert icon.png -resize $((size*2))x$((size*2)) icon.iconset/icon_${size}x${size}@2x.png
done

# Convert to .icns (macOS only)
iconutil -c icns icon.iconset -o app/assets/icon.icns
```

## Placeholder Icons

For development, you can use simple placeholder icons. The build will work without custom icons, but it's recommended to add proper icons before release.

## Icon Design Guidelines

- Use a simple, recognizable design
- Ensure it looks good at small sizes (16x16)
- Use high contrast for visibility
- Consider both light and dark backgrounds
- Recommended: UML diagram symbol or "UML" text

