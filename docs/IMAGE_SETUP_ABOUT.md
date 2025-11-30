# About Us Image Setup

## 📸 How to Add Your About Us Image

### **Step 1: Add Your Image**

1. Place your about us image in the `public` folder
2. Name it exactly: **`about-image.png`** or **`about-image.jpg`**

### **Step 2: Image Specifications**

**Recommended:**
- **Filename:** `about-image.png` or `about-image.jpg`
- **Size:** 1200x1200px or 1200x1600px (square or portrait)
- **Format:** PNG or JPG
- **File Size:** Under 500KB for best performance

### **Step 3: Supported Formats**

The code will automatically check for:
- `/about-image.png` (PNG format)
- `/about-image.jpg` (JPG format)
- `/about-image.webp` (WebP format)

### **Step 4: How It Works**

1. **Priority:** If you have an about image in Sanity CMS, it will use that first
2. **Fallback:** If no Sanity image, it will use `/about-image.png` from public folder
3. **Display:** Image appears in the About Us section (right column on desktop, below content on mobile)

### **Step 5: After Adding Image**

1. Save your image as `about-image.png` in the `public` folder
2. Restart your dev server if running: `npm run dev`
3. The image will appear automatically in the About Us section

---

## 🔄 Later: Moving to Sanity CMS

When you're ready to use Sanity CMS:

1. Upload the image to Sanity Studio
2. Go to **Site Settings** → **About Us Image**
3. Upload and publish
4. The Sanity image will automatically take priority
5. You can then remove the local image from the public folder

---

## 📝 Notes

- The image path is: `/about-image.png` (starts with `/` because it's in the public folder)
- Next.js automatically serves files from the `public` folder at the root URL
- Image will be displayed in the About Us section on the home page

---

**Current Status:** Using local image from public folder (temporary solution)

