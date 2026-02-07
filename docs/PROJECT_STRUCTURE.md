# Project Structure & Technical Documentation
**Complete Technical Reference for Jewels by NavKush Website**

**Date:** December 2024  
**Version:** 1.0.0

---

## 📋 **TABLE OF CONTENTS**

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Directory Structure](#3-directory-structure)
4. [Component Architecture](#4-component-architecture)
5. [Layout System](#5-layout-system)
6. [Design System](#6-design-system)
7. [Data Flow](#7-data-flow)
8. [Utility Functions](#8-utility-functions)
9. [API Routes](#9-api-routes)
10. [Configuration Files](#10-configuration-files)
11. [Type Definitions](#11-type-definitions)
12. [Tech Stack](#12-tech-stack)

---

## 1. **PROJECT OVERVIEW**

### **Project Name**
Jewels by NavKush - Professional Jewelry Business Website

### **Technology Stack**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **CMS:** Sanity.io (Headless CMS)
- **Database:** Firebase Firestore (NoSQL)
- **Hosting:** Vercel (Serverless)
- **Animations:** Framer Motion
- **Form Handling:** React Hook Form + Zod

### **Architecture Pattern**
- **Server Components First:** Default to server components
- **Client Components:** Only for interactivity/animations
- **Server-Side Rendering (SSR):** All pages are server-rendered
- **Static Site Generation (SSG):** Where applicable
- **Incremental Static Regeneration (ISR):** For dynamic content

---

## 2. **ARCHITECTURE**

### **2.1 Application Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Root Layout (app/layout.tsx)         │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         TopHeader (Global Navigation)       │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │              Page Content (SSR)             │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │    Server Components (Data Fetching)  │  │  │  │
│  │  │  │  ┌─────────────────────────────────┐ │  │  │  │
│  │  │  │  │ Client Components (Interactivity)│ │  │  │  │
│  │  │  │  └─────────────────────────────────┘ │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │            Footer (Global Footer)           │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ Sanity  │         │Firebase │         │  Vercel │
    │   CMS   │         │Firestore│         │  CDN    │
    └─────────┘         └─────────┘         └─────────┘
```

### **2.2 Component Hierarchy**

```
RootLayout
├── TopHeader (Client Component)
│   ├── Navigation Links
│   ├── Cart Icon
│   └── User Icon
├── Page Content (Server Component)
│   ├── Home Page (app/page.tsx)
│   │   ├── IntroSection (Server)
│   │   │   └── IntroSectionClient (Client - Animations)
│   │   ├── ProductCategories (Server)
│   │   └── MostLovedCreations (Server)
│   ├── Designs Page (app/designs/page.tsx)
│   │   ├── CategoryFilterButtons
│   │   └── ProductGrid (ProductCard components)
│   └── Product Detail (app/designs/[slug]/page.tsx)
│       ├── ProductImage3D (Client)
│       └── ProductDetails
└── Footer (Server Component)
```

### **2.3 Data Flow**

```
1. User Request
   ↓
2. Next.js App Router
   ↓
3. Server Component (Page)
   ↓
4. Data Fetching (Sanity/Firebase)
   ├── lib/cms/queries.ts (Sanity)
   └── lib/firebase/config.ts (Firebase)
   ↓
5. Server Component Renders HTML
   ↓
6. HTML Sent to Client
   ↓
7. Client Components Hydrate
   ├── Animations (Framer Motion)
   ├── Form Handling (React Hook Form)
   └── Interactive Features
   ↓
8. User Interaction
   ↓
9. API Routes (app/api/*)
   └── Server-Side Processing
```

---

## 3. **DIRECTORY STRUCTURE**

### **3.1 Root Directory**

```
jewelry-website/
├── app/                    # Next.js App Router (Pages & Routes)
├── components/             # React Components
├── lib/                    # Utility Functions & Helpers
├── types/                  # TypeScript Type Definitions
├── sanity/                 # Sanity.io Configuration
├── public/                 # Static Assets
├── docs/                   # Documentation
├── scripts/                # Utility Scripts
├── middleware.ts           # Next.js Middleware (Security Headers)
├── next.config.ts          # Next.js Configuration
├── tsconfig.json           # TypeScript Configuration
├── package.json            # Dependencies
└── README.md               # Project README
```

### **3.2 App Directory (`app/`)**

```
app/
├── layout.tsx              # Root Layout (Global)
├── page.tsx                # Home Page
├── globals.css              # Global Styles
├── robots.ts               # Robots.txt Generator
├── sitemap.ts              # Sitemap Generator
│
├── about/                  # About Us Page
│   └── page.tsx
│
├── contact/                # Contact Page
│   └── page.tsx
│
├── designs/                # Product Pages
│   ├── page.tsx           # All Designs Listing
│   └── [slug]/            # Dynamic Product Detail
│       └── page.tsx
│
├── cart/                   # Shopping Cart
│   └── page.tsx
│
├── profile/                # User Profile
│   └── page.tsx
│
├── materials/              # Materials Page
│   └── page.tsx
│
├── sustainability/         # Sustainability Page
│   └── page.tsx
│
├── shipping/               # Shipping & Returns
│   └── page.tsx
│
├── faqs/                   # FAQs Page
│   └── page.tsx
│
├── privacy/                # Privacy Policy
│   └── page.tsx
│
├── terms/                  # Terms of Service
│   └── page.tsx
│
├── studio/                 # Sanity Studio
│   └── [[...tool]]/
│       └── page.tsx
│
└── api/                    # API Routes
    └── contact/
        └── route.ts        # Contact Form API
```

### **3.3 Components Directory (`components/`)**

```
components/
├── ErrorBoundary.tsx        # React Error Boundary
│
├── layout/                 # Layout Components
│   ├── TopHeader.tsx      # Global Header (Client)
│   └── Footer.tsx         # Global Footer (Server)
│
├── sections/               # Page Sections
│   ├── IntroSection.tsx           # Home Intro (Server)
│   ├── IntroSectionClient.tsx     # Intro Animations (Client)
│   ├── HeroImage3D.tsx            # Hero Image 3D (Client)
│   ├── ProductCategories.tsx      # Product Categories (Server)
│   ├── CategoryImage3D.tsx        # Category Image 3D (Client)
│   ├── MostLovedHeading.tsx       # Most Loved Heading (Server)
│   ├── MostLovedCreations.tsx     # Most Loved Products (Server)
│   ├── PlaceholderCard3D.tsx      # Placeholder Card (Client)
│   ├── AboutUs.tsx               # About Section (Server)
│   ├── AboutUsClient.tsx         # About Animations (Client)
│   ├── AboutImage3D.tsx         # About Image 3D (Client)
│   └── ContactForm.tsx          # Contact Form (Client)
│
└── ui/                     # Reusable UI Components
    ├── Button.tsx                 # Button Component
    ├── Input.tsx                  # Input Field
    ├── Textarea.tsx               # Textarea Field
    ├── Card.tsx                   # Card Container
    ├── PageContainer.tsx          # Page Container
    ├── SectionHeading.tsx         # Section Heading
    ├── InfoCard.tsx              # Info Card
    ├── ProductCard.tsx           # Product Card (Client)
    ├── ProductImage3D.tsx       # Product Image 3D (Client)
    ├── CategoryCard3D.tsx       # Category Card 3D (Client)
    ├── CategoryFilterButton.tsx  # Category Filter Button (Client)
    ├── CategoryLink.tsx          # Category Link
    ├── ScrollReveal.tsx          # Scroll Animation Wrapper (Client)
    └── ImagePlaceholder.tsx      # Image Placeholder
```

### **3.4 Lib Directory (`lib/`)**

```
lib/
├── constants.ts            # Application Constants
│
├── animations/             # Animation Constants
│   └── constants.ts       # 3D Animation Parameters
│
├── cms/                    # Sanity CMS Integration
│   ├── client.ts          # Sanity Client Configuration
│   └── queries.ts         # Sanity Data Queries
│
├── firebase/               # Firebase Integration
│   └── config.ts          # Firebase Configuration
│
├── security/               # Security Utilities
│   ├── env-validation.ts  # Environment Variable Validation
│   ├── error-handler.ts  # Secure Error Handling
│   ├── rate-limit.ts     # API Rate Limiting
│   └── sanitize.ts        # Input Sanitization
│
├── seo/                    # SEO Utilities
│   ├── metadata.ts        # Metadata Generation
│   └── structured-data.ts # Schema.org JSON-LD
│
├── utils/                  # Utility Functions
│   ├── image-helpers.ts   # Image Helper Functions
│   ├── price-formatting.ts # Price Formatting
│   └── text-formatting.ts # Text Formatting Utilities
│
└── validations/            # Validation Schemas
    └── schemas.ts         # Zod Validation Schemas
```

### **3.5 Types Directory (`types/`)**

```
types/
├── cms.ts                  # Sanity CMS Type Definitions
└── firebase.ts             # Firebase Type Definitions
```

### **3.6 Sanity Directory (`sanity/`)**

```
sanity/
├── config.ts              # Sanity Configuration
├── env.ts                 # Sanity Environment Variables
├── structure.ts           # Sanity Studio Structure
├── lib/
│   ├── client.ts          # Sanity Client
│   ├── image.ts           # Image URL Builder
│   └── live.ts            # Live Preview
└── schemaTypes/           # Sanity Schema Definitions
    ├── jewelryDesign.ts   # Jewelry Design Schema
    ├── siteSettings.ts    # Site Settings Schema
    └── category.ts        # Category Schema
```

### **3.7 Public Directory (`public/`)**

```
public/
├── hero-image.png         # Hero Image
├── about-image.png        # About Us Image
├── category-*.png         # Category Images (4 files)
├── assets/
│   └── placeholders/     # Placeholder Images
└── icons/                 # Icon Files
```

---

## 4. **COMPONENT ARCHITECTURE**

### **4.1 Component Types**

#### **Server Components (Default)**
- **Purpose:** Data fetching, SEO-critical content
- **Location:** Most components in `app/` and `components/sections/`
- **Features:**
  - Can use `async/await`
  - Direct database/CMS access
  - SEO-friendly (content in initial HTML)
  - No client-side JavaScript

**Examples:**
- `app/page.tsx` - Home page
- `components/sections/IntroSection.tsx`
- `components/sections/ProductCategories.tsx`
- `components/layout/Footer.tsx`

#### **Client Components (`'use client'`)**
- **Purpose:** Interactivity, animations, forms
- **Location:** Components with `'use client'` directive
- **Features:**
  - React hooks (`useState`, `useEffect`, etc.)
  - Event handlers
  - Browser APIs
  - Animations (Framer Motion)

**Examples:**
- `components/layout/TopHeader.tsx` - Navigation with scroll effects
- `components/ui/ProductCard.tsx` - 3D hover effects
- `components/sections/ContactForm.tsx` - Form handling
- `components/ui/ScrollReveal.tsx` - Scroll animations

### **4.2 Component Categories**

#### **Layout Components**
- **Location:** `components/layout/`
- **Purpose:** Global layout elements
- **Components:**
  - `TopHeader.tsx` - Global navigation header
  - `Footer.tsx` - Global footer

#### **Section Components**
- **Location:** `components/sections/`
- **Purpose:** Page sections (home page, about, etc.)
- **Pattern:** Server component + Client component for animations
- **Examples:**
  - `IntroSection.tsx` + `IntroSectionClient.tsx`
  - `AboutUs.tsx` + `AboutUsClient.tsx`

#### **UI Components**
- **Location:** `components/ui/`
- **Purpose:** Reusable UI elements
- **Features:** Consistent styling, accessibility, animations
- **Examples:**
  - `Button.tsx` - Standardized button
  - `Input.tsx` - Form input field
  - `Card.tsx` - Card container
  - `ProductCard.tsx` - Product display card

### **4.3 Component Patterns**

#### **Server → Client Pattern**
```tsx
// Server Component (IntroSection.tsx)
export default async function IntroSection() {
  const data = await fetchData(); // Server-side fetch
  
  return (
    <IntroSectionClient data={data} /> // Pass to client component
  );
}

// Client Component (IntroSectionClient.tsx)
'use client';
export function IntroSectionClient({ data }) {
  // Client-side animations/interactivity
  return <div>{/* Animated content */}</div>;
}
```

#### **3D Animation Pattern**
```tsx
'use client';
import { motion } from 'framer-motion';
import { ANIMATION_3D } from '@/lib/animations/constants';

export function ProductCard3D({ product }) {
  return (
    <motion.div
      whileHover={{ 
        rotateY: ANIMATION_3D.HOVER.ROTATE_Y,
        scale: ANIMATION_3D.HOVER.SCALE 
      }}
    >
      {/* Card content */}
    </motion.div>
  );
}
```

---

## 5. **LAYOUT SYSTEM**

### **5.1 Root Layout (`app/layout.tsx`)**

**Purpose:** Global layout wrapper for all pages

**Structure:**
```tsx
RootLayout
├── HTML Head
│   ├── Metadata (SEO)
│   ├── Fonts (Playfair Display, Inter)
│   └── Structured Data (JSON-LD)
├── Body
│   ├── Skip to Content Link (Accessibility)
│   ├── ErrorBoundary
│   │   └── Main Content
│   │       ├── TopHeader (Global)
│   │       ├── {children} (Page Content)
│   │       └── Footer (Global)
```

**Features:**
- Global metadata generation
- Font optimization (Next.js fonts)
- Structured data (Organization, Website schemas)
- Error boundary wrapper
- Accessibility features

### **5.2 Page Layouts**

#### **Standard Page Layout**
```tsx
PageContainer
├── SectionHeading (Page Title)
├── Content Sections
└── ScrollReveal (Animations)
```

#### **Product Listing Layout**
```tsx
PageContainer
├── CategoryFilterButtons
├── ProductGrid
│   └── ProductCard (Multiple)
└── ScrollReveal
```

#### **Product Detail Layout**
```tsx
PageContainer
├── Breadcrumbs
├── ProductImage3D
├── ProductDetails
│   ├── Title
│   ├── Price
│   ├── Description
│   └── Add to Cart Button
└── Related Products
```

### **5.3 Layout Components**

#### **PageContainer**
- **Location:** `components/ui/PageContainer.tsx`
- **Purpose:** Consistent page wrapper
- **Features:**
  - Max-width container
  - Responsive padding
  - Background color

#### **SectionHeading**
- **Location:** `components/ui/SectionHeading.tsx`
- **Purpose:** Consistent section headings
- **Features:**
  - Typography standardization
  - Responsive sizing
  - Alignment options

---

## 6. **DESIGN SYSTEM**

### **6.1 Color System**

**Two-Color Shade System:**
```typescript
// Primary Background Colors
beige: '#CCC4BA'        // rgb(204, 196, 186)
cream: '#faf8f5'        // rgb(250, 248, 245)

// Text Colors
textOnBeige: 'rgb(255, 255, 255)'    // White on beige
textOnCream: 'rgb(42, 42, 42)'       // Dark on cream
textSecondary: 'rgb(106, 106, 106)'  // Secondary text
textMuted: 'rgb(145, 140, 135)'     // Muted text

// UI Colors
borderGray: '#e8e5e0'   // Light border
```

**Usage:**
- Beige: Sections, headers, footers, category cards
- Cream: Page backgrounds, cards, inputs
- Text colors adapt based on background

### **6.2 Typography System**

**Font Families:**
```css
--font-playfair: 'Playfair Display'  /* Headings */
--font-inter: 'Inter'                /* Body text */
```

**Font Sizes (CSS Variables):**
```css
/* Headings */
--heading-xs: 1.5rem    /* 24px */
--heading-sm: 2rem      /* 32px */
--heading-md: 2.5rem    /* 40px */
--heading-lg: 3rem      /* 48px */

/* Body */
--body-xs: 0.875rem     /* 14px */
--body-sm: 1rem         /* 16px */
--body-base: 1.125rem   /* 18px */
--body-lg: 1.25rem      /* 20px */
```

**Usage:**
- Playfair Display: Headings, product names, prices
- Inter: Body text, navigation, buttons, descriptions

### **6.3 Spacing System**

**Standardized Padding:**
```typescript
// Page containers
py-12 sm:py-16 md:py-20 lg:py-24

// Section padding
py-12 sm:py-16 md:py-20 lg:py-24

// Card padding
p-4 sm:p-5 md:p-6 lg:p-8
```

**Standardized Gaps:**
```typescript
// Grid gaps
gap-4 sm:gap-5 md:gap-6 lg:gap-8

// Flex gaps
gap-3 sm:gap-4 md:gap-6
```

### **6.4 Border Radius**

```typescript
rounded-lg    // 8px - Cards, inputs, images
rounded-full  // 9999px - Buttons, icons
```

### **6.5 Animation System**

**3D Animation Constants:**
```typescript
// Location: lib/animations/constants.ts

ANIMATION_3D = {
  TILT: { MAX_ROTATE: 15 },
  DEPTH: { PERSPECTIVE: 1000, TRANSLATE_Z: 50 },
  SCALE: { HOVER: 1.05, ACTIVE: 0.98 },
  SPRING: { STIFFNESS: 300, DAMPING: 20 },
  DURATION: { ENTRY: 0.6, HOVER: 0.3 },
  // ... more constants
}
```

**Usage:**
- Product cards: 3D tilt on hover
- Category cards: 3D depth effect
- Images: Subtle scale on hover
- Scroll animations: Fade/slide in

---

## 7. **DATA FLOW**

### **7.1 Data Fetching Flow**

```
1. Page Request
   ↓
2. Server Component (app/page.tsx)
   ↓
3. Data Fetching Functions
   ├── getSiteSettings() → lib/cms/queries.ts
   ├── getDesigns() → lib/cms/queries.ts
   └── getCategoryImages() → lib/cms/queries.ts
   ↓
4. Sanity Client (lib/cms/client.ts)
   ↓
5. Sanity.io API
   ↓
6. Data Returned to Server Component
   ↓
7. Rendered as HTML (Server-Side)
   ↓
8. Sent to Client
   ↓
9. Client Components Hydrate (if needed)
```

### **7.2 Form Submission Flow**

```
1. User Fills Form (ContactForm.tsx)
   ↓
2. React Hook Form Validation (Zod)
   ↓
3. Form Submit Handler
   ↓
4. API Route (app/api/contact/route.ts)
   ├── Input Validation (Zod)
   ├── Input Sanitization
   ├── Rate Limiting Check
   └── Origin Validation (CSRF)
   ↓
5. Firebase Firestore (lib/firebase/config.ts)
   ↓
6. Data Stored
   ↓
7. Success/Error Response
   ↓
8. User Feedback
```

### **7.3 Image Loading Flow**

```
1. Component Requests Image
   ↓
2. Sanity Image Source
   ↓
3. urlFor() Helper (sanity/lib/image.ts)
   ↓
4. Next.js Image Component
   ├── Image Optimization
   ├── Lazy Loading
   └── Responsive Sizes
   ↓
5. CDN Delivery (Sanity CDN)
   ↓
6. Browser Display
```

---

## 8. **UTILITY FUNCTIONS**

### **8.1 Text Formatting (`lib/utils/text-formatting.ts`)**

**Functions:**
- `capitalize(str)` - Capitalize first letter
- `titleCase(str)` - Title case string
- `formatCategoryName(category)` - Format category names
- `getBrandName()` - Get brand name
- `formatProductTitle(title)` - Format product titles

### **8.2 Price Formatting (`lib/utils/price-formatting.ts`)**

**Functions:**
- `formatPrice(price, currency?)` - Format price with currency
- `CURRENCY` - Currency constant (USD)

### **8.3 Image Helpers (`lib/utils/image-helpers.ts`)**

**Functions:**
- `getRandomCategoryImages(images, count)` - Get random category images
- `getCategoryImageSource(category, images)` - Get category image source
- `CategoryType` - Type definition for categories

### **8.4 Security Utilities (`lib/security/`)**

**Functions:**
- `sanitizeString(str)` - Sanitize input strings
- `sanitizeEmail(email)` - Sanitize email addresses
- `sanitizePhone(phone)` - Sanitize phone numbers
- `sanitizeObject(obj)` - Recursive object sanitization
- `rateLimit(identifier, limit, window)` - Rate limiting
- `logError(error, context)` - Secure error logging
- `validateFirebaseEnv()` - Validate Firebase env vars
- `validateSanityEnv()` - Validate Sanity env vars

### **8.5 SEO Utilities (`lib/seo/`)**

**Functions:**
- `generateStandardMetadata(options)` - Generate page metadata
- `generateProductMetadata(product)` - Generate product metadata
- `generateOrganizationSchema()` - Organization JSON-LD
- `generateWebsiteSchema()` - Website JSON-LD
- `generateProductSchema(product)` - Product JSON-LD
- `generateBreadcrumbSchema(items)` - Breadcrumb JSON-LD
- `generateCollectionPageSchema(category)` - Collection JSON-LD

---

## 9. **API ROUTES**

### **9.1 Contact Form API (`app/api/contact/route.ts`)**

**Endpoint:** `POST /api/contact`

**Flow:**
1. Request validation (Content-Type, method, size)
2. JSON parsing
3. Input validation (Zod schema)
4. Input sanitization
5. Rate limiting check
6. Origin validation (CSRF protection)
7. Firebase write operation
8. Success/error response with security headers

**Request Body:**
```typescript
{
  name: string;      // 2-100 chars
  email: string;     // Valid email, max 254 chars
  phone?: string;    // Optional, max 20 chars
  message: string;   // 10-5000 chars
}
```

**Response:**
```typescript
// Success (200)
{ success: true, message: "Message sent successfully" }

// Error (400/429/500)
{ success: false, error: "Error message" }
```

**Security Features:**
- Input validation (Zod)
- Input sanitization
- Rate limiting (10 requests per 15 minutes)
- Origin validation
- Security headers on all responses
- Request size limits (10KB)

---

## 10. **CONFIGURATION FILES**

### **10.1 Next.js Configuration (`next.config.ts`)**

**Settings:**
- Image optimization (Sanity CDN)
- Image formats (AVIF, WebP)
- Device sizes for responsive images
- Compression enabled
- `poweredByHeader` disabled

### **10.2 TypeScript Configuration (`tsconfig.json`)**

**Settings:**
- Strict mode enabled
- Path aliases (`@/*` → `./`)
- Module resolution
- JSX support

### **10.3 Middleware (`middleware.ts`)**

**Purpose:** Security headers for all requests

**Headers Set:**
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### **10.4 Tailwind Configuration**

**Settings:**
- Custom color variables
- Custom font families
- Responsive breakpoints
- Custom spacing scale

### **10.5 Sanity Configuration (`sanity/config.ts`)**

**Settings:**
- Project ID
- Dataset (production)
- API version
- Plugins
- Schema types

---

## 11. **TYPE DEFINITIONS**

### **11.1 CMS Types (`types/cms.ts`)**

**Interfaces:**
```typescript
interface JewelryDesign {
  _id: string;
  _type: 'jewelryDesign';
  title: string;
  slug: { current: string };
  category: string;
  price: number;
  material: string;
  description: any[]; // Portable Text
  images: SanityImageSource[];
  inStock: boolean;
  sku?: string;
  _updatedAt: string;
}

interface SiteSettings {
  _id: string;
  _type: 'siteSettings';
  brandName?: string;
  tagline?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: SanityImageSource;
  // ... more fields
}
```

### **11.2 Component Props Types**

**Common Patterns:**
```typescript
// Product Card Props
interface ProductCardProps {
  design: JewelryDesign;
  variant?: 'default' | 'compact';
}

// Button Props
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Input Props
interface InputProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}
```

---

## 12. **TECH STACK**

### **12.1 Core Dependencies**

| Package | Version | Purpose |
|---------|--------|---------|
| `next` | 16.0.3 | React framework |
| `react` | 19.2.0 | UI library |
| `react-dom` | 19.2.0 | React DOM |
| `typescript` | ^5 | Type safety |

### **12.2 Styling**

| Package | Version | Purpose |
|---------|--------|---------|
| `tailwindcss` | ^4 | CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS integration |

### **12.3 CMS & Database**

| Package | Version | Purpose |
|---------|--------|---------|
| `@sanity/client` | ^7.13.0 | Sanity client |
| `@sanity/image-url` | ^1.2.0 | Image URL builder |
| `sanity` | ^4.18.0 | Sanity Studio |
| `firebase` | ^12.6.0 | Firebase SDK |

### **12.4 Forms & Validation**

| Package | Version | Purpose |
|---------|--------|---------|
| `react-hook-form` | ^7.66.1 | Form handling |
| `@hookform/resolvers` | ^5.2.2 | Zod resolver |
| `zod` | ^4.1.12 | Schema validation |

### **12.5 Animations**

| Package | Version | Purpose |
|---------|--------|---------|
| `framer-motion` | ^12.23.24 | Animation library |

---

## 📊 **COMPONENT SUMMARY**

### **Total Components: 29**

**By Category:**
- **Layout Components:** 2
- **Section Components:** 12
- **UI Components:** 15

**By Type:**
- **Server Components:** 18
- **Client Components:** 11

### **Total Pages: 14**

- Home (`/`)
- Designs Listing (`/designs`)
- Product Detail (`/designs/[slug]`)
- About (`/about`)
- Contact (`/contact`)
- Cart (`/cart`)
- Profile (`/profile`)
- Materials (`/materials`)
- Sustainability (`/sustainability`)
- Shipping (`/shipping`)
- FAQs (`/faqs`)
- Privacy (`/privacy`)
- Terms (`/terms`)
- Sanity Studio (`/studio`)

---

## 🔄 **DEVELOPMENT WORKFLOW**

### **1. Adding a New Page**
1. Create `app/new-page/page.tsx`
2. Add metadata export
3. Use `PageContainer` and `SectionHeading`
4. Add to navigation (if needed)
5. Update sitemap

### **2. Adding a New Component**
1. Determine if Server or Client component
2. Create in appropriate directory:
   - `components/ui/` for reusable UI
   - `components/sections/` for page sections
   - `components/layout/` for layout components
3. Add TypeScript types
4. Follow design system (colors, spacing, typography)
5. Add animations if needed (use `ANIMATION_3D` constants)

### **3. Adding a New Utility Function**
1. Determine category:
   - `lib/utils/` for general utilities
   - `lib/security/` for security utilities
   - `lib/seo/` for SEO utilities
2. Add TypeScript types
3. Export from appropriate file
4. Document usage

---

## ✅ **BEST PRACTICES**

### **Component Best Practices**
- ✅ Server components by default
- ✅ Client components only for interactivity
- ✅ Props properly typed
- ✅ Consistent naming conventions
- ✅ Reusable components in `components/ui/`

### **Code Organization**
- ✅ Clear directory structure
- ✅ Related files grouped together
- ✅ Consistent naming patterns
- ✅ TypeScript throughout
- ✅ No `any` types

### **Performance**
- ✅ Server-side rendering
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Efficient data fetching

### **Security**
- ✅ Input validation
- ✅ Input sanitization
- ✅ Rate limiting
- ✅ Security headers
- ✅ Environment variable validation

---

## 📚 **REFERENCE DOCUMENTATION**

- **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Complete deployment guide
- **[SEO Audit](./SEO_AUDIT_2025.md)** - Complete SEO best practices & verification
- **[Security Audit](./SECURITY_AUDIT_2025.md)** - Complete security best practices & audit
- **[Backend Comprehensive Audit](./BACKEND_COMPREHENSIVE_AUDIT_2025_FINAL.md)** - Complete backend and comprehensive audit
- **[Design System](./DESIGN_SYSTEM_CONSISTENCY.md)** - Design standards
- **[3D Animations Guide](./3D_ANIMATIONS_GUIDE.md)** - Animation system
- **[Development Guide](./DEVELOPMENT_GUIDE.md)** - Development workflow

---

**Last Updated:** December 2024  
**Version:** 1.0.0


