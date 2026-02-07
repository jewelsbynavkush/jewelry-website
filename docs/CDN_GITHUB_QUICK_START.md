# GitHub CDN Quick Start (5 Minutes)

## Choose Your Option

- **jsDelivr** (Recommended) - Unlimited bandwidth, fast CDN
- **Direct GitHub** - Simple, but rate limited (60 requests/hour)

---

## Step 1: Create GitHub Repository (2 min)

1. Go to https://github.com/new
2. Repository name: `jewelry-assets` (or any name)
3. Make it **Public** ✅ (required)
4. Click "Create repository"

---

## Step 2: Upload Images (2 min)

**Easiest Method:**
1. In your new repo, click **"Add file"** → **"Upload files"**
2. Drag and drop your entire `public/assets/` folder
3. Click **"Commit changes"**

**Or use command line:**
```bash
git clone https://github.com/YOUR_USERNAME/jewelry-assets.git
cd jewelry-assets
cp -r /path/to/jewelry-website/public/assets ./assets
git add assets/
git commit -m "Add images"
git push origin main
```

---

## Step 3: Configure Project (1 min)

### Option A: jsDelivr (Recommended)

Add to `.env.local`:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/YOUR_USERNAME/jewelry-assets@main
CDN_PROVIDER=jsdelivr
```

### Option B: Direct GitHub

Add to `.env.local`:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/YOUR_USERNAME/jewelry-assets/main
CDN_PROVIDER=github
```

**Replace:**
- `YOUR_USERNAME` - Your GitHub username
- `jewelry-assets` - Your repository name
- `main` - Your branch name

---

## Step 4: Test

1. Restart dev server: `npm run dev`
2. Open DevTools (F12) → Network tab
3. Refresh page
4. Images should load from:
   - jsDelivr: `cdn.jsdelivr.net`
   - Direct: `raw.githubusercontent.com`

---

## Examples

### jsDelivr Example

If username is `johndoe` and repo is `jewelry-assets`:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/johndoe/jewelry-assets@main
CDN_PROVIDER=jsdelivr
```

Test URL:
```
https://cdn.jsdelivr.net/gh/johndoe/jewelry-assets@main/assets/products/rings/elegant-gold-ring.png
```

### Direct GitHub Example

```env
NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/johndoe/jewelry-assets/main
CDN_PROVIDER=github
```

Test URL:
```
https://raw.githubusercontent.com/johndoe/jewelry-assets/main/assets/products/rings/elegant-gold-ring.png
```

---

## That's It! 🎉

Your images are now served from a free CDN!

**Need detailed steps?** See [Complete Step-by-Step Guide](./CDN_COMPLETE_STEP_BY_STEP.md)  
**Compare options?** See [Direct GitHub vs jsDelivr](./CDN_GITHUB_DIRECT_VS_JSDELIVR.md)
