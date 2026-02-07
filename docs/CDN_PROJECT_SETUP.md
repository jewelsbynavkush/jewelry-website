# Configure Project to Use jsDelivr CDN

## Step 1: Get Your GitHub Information

You need three pieces of information from your GitHub repository:

1. **GitHub Username** - Your GitHub username
2. **Repository Name** - The name of the repo you created
3. **Branch Name** - Usually `main` (or `master` in older repos)

### How to Find Them:

1. Go to your GitHub repository in a browser
2. Look at the URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`
   - `YOUR_USERNAME` = Your GitHub username
   - `YOUR_REPO` = Your repository name
3. Check the branch dropdown (usually shows "main" or "master")

**Example:**
- URL: `https://github.com/johndoe/jewelry-assets`
- Username: `johndoe`
- Repo: `jewelry-assets`
- Branch: `main`

---

## Step 2: Create .env.local File

1. **Open your project** in your code editor
2. **Go to the root folder** (same level as `package.json`)
3. **Create a new file** named `.env.local`

**Note:** If `.env.local` already exists, just open it and add the lines.

---

## Step 3: Add Environment Variables

Open `.env.local` and add this line:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main
```

**Replace:**
- `YOUR_USERNAME` with your actual GitHub username
- `YOUR_REPO` with your actual repository name
- `main` with your branch name (if different)

**Note:** `CDN_PROVIDER` is optional - the system auto-detects the provider from the URL. If you want to explicitly set it, use `NEXT_PUBLIC_CDN_PROVIDER=jsdelivr`.

**Example:**
If your GitHub username is `johndoe`, repo is `jewelry-assets`, and branch is `main`:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/johndoe/jewelry-assets@main
CDN_PROVIDER=jsdelivr
```

**Important:** 
- No spaces around the `=` sign
- No quotes needed
- Each variable on its own line

---

## Step 4: Save the File

Save `.env.local` file.

---

## Step 5: Restart Your Dev Server

**If your dev server is running:**

1. Stop it by pressing `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac) in the terminal
2. Start it again:
   ```bash
   npm run dev
   ```

**If your dev server is not running:**

```bash
npm run dev
```

**Why restart?** Environment variables are only loaded when the server starts.

---

## Step 6: Test It's Working

### Method 1: Check Browser DevTools

1. Open your website in browser
2. Press `F12` (or right-click → Inspect)
3. Go to **Network** tab
4. Refresh the page (`F5` or `Ctrl+R`)
5. Look for images loading from `cdn.jsdelivr.net`
6. You should see URLs like:
   ```
   https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/assets/...
   ```

### Method 2: Test a Direct URL

1. Construct a test URL:
   ```
   https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/assets/products/rings/elegant-gold-ring.png
   ```
   (Replace with your actual details and an image that exists)

2. Open this URL in your browser
3. The image should load

### Method 3: Check Your Website

1. Visit your website
2. Check that all images display correctly:
   - Product images
   - Category images
   - Hero image
   - About image
3. No broken image icons should appear

---

## Troubleshooting

### Images Not Loading?

1. **Check .env.local file:**
   - Is it in the root folder (same as package.json)?
   - Are the values correct?
   - No typos in username/repo name?

2. **Check GitHub repository:**
   - Is it public?
   - Do images exist in the `assets/` folder?
   - Does the folder structure match?

3. **Restart server:**
   - Did you restart after adding .env.local?
   - Environment variables only load on server start

4. **Check URL format:**
   - Should be: `https://cdn.jsdelivr.net/gh/USERNAME/REPO@BRANCH`
   - No trailing slash
   - Branch name correct (usually `main`)

5. **Test direct URL:**
   - Try opening a direct CDN URL in browser
   - If it doesn't load, check GitHub repo

### Still Not Working?

1. **Verify your GitHub repo URL:**
   - Go to your repo on GitHub
   - Check the URL matches what you put in .env.local

2. **Check branch name:**
   - Some repos use `master` instead of `main`
   - Check the branch dropdown in GitHub

3. **Verify images are uploaded:**
   - Go to your GitHub repo
   - Click on `assets` folder
   - Verify images are there

---

## Quick Checklist

- [ ] Found GitHub username, repo name, and branch name
- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_CDN_BASE_URL` with correct values
- [ ] Added `CDN_PROVIDER=jsdelivr`
- [ ] Saved the file
- [ ] Restarted dev server
- [ ] Checked Network tab - images load from cdn.jsdelivr.net
- [ ] Verified images display correctly on website

---

## Example Complete Setup

**GitHub Repository:**
- URL: `https://github.com/johndoe/jewelry-assets`
- Username: `johndoe`
- Repo: `jewelry-assets`
- Branch: `main`

**`.env.local` file:**
```env
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/johndoe/jewelry-assets@main
CDN_PROVIDER=jsdelivr
```

**Test URL:**
```
https://cdn.jsdelivr.net/gh/johndoe/jewelry-assets@main/assets/products/rings/elegant-gold-ring.png
```

---

## That's It! 🎉

Your images should now be loading from jsDelivr CDN!

If everything works, you'll see:
- ✅ Images load from `cdn.jsdelivr.net` in Network tab
- ✅ All images display correctly
- ✅ Fast loading times
- ✅ No broken images
