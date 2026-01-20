# Category Active Field Guide

## Overview

The `active` boolean field in the Category model controls whether a category is visible and accessible throughout the application. When `active: false`, the category and its products are hidden from all user-facing features.

## Implementation

### Database Model

**File:** `models/Category.ts`

```typescript
active: {
  type: Boolean,
  default: true,
  index: true,
}
```

- **Default:** `true` (all categories are enabled by default)
- **Indexed:** For fast queries filtering by active status

### Data Fetching Functions

All data fetching functions automatically filter by `active: true`:

#### 1. Categories (`lib/data/categories.ts`)

- `getCategories()` - Only returns categories where `active: true`
- `getCategory(slug)` - Only returns category if `active: true`

#### 2. Products (`lib/data/products.ts`)

- `getProducts(category?)` - Only returns products from active categories
- `getProduct(slug)` - Only returns product if its category is active
- `getMostLovedProducts()` - Only includes products from active categories
- `getRelatedProducts()` - Only returns products if category is active
- `getCategoryImages()` - Only returns images for active categories

### API Routes

**File:** `app/api/products/route.ts`

- Dynamically loads active categories from database
- Only accepts category filters for active categories
- Products are automatically filtered by active categories

### Migration Script

**File:** `scripts/migrate-to-mongodb.ts`

- Migrates all 4 categories (rings, earrings, necklaces, bracelets)
- Sets `active: true` by default for all migrated categories
- You can disable categories later by updating `active: false` in MongoDB

## How to Enable/Disable Categories

### Method 1: MongoDB Atlas UI

1. Go to MongoDB Atlas → Collections
2. Select `categories` collection
3. Find the category document
4. Edit the `active` field:
   - `true` = Category is visible
   - `false` = Category is hidden

### Method 2: MongoDB Shell

```javascript
// Disable a category
db.categories.updateOne(
  { slug: "bracelets" },
  { $set: { active: false } }
);

// Enable a category
db.categories.updateOne(
  { slug: "bracelets" },
  { $set: { active: true } }
);
```

### Method 3: Admin Panel (Future)

When you build an admin panel, add a toggle to enable/disable categories.

## Behavior When Category is Disabled

When a category has `active: false`:

1. ✅ **Category won't appear** in category lists
2. ✅ **Products from that category won't appear** in product listings
3. ✅ **Category filter won't work** in API routes
4. ✅ **Category images won't be returned** in `getCategoryImages()`
5. ✅ **Related products won't include** products from inactive categories
6. ✅ **Product detail pages** for products in inactive categories won't be accessible

## Best Practices

1. **Always check `active: true`** when querying categories
2. **Verify category is active** before filtering products by category
3. **Use database queries** instead of hardcoded category lists
4. **Update category counts** after enabling/disabling categories
5. **Test thoroughly** after disabling categories to ensure no broken links

## Example Queries

### Get All Active Categories

```typescript
const activeCategories = await Category.find({ active: true })
  .sort({ order: 1 });
```

### Get Products from Active Categories Only

```typescript
// Get active category slugs
const activeCategories = await Category.find({ active: true })
  .select('slug')
  .lean();
const activeCategorySlugs = activeCategories.map(cat => cat.slug);

// Filter products
const products = await Product.find({
  status: 'active',
  category: { $in: activeCategorySlugs }
});
```

### Verify Category is Active Before Use

```typescript
const category = await Category.findOne({ 
  slug: categorySlug,
  active: true 
});

if (!category) {
  // Category is inactive or doesn't exist
  return [];
}
```

## Migration Notes

- All 4 categories are migrated with `active: true`
- You can disable any category after migration
- Disabled categories remain in database but are hidden from users
- Re-enable by setting `active: true` again
