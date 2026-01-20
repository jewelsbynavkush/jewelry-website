# Account Setup Guide - Business Accounts & Domain Transfer

**Date:** January 2025  
**Purpose:** Complete guide for setting up business accounts, Gmail, GitHub, domain transfer, and SSH setup

---

## 🎯 **Why Separate Business Accounts?**

**Benefits:**
- ✅ **Security** - Separate business from personal
- ✅ **Professional** - Business should have business accounts
- ✅ **Sale Value** - Clean separation increases value
- ✅ **Easy Transfer** - Simple to transfer if you sell
- ✅ **No Risk of Loss** - Won't lose access if domain issues occur

**Recommended:** Use `jewelsbynavkush@gmail.com` for all business accounts!

---

## 📧 **Gmail Account Setup**

### **Step 1: Create Gmail Account**

1. Visit [gmail.com](https://gmail.com)
2. Click **"Create account"**
3. **Username Options:**
   - `jewelsbynavkush@gmail.com` ⭐ **BEST**
   - `jewelsbynavkush.business@gmail.com`
   - `jewelsbynavkushjewelry@gmail.com`
4. **Password:** Strong password (12+ characters, save securely)
5. **Recovery Email:** Your personal email
6. **Recovery Phone:** Your phone number
7. Complete verification

### **Step 2: Secure the Account**

1. **Enable 2-Factor Authentication:**
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Use authenticator app (recommended)

2. **Add Recovery Options:**
   - Recovery email
   - Recovery phone
   - Security questions

### **Step 3: Use for All Business Accounts**

- ✅ MongoDB Atlas
- ✅ Vercel
- ✅ GitHub
- ✅ Razorpay
- ✅ All business services

---

## 🐙 **GitHub Account Setup**

### **Option 1: Transfer Repository (Recommended)**

#### **From Old Account (Personal):**

1. Log in to GitHub with **old account** (personal)
2. Go to repository: `jewelry-website`
3. Click **"Settings"** → **"Danger Zone"**
4. Click **"Transfer ownership"**
5. Enter new account username: `jewelsbynavkush`
6. Type repository name: `jewelry-website`
7. Click **"I understand, transfer this repository"**
8. Confirm transfer

#### **From New Account:**

1. Log in to GitHub with **new account** (`jewelsbynavkush@gmail.com`)
2. Accept transfer invitation
3. Repository is now in new account ✅

### **Option 2: Create New Repository**

1. Log in to GitHub with **new account**
2. Click **"+"** → **"New repository"**
3. **Repository name:** `jewelry-website`
4. **Visibility:** Private (or Public)
5. **Don't** initialize with README
6. Click **"Create repository"**

### **Update Local Git Remote**

```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin git@github.com:jewelsbynavkush/jewelry-website.git

# Verify
git remote -v

# Push to new remote
git push -u origin main
```

---

## 🔐 **SSH Setup for Multiple GitHub Accounts**

### **Step 1: Generate SSH Key for Business Account**

```bash
# Generate SSH key for business account
ssh-keygen -t ed25519 -C "jewelsbynavkush@gmail.com" -f ~/.ssh/id_ed25519_jewelsbynavkush

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to SSH agent
ssh-add ~/.ssh/id_ed25519_jewelsbynavkush
```

### **Step 2: Add SSH Key to GitHub**

1. Copy public key:
   ```bash
   cat ~/.ssh/id_ed25519_jewelsbynavkush.pub
   ```

2. Go to GitHub → Settings → SSH and GPG keys
3. Click **"New SSH key"**
4. **Title:** `jewelsbynavkush-business`
5. **Key:** Paste public key
6. Click **"Add SSH key"**

### **Step 3: Configure SSH Config**

Create/edit `~/.ssh/config`:

```
# Personal GitHub account
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal

# Business GitHub account
Host github.com-business
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_jewelsbynavkush
```

### **Step 4: Update Git Remote**

```bash
# Update remote to use business SSH
git remote set-url origin git@github.com-business:jewelsbynavkush/jewelry-website.git

# Test connection
ssh -T git@github.com-business
```

---

## 🌐 **Domain Transfer to New Namecheap Account**

### **Step 1: Create New Namecheap Account**

1. Visit [namecheap.com](https://namecheap.com)
2. Click **"Sign Up"**
3. **Account Details:**
   - **Username:** `jewelsbynavkush`
   - **Email:** `jewelsbynavkush@gmail.com` ⭐ **Use business Gmail**
   - **Password:** Strong password
   - **Name:** Business name
4. Verify email
5. Complete profile

### **Step 2: Initiate Domain Transfer**

#### **From Old Account (Personal):**

1. Log in to Namecheap with **old account** (personal)
2. Go to **"Domain List"**
3. Find `jewelsbynavkush.com`
4. Click **"Manage"**
5. Scroll to **"Transfer to Another Namecheap Account"**
6. Enter new account username: `jewelsbynavkush`
7. Enter new account email: `jewelsbynavkush@gmail.com`
8. Click **"Transfer"**
9. Confirm transfer

#### **From New Account:**

1. Log in to Namecheap with **new account**
2. Check email for transfer invitation
3. Accept transfer
4. Domain is now in new account ✅

### **Step 3: Verify Domain Transfer**

1. Go to **"Domain List"** in new account
2. Verify `jewelsbynavkush.com` is listed
3. Check domain settings
4. Update DNS if needed

---

## ✅ **Verification Checklist**

- [ ] Gmail account created: `jewelsbynavkush@gmail.com`
- [ ] 2-factor authentication enabled
- [ ] GitHub account created/transferred
- [ ] Repository transferred to new account
- [ ] SSH key generated and added to GitHub
- [ ] SSH config updated for multiple accounts
- [ ] Git remote updated
- [ ] Namecheap account created
- [ ] Domain transferred to new account
- [ ] All business accounts using business Gmail

---

## 🎯 **Next Steps**

1. **Update All Service Accounts:**
   - MongoDB Atlas → Use business Gmail
   - Vercel → Use business Gmail
   - Razorpay → Use business Gmail
   - All business services → Use business Gmail

2. **Secure All Accounts:**
   - Enable 2FA on all accounts
   - Use strong, unique passwords
   - Save passwords in password manager

3. **Document Access:**
   - Keep list of all business accounts
   - Document usernames and recovery methods
   - Store securely (password manager)

---

## 🎉 **Setup Complete!**

**You now have:**
- ✅ Separate business Gmail account
- ✅ GitHub account with repository
- ✅ SSH setup for multiple accounts
- ✅ Domain in business Namecheap account
- ✅ Clean separation from personal accounts

**Benefits:**
- ✅ Easy to transfer if you sell
- ✅ Professional setup
- ✅ No risk of losing access
- ✅ Clean separation

---

**Last Updated:** January 2025
