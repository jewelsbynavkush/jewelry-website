# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project → Enable Firestore
3. Get config from Project Settings → General → Your apps

### Step 3: Set Up Sanity.io
1. Go to [Sanity.io](https://www.sanity.io/)
2. Create project
3. Get Project ID from settings

### Step 4: Create `.env.local`
1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and fill in your actual values:
   - Firebase config values (see [Firebase Setup Guide](FIREBASE_SETUP.md))
   - Sanity.io project ID (see [Sanity.io Setup Guide](SANITY_SETUP.md))

### Step 5: Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## ✅ What's Included

- ✅ Home page with hero section
- ✅ Designs/Products page (connects to Sanity.io)
- ✅ Contact page with form (saves to Firebase)
- ✅ About page
- ✅ SEO optimized (sitemap, robots.txt, meta tags)
- ✅ Responsive design
- ✅ Modern UI components

## 📝 Next Steps

1. **Add content in Sanity.io:**
   - Create `jewelryDesign` content type
   - Add your jewelry designs

2. **Test contact form:**
   - Fill out contact form
   - Check Firebase Firestore for submissions

3. **Customize:**
   - Update branding in Header/Footer
   - Modify colors in Tailwind classes
   - Add your content

4. **Deploy:**
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy!

## 🎯 Key Files

- `app/` - Pages and routes
- `components/` - React components
- `lib/firebase/` - Firebase config
- `lib/cms/` - Sanity.io config
- `.env.local` - Your environment variables (create this!)

## 📚 Full Documentation

All documentation is available in the `docs/` folder:

- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Complete development documentation
- **[Firebase Setup](FIREBASE_SETUP.md)** - Detailed Firebase configuration
- **[Sanity.io Setup](SANITY_SETUP.md)** - Complete Sanity.io CMS setup
- **[Vercel Deployment](VERCEL_DEPLOYMENT.md)** - Deployment guide

