# Sanity Studio - Quick Start Guide

## ✅ Schema Created Successfully!

The `jewelryDesign` schema has been created and is ready to use!

---

## 🚀 How to Access Sanity Studio

### Option 1: Via Your Website (Recommended)
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Open your browser and go to:
   ```
   http://localhost:3000/studio
   ```
3. You'll see the Sanity Studio interface!

### Option 2: Standalone Studio (Alternative)
If you want to run Studio separately:
```bash
# This will open Studio at http://localhost:3333
sanity start
```

---

## 📝 Adding Your First Jewelry Design

### Step 1: Open Studio
Go to `http://localhost:3000/studio` (make sure `npm run dev` is running)

### Step 2: Create New Design
1. Click the **"Create"** button (top right)
2. Select **"Jewelry Design"** from the list
3. You'll see a form with all the fields

### Step 3: Fill in the Form

**Title** (Required):
- Enter: "Gold Diamond Ring"
- This is the name of your jewelry piece

**Slug** (Required):
- Click the **"Generate"** button (it auto-creates from title)
- Or manually type: `gold-diamond-ring`
- This becomes the URL: `/designs/gold-diamond-ring`

**Description** (Required):
- Enter: "Beautiful handcrafted gold ring with a stunning diamond centerpiece. Perfect for special occasions."
- Minimum 10 characters

**Image** (Required):
- Click **"Upload"** or drag and drop an image
- **Recommended:** 1200x1200px or larger
- **Formats:** JPG, PNG, WebP
- Add **Alt Text** for accessibility (e.g., "Gold diamond ring")

**Price** (Optional):
- Enter: `999.99`
- No dollar sign needed
- This will display as "$999.99" on the website

**Category** (Optional):
- Select from dropdown: Rings, Necklaces, Earrings, Bracelets, etc.

**Featured** (Optional):
- Check this box to show on home page
- Unchecked by default

**In Stock** (Optional):
- Check if item is available
- Checked by default

### Step 4: Publish
1. Click **"Publish"** button (top right)
2. **Important:** Designs must be published to appear on your website!

### Step 5: View on Website
1. Go to: `http://localhost:3000/designs`
2. Your design should now appear! ✅

---

## 🎨 Schema Features

The schema includes:

### Required Fields:
- ✅ **Title** - Name of jewelry piece
- ✅ **Slug** - URL-friendly identifier
- ✅ **Description** - Detailed description
- ✅ **Image** - Main photo with alt text

### Optional Fields:
- 💰 **Price** - Price in USD
- 📂 **Category** - Type of jewelry
- ⭐ **Featured** - Show on home page
- 📦 **In Stock** - Availability status

### Built-in Features:
- ✅ Image cropping (hotspot)
- ✅ Auto-slug generation
- ✅ Validation rules
- ✅ Preview with image
- ✅ Sorting options

---

## 📋 Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Title** | String | ✅ Yes | Name of jewelry (2-100 chars) |
| **Slug** | Slug | ✅ Yes | URL identifier (auto-generated) |
| **Description** | Text | ✅ Yes | Description (10-500 chars) |
| **Image** | Image | ✅ Yes | Main photo with alt text |
| **Price** | Number | ❌ No | Price in USD (positive number) |
| **Category** | String | ❌ No | Type (rings, necklaces, etc.) |
| **Featured** | Boolean | ❌ No | Show on home page |
| **In Stock** | Boolean | ❌ No | Availability status |

---

## 🔍 Troubleshooting

### Issue: Can't access Studio at `/studio`
**Solution:**
1. Make sure `npm run dev` is running
2. Check the URL: `http://localhost:3000/studio`
3. Try refreshing the page

### Issue: "Jewelry Design" not showing in Create menu
**Solution:**
1. Check that schema file exists: `sanity/schemaTypes/jewelryDesign.ts`
2. Verify it's registered in `sanity/schemaTypes/index.ts`
3. Restart dev server: Stop and run `npm run dev` again

### Issue: Designs not showing on website
**Solution:**
1. Make sure design is **published** (not draft)
2. Check browser console for errors
3. Verify Sanity project ID in `.env.local`
4. Run test: `node scripts/test-sanity-connection.js`

### Issue: Images not uploading
**Solution:**
1. Check image size (should be under 10MB)
2. Try different image format (JPG, PNG)
3. Check browser console for errors
4. Verify internet connection

---

## ✅ Verification Checklist

After adding your first design:
- [ ] Studio accessible at `/studio`
- [ ] "Jewelry Design" appears in Create menu
- [ ] Form shows all fields
- [ ] Image uploads successfully
- [ ] Design is published (not draft)
- [ ] Design appears on `/designs` page
- [ ] Image displays correctly
- [ ] All fields show correctly

---

## 🎯 Quick Test

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open Studio:**
   ```
   http://localhost:3000/studio
   ```

3. **Create test design:**
   - Title: "Test Ring"
   - Slug: "test-ring" (auto-generated)
   - Description: "This is a test design"
   - Image: Upload any image
   - **Publish**

4. **Check website:**
   ```
   http://localhost:3000/designs
   ```
   Should see "Test Ring" ✅

---

## 📚 Next Steps

1. ✅ Add your jewelry designs
2. ✅ Upload high-quality images
3. ✅ Write detailed descriptions (good for SEO)
4. ✅ Set prices if selling
5. ✅ Mark featured designs for home page
6. ✅ Organize by categories

---

## 💡 Pro Tips

- **Use high-quality images** (1200x1200px minimum)
- **Write detailed descriptions** (helps with SEO)
- **Use consistent naming** for titles
- **Always publish** after creating
- **Add alt text** to images (accessibility)
- **Use categories** to organize
- **Mark featured** for home page showcase

---

## 🎉 You're All Set!

The schema is created and ready. Just:
1. Open Studio at `/studio`
2. Add your designs
3. Publish them
4. See them on your website!

**Happy creating!** 💍✨

