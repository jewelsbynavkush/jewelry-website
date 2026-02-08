# Vercel Deployment Guide
**Complete Step-by-Step Guide to Deploy Your Jewelry Website to Vercel**

**Date:** January 2026  
**Status:** ✅ **Complete Deployment Guide**

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Prepare Your Code](#2-prepare-your-code)
3. [Push to GitHub](#3-push-to-github)
4. [Deploy to Vercel](#4-deploy-to-vercel)
5. [Configure Environment Variables](#5-configure-environment-variables)
6. [Custom Domain (Optional)](#6-custom-domain-optional)
7. [Troubleshooting](#troubleshooting)

---

## 📋 **Deployment Overview**

### **Architecture**
- **Frontend:** Next.js 16 (App Router) - Serverless
- **Database:** Zoho Catalyst NoSQL (or JSON-based for now)
- **Hosting:** Vercel (Serverless Platform)
- **Version Control:** GitHub
- **Domain:** Custom domain (optional)

### **Deployment Strategy**
- ✅ **Serverless Architecture** - Zero server management
- ✅ **Automatic Deployments** - CI/CD via Vercel
- ✅ **Preview Deployments** - Test before production
- ✅ **Global CDN** - Fast worldwide performance
- ✅ **HTTPS by Default** - SSL certificates auto-provisioned

### **Estimated Time: 1-2 Hours**
- Pre-Deployment Prep: 15-30 min
- GitHub Setup: 10-15 min
- Vercel Deployment: 15-30 min
- Post-Deployment Config: 15-30 min
- Custom Domain: 30-60 min (optional)
- Testing & Verification: 15-30 min

---

## 1. Prerequisites

Before deploying, ensure you have:

- ✅ Code pushed to GitHub repository
- ✅ All environment variables ready (see [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md))
- ✅ Zoho Catalyst project set up (see [Zoho Catalyst Setup](./ZOHO_CATALYST_NOSQL_SETUP.md)) - Optional for now
- ✅ Vercel account (free)
- ✅ Build passes locally (`npm run build`)

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
# Environment
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-vercel-url.vercel.app
NEXT_PUBLIC_SITE_NAME=Jewels by NavKush

# Zoho Catalyst (Production)
ZOHO_CATALYST_PROJECT_ID=your_prod_project_id
ZOHO_CATALYST_CLIENT_ID=your_prod_client_id
ZOHO_CATALYST_CLIENT_SECRET=your_prod_client_secret

```

**Note:** For current JSON-based architecture, only `NEXT_PUBLIC_ENV`, `NEXT_PUBLIC_BASE_URL`, and `NEXT_PUBLIC_SITE_NAME` are required. Zoho Catalyst variables are for future implementation.

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

## 4.5. Configure Branch Selection (Dev/Prod Projects)

### **The Problem**
When creating a new Vercel project, you might not see a branch selector during initial setup. This is normal - you can configure it after project creation.

### **Method: Configure Branch After Project Creation (Recommended)**

#### **Step 1: Create Project with Default Branch**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `jewelry-website` repository
5. Click **"Import"**
6. **Don't worry about branch selection yet** - just use the default
7. Configure project name and settings
8. Click **"Deploy"** (this will deploy from `main` branch initially)

#### **Step 2: Change Production Branch**
After the project is created:

1. Go to your Vercel project dashboard
2. Click **"Settings"** (gear icon in top right)
3. Click **"Environments"** in the left sidebar (NOT "Git")
4. Scroll to the **"Production"** environment section
5. Look for **"Branch Tracking"** or **"Production Branch"** field
6. Enter or select your desired branch:
   - For **dev project**: Enter `develop`
   - For **prod project**: Enter `main` (or keep default)
7. Click **"Save"** or the branch will auto-save
8. Vercel will automatically redeploy from the new branch

#### **Step 3: Verify Branch Change**
1. Go to **"Deployments"** tab
2. You should see a new deployment triggered from your selected branch
3. Check the deployment details - it should show the correct branch name

### **Complete Setup for Dev & Prod Projects**

#### **Development Project Setup:**
1. **Create Project:**
   - Name: `jewelry-website-dev`
   - Import from GitHub
   - Deploy (will use `main` initially)

2. **Configure Branch:**
   - Settings → **Environments** → Production section → Branch Tracking → Enter `develop`
   - Save

3. **Result:**
   - Pushes to `develop` branch → Auto-deploys to dev project
   - URL: `jewelry-website-dev.vercel.app`

#### **Production Project Setup:**
1. **Create Project:**
   - Name: `jewelry-website-prod`
   - Import from GitHub (same repo)
   - Deploy (will use `main` initially)

2. **Configure Branch:**
   - Settings → **Environments** → Production section → Branch Tracking → Enter `main` (or keep default)
   - Save

3. **Result:**
   - Pushes to `main` branch → Auto-deploys to prod project
   - URL: `jewelry-website-prod.vercel.app`

### **Troubleshooting Branch Configuration**

**Issue: Branch Not Showing in Dropdown**
- Make sure the branch exists in GitHub
- Push the branch to GitHub if it's only local: `git push -u origin develop`
- Refresh Vercel dashboard
- You can type the branch name directly (it doesn't need to be in a dropdown)

**Issue: Branch Changed But Not Deploying**
- Make a small change to trigger deployment
- Check Vercel dashboard → Deployments
- Should see new deployment from selected branch

**Issue: Wrong Branch Deploying**
- Verify branch in Settings → **Environments** → Production → Branch Tracking
- Check if branch exists in GitHub
- Make sure you're looking at the correct environment (Production vs Preview)

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

### Issue: MongoDB Atlas Not Working
**Solution:**
1. Verify `MONGODB_URI` environment variable in Vercel
2. Check connection string format (should start with `mongodb+srv://`)
3. Verify username and password are correct
4. Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for Vercel)
5. Check MongoDB Atlas cluster is running
6. See [MongoDB Atlas Setup Guide](./MONGODB_ATLAS_SETUP_GUIDE.md)

### Issue: Images Not Loading
**Solution:**
1. Check image paths in public directory
2. Verify Next.js Image component configuration
3. Check browser console for errors
4. Verify image assets exist in public folder
5. See [Image Guide](./IMAGE_GUIDE.md)

### Issue: Contact Form Not Working
**Solution:**
1. Check API route is deployed
2. Verify rate limiting settings
3. Check browser console for errors
4. Verify CORS settings
5. Check API route logs in Vercel

---

## ✅ **Complete Deployment Checklist**

### **Pre-Deployment**
- [ ] Code is production-ready
- [ ] Build passes (`npm run build`)
- [ ] All environment variables prepared
- [ ] Security headers configured
- [ ] `.env.local` in `.gitignore`

### **GitHub Setup**
- [ ] GitHub account created
- [ ] Repository created
- [ ] Code pushed to GitHub
- [ ] `.env.local` NOT in repository

### **Vercel Deployment**
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] All environment variables added
- [ ] Build successful
- [ ] Site accessible at Vercel URL

### **Post-Deployment**
- [ ] Base URL updated
- [ ] All functionality tested
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled (optional)
- [ ] Monitoring set up (optional)

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

## 💡 **Pro Tips**

- **Use Preview Deployments** to test before merging
- **Monitor Build Logs** for any issues
- **Set up Vercel Analytics** for insights
- **Use Environment Variables** for different environments
- **Enable Automatic HTTPS** (done by default)
- **Set up separate dev/prod projects** (see [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md))

---

## 📊 **Monitoring & Maintenance**

### **Weekly Maintenance**
- [ ] Check deployment logs for errors
- [ ] Review analytics for issues
- [ ] Test critical functionality

### **Monthly Maintenance**
- [ ] Update dependencies (`npm update`)
- [ ] Review security advisories
- [ ] Check service usage/quota

### **Quarterly Maintenance**
- [ ] Security audit
- [ ] Performance review
- [ ] SEO audit
- [ ] Dependency updates

---

## 🚨 **Production Deployment Fixes**

### **Common Production Issues & Fixes**

#### **1. CSP Violation - Vercel Live Scripts Blocked**

**Issue:** Content Security Policy blocks Vercel Live feedback script.

**Fix:** `middleware.ts` allows `https://vercel.live` in `script-src` and `frame-src` in all environments (prod, preview, local dev).

#### **2. Image 400 Errors - File Extension Mismatch**

**Issue:** Hero and about images return 400 due to incorrect file extensions in database.

**Fix:**
- Default fallback paths updated in `lib/data/site-settings.ts`
- Run migration script: `npm run update:image-paths`
- Or manually update MongoDB records:
  ```javascript
  db.site_settings.updateOne(
    { type: 'hero' },
    { $set: { 'data.hero.image': '/assets/hero/hero-image.png' } }
  );
  db.site_settings.updateOne(
    { type: 'about' },
    { $set: { 'data.about.image': '/assets/about/about-image.png' } }
  );
  ```

#### **3. 401 Unauthorized - Expected Errors Logged**

**Issue:** Expected 401 errors for unauthenticated profile fetches are logged unnecessarily.

**Fix:** `lib/api/client.ts` suppresses expected 401 errors for profile endpoint.

#### **4. 429 Too Many Requests - Rate Limit Too Strict**

**Issue:** Refresh token endpoint rate limit too strict (10 per 15 minutes).

**Fix:** Increased to 20 per 15 minutes in `lib/security/constants.ts`.

---

## 🎯 **Quick Start Deployment**

### **Fastest Path to Production (~40 minutes):**

1. **Prepare Environment Variables** (5 min)
   - Gather all credentials
   - See [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md)

2. **Push to GitHub** (5 min)
   ```bash
   git init
   git remote add origin https://github.com/yourusername/jewelry-website.git
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

3. **Deploy to Vercel** (10 min)
   - Import from GitHub
   - Add environment variables
   - Deploy

4. **Configure & Test** (10 min)
   - Update base URL
   - Test all functionality
   - Verify everything works
   - Run `npm run update:image-paths` if needed

5. **Custom Domain** (10 min - optional)
   - Add domain in Vercel
   - Configure DNS
   - Wait for propagation

**Total: ~40 minutes to production!**

---

## 📚 **Related Documentation**

- [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md) - Dev/prod environment setup
- [Vercel Branch Setup](./VERCEL_BRANCH_SETUP.md) - Configure different branches
- [GitHub Complete Guide](./GITHUB_COMPLETE_GUIDE.md) - Complete GitHub setup
- [Zoho Catalyst Setup](./ZOHO_CATALYST_NOSQL_SETUP.md) - Database setup
- [Production Launch Guide](./PRODUCTION_LAUNCH_GUIDE.md) - Complete business launch guide

---

**Deployment complete!** Your jewelry website is now live on Vercel! 🚀

**Last Updated:** January 2026


