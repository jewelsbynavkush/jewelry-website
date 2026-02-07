# GitHub Free CDN Setup Guide (jsDelivr or Direct)

## Overview

You can use GitHub as a free CDN in two ways:
1. **jsDelivr** (Recommended) - Unlimited bandwidth, fast CDN
2. **Direct GitHub** - Simple, but has rate limits

**📖 See comparison:** [Direct GitHub vs jsDelivr](./CDN_GITHUB_DIRECT_VS_JSDELIVR.md)

This guide covers both options.

## Requirements

- GitHub account (free)
- Public repository (or use existing public repo)
- Images in `public/assets/` folder

## Step-by-Step Setup

### Step 1: Create/Use a GitHub Repository

1. **If you don't have a repo:**
   - Go to https://github.com/new
   - Create a new repository (e.g., `jewelry-assets`)
   - Make it **Public** (required for jsDelivr)
   - Don't initialize with README (we'll add files manually)

2. **If you have an existing repo:**
   - You can use your existing repository
   - Create a branch for assets if you prefer (e.g., `assets` branch)

### Step 2: Upload Images to GitHub

**Option A: Using GitHub Web Interface**

1. Go to your repository on GitHub
2. Click "Add file" → "Upload files"
3. Create folder structure:
   ```
   assets/
   ├── products/
   │   ├── rings/
   │   ├── earrings/
   │   ├── necklaces/
   │   └── bracelets/
   ├── hero/
   ├── about/
   └── categories/
   ```
4. Upload all images from `public/assets/` maintaining the same structure
5. Commit with message: "Add jewelry images"
6. Commit to `main` branch (or your preferred branch)

**Option B: Using Git Command Line**

```bash
# Clone your repo (or navigate to existing repo)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Copy images from your project
cp -r /path/to/jewelry-website/public/assets ./assets

# Commit and push
git add assets/
git commit -m "Add jewelry images for CDN"
git push origin main
```

**Option C: Using GitHub Desktop**

1. Clone your repository
2. Copy `public/assets/` folder to repository root as `assets/`
3. Commit and push

### Step 3: Get Your Repository Information

You'll need:
- **GitHub Username:** `YOUR_USERNAME`
- **Repository Name:** `YOUR_REPO`
- **Branch Name:** Usually `main` or `master`

### Step 4: Configure Environment Variables

**Option A: jsDelivr (Recommended)**

Add to your `.env` or `.env.local` file:

```env
# GitHub + jsDelivr CDN Configuration (Recommended)
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main
CDN_PROVIDER=jsdelivr
```

**Example:**
```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/johndoe/jewelry-assets@main
CDN_PROVIDER=jsdelivr
```

**Option B: Direct GitHub**

```env
# Direct GitHub Raw URLs (Simple, but has rate limits)
NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main
CDN_PROVIDER=github
```

**Example:**
```env
NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/johndoe/jewelry-assets/main
CDN_PROVIDER=github
```

**Which to choose?**
- **jsDelivr** - Better for production (unlimited bandwidth, faster)
- **Direct GitHub** - Simpler, but has rate limits (60 requests/hour)

### Step 5: Verify Image URLs

**If using jsDelivr:**
Your images will be accessible at:
```
https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/assets/products/rings/elegant-gold-ring.png
```

**If using Direct GitHub:**
Your images will be accessible at:
```
https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets/products/rings/elegant-gold-ring.png
```

**Test a URL:**
1. Upload one image to GitHub
2. Construct the URL based on your choice
3. Open in browser to verify it loads

### Step 6: Update Your Project

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test images:**
   - Check browser DevTools Network tab
   - Images should load from `cdn.jsdelivr.net`
   - Verify images display correctly

3. **Optional - Keep local images as backup:**
   - You can keep `public/assets/` for local development
   - CDN will be used when configured

## URL Structure Examples

### Before (Local):
```
/assets/products/rings/elegant-gold-ring.png
```

### After jsDelivr:
```
https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/assets/products/rings/elegant-gold-ring.png
```

### After Direct GitHub:
```
https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets/products/rings/elegant-gold-ring.png
```

## Using Different Branches

If you want to use a different branch (e.g., `assets` branch):

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@assets
```

## Updating Images

### Method 1: GitHub Web Interface
1. Navigate to the image file in GitHub
2. Click "Edit" (pencil icon)
3. Upload new image
4. Commit changes

### Method 2: Git Command Line
```bash
# Navigate to your assets repo
cd YOUR_REPO

# Replace image
cp /path/to/new-image.png assets/products/rings/elegant-gold-ring.png

# Commit and push
git add assets/
git commit -m "Update product image"
git push origin main
```

**Note:** jsDelivr caches images, so updates may take a few minutes to appear. You can force refresh by appending `?v=timestamp` to URLs.

## Advantages

### jsDelivr
✅ **Completely Free** - No limits on bandwidth or storage  
✅ **Unlimited Bandwidth** - Perfect for high traffic  
✅ **Global CDN** - Fast worldwide delivery  
✅ **No Rate Limits** - No request throttling  
✅ **Better Caching** - Aggressive caching for performance  

### Direct GitHub
✅ **Simple** - Direct from GitHub, no third-party  
✅ **Easy Setup** - Just use raw.githubusercontent.com  
✅ **Free** - No additional services  

## Limitations

### jsDelivr
⚠️ **Public Repository Required** - Images will be publicly accessible  
⚠️ **Cache Delay** - Updates may take a few minutes to propagate  
⚠️ **No Image Optimization** - No automatic WebP/AVIF conversion  

### Direct GitHub
⚠️ **Rate Limiting** - 60 requests/hour per IP (unauthenticated)  
⚠️ **Slower** - Not optimized for CDN delivery  
⚠️ **No Caching** - Every request hits GitHub servers  
⚠️ **Public Repository Required** - Images will be publicly accessible  
⚠️ **File Size Limits** - GitHub has 100MB file size limit (rarely an issue for images)

**💡 Recommendation:** Use jsDelivr for production, direct GitHub only for testing/small projects.  

## Troubleshooting

### Images Not Loading?

1. **Check URL format:**
   - Verify username, repo name, and branch are correct
   - Ensure path matches GitHub folder structure

2. **Check image exists:**
   - Visit the GitHub repo and verify image is there
   - Check the exact path matches

3. **Clear cache:**
   - jsDelivr caches aggressively
   - Try: `https://cdn.jsdelivr.net/gh/USER/REPO@main/path?t=timestamp`

4. **Check environment variables:**
   - Verify `.env` file has correct values
   - Restart dev server after changes

5. **Verify branch name:**
   - Default is `main`, but might be `master` in older repos
   - Check your actual branch name

### Force Cache Refresh

Add timestamp to URLs:
```typescript
const imageUrl = `${getCDNUrl(path)}?t=${Date.now()}`;
```

Or use version tags:
```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/USER/REPO@v1.0.0
```

## Alternative: Use GitHub Releases

For better versioning, you can use GitHub Releases:

1. Create a release in your repo
2. Upload images as release assets
3. Use release tag in URL:
   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/USER/REPO@v1.0.0
   ```

## Security Considerations

Since images are in a public repo:
- ✅ Fine for product images (they're public anyway)
- ✅ Fine for hero/about images
- ⚠️ Don't store sensitive images
- ⚠️ Anyone can access images directly

## Best Practices

1. **Organize by category** - Keep folder structure clean
2. **Use descriptive names** - `elegant-gold-ring.png` not `img1.png`
3. **Optimize before upload** - Compress images to reduce size
4. **Version control** - Use tags/releases for major updates
5. **Keep local backup** - Don't delete `public/assets/` immediately

## Example Complete Setup

```bash
# 1. Create repo on GitHub (public)
# 2. Clone locally
git clone https://github.com/YOUR_USERNAME/jewelry-assets.git
cd jewelry-assets

# 3. Copy images
cp -r ../jewelry-website/public/assets ./assets

# 4. Commit
git add assets/
git commit -m "Add jewelry images"
git push origin main

# 5. Update .env in jewelry-website
echo "NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/YOUR_USERNAME/jewelry-assets@main" >> .env
echo "CDN_PROVIDER=jsdelivr" >> .env

# 6. Restart dev server
npm run dev
```

## Quick Reference

### jsDelivr (Recommended)

**URL Format:**
```
https://cdn.jsdelivr.net/gh/USERNAME/REPO@BRANCH/path/to/file.png
```

**Environment Variables:**
```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/USERNAME/REPO@main
CDN_PROVIDER=jsdelivr
```

### Direct GitHub

**URL Format:**
```
https://raw.githubusercontent.com/USERNAME/REPO/BRANCH/path/to/file.png
```

**Environment Variables:**
```env
NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/USERNAME/REPO/main
CDN_PROVIDER=github
```

**Test URLs:**
Replace with your details:
- jsDelivr: `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/assets/products/rings/elegant-gold-ring.png`
- Direct: `https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets/products/rings/elegant-gold-ring.png`
