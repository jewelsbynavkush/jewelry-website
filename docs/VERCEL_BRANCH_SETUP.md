# Vercel Branch Selection Guide

**How to configure different branches for dev and prod projects in Vercel**

---

## 🎯 **The Problem**

When creating a new Vercel project, you might not see a branch selector during the initial setup. This is normal - you can configure it after project creation.

---

## ✅ **Solution: Two Methods**

### **Method 1: Configure Branch After Project Creation (Recommended)**

This is the easiest and most reliable method.

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

---

### **Method 2: Use Vercel CLI (Advanced)**

If you prefer command-line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd /Users/rajatsharma/Desktop/STUDY/DI/jewelry-website
vercel link

# Set production branch
vercel --prod
```

Then configure in dashboard as shown in Method 1.

---

## 🔧 **Complete Setup for Dev & Prod Projects**

### **Development Project Setup**

1. **Create Project:**
   - Name: `jewelry-website-dev`
   - Import from GitHub
   - Deploy (will use `main` initially)

2. **Configure Branch:**
   - Settings → **Environments** → Production section → Branch Tracking → Enter `develop`
   - Save

3. **Configure Environment Variables:**
   - Settings → Environment Variables
   - Add all dev environment variables
   - Enable for: Production, Preview, Development

4. **Result:**
   - Pushes to `develop` branch → Auto-deploys to dev project
   - URL: `jewelry-website-dev.vercel.app`

### **Production Project Setup**

1. **Create Project:**
   - Name: `jewelry-website-prod`
   - Import from GitHub (same repo)
   - Deploy (will use `main` initially)

2. **Configure Branch:**
   - Settings → **Environments** → Production section → Branch Tracking → Enter `main` (or keep default)
   - Save

3. **Configure Environment Variables:**
   - Settings → Environment Variables
   - Add all prod environment variables
   - Enable for: Production, Preview, Development

4. **Result:**
   - Pushes to `main` branch → Auto-deploys to prod project
   - URL: `jewelry-website-prod.vercel.app`

---

## 🌿 **Branch Configuration Details**

### **Where to Find Branch Settings**

1. **Vercel Dashboard** → Your Project
2. **Settings** (gear icon)
3. **Environments** (left sidebar) ← **IMPORTANT: It's here, not in Git!**
4. **Production** section → **"Branch Tracking"** or **"Production Branch"** field

### **Available Options**

- **Production Branch:** The branch that deploys to your production URL
- **Preview Branches:** Branches that create preview deployments
- **Ignored Build Step:** Skip builds for certain commits

### **Recommended Settings**

#### **Development Project:**
```
Production Branch: develop
Preview Branches: feature/*, bugfix/*
```

#### **Production Project:**
```
Production Branch: main
Preview Branches: develop, feature/*, bugfix/*
```

---

## 🚨 **Troubleshooting**

### **Issue: Branch Not Showing in Dropdown**

**Solution:**
1. Make sure the branch exists in GitHub
2. Push the branch to GitHub if it's only local:
   ```bash
   git push -u origin develop
   ```
3. Refresh Vercel dashboard
4. Go to Settings → **Environments** → Production → Branch Tracking
5. You can type the branch name directly (it doesn't need to be in a dropdown)
6. If still not working, go to Settings → Git → Click "Refresh" or "Reconnect"

### **Issue: Branch Changed But Not Deploying**

**Solution:**
1. Make a small change to trigger deployment:
   ```bash
   git checkout develop
   # Make a small change (e.g., update README)
   git commit -m "Trigger dev deployment"
   git push origin develop
   ```
2. Check Vercel dashboard → Deployments
3. Should see new deployment from `develop` branch

### **Issue: Wrong Branch Deploying**

**Solution:**
1. Verify branch in Settings → **Environments** → Production → Branch Tracking
2. Check if branch exists in GitHub
3. Make sure you're looking at the correct environment (Production vs Preview)
4. Disconnect and reconnect Git integration if needed:
   - Settings → Git → Disconnect
   - Then reconnect

### **Issue: Can't See Git Settings**

**Solution:**
1. Make sure you're the project owner/admin
2. Check if project is connected to Git (should show GitHub icon)
3. If not connected, go to Settings → Git → Connect Git Repository

---

## 📋 **Quick Checklist**

### **Before Creating Project:**
- [ ] Branch exists in GitHub (both `main` and `develop`)
- [ ] You have access to Vercel account
- [ ] GitHub repository is accessible

### **After Creating Project:**
- [ ] Project created successfully
- [ ] Go to Settings → Git
- [ ] Change Production Branch to desired branch
- [ ] Save changes
- [ ] Verify new deployment triggered
- [ ] Check deployment shows correct branch

### **For Both Projects:**
- [ ] Dev project uses `develop` branch
- [ ] Prod project uses `main` branch
- [ ] Environment variables configured
- [ ] Auto-deployments working

---

## 🎯 **Workflow After Setup**

Once configured correctly:

```bash
# Development workflow
git checkout develop
# ... make changes ...
git commit -m "New feature"
git push origin develop
# → Auto-deploys to dev.vercel.app

# Production workflow (after testing)
git checkout main
git merge develop
git push origin main
# → Auto-deploys to prod.vercel.app
```

---

## 📚 **Related Documentation**

- [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md) - Complete environment setup
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) - General Vercel deployment
- [Project Roadmap](./PROJECT_ROADMAP.md) - Overall project plan

---

**✅ Once configured, your branches will automatically deploy to the correct Vercel projects!**
