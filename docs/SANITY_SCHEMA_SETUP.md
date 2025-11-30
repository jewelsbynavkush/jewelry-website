# Sanity Schema Setup - Complete Guide

## 🚀 Quick Fix (5 Minutes)

**If no designs are showing on your website:**

1. **Open Sanity Studio:** Go to `http://localhost:3000/studio` (or https://sanity.io/manage)
2. **Create Schema:** The schema is already created in code! Just add content.
3. **Add Design:** Click "Create" → "Jewelry Design" → Fill form → Publish
4. **Check Website:** Go to `http://localhost:3000/designs` - your design should appear!

**Still not working?** See detailed steps below.

---

## 🤔 What is a Schema?

**Simple Explanation:**
A schema is like a **form template** that tells Sanity.io what fields your jewelry designs should have. Think of it like a form with boxes for:
- Title (text box)
- Description (big text box)
- Image (image upload)
- Price (number)
- Category (dropdown)

**Without a schema:** Sanity doesn't know what fields to show when you try to add a design.
**With a schema:** Sanity shows you a form with all the right fields to fill in.

---

## ✅ What's Already Set Up

Your code is **already configured** to:
- ✅ Connect to Sanity.io
- ✅ Schema created in code (`sanity/schemaTypes/jewelryDesign.ts`)
- ✅ Fetch designs from Sanity
- ✅ Display images and information
- ✅ Show designs on the website

**What You Need to Do:**
- ✅ Add jewelry designs in Sanity Studio
- ✅ Mark some as "Most Loved" for home page
- ✅ Add material descriptions
- ✅ Upload images

---

## 🚀 Quick Setup (2 Methods)

### **Method 1: Use Sanity Studio Online (Easiest - Recommended)**

This is the **easiest way** - no coding required!

#### Step 1: Open Sanity Studio
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Click on your project (`2suuxw24`)
3. Click **"Open Studio"** button (top right)

#### Step 2: Create Schema via Schema Builder
1. In Studio, look for **"Schema"** or **"Structure"** in the left menu
2. Click **"Add document type"** or **"Create new type"**
3. Name it: `jewelryDesign` (exactly this name - case sensitive!)

#### Step 3: Add Fields
Click **"Add field"** for each of these:

**Field 1: Title**
- Field name: `title`
- Field type: **String**
- Required: ✅ Yes

**Field 2: Slug**
- Field name: `slug`
- Field type: **Slug**
- Options: Source from `title`
- Required: ✅ Yes

**Field 3: Description**
- Field name: `description`
- Field type: **Text**
- Required: ✅ Yes

**Field 4: Image**
- Field name: `image`
- Field type: **Image**
- Options: Enable "Hotspot" (optional)
- Required: ✅ Yes

**Field 5: Price**
- Field name: `price`
- Field type: **Number**
- Required: ❌ No (optional)

**Field 6: Category**
- Field name: `category`
- Field type: **String**
- Options: Add list values:
  - `rings`
  - `necklaces`
  - `earrings`
  - `bracelets`
  - `other`
- Required: ❌ No (optional)

#### Step 4: Save Schema
1. Click **"Save"** or **"Publish"**
2. The schema is now created!

---

### **Method 2: Install Sanity Studio Locally (More Control)**

This gives you more control and is better for complex schemas.

#### Step 1: Install Sanity CLI
```bash
npm install -g @sanity/cli
```

#### Step 2: Login to Sanity
```bash
sanity login
```
(Follow the prompts to login with your Sanity account)

#### Step 3: Initialize Studio in Your Project
```bash
cd jewelry-website
sanity init --env
```

When prompted:
- **Select project:** Choose your project (`2suuxw24`)
- **Select dataset:** `production`
- **Project output path:** `./studio` (or press Enter for default)
- **Template:** Choose **"Clean project with no predefined schemas"**

#### Step 4: Create Schema File
Create the file: `studio/schemas/jewelryDesign.ts`

```typescript
export default {
  name: 'jewelryDesign',
  title: 'Jewelry Design',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in USD',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Rings', value: 'rings' },
          { title: 'Necklaces', value: 'necklaces' },
          { title: 'Earrings', value: 'earrings' },
          { title: 'Bracelets', value: 'bracelets' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
}
```

#### Step 5: Register Schema
Edit `studio/schemas/index.ts`:

```typescript
import jewelryDesign from './jewelryDesign'

export const schemaTypes = [jewelryDesign]
```

#### Step 6: Run Studio
```bash
cd studio
npm install
sanity start
```

Studio will open at `http://localhost:3333`

---

## 📝 Adding Your First Design

### Step 1: Open Studio
- **Online:** Go to [sanity.io/manage](https://sanity.io/manage) → Your project → "Open Studio"
- **Local:** Run `sanity start` in studio folder

### Step 2: Create New Design
1. Click **"Create"** or **"New"** button
2. Select **"Jewelry Design"**
3. Fill in the form:

**Title:** "Gold Diamond Ring"
- This is the name of your jewelry piece

**Slug:** 
- Click "Generate" button (auto-creates from title)
- Or manually type: `gold-diamond-ring`

**Description:** 
- "Beautiful handcrafted gold ring with a stunning diamond centerpiece. Perfect for special occasions."

**Image:**
- Click "Upload" or drag and drop an image
- Recommended size: 1200x1200px or larger
- Supported formats: JPG, PNG, WebP

**Price:** (Optional)
- Enter number: `999.99`
- No dollar sign needed

**Category:** (Optional)
- Select from dropdown: "Rings"

### Step 3: Publish
1. Click **"Publish"** button (top right)
2. **Important:** Designs must be published to appear on your website!

### Step 4: Verify on Website
1. Go to your website: `http://localhost:3000/designs`
2. Your design should now appear!

---

## 🔍 Troubleshooting

### Issue: "No designs available yet"
**Possible causes:**
1. Schema not created → Follow Method 1 or 2 above
2. Designs not published → Click "Publish" in Sanity Studio
3. Wrong content type name → Must be exactly `jewelryDesign` (case-sensitive)
4. Wrong dataset → Should be `production`

### Issue: Images not showing
**Solutions:**
1. Make sure image is uploaded in Sanity
2. Check browser console for errors
3. Verify `@sanity/image-url` is installed: `npm list @sanity/image-url`
4. Check image URL in browser DevTools → Network tab

### Issue: Can't find "Add document type" in Studio
**Solution:**
- You might need to use Method 2 (local Studio)
- Or check if you have the right permissions in Sanity

### Issue: Schema not saving
**Solutions:**
1. Check you're logged in to Sanity
2. Verify you have edit permissions
3. Try refreshing the page
4. Check browser console for errors

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Schema created with name `jewelryDesign`
- [ ] All required fields added (title, slug, description, image)
- [ ] At least one design created
- [ ] Design is **published** (not draft)
- [ ] Website shows the design at `/designs`
- [ ] Images load correctly

---

## 🎯 Quick Test

1. **Create a test design:**
   - Title: "Test Ring"
   - Slug: "test-ring" (auto-generated)
   - Description: "This is a test"
   - Image: Upload any image
   - **Publish it**

2. **Check your website:**
   ```bash
   npm run dev
   ```
   Go to: `http://localhost:3000/designs`

3. **If you see "Test Ring"** → Everything works! ✅
4. **If you see "No designs available"** → Check troubleshooting above

---

## 🔍 Test Your Connection

Run this command to test:
```bash
node scripts/test-sanity-connection.js
```

This will tell you:
- ✅ If connection works
- ✅ If schema exists
- ✅ If designs are found

---

## 📚 What Each Field Does

| Field | Type | Required | What It's For |
|-------|------|----------|--------------|
| `title` | String | ✅ Yes | Name of the jewelry piece |
| `slug` | Slug | ✅ Yes | URL-friendly version (e.g., "gold-ring") |
| `description` | Text | ✅ Yes | Description of the jewelry |
| `image` | Image | ✅ Yes | Photo of the jewelry |
| `price` | Number | ❌ No | Price in USD |
| `category` | String | ❌ No | Type (rings, necklaces, etc.) |

---

## 🚀 Next Steps

After schema is set up:
1. ✅ Add your jewelry designs
2. ✅ Upload high-quality images
3. ✅ Add descriptions for SEO
4. ✅ Set prices if selling
5. ✅ Organize by categories

---

## 💡 Pro Tips

- **Use high-quality images** (1200x1200px minimum)
- **Write detailed descriptions** (good for SEO)
- **Use consistent naming** for titles
- **Publish immediately** after creating
- **Add categories** to organize designs

---

**Need help?** Check the troubleshooting section or review the [Sanity.io Setup Guide](SANITY_SETUP.md) for more details.

