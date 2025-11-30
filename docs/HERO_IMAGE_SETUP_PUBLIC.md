# Hero Image Setup (Temporary - Public Folder)

## 📸 How to Add Your Hero Image

### **Step 1: Add Your Image**

1. Place your hero image in this `public` folder
2. Name it exactly: **`hero-image.jpg`**
   - Or use: `hero-image.png` (if PNG format)

### **Step 2: Image Specifications**

**Recommended:**
- **Filename:** `hero-image.jpg` or `hero-image.png`
- **Size:** 1200x1200px or 1200x1600px (square or portrait)
- **Format:** JPG or PNG
- **File Size:** Under 500KB for best performance

### **Step 3: Supported Formats**

The code will automatically check for:
- `/hero-image.jpg` (JPG format)
- `/hero-image.png` (PNG format)
- `/hero-image.webp` (WebP format)

### **Step 4: How It Works**

1. **Priority:** If you have a hero image in Sanity CMS, it will use that first
2. **Fallback:** If no Sanity image, it will use `/hero-image.jpg` from public folder
3. **Placeholder:** If neither exists, shows a placeholder

### **Step 5: After Adding Image**

1. Save your image as `hero-image.jpg` in the `public` folder
2. Restart your dev server if running: `npm run dev`
3. The image will appear automatically in the intro section center column

---

## 🔄 Later: Moving to Sanity CMS

When you're ready to use Sanity CMS:

1. Upload the image to Sanity Studio
2. Go to **Site Settings** → **Hero Image**
3. Upload and publish
4. The Sanity image will automatically take priority
5. You can then remove the local image from the public folder

---

## 📝 Notes

- The image path is: `/hero-image.jpg` (starts with `/` because it's in the public folder)
- Next.js automatically serves files from the `public` folder at the root URL
- No need to import or reference the path differently

---

**Current Status:** Using local image from public folder (temporary solution)

