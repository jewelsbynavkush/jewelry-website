# Different Ways to Create Schema in Sanity.io

Complete guide to all methods for creating schemas in Sanity.io.

## 📋 Table of Contents

1. [Method 1: Sanity Studio Online (Visual Builder)](#method-1-sanity-studio-online-visual-builder)
2. [Method 2: Local Sanity Studio (Code-Based)](#method-2-local-sanity-studio-code-based)
3. [Method 3: Sanity CLI Schema Commands](#method-3-sanity-cli-schema-commands)
4. [Method 4: Sanity Management API](#method-4-sanity-management-api)
5. [Method 5: Import/Export Schema](#method-5-importexport-schema)
6. [Comparison Table](#comparison-table)
7. [Recommended Method](#recommended-method)

---

## Method 1: Sanity Studio Online (Visual Builder)

### **What It Is:**
Use Sanity's web-based Studio interface to create schemas visually - no coding required.

### **Pros:**
- ✅ No coding required
- ✅ Visual interface
- ✅ Quick setup
- ✅ Beginner-friendly
- ✅ Works immediately

### **Cons:**
- ⚠️ Limited customization
- ⚠️ Less control over advanced features
- ⚠️ Can't version control schema easily

### **How To Use:**

#### Step 1: Access Studio
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Click **"Open Studio"**

#### Step 2: Navigate to Schema
1. Look for **"Schema"** or **"Structure"** in left sidebar
2. Click on it
3. You'll see existing document types (if any)

#### Step 3: Create New Document Type
1. Click **"Add document type"** or **"Create new type"** button
2. Enter name: `jewelryDesign`
3. Click **"Create"**

#### Step 4: Add Fields
1. Click **"Add field"** button
2. For each field:
   - **Field name:** e.g., `title`
   - **Field type:** Select from dropdown (String, Text, Image, etc.)
   - **Required:** Check if needed
   - **Options:** Configure field-specific options
3. Repeat for all fields

#### Step 5: Save
1. Click **"Save"** or **"Publish"**
2. Schema is now active!

### **Best For:**
- Beginners
- Quick prototypes
- Simple schemas
- Non-developers

---

## Method 2: Local Sanity Studio (Code-Based)

### **What It Is:**
Install Sanity Studio locally and define schemas using TypeScript/JavaScript files.

### **Pros:**
- ✅ Full control and customization
- ✅ Version control (Git)
- ✅ Advanced features
- ✅ Type safety with TypeScript
- ✅ Better for teams
- ✅ Can use all Sanity features

### **Cons:**
- ⚠️ Requires coding knowledge
- ⚠️ More setup time
- ⚠️ Need to run locally

### **How To Use:**

#### Step 1: Install Sanity CLI
```bash
npm install -g @sanity/cli
```

#### Step 2: Login
```bash
sanity login
```

#### Step 3: Initialize Studio
```bash
cd jewelry-website
sanity init --env
```

When prompted:
- Select your project
- Select dataset: `production`
- Output path: `./studio` (or press Enter)
- Template: **"Clean project with no predefined schemas"**

#### Step 4: Create Schema File
Create `studio/schemas/jewelryDesign.ts`:

```typescript
export default {
  name: 'jewelryDesign',
  title: 'Jewelry Design',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in USD',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Rings', value: 'rings' },
          { title: 'Necklaces', value: 'necklaces' },
          { title: 'Earrings', value: 'earrings' },
          { title: 'Bracelets', value: 'bracelets' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
}
```

#### Step 5: Register Schema
Edit `studio/schemas/index.ts`:

```typescript
import jewelryDesign from './jewelryDesign'

export const schemaTypes = [jewelryDesign]
```

#### Step 6: Run Studio
```bash
cd studio
npm install
sanity start
```

Studio opens at `http://localhost:3333`

#### Step 7: Deploy Schema
```bash
sanity deploy
```

### **Best For:**
- Developers
- Complex schemas
- Team projects
- Production applications
- Version control needs

---

## Method 3: Sanity CLI Schema Commands

### **What It Is:**
Use Sanity CLI commands to generate and manage schemas.

### **Pros:**
- ✅ Quick generation
- ✅ Consistent structure
- ✅ Good for scaffolding

### **Cons:**
- ⚠️ Limited customization
- ⚠️ Still need to edit files
- ⚠️ Less common method

### **How To Use:**

#### Step 1: Install CLI
```bash
npm install -g @sanity/cli
```

#### Step 2: Initialize Project
```bash
sanity init
```

#### Step 3: Use Schema Generator
```bash
# Generate a document type
sanity schema generate

# Or use templates
sanity init --template blog
```

### **Best For:**
- Quick prototyping
- Using templates
- Learning Sanity

---

## Method 4: Sanity Management API

### **What It Is:**
Programmatically create schemas using Sanity's Management API.

### **Pros:**
- ✅ Automation possible
- ✅ Can be scripted
- ✅ Good for migrations

### **Cons:**
- ⚠️ Complex
- ⚠️ Requires API knowledge
- ⚠️ Not recommended for beginners

### **How To Use:**

#### Step 1: Install SDK
```bash
npm install @sanity/client
```

#### Step 2: Create Script
```javascript
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  token: 'your-management-token', // Needs write permissions
  useCdn: false,
  apiVersion: '2024-01-01',
});

// Define schema
const schema = {
  name: 'jewelryDesign',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'description', type: 'text' },
    // ... more fields
  ],
};

// Create via API (complex - not commonly used)
// This is advanced and requires deep API knowledge
```

### **Best For:**
- Advanced users
- Automation
- Migrations
- CI/CD pipelines

---

## Method 5: Import/Export Schema

### **What It Is:**
Export schema from one project and import to another.

### **Pros:**
- ✅ Reuse schemas
- ✅ Share between projects
- ✅ Backup schemas

### **Cons:**
- ⚠️ Need existing schema first
- ⚠️ May need adjustments

### **How To Use:**

#### Export Schema
```bash
# Export schema configuration
sanity schema extract > schema.json
```

#### Import Schema
```bash
# Import to another project
sanity schema import schema.json
```

### **Best For:**
- Copying schemas
- Backing up
- Sharing between projects

---

## 📊 Comparison Table

| Method | Difficulty | Speed | Control | Best For |
|--------|-----------|-------|---------|----------|
| **Online Studio** | ⭐ Easy | ⚡⚡⚡ Fast | ⭐⭐ Low | Beginners, Quick setup |
| **Local Studio** | ⭐⭐⭐ Medium | ⚡⚡ Medium | ⭐⭐⭐⭐⭐ Full | Developers, Production |
| **CLI Commands** | ⭐⭐ Medium | ⚡⚡⚡ Fast | ⭐⭐⭐ Medium | Templates, Scaffolding |
| **Management API** | ⭐⭐⭐⭐⭐ Hard | ⚡ Slow | ⭐⭐⭐⭐ High | Automation, Advanced |
| **Import/Export** | ⭐⭐ Medium | ⚡⚡ Medium | ⭐⭐⭐ Medium | Copying, Backup |

---

## 🎯 Recommended Method

### **For Beginners:**
**Method 1: Online Studio** (Visual Builder)
- Easiest to start
- No coding required
- Get started in 5 minutes

### **For Developers:**
**Method 2: Local Studio** (Code-Based)
- Full control
- Version control
- Production-ready
- Best long-term solution

### **Quick Start Path:**
1. **Start with Method 1** (Online Studio) to get something working quickly
2. **Move to Method 2** (Local Studio) when you need more control
3. **Use Method 5** (Import/Export) to migrate between projects

---

## 💡 Which Method Should You Use?

### **Choose Method 1 (Online Studio) if:**
- ✅ You're new to Sanity
- ✅ You want to get started quickly
- ✅ You don't need version control
- ✅ You're not a developer
- ✅ You have simple schema needs

### **Choose Method 2 (Local Studio) if:**
- ✅ You're a developer
- ✅ You need version control
- ✅ You want full customization
- ✅ You're working in a team
- ✅ You need advanced features
- ✅ You're building for production

### **Choose Method 3 (CLI) if:**
- ✅ You want to use templates
- ✅ You're learning Sanity
- ✅ You need quick scaffolding

### **Choose Method 4 (API) if:**
- ✅ You need automation
- ✅ You're building tools
- ✅ You're an advanced user

### **Choose Method 5 (Import/Export) if:**
- ✅ You're copying schemas
- ✅ You need backups
- ✅ You're migrating projects

---

## 🚀 Quick Start Recommendation

**For your jewelry website:**

1. **Start with Method 1** (Online Studio):
   - Get schema created in 5 minutes
   - Add your first design
   - See it working on your website

2. **Later, move to Method 2** (Local Studio):
   - When you need more control
   - When working with a team
   - For production deployment

---

## 📚 Related Guides

- **[Schema Setup Guide](SANITY_SCHEMA_SETUP.md)** - Detailed setup instructions
- **[Sanity.io Setup](SANITY_SETUP.md)** - Complete Sanity.io configuration
- **[Quick Fix Guide](../QUICK_FIX_NO_DESIGNS.md)** - If no designs showing

---

## ❓ FAQ

**Q: Can I switch between methods?**
A: Yes! You can start with Online Studio and later move to Local Studio.

**Q: Which method is best for production?**
A: Method 2 (Local Studio) is recommended for production - better control and version control.

**Q: Do I need to code for Method 1?**
A: No! Method 1 is completely visual - no coding required.

**Q: Can I use multiple methods?**
A: Yes, but typically you'll use one primary method. You can export/import between methods.

**Q: Which is fastest?**
A: Method 1 (Online Studio) is the fastest to get started.

---

**Choose the method that fits your needs and experience level!** 🎯

