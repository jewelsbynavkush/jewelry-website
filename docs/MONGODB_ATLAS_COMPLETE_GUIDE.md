# MongoDB Atlas Complete Guide

**Date:** January 2026  
**Purpose:** Complete guide to MongoDB Atlas setup, terminology, and best practices

---

## 📋 **Table of Contents**

1. [Why MongoDB Atlas?](#why-mongodb-atlas)
2. [Terminology Explained](#terminology-explained)
3. [Setup Guide](#setup-guide)
4. [Database Users & Security](#database-users--security)
5. [Connection Strings](#connection-strings)
6. [Scaling & Upgrades](#scaling--upgrades)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 **Why MongoDB Atlas?**

### **Perfect for Your E-commerce Platform**

✅ **Free Tier (M0):**
- 512MB storage - Enough for thousands of products
- Unlimited operations - No read/write limits
- Shared cluster - Fully managed
- No credit card required - True free tier
- Never expires - Free forever (within limits)

✅ **Excellent Scalability:**
- Used by Fortune 500 companies
- Handles millions of requests
- Auto-scaling clusters
- Multi-region support

✅ **Perfect for E-commerce:**
- Flexible schema for products with varying attributes
- Complex queries, search, filters, aggregations
- Transactions for order processing
- Full-text search capabilities

✅ **Scaling Path:**
- **M0 (Free):** $0/month - Start here
- **M10:** $9/month - When you need more (2GB storage)
- **M30:** $57/month - High traffic (10GB storage)
- **M50+:** $200+/month - Enterprise scale

---

## 📚 **Terminology Explained**

### **1. Cluster** 🏢
- The **infrastructure** (servers, storage, network)
- The **container** that holds everything
- Like a **building** that contains all your databases

**In Your Case:**
- **Cluster Name:** `jewelsbynavkush` (or `jewelry-website-dev`)
- **Tier:** M0 (Free) or M10 ($9/month)
- **Contains:** All your databases

### **2. Database** 📁
- A **logical container** for your data
- Contains **collections** (tables)
- Like a **folder** that contains files

**In Your Case:**
- **Development Database:** `jewelry-website-dev`
- **Production Database:** `jewelry-website-prod`

### **3. Collection** 📄
- A **group of documents** (like a table)
- Contains **documents** (rows/records)
- Like a **file** in a folder

**In Your Case:**
- **Products Collection:** All product documents
- **Users Collection:** All user documents
- **Orders Collection:** All order documents

### **4. Document** 📝
- A **single record** (like a row)
- Contains **fields** (like columns)
- Stored as **JSON/BSON** format

### **5. Field** 📋
- A **key-value pair** in a document
- Like a **column** in a table

### **System Databases (Ignore):**
- `admin` - MongoDB system database (user authentication)
- `local` - MongoDB system database (replication data)
- ⚠️ **Don't modify or delete these!**

### **Complete Structure:**
```
Cluster: jewelsbynavkush
├── Database: jewelry-website-dev
│   ├── Collection: products
│   ├── Collection: users
│   └── Collection: orders
├── Database: jewelry-website-prod
│   └── (same structure)
├── Database: admin (system - ignore)
└── Database: local (system - ignore)
```

---

## 🚀 **Setup Guide**

### **Step 1: Create MongoDB Atlas Account**

1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Use email or Google account
4. **No credit card required**
5. Verify your email

**✅ Step 1 Complete:** You now have a MongoDB Atlas account.

---

### **Step 2: Create Cluster**

1. After login, click **"Build a Database"**
2. Choose **"M0 Free"** tier (512MB, free forever)
3. **Cloud Provider:** AWS (or your preference)
4. **Region:** Choose closest to your users
   - For India: **Mumbai (ap-south-1)**
   - For US: **N. Virginia (us-east-1)**
   - For EU: **Ireland (eu-west-1)**
5. **Cluster Name:** `jewelsbynavkush` (or your choice)
6. Click **"Create Cluster"**
7. Wait 3-5 minutes for creation

**✅ Step 2 Complete:** Cluster is created.

---

### **Step 3: Create Databases**

**Goal:** One cluster, two databases (dev & prod)

#### **Create Development Database:**

1. Click **"Browse Collections"** (left sidebar)
2. Click **"Create Database"** button
3. **Database Name:** `jewelry-website-dev`
4. **Collection Name:** `products` (temporary - required to create database)
5. Click **"Create"**

**✅ Development database created!**

#### **Create Production Database:**

1. Still in **"Browse Collections"**
2. Click **"Create Database"** again
3. **Database Name:** `jewelry-website-prod`
4. **Collection Name:** `products` (temporary)
5. Click **"Create"**

**✅ Production database created!**

**Note:** The `products` collection is temporary. You'll create real collections later.

---

### **Step 4: Configure Network Access**

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Note:** This allows all IPs (needed for Vercel)
4. Click **"Confirm"**

**✅ Step 4 Complete:** Network access is configured.

---

## 👤 **Database Users & Security**

### **Create Development User**

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. **Authentication Method:** Password
4. **Username:** `jewelsbynavkush-user-dev`
5. **Password:** 
   - Click **"Autogenerate Secure Password"** (recommended)
   - Or create your own (save it securely!)
6. **Database User Privileges:** 
   - Select **"Read and write to any database"**
   - Or create database-level user (more secure - see below)
7. Click **"Add User"**
8. **Important:** Save the password! You won't see it again.

### **Create Production User (Recommended)**

1. Click **"Add New Database User"** again
2. **Username:** `jewelsbynavkush-user-prod`
3. **Password:** Generate secure password
4. **Privileges:** Read and write to any database
5. Click **"Add User"**
6. **Save password securely**

### **Database-Level Users (More Secure)**

For better security, create users with access to specific databases only:

1. **Create User:**
   - Username: `jewelsbynavkush-user-dev`
   - Password: Generate secure password
   - **Privileges:** Click **"Add Custom Role"**
     - **Role Name:** `dev-read-write`
     - **Database:** `jewelry-website-dev`
     - **Privileges:** `readWrite`
     - Click **"Add Role"**
   - Click **"Add User"**

2. **Repeat for Production:**
   - Username: `jewelsbynavkush-user-prod`
   - Database: `jewelry-website-prod`
   - Privileges: `readWrite`

**✅ Step 5 Complete:** Database users are created.

---

## 🔗 **Connection Strings**

### **Get Connection String**

1. Go to **"Clusters"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. **Driver:** Node.js
5. **Version:** 5.5 or later
6. Copy the connection string template:
   ```
   mongodb+srv://<username>:<password>@jewelsbynavkush.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=jewelsbynavkush
   ```

### **Development Connection String**

Replace placeholders:
- `<username>` → `jewelsbynavkush-user-dev`
- `<password>` → Your dev user password
- Add database name: `jewelry-website-dev`

**Final:**
```
mongodb+srv://jewelsbynavkush-user-dev:PASSWORD@jewelsbynavkush.xxxxx.mongodb.net/jewelry-website-dev?retryWrites=true&w=majority&appName=jewelsbynavkush
```

### **Production Connection String**

Same cluster URL, different database and user:
```
mongodb+srv://jewelsbynavkush-user-prod:PASSWORD@jewelsbynavkush.xxxxx.mongodb.net/jewelry-website-prod?retryWrites=true&w=majority&appName=jewelsbynavkush
```

**Notice:**
- Same cluster URL
- Different database names (`dev` vs `prod`)
- Different users (recommended for security)

---

## 📦 **Install & Connect**

### **Install Mongoose (Recommended)**

```bash
npm install mongoose
```

**Why Mongoose:**
- ✅ Popular ODM (Object Document Mapper)
- ✅ Schema validation
- ✅ TypeScript support
- ✅ Easy to use

### **Create Connection Utility**

Create `lib/mongodb.ts`:

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

### **Add TypeScript Types**

Add to `global.d.ts`:

```typescript
import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

export {};
```

### **Use in API Routes**

Example: `app/api/products/route.ts`:

```typescript
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    
    // Your database operations here
    // Example: const products = await Product.find({});
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
```

---

## 📊 **Create Collections**

Collections are created automatically when you insert data. But you can create them manually:

### **Via MongoDB Atlas UI**

1. Go to **"Browse Collections"**
2. Click on your database (e.g., `jewelry-website-dev`)
3. Click **"Create Collection"**
4. **Collection Name:** `products` (or `users`, `orders`, etc.)
5. Click **"Create"**

### **Recommended Collections:**

- `products` - Product catalog
- `users` - User accounts
- `orders` - Order records
- `order_items` - Order line items
- `categories` - Product categories
- `cart` - Shopping cart items
- `wishlist` - User wishlists
- `site_settings` - Site configuration
- `inventory_log` - Inventory tracking
- `email_queue` - Email notifications

---

## 📈 **Scaling & Upgrades**

### **When to Upgrade**

| Scenario | Monthly Traffic | Tier Needed |
|----------|----------------|-------------|
| Small Business | < 1,000 visitors/month | ✅ **M0 Free** |
| Growing Business | 1,000-10,000 visitors/month | ✅ **M0 Free** |
| Medium Business | 10,000-50,000 visitors/month | ⚠️ **M10 ($9/month)** |
| High Traffic | 50,000+ visitors/month | ⚠️ **M10-M30 ($9-57/month)** |

### **Upgrade Process**

**Good News:** You can upgrade the same cluster in-place!

1. Go to **"Clusters"**
2. Click **"..."** (three dots) on your cluster
3. Click **"Edit Configuration"**
4. Select new tier (e.g., M10)
5. Click **"Confirm"**
6. Wait 5-10 minutes for upgrade

**Data Safety:**
- ✅ **No data migration needed** - Data stays in place
- ✅ **No downtime** - Upgrade happens automatically
- ✅ **All data preserved** - Nothing is lost

### **Scaling Path:**

- **M0 (Free):** $0/month - 512MB storage
- **M10:** $9/month - 2GB storage, better performance
- **M30:** $57/month - 10GB storage, high performance
- **M50+:** $200+/month - Enterprise scale

---

## 🐛 **Troubleshooting**

### **Issue: Connection Timeout**

**Solution:**
1. Check network access (IP whitelist)
2. Verify connection string format
3. Check username/password
4. Ensure cluster is running

### **Issue: Authentication Failed**

**Solution:**
1. Verify username and password
2. Check database user privileges
3. Ensure user exists in correct database

### **Issue: Network Access Denied**

**Solution:**
1. Add your IP to whitelist
2. For Vercel: Allow 0.0.0.0/0 (all IPs)
3. Wait a few minutes for changes to propagate

### **Issue: Database Not Found**

**Solution:**
1. Database is created automatically on first insert
2. Or create manually via MongoDB Atlas UI
3. Verify database name in connection string

---

## ✅ **Verification Checklist**

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Free)
- [ ] Development database created: `jewelry-website-dev`
- [ ] Production database created: `jewelry-website-prod`
- [ ] Development database user created
- [ ] Production database user created
- [ ] IP addresses whitelisted (0.0.0.0/0)
- [ ] Development connection string saved
- [ ] Production connection string saved
- [ ] MongoDB driver installed (mongoose)
- [ ] Connection utility created (`lib/mongodb.ts`)
- [ ] Collections created (or ready to be created)

---

## 🎯 **Next Steps**

1. **Add Connection String to Environment Variables**
   - Add `MONGODB_URI` to `.env.development.local`
   - Add `MONGODB_URI` to `.env.production.local`
   - Add to Vercel environment variables

2. **Create Database Models**
   - Create Mongoose schemas for all collections
   - See: [Project Roadmap](./PROJECT_ROADMAP.md) for data models

3. **Test Connection**
   - Create test API route (`/api/test-db`)
   - Verify connection works

---

## 🎉 **Setup Complete!**

Your MongoDB Atlas database is ready to use. You can now:
- ✅ Store products, users, orders
- ✅ Scale to millions of users
- ✅ Use transactions for orders
- ✅ Full-text search (with indexes or Algolia)

**See Also:**
- [Project Roadmap](./PROJECT_ROADMAP.md) - Data models and architecture
- [Environment Setup Guide](./ENVIRONMENT_SETUP_GUIDE.md) - Complete environment setup

---

**Last Updated:** January 2026
