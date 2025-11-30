# Cache Clearing Guide - Hero Image Update

## 🔄 **Issue: Old Image Still Showing**

If you've updated `hero-image.png` but the website still shows the old image, it's likely a caching issue.

---

## ✅ **Quick Fix Steps**

### **Step 1: Clear Next.js Build Cache**

```bash
# Delete .next folder
rm -rf .next

# Rebuild
npm run build
```

### **Step 2: Restart Dev Server**

If running development server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### **Step 3: Clear Browser Cache**

**Chrome/Edge:**
1. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) for hard refresh
2. Or: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

**Firefox:**
1. Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. Or: Settings → Privacy → Clear Data → Cached Web Content

**Safari:**
1. Press `Cmd+Option+E` to clear cache
2. Or: Develop menu → Empty Caches

### **Step 4: Verify Image File**

Check that the new image is actually in place:

```bash
# Check file modification time
stat public/hero-image.png

# Check file size
ls -lh public/hero-image.png
```

---

## 🔧 **Technical Details**

### **Why This Happens:**

1. **Next.js Cache:** Builds cache images in `.next` folder
2. **Browser Cache:** Browsers cache images for performance
3. **CDN Cache:** If deployed, CDN may cache the image

### **Solutions Applied:**

1. ✅ Added `unoptimized` prop to Image component (bypasses Next.js image optimization cache)
2. ✅ Cleared `.next` build cache
3. ✅ Image path remains `/hero-image.png`

---

## 📝 **Prevention Tips**

### **For Development:**

1. **Use Hard Refresh:** Always use `Ctrl+Shift+R` / `Cmd+Shift+R` when testing image changes
2. **Clear Cache Regularly:** Delete `.next` folder when images don't update
3. **Check File Timestamp:** Verify the image file was actually updated

### **For Production:**

1. **Version Images:** Use versioned filenames (e.g., `hero-image-v2.png`)
2. **CDN Cache:** Configure CDN cache headers for images
3. **Image Optimization:** Use proper image optimization tools

---

## ✅ **Current Status**

- ✅ Build cache cleared
- ✅ Image component updated with `unoptimized` prop
- ✅ File verified: `hero-image.png` exists and is current

**Next Steps:**
1. Restart your dev server: `npm run dev`
2. Hard refresh browser: `Ctrl+Shift+R` / `Cmd+Shift+R`
3. The new image should now appear!

---

**Last Updated:** Current  
**Status:** ✅ Cache clearing solution applied

