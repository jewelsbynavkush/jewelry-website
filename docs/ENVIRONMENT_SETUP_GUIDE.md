# Environment Setup Guide - Dev & Prod (100% Free)

**Complete step-by-step guide to set up development and production environments using free services.**

---

## 📋 **Table of Contents**

1. [Overview - Free Services](#overview---free-services)
2. [Prerequisites](#prerequisites)
3. [Step 1: GitHub Repository Setup](#step-1-github-repository-setup)
4. [Step 2: Zoho Catalyst Projects Setup](#step-2-zoho-catalyst-projects-setup)
5. [Step 3: Vercel Projects Setup](#step-3-vercel-projects-setup)
6. [Step 4: Domain Configuration](#step-4-domain-configuration)
7. [Step 5: Environment Variables](#step-5-environment-variables)
8. [Step 6: Branch Strategy](#step-6-branch-strategy)
9. [Step 7: Local Development Setup](#step-7-local-development-setup)
10. [Step 8: Testing & Verification](#step-8-testing--verification)

---

## 🎯 **Overview - Free Services**

### **All Free Services We'll Use:**

| Service | Free Tier | What We Get |
|---------|-----------|-------------|
| **GitHub** | ✅ Free | Unlimited repos, version control, CI/CD |
| **Vercel** | ✅ Free | 100GB bandwidth/month, unlimited deployments, CDN |
| **Zoho Catalyst** | ✅ Free | 2GB storage, 10K reads/month, 5K writes/month |
| **Zoho Mail** | ✅ Free | 5GB storage, 25MB attachment limit |
| **Domain** | ⚠️ Paid | Your existing domain (jewelsbynavkush.com) |

**Total Cost: $0/month** (except domain, which you already have)

---

## ✅ **Prerequisites**

Before starting, ensure you have:
- ✅ GitHub account (free)
- ✅ Vercel account (free - sign up with GitHub)
- ✅ Zoho Catalyst account (free)
- ✅ Domain access (jewelsbynavkush.com)
- ✅ Code pushed to GitHub

---

## 📦 **Step 1: GitHub Repository Setup**

### **1.1 Create Repository (if not exists)**

1. Go to [GitHub](https://github.com)
2. Click **"New repository"** (or **"+"** → **"New repository"**)
3. Repository name: `jewelry-website` (or your preferred name)
4. Choose **Public** (free) or **Private** (free for personal use)
5. **Don't** initialize with README (you already have one)
6. Click **"Create repository"**

### **1.2 Push Your Code**

```bash
# Navigate to your project
cd /Users/rajatsharma/Desktop/STUDY/DI/jewelry-website

# Initialize git (if not already done)
git init

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/jewelry-website.git

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Production-ready jewelry website"

# Push to GitHub
git branch -M main
git push -u origin main
```

### **1.3 Create Development Branch**

```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop branch to GitHub
git push -u origin develop
```

**✅ Step 1 Complete:** Your code is now on GitHub with `main` and `develop` branches.

---

## 🗄️ **Step 2: Zoho Catalyst Projects Setup**

### **2.1 Create Development Project**

1. Go to [Zoho Catalyst Console](https://catalyst.zoho.com)
2. Click **"Create Project"**
3. **Project Name:** `jewelry-website-dev`
4. **Description:** Development environment for jewelry website
5. Click **"Create"**
6. **Note down:**
   - Project ID (you'll need this)
   - Project Name

### **2.2 Set Up NoSQL Database (Dev)**

1. In your dev project, go to **"Data Store"** → **"NoSQL"**
2. Click **"Create Table"**
3. **Table Name:** `products`
4. **Primary Key:** `id` (String)
5. Click **"Create"**
6. Repeat for all tables:
   - `users`
   - `addresses`
   - `cart`
   - `orders`
   - `order_items`
   - `categories`
   - `site_settings`
   - `inventory_log`
   - `wishlist`
   - `email_templates`
   - `email_queue`

### **2.3 Get API Credentials (Dev)**

1. Go to **"Settings"** → **"API Details"**
2. Click **"Generate Client ID"**
3. **Client Name:** `jewelry-website-dev-client`
4. Click **"Generate"**
5. **Copy and save:**
   - Client ID
   - Client Secret (shown only once!)

### **2.4 Create Production Project**

1. Click **"Create Project"** again
2. **Project Name:** `jewelry-website-prod`
3. **Description:** Production environment for jewelry website
4. Click **"Create"**
5. Repeat steps 2.2 and 2.3 for production:
   - Create all tables
   - Generate API credentials
   - Save Client ID and Client Secret

**✅ Step 2 Complete:** You now have two Zoho Catalyst projects (dev & prod) with databases.

---

## 🚀 **Step 3: Vercel Projects Setup**

### **3.1 Sign Up / Login to Vercel**

1. Go to [Vercel](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub

### **3.2 Create Development Project**

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Select your `jewelry-website` repository
4. Click **"Import"**

#### **Configure Development Project:**

1. **Project Name:** `jewelry-website-dev`
2. **Framework Preset:** Next.js (auto-detected)
3. **Root Directory:** `./` (default)
4. **Build Command:** `npm run build` (default)
5. **Output Directory:** `.next` (default)
6. **Install Command:** `npm install` (default)

#### **Environment Variables (Dev):**

Click **"Environment Variables"** and add:

```bash
# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=https://dev2026.jewelsbynavkush.com

# Zoho Catalyst (Dev)
ZOHO_CATALYST_PROJECT_ID=your_dev_project_id
ZOHO_CATALYST_CLIENT_ID=your_dev_client_id
ZOHO_CATALYST_CLIENT_SECRET=your_dev_client_secret

# Zoho Mail (Dev - optional for now)
ZOHO_MAIL_API_KEY=your_dev_mail_key

# Add to all environments: Production, Preview, Development
```

7. **Branch:** Select **"develop"** branch
8. Click **"Deploy"**

### **3.3 Create Production Project**

1. Click **"Add New..."** → **"Project"** again
2. Select the same `jewelry-website` repository
3. Click **"Import"**

#### **Configure Production Project:**

1. **Project Name:** `jewelry-website-prod`
2. **Framework Preset:** Next.js (auto-detected)
3. **Root Directory:** `./` (default)
4. **Build Command:** `npm run build` (default)
5. **Output Directory:** `.next` (default)
6. **Install Command:** `npm install` (default)

#### **Environment Variables (Prod):**

Click **"Environment Variables"** and add:

```bash
# Environment
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_BASE_URL=https://jewelsbynavkush.com

# Zoho Catalyst (Prod)
ZOHO_CATALYST_PROJECT_ID=your_prod_project_id
ZOHO_CATALYST_CLIENT_ID=your_prod_client_id
ZOHO_CATALYST_CLIENT_SECRET=your_prod_client_secret

# Zoho Mail (Prod)
ZOHO_MAIL_API_KEY=your_prod_mail_key

# Add to all environments: Production, Preview, Development
```

7. **Branch:** Select **"main"** branch
8. Click **"Deploy"**

**✅ Step 3 Complete:** You now have two Vercel projects (dev & prod) connected to GitHub.

---

## 🌐 **Step 4: Domain Configuration**

### **4.1 Production Domain (Already Set Up)**

Your production domain `jewelsbynavkush.com` should already be configured. If not:

1. In Vercel production project, go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter: `jewelsbynavkush.com`
4. Add DNS records as shown by Vercel:
   - Usually: `CNAME` record pointing to `cname.vercel-dns.com`
5. Wait for DNS propagation (usually 5-30 minutes)

### **4.2 Development Domain Setup**

#### **Option A: Subdomain (Recommended - Free)**

1. In Vercel development project, go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter: `dev2026.jewelsbynavkush.com` (or `dev.jewelsbynavkush.com`)
4. Add DNS record in your domain registrar:
   - **Type:** `CNAME`
   - **Name:** `dev2026` (or `dev`)
   - **Value:** `cname.vercel-dns.com` (or the value Vercel shows)
5. Wait for DNS propagation

#### **Option B: Vercel Preview Domain (Free - No DNS Setup)**

- Vercel automatically provides: `jewelry-website-dev.vercel.app`
- No DNS configuration needed
- Use this if you don't want to set up subdomain

**✅ Step 4 Complete:** Domains are configured (or using Vercel preview domains).

---

## 🔐 **Step 5: Environment Variables**

### **5.1 Local Development Setup**

Create environment files in your project:

#### **`.env.development.local`**

```bash
# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Zoho Catalyst (Dev)
ZOHO_CATALYST_PROJECT_ID=your_dev_project_id
ZOHO_CATALYST_CLIENT_ID=your_dev_client_id
ZOHO_CATALYST_CLIENT_SECRET=your_dev_client_secret

# Zoho Mail (Dev)
ZOHO_MAIL_API_KEY=your_dev_mail_key
```

#### **`.env.production.local`**

```bash
# Environment
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_BASE_URL=https://jewelsbynavkush.com

# Zoho Catalyst (Prod)
ZOHO_CATALYST_PROJECT_ID=your_prod_project_id
ZOHO_CATALYST_CLIENT_ID=your_prod_client_id
ZOHO_CATALYST_CLIENT_SECRET=your_prod_client_secret

# Zoho Mail (Prod)
ZOHO_MAIL_API_KEY=your_prod_mail_key
```

#### **`.env.example`** (Template - commit this)

```bash
# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Zoho Catalyst
ZOHO_CATALYST_PROJECT_ID=
ZOHO_CATALYST_CLIENT_ID=
ZOHO_CATALYST_CLIENT_SECRET=

# Zoho Mail
ZOHO_MAIL_API_KEY=
```

### **5.2 Update .gitignore**

Ensure `.gitignore` includes:

```gitignore
# Environment variables
.env*.local
.env
.env.development.local
.env.production.local
```

### **5.3 Create Environment Helper**

Create `lib/utils/env.ts` (if not exists):

```typescript
/**
 * Get environment-specific configuration
 */
export function getEnv() {
  return process.env.NEXT_PUBLIC_ENV || 'development';
}

/**
 * Check if running in production
 */
export function isProduction() {
  return getEnv() === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment() {
  return getEnv() === 'development';
}

/**
 * Get Zoho Catalyst configuration based on environment
 */
export function getZohoCatalystConfig() {
  const env = getEnv();
  
  return {
    projectId: process.env.ZOHO_CATALYST_PROJECT_ID || '',
    clientId: process.env.ZOHO_CATALYST_CLIENT_ID || '',
    clientSecret: process.env.ZOHO_CATALYST_CLIENT_SECRET || '',
    environment: env,
  };
}
```

**✅ Step 5 Complete:** Environment variables are configured for all environments.

---

## 🌿 **Step 6: Branch Strategy**

### **6.1 Branch Structure**

```
main (production)
  └── Auto-deploys to: jewelry-website-prod.vercel.app
      └── Domain: jewelsbynavkush.com

develop (development)
  └── Auto-deploys to: jewelry-website-dev.vercel.app
      └── Domain: dev2026.jewelsbynavkush.com

feature/* (feature branches)
  └── Auto-deploys to: preview URLs
```

### **6.2 Configure Vercel Branch Deployments**

#### **Development Project:**
1. Go to Vercel dev project → **"Settings"** → **"Git"**
2. **Production Branch:** `develop`
3. **Preview Branches:** `feature/*`, `bugfix/*`

#### **Production Project:**
1. Go to Vercel prod project → **"Settings"** → **"Git"**
2. **Production Branch:** `main`
3. **Preview Branches:** `develop`, `feature/*`, `bugfix/*`

### **6.3 Workflow**

```bash
# Work on a feature
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-feature
# → Creates preview deployment

# Merge to develop
git checkout develop
git merge feature/new-feature
git push origin develop
# → Auto-deploys to dev environment

# Merge to main (after testing)
git checkout main
git merge develop
git push origin main
# → Auto-deploys to production
```

**✅ Step 6 Complete:** Branch strategy is configured.

---

## 💻 **Step 7: Local Development Setup**

### **7.1 Install Dependencies**

```bash
cd /Users/rajatsharma/Desktop/STUDY/DI/jewelry-website
npm install
```

### **7.2 Install Zoho Catalyst SDK**

```bash
npm install @zohocatalyst/nodejs-sdk
```

### **7.3 Create Environment File**

```bash
# Copy example file
cp .env.example .env.development.local

# Edit with your dev credentials
# Use your favorite editor to add the values
```

### **7.4 Test Local Development**

```bash
# Run development server
npm run dev

# Should start on http://localhost:3000
# Uses .env.development.local automatically
```

### **7.5 Test Production Build Locally**

```bash
# Build for production
npm run build

# Start production server
npm start

# Should use production environment variables
```

**✅ Step 7 Complete:** Local development is set up.

---

## ✅ **Step 8: Testing & Verification**

### **8.1 Verify Development Environment**

1. **Check Vercel Deployment:**
   - Go to Vercel dev project
   - Verify latest deployment is successful
   - Visit: `https://jewelry-website-dev.vercel.app` (or your dev domain)

2. **Check Environment Variables:**
   - Go to Vercel dev project → **"Settings"** → **"Environment Variables"**
   - Verify all variables are set
   - Check they're enabled for correct environments

3. **Check Zoho Catalyst:**
   - Go to Zoho Catalyst dev project
   - Verify tables are created
   - Test API connection

### **8.2 Verify Production Environment**

1. **Check Vercel Deployment:**
   - Go to Vercel prod project
   - Verify latest deployment is successful
   - Visit: `https://jewelsbynavkush.com`

2. **Check Environment Variables:**
   - Go to Vercel prod project → **"Settings"** → **"Environment Variables"**
   - Verify all variables are set
   - **Important:** Use production credentials only!

3. **Check Zoho Catalyst:**
   - Go to Zoho Catalyst prod project
   - Verify tables are created
   - Test API connection

### **8.3 Test Deployment Flow**

```bash
# 1. Make a change in develop branch
git checkout develop
# ... make a small change (e.g., update README) ...
git commit -m "Test dev deployment"
git push origin develop
# → Should auto-deploy to dev environment

# 2. Verify dev deployment works
# Visit dev URL and check the change appears

# 3. Merge to main (after testing)
git checkout main
git merge develop
git push origin main
# → Should auto-deploy to production

# 4. Verify production deployment
# Visit production URL and check the change appears
```

**✅ Step 8 Complete:** Both environments are verified and working.

---

## 📋 **Quick Checklist**

### **Development Environment**
- [ ] GitHub repository created
- [ ] `develop` branch created
- [ ] Zoho Catalyst dev project created
- [ ] Zoho Catalyst dev database tables created
- [ ] Zoho Catalyst dev API credentials generated
- [ ] Vercel dev project created
- [ ] Vercel dev environment variables configured
- [ ] Dev domain configured (or using Vercel preview)
- [ ] Dev deployment successful

### **Production Environment**
- [ ] `main` branch exists
- [ ] Zoho Catalyst prod project created
- [ ] Zoho Catalyst prod database tables created
- [ ] Zoho Catalyst prod API credentials generated
- [ ] Vercel prod project created
- [ ] Vercel prod environment variables configured
- [ ] Production domain configured
- [ ] Production deployment successful

### **Local Development**
- [ ] `.env.development.local` created
- [ ] `.env.production.local` created
- [ ] `.env.example` created
- [ ] Zoho Catalyst SDK installed
- [ ] Local dev server runs successfully

---

## 🎯 **Next Steps**

After completing this setup:

1. **Start Database Migration:**
   - Migrate existing JSON data to Zoho Catalyst
   - See: [Zoho Catalyst Setup Guide](./ZOHO_CATALYST_NOSQL_SETUP.md)

2. **Implement API Integration:**
   - Create API routes for Zoho Catalyst
   - Update existing code to use database

3. **Begin Feature Development:**
   - Start with Phase 1 from [Project Roadmap](./PROJECT_ROADMAP.md)
   - Develop in `develop` branch
   - Test in dev environment
   - Deploy to production after testing

---

## 🆘 **Troubleshooting**

### **Issue: Vercel deployment fails**
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Check for TypeScript/linting errors

### **Issue: Zoho Catalyst connection fails**
- Verify API credentials are correct
- Check project ID matches
- Ensure tables are created

### **Issue: Domain not working**
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records are correct
- Check domain is added in Vercel

### **Issue: Environment variables not working**
- Verify `.env*.local` files exist
- Check variable names match exactly
- Restart dev server after changes

---

## 📚 **Related Documentation**

- [Project Roadmap](./PROJECT_ROADMAP.md) - Complete development plan
- [Zoho Catalyst Setup](./ZOHO_CATALYST_NOSQL_SETUP.md) - Database setup details
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Deployment guide
- [GitHub Complete Guide](./GITHUB_COMPLETE_GUIDE.md) - Version control

---

**✅ Environment setup complete! You now have separate dev and prod environments using 100% free services.**
