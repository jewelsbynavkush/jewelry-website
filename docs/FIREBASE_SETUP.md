# Firebase Setup Guide

Complete step-by-step guide to set up Firebase Firestore for the jewelry website.

## 📋 Table of Contents

1. [Create Firebase Project](#1-create-firebase-project)
2. [Enable Firestore Database](#2-enable-firestore-database)
3. [Get Configuration Values](#3-get-configuration-values)
4. [Set Up Security Rules](#4-set-up-security-rules)
5. [Configure Environment Variables](#5-configure-environment-variables)
6. [Test Firebase Connection](#6-test-firebase-connection)
7. [Troubleshooting](#troubleshooting)

---

## 1. Create Firebase Project

### Step 1.1: Sign Up/Login
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account (or create one)
3. Click **"Get Started"** or **"Add Project"**

### Step 1.2: Create New Project
1. Click **"Create a project"** or **"Add project"**
2. Enter project name: `jewelry-website` (or your preferred name)
3. Click **"Continue"**

### Step 1.3: Configure Google Analytics (Optional)
1. Choose whether to enable Google Analytics
   - **Recommended:** Enable for better insights
   - Or disable if you don't need it
2. If enabled, select or create an Analytics account
3. Click **"Create project"**

### Step 1.4: Wait for Project Creation
- Firebase will create your project (takes 30-60 seconds)
- Click **"Continue"** when ready

---

## 2. Enable Firestore Database

### Step 2.1: Navigate to Firestore
1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. If you see "Get started", click it
3. If you see "Create database", click it

### Step 2.2: Choose Database Mode
1. Select **"Start in production mode"** (we'll set up security rules later)
   - Or **"Start in test mode"** for development (less secure)
2. Click **"Next"**

### Step 2.3: Choose Location
1. Select a **Cloud Firestore location** closest to your users
   - **Recommended:** `us-central` or `us-east1` (if in US)
   - Or choose based on your target audience
2. Click **"Enable"**
3. Wait for database creation (takes 1-2 minutes)

---

## 3. Get Configuration Values

### Step 3.1: Add Web App
1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app

### Step 3.2: Register App
1. Enter app nickname: `Jewelry Website` (or any name)
2. **Optional:** Check "Also set up Firebase Hosting" (we're using Vercel, so skip)
3. Click **"Register app"**

### Step 3.3: Copy Configuration
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Copy these values** - you'll need them for `.env.local`

### Step 3.4: Note the Values
Write down or copy:
- `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## 4. Set Up Security Rules

### Step 4.1: Navigate to Firestore Rules
1. In Firebase Console, go to **"Firestore Database"**
2. Click on **"Rules"** tab

### Step 4.2: Configure Rules for Contact Forms
For development/testing, you can use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to contacts collection
    match /contacts/{document=**} {
      allow read, write: if true; // For development only
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**⚠️ Important:** This is for development. For production, use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow write access to contacts collection (for form submissions)
    match /contacts/{contactId} {
      allow read: if false; // Only admins should read
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'message', 'createdAt']);
      allow update, delete: if false; // No updates or deletes
    }
  }
}
```

### Step 4.3: Publish Rules
1. Click **"Publish"** to save the rules
2. Rules will be active immediately

---

## 5. Configure Environment Variables

### Step 5.1: Create `.env.local` File
1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in your editor and update the Firebase values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Step 5.2: Replace Values
Replace all placeholder values with your actual Firebase configuration values from Step 3.

### Step 5.3: Verify File Location
Make sure `.env.local` is in:
```
jewelry-website/
  └── .env.local  ← Here
```

---

## 6. Test Firebase Connection

### Step 6.1: Start Development Server
```bash
cd jewelry-website
npm run dev
```

### Step 6.2: Test Contact Form
1. Go to `http://localhost:3000/contact`
2. Fill out the contact form
3. Submit the form

### Step 6.3: Verify in Firebase Console
1. Go to Firebase Console → **Firestore Database**
2. Click **"Data"** tab
3. You should see a `contacts` collection
4. Click on it to see your form submission

### Step 6.4: Check Browser Console
- Open browser DevTools (F12)
- Check Console for any Firebase errors
- Should see no errors if setup is correct

---

## 📊 Firebase Console Overview

### Key Sections:
- **Firestore Database** - Your database (where contact forms are stored)
- **Authentication** - User authentication (not used in this project)
- **Storage** - File storage (not used in this project)
- **Project Settings** - Configuration values

### Collections Structure:
```
contacts/
  └── {documentId}/
      ├── name: "John Doe"
      ├── email: "john@example.com"
      ├── phone: "123-456-7890" (optional)
      ├── message: "Hello..."
      └── createdAt: Timestamp
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use different projects for development/production
- ✅ Rotate API keys if compromised

### 2. Firestore Rules
- ✅ Start with restrictive rules
- ✅ Only allow necessary operations
- ✅ Validate data structure in rules

### 3. API Keys
- ✅ `NEXT_PUBLIC_*` variables are exposed to browser (safe for Firebase)
- ✅ Never put secrets in `NEXT_PUBLIC_*` variables
- ✅ Firebase API keys are safe to expose (they're public by design)

---

## 🐛 Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution:**
- Check that all environment variables are set
- Verify variable names start with `NEXT_PUBLIC_`
- Restart dev server after adding env variables

### Issue: "Firestore: Missing or insufficient permissions"
**Solution:**
- Check Firestore security rules
- Ensure rules allow `create` operation for `contacts` collection
- Verify you're using the correct project

### Issue: "Firebase App named '[DEFAULT]' already exists"
**Solution:**
- This is normal - Firebase initializes once
- No action needed

### Issue: Contact form not saving
**Solution:**
1. Check browser console for errors
2. Verify Firestore is enabled
3. Check security rules allow `create`
4. Verify environment variables are correct
5. Check network tab for API calls

### Issue: Can't see data in Firebase Console
**Solution:**
- Make sure you're looking at the correct project
- Check the `contacts` collection (not a different collection)
- Refresh the page
- Check if data was actually saved (check browser console)

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Web app registered
- [ ] Configuration values copied
- [ ] `.env.local` file created with all values
- [ ] Security rules configured
- [ ] Contact form tested and working
- [ ] Data visible in Firebase Console

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)

---

## 🎯 Next Steps

After Firebase is set up:
1. ✅ Test contact form submission
2. ✅ Set up Sanity.io (see [Sanity.io Setup Guide](SANITY_SETUP.md))
3. ✅ Deploy to Vercel (see [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md))

---

**Firebase setup complete!** Your contact forms will now save to Firestore. 🎉

