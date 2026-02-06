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
| **MongoDB Atlas** | ✅ Free | 512MB storage, unlimited operations (M0 free tier) |
| **Zoho Mail** | ✅ Free | 5GB storage, 25MB attachment limit |
| **Domain** | ⚠️ Paid | Your existing domain (jewelsbynavkush.com) |

**Total Cost: $0/month** (except domain, which you already have)

---

## ✅ **Prerequisites**

Before starting, ensure you have:
- ✅ GitHub account (free)
- ✅ Vercel account (free - sign up with GitHub)
- ✅ MongoDB Atlas account (free)
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

## 🗄️ **Step 2: MongoDB Atlas Setup**

### **2.1 Create MongoDB Atlas Account**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up with email or Google account
4. **No credit card required** for free tier
5. Verify your email

### **2.2 Create Development Cluster**

1. After login, click **"Build a Database"**
2. Choose **"M0 Free"** tier (512MB, free forever)
3. **Cloud Provider:** AWS (or your preference)
4. **Region:** Choose closest to your users (e.g., Mumbai for India)
5. **Cluster Name:** `jewelry-website-dev`
6. Click **"Create"**
7. Wait 3-5 minutes for cluster creation

### **2.3 Create Database User (Dev)**

1. In **"Database Access"** section
2. Click **"Add New Database User"**
3. **Authentication Method:** Password
4. **Username:** `jewelry-dev-user` (or your choice)
5. **Password:** Generate secure password (save it!)
6. **Database User Privileges:** Read and write to any database
7. Click **"Add User"**

### **2.4 Whitelist IP Addresses (Dev)**

1. Go to **"Network Access"** section
2. Click **"Add IP Address"**
3. For Vercel: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Note:** For production, use specific IPs for better security
4. Click **"Confirm"**

### **2.5 Get Connection String (Dev)**

1. Go to **"Clusters"** section
2. Click **"Connect"** on your dev cluster
3. Choose **"Connect your application"**
4. **Driver:** Node.js
5. **Version:** 5.5 or later
6. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@jewelry-website-dev.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<username>` with your database username
8. Replace `<password>` with your database password
9. Add database name: `?retryWrites=true&w=majority` → `jewelry-website-dev?retryWrites=true&w=majority`
10. **Save this connection string securely**

### **2.6 Create Production Cluster**

1. Click **"Build a Database"** again
2. Choose **"M0 Free"** tier (or upgrade to M10 for $9/month if needed)
3. **Cluster Name:** `jewelry-website-prod`
4. Click **"Create"**
5. Repeat steps 2.3, 2.4, and 2.5 for production:
   - Create database user
   - Whitelist IP addresses
   - Get connection string

**✅ Step 2 Complete:** You now have two MongoDB Atlas clusters (dev & prod) ready to use.

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

# MongoDB Atlas (Dev)
MONGODB_URI=mongodb+srv://username:password@dev-cluster.mongodb.net/jewelry-website-dev?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Zoho Mail (Dev - optional for now)
ZOHO_MAIL_API_KEY=your_dev_mail_key

# Add to all environments: Production, Preview, Development
```

7. Click **"Deploy"** (branch will be configured after deployment)
   
   **Note:** If you don't see a branch selector, that's normal. You'll configure it after the project is created (see Step 3.2.1 below).

#### **3.2.1 Configure Branch After Deployment:**

After the project is created and first deployment completes:

1. Go to your project dashboard
2. Click **"Settings"** → **"Environments"** (NOT "Git" - it's in Environments!)
3. Scroll to **"Production"** section
4. Find **"Branch Tracking"** or **"Production Branch"** field
5. Enter: `develop`
6. Save (may auto-save)
7. Vercel will automatically redeploy from `develop` branch

**Important:** The branch setting is in **Settings → Environments**, not Settings → Git!

**Alternative:** See [Vercel Branch Setup Guide](./VERCEL_BRANCH_SETUP.md) for detailed instructions.

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

# MongoDB Atlas (Prod)
MONGODB_URI=mongodb+srv://username:password@prod-cluster.mongodb.net/jewelry-website-prod?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://jewelsbynavkush.com,https://www.jewelsbynavkush.com

# Zoho Mail (Prod)
ZOHO_MAIL_API_KEY=your_prod_mail_key

# Add to all environments: Production, Preview, Development
```

7. Click **"Deploy"** (branch will be configured after deployment)
   
   **Note:** If you don't see a branch selector, that's normal. You'll configure it after the project is created (see Step 3.3.1 below).

#### **3.3.1 Configure Branch After Deployment:**

After the project is created and first deployment completes:

1. Go to your project dashboard
2. Click **"Settings"** → **"Environments"** (NOT "Git" - it's in Environments!)
3. Scroll to **"Production"** section
4. Find **"Branch Tracking"** or **"Production Branch"** field
5. Verify it shows `main` (should be default)
6. If not, enter: `main` and save

**Important:** The branch setting is in **Settings → Environments**, not Settings → Git!

**Alternative:** See [Vercel Branch Setup Guide](./VERCEL_BRANCH_SETUP.md) for detailed instructions.

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

### **5.1 JWT Authentication Setup**

JWT authentication requires the following environment variables:

```bash
# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m
```

**Generating a Secure JWT_SECRET:**

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 64
```

**Option 3: Online Generator**
Use a secure random string generator (at least 32 characters, preferably 64+).

**Important Notes:**
- `JWT_EXPIRES_IN=5m` means tokens expire after 5 minutes
- Use a **different** `JWT_SECRET` for production than development
- Never commit `JWT_SECRET` to version control

### **5.2 Local Development Setup**

Create environment files in your project:

#### **`.env.development.local`**

```bash
# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB Atlas (Dev)
MONGODB_URI=mongodb+srv://username:password@dev-cluster.mongodb.net/jewelry-website-dev?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-secure-random-secret-key-change-in-production
JWT_EXPIRES_IN=5m

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Zoho Mail (Dev)
ZOHO_MAIL_API_KEY=your_dev_mail_key

# Fast2SMS Quick SMS Service (Dev) - No DLT Required
FAST2SMS_API_KEY=your_fast2sms_api_key

# Gmail Email Service (Dev)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush

# Fast2SMS Quick SMS Service (Dev) - No DLT Required
FAST2SMS_API_KEY=your_fast2sms_api_key
```

#### **`.env.production.local`**

```bash
# Environment
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_BASE_URL=https://jewelsbynavkush.com

# MongoDB Atlas (Prod)
MONGODB_URI=mongodb+srv://username:password@prod-cluster.mongodb.net/jewelry-website-prod?retryWrites=true&w=majority

# Zoho Mail (Prod)
ZOHO_MAIL_API_KEY=your_prod_mail_key

# Fast2SMS Quick SMS Service (Prod) - No DLT Required
FAST2SMS_API_KEY=your_fast2sms_api_key

# Gmail Email Service (Prod)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_FROM_NAME=Jewels by NavKush

# Fast2SMS Quick SMS Service (Prod) - No DLT Required
FAST2SMS_API_KEY=your_fast2sms_api_key
```

#### **`.env.example`** (Template - commit this)

```bash
# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB Atlas
MONGODB_URI=

# JWT Authentication
JWT_SECRET=
JWT_EXPIRES_IN=5m

# CORS Configuration
CORS_ALLOWED_ORIGINS=

# Zoho Mail
ZOHO_MAIL_API_KEY=

# Fast2SMS Quick SMS Service (No DLT Required)
FAST2SMS_API_KEY=

# Gmail Email Service
GMAIL_USER=
GMAIL_APP_PASSWORD=
GMAIL_FROM_NAME=Jewels by NavKush

# Fast2SMS Quick SMS Service (No DLT Required)
FAST2SMS_API_KEY=
```

### **5.3 Vercel Environment Variables**

#### **Development Project**

1. Go to Vercel dev project → **Settings** → **Environment Variables**
2. Add:
   - `JWT_SECRET` = `your-secure-random-secret-key-change-in-production`
   - `JWT_EXPIRES_IN` = `5m`
   - `FAST2SMS_API_KEY` = `your_fast2sms_api_key`
   - `GMAIL_USER` = `your-email@gmail.com`
   - `GMAIL_APP_PASSWORD` = `your_16_char_app_password`
   - `GMAIL_FROM_NAME` = `Jewels by NavKush` (optional)
3. Select environments: **Production, Preview, Development**

#### **Production Project**

1. Go to Vercel prod project → **Settings** → **Environment Variables**
2. Add:
   - `JWT_SECRET` = `your-different-secure-random-secret-key-for-production`
   - `JWT_EXPIRES_IN` = `5m`
   - `FAST2SMS_API_KEY` = `your_fast2sms_api_key`
   - `GMAIL_USER` = `your-email@gmail.com`
   - `GMAIL_APP_PASSWORD` = `your_16_char_app_password`
   - `GMAIL_FROM_NAME` = `Jewels by NavKush` (optional)
3. Select environments: **Production, Preview, Development**

**⚠️ Important:** Use **different** `JWT_SECRET` values for dev and prod!

### **5.4 Update .gitignore**

Ensure `.gitignore` includes:

```gitignore
# Environment variables
.env*.local
.env
.env.development.local
.env.production.local
```

### **5.5 Create Environment Helper**

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
/**
 * Get MongoDB connection URI
 */
export function getMongoDbUri(): string {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  return uri;
}
```

### **5.6 Verification**

After adding the variables:

1. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Test authentication:**
   - Try registering a user
   - Try logging in
   - Check that tokens are generated

3. **Check token expiration:**
   - Login and get a token
   - Wait 5 minutes
   - Try using the token - it should be expired

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

### **7.2 Install MongoDB Driver**

```bash
npm install mongoose
# or
npm install mongodb
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

3. **Check MongoDB Atlas:**
   - Go to MongoDB Atlas prod cluster
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
- [ ] MongoDB Atlas dev cluster created
- [ ] MongoDB Atlas dev database user created
- [ ] MongoDB Atlas dev IP whitelisted
- [ ] MongoDB Atlas dev connection string saved
- [ ] Vercel dev project created
- [ ] Vercel dev environment variables configured
- [ ] Dev domain configured (or using Vercel preview)
- [ ] Dev deployment successful

### **Production Environment**
- [ ] `main` branch exists
- [ ] MongoDB Atlas prod cluster created
- [ ] MongoDB Atlas prod database user created
- [ ] MongoDB Atlas prod IP whitelisted
- [ ] MongoDB Atlas prod connection string saved
- [ ] Vercel prod project created
- [ ] Vercel prod environment variables configured
- [ ] Production domain configured
- [ ] Production deployment successful

### **Local Development**
- [ ] `.env.development.local` created
- [ ] `.env.production.local` created
- [ ] `.env.example` created
- [ ] MongoDB driver (mongoose) installed
- [ ] Local dev server runs successfully

---

## 🎯 **Next Steps**

After completing this setup:

1. **Start Database Migration:**
   - Migrate existing JSON data to MongoDB Atlas
   - See: [MongoDB Atlas Setup Guide](./DATABASE_RECOMMENDATION.md) or [MongoDB Atlas Documentation](https://docs.mongodb.com/atlas/)

2. **Implement API Integration:**
   - Create API routes for MongoDB Atlas
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

### **Issue: MongoDB Atlas connection fails**
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

### **About NODE_ENV**

**✅ You DON'T Need to Set NODE_ENV Manually**

`NODE_ENV` is **automatically set** by Next.js and Vercel:
- **Development (`npm run dev`):** Next.js automatically sets `NODE_ENV=development`
- **Production Build (`npm run build`):** Next.js automatically sets `NODE_ENV=production`
- **Vercel Deployment:** Vercel automatically sets `NODE_ENV=production` for all deployments

**No need to add it to `.env.local` or Vercel environment variables!**

---

## 📚 **Related Documentation**

- [Vercel Branch Setup Guide](./VERCEL_BRANCH_SETUP.md) - **How to select/change branches in Vercel**
- [Project Roadmap](./PROJECT_ROADMAP.md) - Complete development plan
- [MongoDB Atlas Setup](./DATABASE_RECOMMENDATION.md) - Database setup details
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Deployment guide
- [GitHub Complete Guide](./GITHUB_COMPLETE_GUIDE.md) - Version control

---

**✅ Environment setup complete! You now have separate dev and prod environments using 100% free services.**
