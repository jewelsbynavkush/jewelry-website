# Sanity.io Setup Guide

Complete step-by-step guide to set up Sanity.io CMS for managing jewelry designs.

## 📋 Table of Contents

1. [Create Sanity.io Account](#1-create-sanityio-account)
2. [Create New Project](#2-create-new-project)
3. [Get Project Configuration](#3-get-project-configuration)
4. [Set Up Content Schema](#4-set-up-content-schema)
5. [Configure Environment Variables](#5-configure-environment-variables)
6. [Install Sanity Studio (Optional)](#6-install-sanity-studio-optional)
7. [Add Content](#7-add-content)
8. [Test CMS Integration](#8-test-cms-integration)
9. [Troubleshooting](#troubleshooting)

---

## 1. Create Sanity.io Account

### Step 1.1: Sign Up
1. Go to [Sanity.io](https://www.sanity.io/)
2. Click **"Get started"** or **"Sign up"**
3. Choose sign-up method:
   - **Google** (recommended - fastest)
   - **GitHub**
   - **Email**

### Step 1.2: Complete Registration
1. Fill in required information
2. Verify your email if needed
3. You'll be redirected to Sanity.io dashboard

---

## 2. Create New Project

### Step 2.1: Create Project
1. In Sanity.io dashboard, click **"Create project"**
2. Or click **"New project"** button

### Step 2.2: Configure Project
1. **Project name:** `Jewelry Website` (or your preferred name)
2. **Data location:** Choose closest to your users
   - **Recommended:** `US West (San Francisco)` or `US East (Washington)`
3. Click **"Create project"**

### Step 2.3: Choose Plan
1. Select **"Free"** plan (perfect for starting)
   - Includes: 3 users, unlimited API requests
2. Click **"Continue"** or **"Create project"**

---

## 3. Get Project Configuration

### Step 3.1: Find Project ID
1. In your project dashboard, look for **"Project ID"**
2. It's usually displayed at the top or in project settings
3. **Copy this value** - you'll need it for `.env.local`

### Step 3.2: Find Dataset
1. Default dataset is usually **"production"**
2. You can see it in the URL: `https://your-project-id.sanity.studio/desk/production`
3. **Note:** We'll use `production` as the dataset

### Step 3.3: Get API Token (Optional for Read-Only)
For read-only access (what the website needs), you typically don't need a token if using public dataset.

However, if you want to create content via API, you'll need a token:
1. Go to **"API"** → **"Tokens"**
2. Click **"Add API token"**
3. Name it: `Website Token`
4. Select permissions: **"Viewer"** (read-only) or **"Editor"** (read/write)
5. Click **"Save"**
6. **Copy the token** (you'll only see it once!)

---

## 4. Set Up Content Schema

### Step 4.1: Access Schema
You have two options:

**Option A: Use Sanity Studio (Recommended)**
- Install Sanity Studio locally (see Step 6)
- Define schema in code

**Option B: Use Sanity Studio Online**
- Go to your project dashboard
- Click **"Open Studio"**
- Use the visual schema builder

### Step 4.2: Create Jewelry Design Schema

Create a file `schemas/jewelryDesign.ts` (if using local Studio):

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

### Step 4.3: Register Schema
If using local Studio, register it in `schemas/index.ts`:

```typescript
import jewelryDesign from './jewelryDesign'

export const schemaTypes = [jewelryDesign]
```

---

## 5. Configure Environment Variables

### Step 5.1: Update `.env.local`
1. If you haven't created `.env.local` yet:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add/update Sanity.io configuration:

```env
# Sanity.io Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your-token-here  # Optional, only if needed
```

### Step 5.2: Replace Values
- Replace `your-project-id-here` with your actual Project ID
- Keep `production` as dataset (or change if you used different)
- `SANITY_API_TOKEN` is optional for read-only access

---

## 6. Install Sanity Studio (Optional)

Sanity Studio lets you manage content visually. It's optional but recommended.

### Step 6.1: Install Sanity CLI
```bash
npm install -g @sanity/cli
```

### Step 6.2: Login to Sanity
```bash
sanity login
```

### Step 6.3: Initialize Studio
```bash
cd jewelry-website
sanity init
```

Follow the prompts:
- Choose **"Create new project"** or **"Use existing project"**
- Select your project
- Choose **"Blog (schema)"** or **"Clean project"**
- Install dependencies: **Yes**

### Step 6.4: Run Studio Locally
```bash
sanity start
```

Studio will open at `http://localhost:3333`

---

## 7. Add Content

### Step 7.1: Access Studio
- **Online:** Go to your project → Click **"Open Studio"**
- **Local:** Run `sanity start` and open `http://localhost:3333`

### Step 7.2: Create First Design
1. Click **"Create"** or **"New"** button
2. Select **"Jewelry Design"**
3. Fill in the form:
   - **Title:** "Gold Diamond Ring"
   - **Slug:** Auto-generated from title
   - **Description:** "Beautiful gold ring with diamond"
   - **Image:** Upload an image
   - **Price:** 999.99 (optional)
   - **Category:** Select from dropdown (optional)
4. Click **"Publish"**

### Step 7.3: Add More Designs
Repeat Step 7.2 to add more jewelry designs.

---

## 8. Test CMS Integration

### Step 8.1: Start Development Server
```bash
npm run dev
```

### Step 8.2: Check Designs Page
1. Go to `http://localhost:3000/designs`
2. You should see your jewelry designs
3. Images should load correctly

### Step 8.3: Check Home Page
1. Go to `http://localhost:3000`
2. Scroll to "Featured Designs" section
3. Should show your designs

### Step 8.4: Verify Image URLs
- Images should be served from Sanity.io CDN
- Check browser DevTools → Network tab
- Images should load from `cdn.sanity.io`

---

## 📊 Content Structure

### Jewelry Design Document:
```json
{
  "_id": "abc123",
  "_type": "jewelryDesign",
  "title": "Gold Diamond Ring",
  "slug": {
    "current": "gold-diamond-ring"
  },
  "description": "Beautiful gold ring with diamond",
  "image": {
    "asset": {
      "_ref": "image-abc123-1920x1080-jpg",
      "_type": "reference"
    }
  },
  "price": 999.99,
  "category": "rings"
}
```

---

## 🔒 Security & Permissions

### Public Access (Read-Only)
- By default, Sanity.io datasets are **public** (read-only)
- Anyone with Project ID can read your content
- This is fine for a public website

### Private Access
If you need private content:
1. Go to **"API"** → **"CORS origins"**
2. Add your domain
3. Use API tokens for authentication

---

## 🐛 Troubleshooting

### Issue: "Project not found"
**Solution:**
- Verify Project ID is correct
- Check for typos in `.env.local`
- Ensure project exists in Sanity.io dashboard

### Issue: "Dataset not found"
**Solution:**
- Default dataset is `production`
- Check dataset name in `.env.local`
- Verify dataset exists in Sanity.io

### Issue: Images not loading
**Solution:**
1. Check image URL in browser DevTools
2. Verify image was uploaded to Sanity
3. Check CORS settings if needed
4. Verify `@sanity/image-url` is installed

### Issue: No designs showing
**Solution:**
1. Check if designs are **published** (not drafts)
2. Verify schema matches (`jewelryDesign` type)
3. Check browser console for errors
4. Verify Project ID and Dataset are correct

### Issue: "Invalid API version"
**Solution:**
- Use `2024-01-01` or latest version
- Check `NEXT_PUBLIC_SANITY_API_VERSION` in `.env.local`

---

## ✅ Verification Checklist

- [ ] Sanity.io account created
- [ ] Project created
- [ ] Project ID copied
- [ ] Content schema created (`jewelryDesign`)
- [ ] `.env.local` configured
- [ ] At least one design added and published
- [ ] Designs visible on website
- [ ] Images loading correctly

---

## 📚 Additional Resources

- [Sanity.io Documentation](https://www.sanity.io/docs)
- [Sanity Studio Guide](https://www.sanity.io/docs/sanity-studio)
- [Schema Types](https://www.sanity.io/docs/schema-types)
- [Image URLs](https://www.sanity.io/docs/image-urls)

---

## 🎯 Next Steps

After Sanity.io is set up:
1. ✅ Add your jewelry designs
2. ✅ Test on local development
3. ✅ Deploy to Vercel (see [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md))
4. ✅ Update content anytime via Sanity Studio

---

## 💡 Tips

- **Use Sanity Studio Online** for quick content updates
- **Install local Studio** for schema changes
- **Use categories** to organize designs
- **Add descriptions** for better SEO
- **Optimize images** before uploading (recommended size: 1200x1200px)

---

**Sanity.io setup complete!** Your jewelry designs are now managed via CMS. 🎉

