# Vercel Deployment Guide

Complete guide to deploy your jewelry website to Vercel.

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Prepare Your Code](#2-prepare-your-code)
3. [Push to GitHub](#3-push-to-github)
4. [Deploy to Vercel](#4-deploy-to-vercel)
5. [Configure Environment Variables](#5-configure-environment-variables)
6. [Custom Domain (Optional)](#6-custom-domain-optional)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before deploying, ensure you have:

- ✅ Code pushed to GitHub repository
- ✅ Firebase project set up (see [Firebase Setup Guide](FIREBASE_SETUP.md))
- ✅ Sanity.io project set up (see [Sanity.io Setup Guide](SANITY_SETUP.md))
- ✅ All environment variables ready
- ✅ Vercel account (free)

---

## 2. Prepare Your Code

### Step 2.1: Verify Build Works
Test that your project builds successfully:

```bash
cd jewelry-website
npm run build
```

If build succeeds, you're ready to deploy!

### Step 2.2: Check `.gitignore`
Ensure `.env.local` is in `.gitignore` (it should be by default):

```bash
# .gitignore should contain:
.env.local
.env*.local
```

### Step 2.3: Commit All Changes
```bash
git add .
git commit -m "Ready for deployment"
```

---

## 3. Push to GitHub

### Step 3.1: Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click **"New repository"** (or **"+"** → **"New repository"**)
3. Repository name: `jewelry-website` (or your preferred name)
4. Choose **Public** or **Private**
5. **Don't** initialize with README (you already have one)
6. Click **"Create repository"**

### Step 3.2: Connect Local Repository
```bash
# If not already a git repository
git init

# Add remote (replace with your GitHub username)
git remote add origin https://github.com/yourusername/jewelry-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3.3: Verify Push
1. Go to your GitHub repository
2. Verify all files are there
3. Check that `.env.local` is **NOT** in the repository

---

## 4. Deploy to Vercel

### Step 4.1: Sign Up/Login to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub

### Step 4.2: Import Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Or click **"Import Project"**
3. You'll see your GitHub repositories
4. Find `jewelry-website` and click **"Import"**

### Step 4.3: Configure Project
Vercel will auto-detect Next.js:

1. **Framework Preset:** Should be "Next.js" (auto-detected)
2. **Root Directory:** Leave as `./` (unless your Next.js app is in a subfolder)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `npm install` (default)

### Step 4.4: Add Environment Variables
**Important:** Add all environment variables before deploying!

1. Scroll down to **"Environment Variables"** section
2. Click **"Add"** for each variable:

```
NEXT_PUBLIC_FIREBASE_API_KEY = your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_SANITY_PROJECT_ID = your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET = production
NEXT_PUBLIC_SANITY_API_VERSION = 2024-01-01
SANITY_API_TOKEN = your_sanity_token (if needed)
NEXT_PUBLIC_BASE_URL = https://your-vercel-url.vercel.app
```

3. For each variable:
   - **Name:** Variable name (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value:** Your actual value
   - **Environment:** Select all (Production, Preview, Development)

4. Click **"Add"** after each variable

### Step 4.5: Deploy
1. Click **"Deploy"** button
2. Wait for deployment (usually 1-3 minutes)
3. You'll see build logs in real-time

### Step 4.6: Deployment Complete
Once deployment finishes:
1. Click **"Visit"** to see your live site
2. Your site URL will be: `https://your-project-name.vercel.app`

---

## 5. Configure Environment Variables

### Step 5.1: Update Base URL
After first deployment:

1. Go to Vercel dashboard → Your project → **"Settings"**
2. Go to **"Environment Variables"**
3. Update `NEXT_PUBLIC_BASE_URL` to your actual Vercel URL:
   ```
   NEXT_PUBLIC_BASE_URL=https://your-project-name.vercel.app
   ```
4. Redeploy (or it will update on next deployment)

### Step 5.2: Verify Environment Variables
1. Go to **"Settings"** → **"Environment Variables"**
2. Verify all variables are there
3. Check that they're enabled for **Production**, **Preview**, and **Development**

---

## 6. Custom Domain (Optional)

### Step 6.1: Add Domain
1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Enter your domain (e.g., `jewelrystore.com`)
4. Click **"Add"**

### Step 6.2: Configure DNS
Vercel will show DNS records to add:

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add DNS records as shown by Vercel:
   - Usually: `CNAME` record pointing to `cname.vercel-dns.com`
3. Wait for DNS propagation (can take up to 48 hours, usually faster)

### Step 6.3: SSL Certificate
- Vercel automatically provisions SSL certificates
- HTTPS will be enabled automatically
- No additional configuration needed

---

## 🔄 Automatic Deployments

### How It Works
- **Push to `main` branch** → Automatic production deployment
- **Create Pull Request** → Preview deployment
- **Every commit** → New deployment

### Preview Deployments
- Each PR gets a unique URL
- Test changes before merging
- Share with team for review

---

## 📊 Deployment Settings

### Step 7.1: Build Settings
Go to **"Settings"** → **"General"**:

- **Framework:** Next.js (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 7.2: Environment Variables
Go to **"Settings"** → **"Environment Variables"**:

- Add/Edit variables here
- Variables are encrypted
- Available in all deployments

### Step 7.3: Analytics (Optional)
1. Go to **"Analytics"** tab
2. Enable Vercel Analytics (free tier available)
3. Get insights on page views, performance

---

## 🐛 Troubleshooting

### Issue: Build Fails
**Solution:**
1. Check build logs in Vercel dashboard
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Import errors
   - Missing dependencies

### Issue: Environment Variables Not Working
**Solution:**
1. Verify variables are added in Vercel dashboard
2. Check variable names (case-sensitive)
3. Ensure `NEXT_PUBLIC_*` prefix for client-side vars
4. Redeploy after adding variables

### Issue: Firebase Not Working on Production
**Solution:**
1. Check Firebase CORS settings
2. Verify environment variables in Vercel
3. Check Firebase Console → Project Settings → General
4. Ensure Firestore is enabled

### Issue: Sanity.io Not Loading
**Solution:**
1. Verify Project ID in environment variables
2. Check dataset name (usually `production`)
3. Verify content is published (not drafts)
4. Check CORS settings in Sanity.io

### Issue: Images Not Loading
**Solution:**
1. Check Sanity.io image URLs
2. Verify `@sanity/image-url` is installed
3. Check browser console for errors
4. Verify image assets exist in Sanity

### Issue: Contact Form Not Working
**Solution:**
1. Check Firebase environment variables
2. Verify Firestore is enabled
3. Check security rules allow `create`
4. Check browser console for errors
5. Verify API route is deployed

---

## ✅ Verification Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] All environment variables added
- [ ] Build successful
- [ ] Site accessible at Vercel URL
- [ ] Contact form working
- [ ] Designs loading from Sanity.io
- [ ] Images displaying correctly
- [ ] Custom domain configured (if applicable)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

## 🎯 Next Steps

After deployment:
1. ✅ Test all functionality on live site
2. ✅ Set up custom domain (optional)
3. ✅ Configure analytics
4. ✅ Set up monitoring/alerts
5. ✅ Share your website!

---

## 💡 Pro Tips

- **Use Preview Deployments** to test before merging
- **Monitor Build Logs** for any issues
- **Set up Vercel Analytics** for insights
- **Use Environment Variables** for different environments
- **Enable Automatic HTTPS** (done by default)

---

**Deployment complete!** Your jewelry website is now live on Vercel! 🚀

