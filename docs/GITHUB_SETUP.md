# GitHub Setup Guide

Guide to set up GitHub repository for your jewelry website.

## 📋 Table of Contents

1. [Create GitHub Account](#1-create-github-account)
2. [Create Repository](#2-create-repository)
3. [Initialize Git](#3-initialize-git)
4. [Push Code to GitHub](#4-push-code-to-github)
5. [Configure Repository Settings](#5-configure-repository-settings)
6. [Branch Protection (Optional)](#6-branch-protection-optional)

---

## 1. Create GitHub Account

### Step 1.1: Sign Up
1. Go to [GitHub](https://github.com)
2. Click **"Sign up"**
3. Enter your email, password, and username
4. Verify your email

### Step 1.2: Complete Profile (Optional)
- Add profile picture
- Add bio
- Configure preferences

---

## 2. Create Repository

### Step 2.1: New Repository
1. Click **"+"** icon in top right
2. Select **"New repository"**
3. Or go to [github.com/new](https://github.com/new)

### Step 2.2: Repository Settings
1. **Repository name:** `jewelry-website` (or your preferred name)
2. **Description:** "Professional jewelry business website built with Next.js"
3. **Visibility:**
   - **Public** - Anyone can see (free)
   - **Private** - Only you can see (free for personal use)
4. **Initialize repository:**
   - ❌ **Don't** check "Add a README file" (you already have one)
   - ❌ **Don't** check "Add .gitignore" (you already have one)
   - ❌ **Don't** check "Choose a license" (unless you want one)
5. Click **"Create repository"**

---

## 3. Initialize Git

### Step 3.1: Check if Git is Installed
```bash
git --version
```

If not installed, install Git:
- **Mac:** `brew install git` or download from [git-scm.com](https://git-scm.com)
- **Windows:** Download from [git-scm.com](https://git-scm.com)
- **Linux:** `sudo apt install git`

### Step 3.2: Configure Git (First Time Only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3.3: Initialize Repository
```bash
cd jewelry-website

# Check if already a git repository
git status

# If not, initialize
git init
```

---

## 4. Push Code to GitHub

### Step 4.1: Add Remote
```bash
# Add GitHub repository as remote
# Replace 'yourusername' with your GitHub username
git remote add origin https://github.com/yourusername/jewelry-website.git

# Verify remote
git remote -v
```

### Step 4.2: Stage Files
```bash
# Add all files
git add .

# Check what will be committed
git status
```

### Step 4.3: Commit
```bash
git commit -m "Initial commit: Jewelry website setup"
```

### Step 4.4: Push to GitHub
```bash
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

You may be prompted for credentials:
- **Username:** Your GitHub username
- **Password:** Use a Personal Access Token (not your password)

### Step 4.5: Create Personal Access Token
If prompted for password:

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** "Website Development"
4. **Expiration:** Choose duration (90 days recommended)
5. **Scopes:** Check `repo` (full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token** (you'll only see it once!)
8. Use this token as your password when pushing

---

## 5. Configure Repository Settings

### Step 5.1: Repository Settings
1. Go to your repository on GitHub
2. Click **"Settings"** tab

### Step 5.2: General Settings
- **Repository name:** Can be changed
- **Description:** Update if needed
- **Visibility:** Public/Private
- **Topics:** Add tags like `nextjs`, `jewelry`, `website`

### Step 5.3: Branch Settings
1. Go to **"Branches"** in Settings
2. Default branch is `main`
3. Can rename if needed

### Step 5.4: Collaborators (Optional)
1. Go to **"Collaborators"** in Settings
2. Click **"Add people"**
3. Invite team members by username or email

---

## 6. Branch Protection (Optional)

### Step 6.1: Enable Protection
1. Go to **"Branches"** in Settings
2. Click **"Add rule"** next to branch protection rules
3. **Branch name pattern:** `main`
4. Enable options:
   - ✅ **Require pull request reviews**
   - ✅ **Require status checks**
   - ✅ **Require conversation resolution**

### Step 6.2: Save Rules
Click **"Create"** to save branch protection rules.

---

## 🔄 Common Git Commands

### Daily Workflow
```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# Pull latest changes
git pull
```

### Create New Branch
```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Push new branch
git push -u origin feature/new-feature
```

### Update from GitHub
```bash
# Pull latest changes
git pull origin main
```

---

## 📁 .gitignore

Your `.gitignore` should already include:
```
# Environment variables
.env.local
.env*.local

# Dependencies
node_modules/

# Build files
.next/
out/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

**Important:** Never commit `.env.local` to GitHub!

---

## 🐛 Troubleshooting

### Issue: "Repository not found"
**Solution:**
- Check repository URL is correct
- Verify you have access to the repository
- Check if repository is private and you're authenticated

### Issue: "Authentication failed"
**Solution:**
- Use Personal Access Token instead of password
- Check token has `repo` scope
- Verify token hasn't expired

### Issue: "Permission denied"
**Solution:**
- Check you have write access to repository
- Verify you're the owner or collaborator
- Check branch protection rules

### Issue: "Large file" error
**Solution:**
- GitHub has 100MB file size limit
- Use Git LFS for large files
- Or remove large files from repository

---

## ✅ Verification Checklist

- [ ] GitHub account created
- [ ] Repository created
- [ ] Git initialized locally
- [ ] Remote added
- [ ] Code committed
- [ ] Code pushed to GitHub
- [ ] Files visible on GitHub
- [ ] `.env.local` NOT in repository

---

## 📚 Additional Resources

- [GitHub Documentation](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

## 🎯 Next Steps

After GitHub is set up:
1. ✅ Code is backed up on GitHub
2. ✅ Ready to deploy to Vercel (see [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md))
3. ✅ Can collaborate with team
4. ✅ Version control in place

---

## 💡 Pro Tips

- **Commit often** with descriptive messages
- **Use branches** for new features
- **Pull before pushing** to avoid conflicts
- **Never commit secrets** (use `.env.local`)
- **Use meaningful commit messages**

---

**GitHub setup complete!** Your code is now version controlled and backed up. 🎉

