# Category Images for "Our Products" Section

This folder contains category images for the "Our Products" section. These images are used as fallbacks when Sanity images are not available.

## Required Images

Place the following images in the `public` folder:

1. **`category-rings.png`** - Image for RINGS category ✅
2. **`category-earrings.png`** - Image for EARRINGS category ✅
3. **`category-necklaces.png`** - Image for NECKLACES category ✅
4. **`category-bracelets.png`** - Image for BRACELETS category ✅

## Image Specifications

- **Format:** PNG (or JPG)
- **Recommended Size:** 800x800px (square aspect ratio)
- **File Naming:** Must match exactly as listed above (case-sensitive)

## Status

✅ All 4 category images have been added and are ready to use!

## How It Works

The component prioritizes images in this order:
1. **Sanity CMS images** (when configured) - Automatically used if available
2. **Public folder images** (current) - Used as fallback

## Future Migration to Sanity

When you're ready to use Sanity for category images:

1. Add category images to your Sanity Studio
2. The component will automatically detect and use Sanity images
3. Public folder images will no longer be needed (but can remain as backup)

No code changes required - the component handles both sources automatically!

