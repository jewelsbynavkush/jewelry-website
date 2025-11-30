# Jewelry Business Website

A professional, SEO-optimized website for a jewelry business built with Next.js, Sanity.io CMS, and Firebase Firestore.

## 🚀 Features

- ✅ Modern, responsive design
- ✅ SEO optimized (meta tags, sitemap, robots.txt)
- ✅ Content management via Sanity.io CMS
- ✅ Contact forms via Firebase Firestore
- ✅ Serverless architecture
- ✅ Fast performance with Next.js
- ✅ TypeScript for type safety

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **CMS:** Sanity.io (headless CMS)
- **Database:** Firebase Firestore (NoSQL)
- **Hosting:** Vercel (serverless)
- **Form Handling:** React Hook Form + Zod validation

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Firebase account
- Sanity.io account

## 🏗️ Setup Instructions

### 1. Clone and Install

```bash
cd jewelry-website
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings → General
5. Add a web app and copy the configuration

### 3. Set Up Sanity.io

1. Go to [Sanity.io](https://www.sanity.io/)
2. Create an account and new project
3. Get your Project ID from project settings
4. Create an API token with read permissions

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your actual values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Sanity.io Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_api_token

# Optional: Base URL for sitemap
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 5. Set Up Sanity.io Schema

You need to create a content type in Sanity.io for jewelry designs:

1. Go to your Sanity.io project
2. Navigate to Schema
3. Create a new document type called `jewelryDesign` with:
   - `title` (string)
   - `description` (text)
   - `image` (image)
   - `price` (number, optional)
   - `category` (string, optional)
   - `slug` (slug)

Or use Sanity Studio to manage your content.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
jewelry-website/
├── app/                    # Next.js App Router
│   ├── (pages)/           # Route groups
│   │   ├── page.tsx       # Home page
│   │   ├── about/         # About page
│   │   ├── designs/       # Designs page
│   │   └── contact/       # Contact page
│   ├── api/               # API routes
│   │   └── contact/       # Contact form API
│   ├── layout.tsx         # Root layout
│   ├── sitemap.ts         # SEO sitemap
│   └── robots.ts          # SEO robots.txt
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/            # Layout components
│   └── sections/         # Page sections
├── lib/                  # Utilities
│   ├── firebase/         # Firebase configuration
│   ├── cms/              # Sanity.io configuration
│   ├── utils/            # Helper functions
│   └── validations/      # Zod schemas
├── types/                # TypeScript types
└── public/               # Static assets
```

## 🎨 Customization

### Update Branding

1. **Logo/Name:** Update in `components/layout/Header.tsx`
2. **Colors:** Modify Tailwind classes (currently using amber-600 as primary)
3. **Content:** Update pages in `app/` directory

### Add More Pages

1. Create new folder in `app/` directory
2. Add `page.tsx` file
3. Update navigation in `components/layout/Navigation.tsx`

## 📝 Content Management

### Adding Jewelry Designs

1. Log in to Sanity.io Studio
2. Create new `jewelryDesign` document
3. Fill in title, description, image, price, etc.
4. Publish
5. Designs will appear on the website automatically

### Updating Contact Information

Update in:
- `components/layout/Footer.tsx`
- `app/contact/page.tsx`

Or manage via CMS (requires additional setup).

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables
5. Deploy!

### Environment Variables on Vercel

Add all variables from `.env.local` to Vercel project settings.

## 🔒 Security

- Environment variables are stored securely
- Firebase security rules should be configured
- API routes validate input with Zod
- HTTPS enforced on Vercel

## 📊 SEO Features

- ✅ Meta tags on all pages
- ✅ Open Graph tags
- ✅ Automatic sitemap generation
- ✅ Robots.txt configuration
- ✅ Semantic HTML
- ✅ Server-side rendering

## 🐛 Troubleshooting

### Firebase not working
- Check environment variables
- Ensure Firestore is enabled
- Verify API keys are correct

### Sanity.io not loading
- Check project ID and dataset
- Verify API token permissions
- Check network tab for errors

### Build errors
- Run `npm run build` to see errors
- Check TypeScript types
- Verify all imports

## 📚 Documentation

**📖 [Complete Documentation Index](docs/README.md)** - Browse all documentation

### Quick Links:
- **[Quick Start Guide](docs/SETUP_QUICK_START.md)** - Get started in 5 minutes
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Complete development documentation
- **[Firebase Setup](docs/FIREBASE_SETUP.md)** - Detailed Firebase configuration
- **[Sanity.io Setup](docs/SANITY_SETUP.md)** - Complete Sanity.io CMS setup
- **[Sanity Schema Setup](docs/SANITY_SCHEMA_SETUP.md)** - ⭐ Create schema and add designs
- **[Sanity Studio Guide](docs/SANITY_STUDIO_GUIDE.md)** - Using Sanity Studio
- **[Design Implementation](docs/DESIGN_IMPLEMENTATION_SUMMARY.md)** - Design features and components
- **[Vercel Deployment](docs/VERCEL_DEPLOYMENT.md)** - Deployment guide

See [docs/README.md](docs/README.md) for complete documentation index.

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using Next.js, Sanity.io, and Firebase**
