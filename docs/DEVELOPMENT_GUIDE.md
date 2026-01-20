# Jewelry Website - Complete Development Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Setup](#project-setup)
4. [Development Steps](#development-steps)
5. [Configuration](#configuration)
6. [Building Components](#building-components)
7. [CMS Integration](#cms-integration)
8. [Database Integration](#database-integration)
9. [SEO Implementation](#seo-implementation)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### **Project Name:** Jewelry Business Website
### **Purpose:** Professional website for jewelry business with:
- Product/Design showcase
- Contact information
- SEO optimization
- External content management (CMS)
- Serverless architecture

### **Key Features:**
- ✅ Modern, responsive design
- ✅ SEO optimized
- ✅ Content managed via Sanity.io CMS
- ✅ Contact forms via Firebase Firestore
- ✅ Serverless architecture
- ✅ Fast performance

---

## 🚀 Tech Stack

### **Frontend:**
- **Next.js 14+** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### **Backend/Services:**
- **Sanity.io** - Headless CMS (content management)
- **Firebase Firestore** - NoSQL database (forms, data)
- **Vercel** - Hosting & deployment

### **Libraries:**
- **Firebase SDK** - Database integration
- **Sanity Client** - CMS integration
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **next-seo** - SEO optimization

---

## 📦 Project Setup

### **Step 1: Initialize Next.js Project**

```bash
# Navigate to project directory
cd /Users/rajatsharma/Desktop/STUDY/DI

# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest jewelry-website \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

**What this creates:**
- Next.js project with App Router
- TypeScript configuration
- Tailwind CSS setup
- Basic project structure

### **Step 2: Install Dependencies**

```bash
cd jewelry-website

# Install core dependencies
npm install firebase @sanity/client @sanity/image-url next-seo zod react-hook-form @hookform/resolvers
```

**Dependencies Explained:**
- `firebase` - Firebase SDK for Firestore
- `@sanity/client` - Sanity.io CMS client
- `@sanity/image-url` - Image URL builder for Sanity
- `next-seo` - SEO meta tags
- `zod` - Schema validation
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Zod resolver for forms

### **Step 3: Project Structure**

```
jewelry-website/
├── app/                      # Next.js App Router
│   ├── (pages)/              # Route groups
│   │   ├── page.tsx         # Home page
│   │   ├── about/
│   │   │   └── page.tsx      # About page
│   │   ├── designs/
│   │   │   └── page.tsx      # Designs/Products page
│   │   └── contact/
│   │       └── page.tsx      # Contact page
│   ├── api/                  # API routes
│   │   └── contact/
│   │       └── route.ts      # Contact form API
│   ├── layout.tsx           # Root layout
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── layout/              # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── sections/            # Page sections
│       ├── Hero.tsx
│       ├── FeaturedDesigns.tsx
│       └── ContactForm.tsx
├── lib/                     # Utilities
│   ├── firebase/           # Firebase configuration
│   │   └── config.ts
│   ├── cms/                # Sanity.io configuration
│   │   └── client.ts
│   ├── utils/              # Helper functions
│   │   └── helpers.ts
│   └── validations/        # Zod schemas
│       └── schemas.ts
├── types/                   # TypeScript types
│   ├── cms.ts              # CMS types
│   └── firebase.ts         # Firebase types
├── public/                  # Static assets
│   ├── images/             # Images
│   └── icons/               # Icons
├── .env.local              # Environment variables (not in git)
├── .env.example            # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🔧 Configuration

### **Step 4: Environment Variables**

Create `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
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
```

**How to get these values:**
1. **Firebase:** Go to Firebase Console → Project Settings → General → Your apps
2. **Sanity:** Go to Sanity.io → Project Settings → API → Tokens

### **Step 5: Firebase Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Firestore Database
4. Get configuration values
5. Add to `.env.local`

### **Step 6: Sanity.io Setup**

1. Go to [Sanity.io](https://www.sanity.io/)
2. Create account and new project
3. Install Sanity CLI: `npm install -g @sanity/cli`
4. Initialize: `sanity init`
5. Get project ID and API token
6. Add to `.env.local`

---

## 🏗️ Development Steps

### **Step 7: Create Firebase Configuration**

**File:** `lib/firebase/config.ts`

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
```

### **Step 8: Create Sanity.io Configuration**

**File:** `lib/cms/client.ts`

```typescript
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
```

### **Step 9: Create Type Definitions**

**File:** `types/cms.ts`

```typescript
export interface JewelryDesign {
  _id: string;
  title: string;
  description: string;
  image: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  price?: number;
  category?: string;
  slug: {
    current: string;
  };
}

export interface SiteSettings {
  title: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}
```

**File:** `types/firebase.ts`

```typescript
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
}
```

### **Step 10: Create Validation Schemas**

**File:** `lib/validations/schemas.ts`

```typescript
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

---

## 🎨 Building Components

### **Step 11: Create UI Components**

**File:** `components/ui/Button.tsx`

```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-colors';
  const variants = {
    primary: 'bg-amber-600 text-white hover:bg-amber-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border-2 border-amber-600 text-amber-600 hover:bg-amber-50',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### **Step 12: Create Layout Components**

**File:** `components/layout/Header.tsx`

```typescript
import Link from 'next/link';
import Navigation from './Navigation';

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-600">
            Jewelry Store
          </Link>
          <Navigation />
        </div>
      </div>
    </header>
  );
}
```

**File:** `components/layout/Navigation.tsx`

```typescript
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/designs', label: 'Designs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navigation() {
  return (
    <nav className="hidden md:flex space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-gray-700 hover:text-amber-600 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

**File:** `components/layout/Footer.tsx`

```typescript
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Jewelry Store</h3>
            <p className="text-gray-400">
              Your trusted source for beautiful, handcrafted jewelry.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/designs">Designs</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: info@jewelrystore.com</p>
            <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Jewelry Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### **Step 13: Create Page Sections**

**File:** `components/sections/Hero.tsx`

```typescript
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-amber-50 to-amber-100 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Exquisite Handcrafted Jewelry
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Discover our collection of unique, beautifully designed jewelry pieces
          that reflect your personal style.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/designs">
            <Button>Explore Designs</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">Contact Us</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

---

## 📝 Building Pages

### **Step 14: Update Root Layout**

**File:** `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jewelry Store - Exquisite Handcrafted Jewelry',
  description: 'Discover our collection of unique, beautifully designed jewelry pieces.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### **Step 15: Create Home Page**

**File:** `app/page.tsx`

```typescript
import Hero from '@/components/sections/Hero';
import FeaturedDesigns from '@/components/sections/FeaturedDesigns';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - Jewelry Store',
  description: 'Welcome to our jewelry store',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedDesigns />
    </>
  );
}
```

### **Step 16: Create Designs Page**

**File:** `app/designs/page.tsx`

```typescript
import { Metadata } from 'next';
import { client } from '@/lib/cms/client';
import { JewelryDesign } from '@/types/cms';
import { urlFor } from '@/lib/cms/client';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Designs - Jewelry Store',
  description: 'Browse our collection of jewelry designs',
};

async function getDesigns(): Promise<JewelryDesign[]> {
  const query = `*[_type == "jewelryDesign"] | order(_createdAt desc)`;
  return await client.fetch(query);
}

export default async function DesignsPage() {
  const designs = await getDesigns();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Our Designs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {designs.map((design) => (
          <div key={design._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64">
              <Image
                src={urlFor(design.image).width(400).height(400).url()}
                alt={design.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{design.title}</h3>
              <p className="text-gray-600 mb-4">{design.description}</p>
              {design.price && (
                <p className="text-amber-600 font-bold">${design.price}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### **Step 17: Create Contact Page**

**File:** `app/contact/page.tsx`

```typescript
import { Metadata } from 'next';
import ContactForm from '@/components/sections/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us - Jewelry Store',
  description: 'Get in touch with us',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>
      <div className="max-w-2xl mx-auto">
        <ContactForm />
      </div>
    </div>
  );
}
```

### **Step 18: Create Contact Form Component**

**File:** `components/sections/ContactForm.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, ContactFormData } from '@/lib/validations/schemas';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name *
        </label>
        <input
          {...register('name')}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone
        </label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          {...register('message')}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          Thank you! Your message has been sent.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Something went wrong. Please try again.
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
```

### **Step 19: Create Contact API Route**

**File:** `app/api/contact/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { contactFormSchema } from '@/lib/validations/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate data
    const validatedData = contactFormSchema.parse(body);

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...validatedData,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, id: docRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save contact' },
      { status: 500 }
    );
  }
}
```

---

## 🔍 SEO Implementation

### **Step 20: Add SEO to Pages**

**File:** `app/designs/page.tsx` (updated)

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jewelry Designs - Browse Our Collection',
  description: 'Explore our exquisite collection of handcrafted jewelry designs.',
  openGraph: {
    title: 'Jewelry Designs - Browse Our Collection',
    description: 'Explore our exquisite collection of handcrafted jewelry designs.',
    type: 'website',
  },
};
```

### **Step 21: Create Sitemap**

**File:** `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://yourdomain.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://yourdomain.com/designs',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://yourdomain.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://yourdomain.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
```

### **Step 22: Create Robots.txt**

**File:** `app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

---

## 🚀 Deployment

### **Step 23: Prepare for Deployment**

1. **Create `.env.example`** (template for environment variables)
2. **Update `.gitignore`** (ensure `.env.local` is ignored)
3. **Test locally**: `npm run dev`
4. **Build test**: `npm run build`

### **Step 24: Deploy to Vercel**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables
   - Click "Deploy"

3. **Automatic Deployments:**
   - Every push to `main` → Production
   - Every PR → Preview deployment

---

## 🐛 Troubleshooting

### **Cache Clearing**

If you've updated images or files but the website still shows old content, it's likely a caching issue.

**Quick Fix Steps:**

1. **Clear Next.js Build Cache:**
   ```bash
   # Delete .next folder
   rm -rf .next
   
   # Rebuild
   npm run build
   ```

2. **Restart Dev Server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

3. **Clear Browser Cache:**
   - **Chrome/Edge:** Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - **Firefox:** Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - **Safari:** Press `Cmd+Option+E` to clear cache

**Why This Happens:**
- Next.js caches builds in `.next` folder
- Browsers cache images for performance
- CDN may cache content if deployed

### **Common Issues:**

1. **Firebase not initializing:**
   - Check environment variables
   - Ensure Firestore is enabled in Firebase Console

2. **Sanity images not loading:**
   - Check project ID and dataset
   - Verify API token has read permissions

3. **Build errors:**
   - Run `npm run build` to see errors
   - Check TypeScript types
   - Verify all imports are correct

4. **Environment variables not working:**
   - Restart dev server after adding env vars
   - Use `NEXT_PUBLIC_` prefix for client-side vars

---

## 📚 Next Steps

1. ✅ Set up Firebase project
2. ✅ Set up Sanity.io project
3. ✅ Add environment variables
4. ✅ Create content in Sanity.io
5. ✅ Test contact form
6. ✅ Deploy to Vercel
7. ✅ Set up custom domain (optional)

---

## 📝 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🎯 Summary

This guide covers:
- ✅ Project setup
- ✅ Configuration
- ✅ Component creation
- ✅ Page building
- ✅ CMS integration
- ✅ Database integration
- ✅ SEO implementation
- ✅ Deployment

**Follow each step in order for best results!**

