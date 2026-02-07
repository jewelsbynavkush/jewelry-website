# Complete Step-by-Step CDN Setup Guide

## Choose Your Option

- **Option A: jsDelivr** (Recommended - Unlimited bandwidth, fast CDN)
- **Option B: Direct GitHub** (Simple, but has rate limits)

Both use GitHub to store images, but serve them differently.

---

## Option A: jsDelivr Setup (Recommended)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `jewelry-assets` (or any name you prefer)
   - **Description:** (optional) "Static assets for jewelry website"
   - **Visibility:** Select **Public** ✅ (required for jsDelivr)
   - **Initialize repository:** Leave unchecked (we'll add files manually)
3. Click **"Create repository"**

### Step 2: Upload Images to GitHub

**Method 1: Using GitHub Web Interface (Easiest)**

1. In your new repository, click the **"Add file"** button (top right)
2. Select **"Upload files"**
3. Drag and drop your entire `public/assets/` folder from your jewelry website project
   - Or click "choose your files" and select the folder
4. Make sure the folder structure is maintained:
   ```
   assets/
   ├── products/
   │   ├── rings/
   │   │   └── elegant-gold-ring.png
   │   ├── earrings/
   │   │   └── pearl-drop-earrings.png
   │   └── ...
   ├── hero/
   │   └── hero-image.png
   ├── about/
   │   └── about-image.png
   └── categories/
       ├── rings.png
       ├── earrings.png
       └── ...
   ```
5. Scroll down and click **"Commit changes"**
6. Wait for upload to complete

**Method 2: Using Git Command Line**

```bash
# 1. Clone your repository
git clone https://github.com/YOUR_USERNAME/jewelry-assets.git
cd jewelry-assets

# 2. Copy images from your project
# Replace /path/to/jewelry-website with your actual project path
cp -r /path/to/jewelry-website/public/assets ./assets

# 3. Commit and push
git add assets/
git commit -m "Add jewelry images for CDN"
git push origin main
```

**Method 3: Using GitHub Desktop**

1. Open GitHub Desktop
2. Clone your repository
3. Copy `public/assets/` folder to repository root as `assets/`
4. Commit with message: "Add jewelry images"
5. Push to origin

### Step 3: Verify Images Are on GitHub

1. Go to your repository on GitHub
2. Click on the `assets` folder
3. Verify all your images are there with correct folder structure
4. Click on any image to view it
5. Copy the URL from browser address bar (we'll use this to verify later)

### Step 4: Get Your Repository Information

You'll need:
- **GitHub Username:** Found in your GitHub profile URL (e.g., `github.com/johndoe` → username is `johndoe`)
- **Repository Name:** The name you created (e.g., `jewelry-assets`)
- **Branch Name:** Usually `main` (or `master` in older repos)

### Step 5: Configure Environment Variables

1. Open your jewelry website project
2. Create or edit `.env.local` file in the project root (or `.env` if you prefer)
3. Add these lines:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/YOUR_USERNAME/jewelry-assets@main
CDN_PROVIDER=jsdelivr
```

**Replace:**
- `YOUR_USERNAME` with your actual GitHub username
- `jewelry-assets` with your actual repository name
- `main` with your branch name (usually `main` or `master`)

**Example:**
If your GitHub username is `johndoe` and repo is `jewelry-assets`:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/johndoe/jewelry-assets@main
CDN_PROVIDER=jsdelivr
```

### Step 6: Test the Setup

1. **Test a direct URL first:**
   - Construct URL: `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/assets/products/rings/elegant-gold-ring.png`
   - Replace with your actual details
   - Open in browser - image should load

2. **Restart your dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Check in browser:**
   - Open your website
   - Open DevTools (F12)
   - Go to Network tab
   - Refresh page
   - Look for images loading from `cdn.jsdelivr.net`

4. **Verify images display correctly:**
   - Check product pages
   - Check category images
   - Check hero/about images

### Step 7: Verify It's Working

✅ **Success indicators:**
- Images load from `cdn.jsdelivr.net` in Network tab
- All images display correctly on your site
- No broken image icons
- Fast loading times

❌ **If images don't load:**
- Check environment variables are correct
- Verify images exist in GitHub repo
- Check URL format matches your repo structure
- Restart dev server after changing .env

---

## Option B: Direct GitHub Setup

### Step 1: Create GitHub Repository

(Same as Option A, Step 1)

1. Go to https://github.com/new
2. Create a **Public** repository
3. Name it (e.g., `jewelry-assets`)

### Step 2: Upload Images to GitHub

(Same as Option A, Step 2)

Upload your `public/assets/` folder to the repository.

### Step 3: Get Your Repository Information

(Same as Option A, Step 4)

Note your:
- GitHub username
- Repository name
- Branch name (usually `main`)

### Step 4: Configure Environment Variables

1. Open `.env.local` in your project
2. Add these lines:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/YOUR_USERNAME/jewelry-assets/main
CDN_PROVIDER=github
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `jewelry-assets` with your repository name
- `main` with your branch name

**Example:**
```env
NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/johndoe/jewelry-assets/main
CDN_PROVIDER=github
```

### Step 5: Test the Setup

1. **Test a direct URL:**
   - URL: `https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets/products/rings/elegant-gold-ring.png`
   - Open in browser - should load

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Check in browser:**
   - Open DevTools → Network tab
   - Images should load from `raw.githubusercontent.com`

### Step 6: Important Notes for Direct GitHub

⚠️ **Rate Limiting:**
- GitHub limits to **60 requests/hour per IP** (unauthenticated)
- If you hit the limit, images will stop loading temporarily
- Solution: Switch to jsDelivr (Option A) for production

⚠️ **For Production:**
- Direct GitHub is fine for testing/small projects
- For production websites, use jsDelivr (Option A) instead

---

## Updating Images Later

### Method 1: GitHub Web Interface

1. Go to your repository
2. Navigate to the image file
3. Click the **pencil icon** (Edit)
4. Upload new image
5. Click **"Commit changes"**

### Method 2: Git Command Line

```bash
cd jewelry-assets
# Replace the image
cp /path/to/new-image.png assets/products/rings/elegant-gold-ring.png
git add assets/
git commit -m "Update product image"
git push origin main
```

**Note:** 
- jsDelivr: Updates appear in 5-10 minutes (cache delay)
- Direct GitHub: Updates appear immediately

---

## Troubleshooting

### Images Not Loading?

1. **Check environment variables:**
   ```bash
   # Verify .env.local has correct values
   cat .env.local
   ```

2. **Check GitHub repository:**
   - Images exist in repo?
   - Folder structure matches?
   - Repository is public?

3. **Check URL format:**
   - jsDelivr: `https://cdn.jsdelivr.net/gh/USER/REPO@BRANCH/path`
   - Direct: `https://raw.githubusercontent.com/USER/REPO/BRANCH/path`

4. **Test direct URL:**
   - Copy a test URL and open in browser
   - If it doesn't load, check GitHub repo

5. **Restart dev server:**
   - Environment variables only load on server start
   - Stop server (Ctrl+C) and restart

6. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Rate Limit Errors (Direct GitHub Only)

**Symptom:** Images stop loading, 403 errors

**Solution:**
- Switch to jsDelivr (Option A)
- Or wait for rate limit to reset (1 hour)

### Cache Issues (jsDelivr)

**Symptom:** Updated images not showing

**Solution:**
- Wait 5-10 minutes for cache to clear
- Or add `?v=timestamp` to URLs (code handles this automatically)

---

## Quick Reference

### jsDelivr Configuration

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/USERNAME/REPO@main
CDN_PROVIDER=jsdelivr
```

**Test URL:**
```
https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/assets/products/rings/elegant-gold-ring.png
```

### Direct GitHub Configuration

```env
NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/USERNAME/REPO/main
CDN_PROVIDER=github
```

**Test URL:**
```
https://raw.githubusercontent.com/USERNAME/REPO/main/assets/products/rings/elegant-gold-ring.png
```

---

## Checklist

### Setup Checklist

- [ ] Created GitHub repository (public)
- [ ] Uploaded images to `assets/` folder
- [ ] Verified images exist in GitHub
- [ ] Got username, repo name, and branch name
- [ ] Added environment variables to `.env.local`
- [ ] Tested direct URL in browser
- [ ] Restarted dev server
- [ ] Verified images load from CDN in Network tab
- [ ] Checked images display correctly on website

### Verification Checklist

- [ ] Images load from CDN (check Network tab)
- [ ] No broken images on website
- [ ] Product images work
- [ ] Category images work
- [ ] Hero/about images work
- [ ] Cart images work
- [ ] Order detail images work

---

## Summary

**jsDelivr (Recommended):**
1. Create public GitHub repo
2. Upload images
3. Set: `NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/USER/REPO@main`
4. Set: `CDN_PROVIDER=jsdelivr`
5. Restart server

**Direct GitHub:**
1. Create public GitHub repo
2. Upload images
3. Set: `NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/USER/REPO/main`
4. Set: `CDN_PROVIDER=github`
5. Restart server

Both work, but **jsDelivr is recommended** for production due to unlimited bandwidth and better performance.

---

## Need Help?

- Check: `docs/CDN_GITHUB_DIRECT_VS_JSDELIVR.md` for comparison
- Check: `docs/CDN_SETUP_GUIDE.md` for all CDN options
- Verify your GitHub repo structure matches `public/assets/` structure
