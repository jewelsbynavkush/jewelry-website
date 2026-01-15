# Vercel Branch Setup - Quick Guide

**📍 The Production Branch setting is in Settings → Environments (NOT Git!)**

---

## 🎯 **Quick Steps**

### **For Development Project:**

1. Go to your Vercel project
2. Click **"Settings"** (gear icon)
3. Click **"Environments"** in left sidebar
4. Scroll to **"Production"** section
5. Find **"Branch Tracking"** or **"Production Branch"** field
6. Enter: `develop`
7. Save (may auto-save)

### **For Production Project:**

1. Go to your Vercel project
2. Click **"Settings"** (gear icon)
3. Click **"Environments"** in left sidebar
4. Scroll to **"Production"** section
5. Find **"Branch Tracking"** or **"Production Branch"** field
6. Enter: `main` (or keep default)
7. Save (may auto-save)

---

## 📍 **Where to Find It**

```
Vercel Dashboard
  └── Your Project
      └── Settings (gear icon)
          └── Environments ← HERE!
              └── Production section
                  └── Branch Tracking / Production Branch
```

**NOT in:**
- ❌ Settings → Git
- ❌ Settings → Build and Deployment
- ❌ Settings → General

**YES in:**
- ✅ Settings → **Environments**

---

## ✅ **After Setting Branch**

- Vercel will automatically redeploy from the new branch
- Check **"Deployments"** tab to see the new deployment
- Future pushes to that branch will trigger production deployments

---

**See [VERCEL_BRANCH_SETUP.md](./VERCEL_BRANCH_SETUP.md) for detailed guide.**
