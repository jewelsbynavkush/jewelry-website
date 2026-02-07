# Site Settings & E-commerce Migration Guide

**Date:** Generated  
**Purpose:** Migration of brand/content values and e-commerce configuration from constants to database

---

## 📋 Overview

This migration moves hardcoded values from `lib/constants.ts` and `data/site-settings.json` to MongoDB site-settings collection, making them configurable without code changes.

### What Was Migrated

1. **Brand & Content Values** (from `DEFAULTS` constant):
   - Brand name
   - Hero title
   - Hero button text
   - About button text
   - Right column slogan

2. **E-commerce Configuration** (from `ECOMMERCE` constant):
   - Currency & currency symbol
   - Shipping configuration (days, cost, threshold)
   - Tax rate & calculation
   - Cart expiration settings
   - Quantity limits

3. **Contact Information** (from `site-settings.json`):
   - Email (uses `CONTACT_EMAIL` env var if available)
   - Phone (uses `CONTACT_PHONE` env var if available)
   - Address (uses `CONTACT_ADDRESS` env var if available)

---

## 🚀 Running the Migration

### Step 1: Run Migration Script

```bash
npm run migrate:site-settings
```

This will:
- Create/update `general` settings (brand, intro)
- Create/update `hero` settings
- Create/update `about` settings
- Create/update `contact` settings (uses env vars if available)
- Create `ecommerce` settings type (new)

### Step 2: Verify in MongoDB

Check MongoDB Atlas → Collections → `site_settings`:
- Should have entries for: `general`, `hero`, `about`, `contact`, `social`, `seo`, `ecommerce`

---

## 📝 Using the New System

### For Server Components

#### Brand & Content Values

```typescript
import { getSiteSettings } from '@/lib/data/site-settings';
import { DEFAULTS } from '@/lib/constants';

// Get all settings
const settings = await getSiteSettings();

// Use with fallback
const brandName = settings.brand?.name || DEFAULTS.brandName;
const heroTitle = settings.hero?.title || DEFAULTS.heroTitle;
```

#### E-commerce Settings

```typescript
import { getEcommerceSettings } from '@/lib/utils/site-settings-helpers';
import { ECOMMERCE } from '@/lib/constants';

// Get all ecommerce settings (with fallback)
const ecommerce = await getEcommerceSettings();

// Or get individual values
import { getCurrency, getTaxRate, getFreeShippingThreshold } from '@/lib/utils/site-settings-helpers';

const currency = await getCurrency();
const taxRate = await getTaxRate();
const threshold = await getFreeShippingThreshold();
```

### Helper Functions Available

**Brand & Content:**
- `getBrandName()` - Returns brand name from DB with fallback
- `getHeroTitle()` - Returns hero title from DB with fallback
- `getHeroButtonText()` - Returns hero button text from DB with fallback
- `getAboutButtonText()` - Returns about button text from DB with fallback
- `getRightColumnSlogan()` - Returns right column slogan from DB with fallback

**E-commerce:**
- `getEcommerceSettings()` - Returns all ecommerce settings with fallback
- `getCurrency()` - Returns currency code
- `getCurrencySymbol()` - Returns currency symbol
- `getTaxRate()` - Returns tax rate
- `getFreeShippingThreshold()` - Returns free shipping threshold

All helper functions are in: `lib/utils/site-settings-helpers.ts`

---

## 🔄 Fallback Strategy

The system uses a **fallback chain**:

1. **Database values** (from MongoDB site-settings)
2. **Constants** (from `lib/constants.ts` - DEFAULTS/ECOMMERCE)

This ensures:
- ✅ App works even if DB is unavailable
- ✅ No breaking changes to existing code
- ✅ Easy migration path

---

## 📊 Database Structure

### Site Settings Collection

Each document has:
```typescript
{
  type: 'general' | 'hero' | 'about' | 'contact' | 'social' | 'seo' | 'ecommerce',
  data: {
    // Type-specific data structure
  },
  updatedAt: Date
}
```

### E-commerce Settings Structure

```typescript
{
  type: 'ecommerce',
  data: {
    ecommerce: {
      currency: 'INR',
      currencySymbol: '₹',
      defaultShippingDays: 5,
      freeShippingThreshold: 5000,
      defaultShippingCost: 100,
      returnWindowDays: 30,
      taxRate: 0.18,
      calculateTax: true,
      priceVarianceThreshold: 0.1,
      guestCartExpirationDays: 30,
      userCartExpirationDays: null,
      maxQuantityPerItem: 100,
      maxCartItems: 1000,
    }
  }
}
```

---

## 🔧 Updating Values

### Via MongoDB Atlas UI

1. Go to MongoDB Atlas → Collections → `site_settings`
2. Find document with `type: 'ecommerce'` (or other type)
3. Edit the `data` field
4. Save changes

### Via Code (Migration Script)

Update `scripts/migrate-site-settings.ts` and run:
```bash
npm run migrate:site-settings
```

---

## ⚠️ Important Notes

1. **Constants Still Exist**: `DEFAULTS` and `ECOMMERCE` constants remain as fallbacks. They should NOT be removed.

2. **Backward Compatibility**: All existing code using `DEFAULTS` and `ECOMMERCE` will continue to work. The constants serve as fallbacks.

3. **Reuse Values**: Helper functions reuse constants as fallbacks, avoiding duplication.

4. **Server Components Only**: Helper functions are async and work only in server components. For client components, pass values as props.

5. **Environment Variables**: Contact information (email, phone, address) can be set via env vars:
   - `CONTACT_EMAIL`
   - `CONTACT_PHONE`
   - `CONTACT_ADDRESS`

---

## 📝 Migration Checklist

- [x] Updated `SiteSettings` model to include `ecommerce` type
- [x] Updated `types/data.ts` to include ecommerce settings
- [x] Created migration script `scripts/migrate-site-settings.ts`
- [x] Updated `getSiteSettings()` to fetch ecommerce settings
- [x] Updated constants with fallback notes
- [x] Created helper functions in `lib/utils/site-settings-helpers.ts`
- [x] Updated `text-formatting.ts` to accept brand name parameter
- [x] Added migration script to `package.json`

---

## 🎯 Next Steps

1. **Run Migration**: `npm run migrate:site-settings`
2. **Update Code**: Gradually update code to use helper functions instead of direct constants
3. **Test**: Verify all functionality works with DB values
4. **Monitor**: Check that fallbacks work if DB is unavailable

---

## 🔍 Files Changed

- `models/SiteSettings.ts` - Added `ecommerce` type
- `types/data.ts` - Added ecommerce settings type
- `lib/data/site-settings.ts` - Fetch ecommerce settings
- `lib/constants.ts` - Added fallback notes
- `lib/utils/text-formatting.ts` - Updated getBrandName()
- `lib/utils/site-settings-helpers.ts` - **NEW** - Helper functions
- `scripts/migrate-site-settings.ts` - **NEW** - Migration script
- `package.json` - Added migration script command

---

## 💡 Usage Examples

### Example 1: Using E-commerce Settings in Cart

```typescript
import { getEcommerceSettings } from '@/lib/utils/site-settings-helpers';

export default async function CartPage() {
  const ecommerce = await getEcommerceSettings();
  
  return (
    <div>
      <p>Currency: {ecommerce.currencySymbol}</p>
      <p>Free shipping over: {ecommerce.freeShippingThreshold}</p>
      <p>Tax rate: {(ecommerce.taxRate * 100).toFixed(0)}%</p>
    </div>
  );
}
```

### Example 2: Using Brand Name

```typescript
import { getBrandName } from '@/lib/utils/site-settings-helpers';

export default async function Header() {
  const brandName = await getBrandName();
  
  return <h1>{brandName}</h1>;
}
```

### Example 3: Fallback in Constants

```typescript
import { getSiteSettings } from '@/lib/data/site-settings';
import { DEFAULTS } from '@/lib/constants';

const settings = await getSiteSettings();
const heroTitle = settings.hero?.title || DEFAULTS.heroTitle; // DB first, then constant
```

---

## ✅ Benefits

1. **Configurable**: Change values without code deployment
2. **Environment-Specific**: Different values for dev/staging/prod
3. **Safe Fallbacks**: App works even if DB is unavailable
4. **Reusable**: Helper functions reduce code duplication
5. **Type-Safe**: Full TypeScript support
