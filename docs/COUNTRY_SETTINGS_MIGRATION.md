# Country Settings & Validation Migration Guide

**Date:** Generated  
**Purpose:** Migration of country-specific hardcoded values to database-driven system

---

## 📋 Overview

This migration moves all country-specific hardcoded values to MongoDB, making the system multi-country capable:

1. **Country Settings Model** - Stores country-specific configuration
2. **Address Validation** - Country-aware validation rules
3. **Phone Validation** - Country-specific phone patterns
4. **Category Validation** - Dynamic validation against DB categories
5. **Image Helpers** - Removed hardcoded category lists
6. **Category Formatting** - Uses DB category.displayName

---

## 🚀 Running the Migration

### Step 1: Run Country Settings Migration

```bash
npm run migrate:country-settings
```

This will:
- Create India as default country with all settings
- Set up phone patterns, pincode patterns, states list
- Configure currency (INR, ₹)

### Step 2: Verify in MongoDB

Check MongoDB Atlas → Collections → `countrysettings`:
- Should have entry for `IN` (India) with `isDefault: true`

---

## 📝 What Was Changed

### 1. Country Settings Model (`models/CountrySettings.ts`)

**New Model Fields:**
- `countryCode` - ISO code (IN, US, etc.)
- `countryName` - Full name
- `phoneCountryCode` - Phone code (+91, +1, etc.)
- `phonePattern` - Regex for phone validation
- `phoneLength` - Expected phone length
- `pincodePattern` - Regex for postal code
- `pincodeLength` - Expected pincode length
- `pincodeLabel` - Field label (Pincode, ZIP Code, etc.)
- `states` - Array of valid states/provinces
- `currency` - Currency code
- `currencySymbol` - Currency symbol
- `isActive` - Enable/disable country
- `isDefault` - Mark as default country

### 2. Address Validation (`lib/validations/address-country-aware.ts`)

**New Functions:**
- `isValidPincode()` - Country-aware pincode validation
- `isValidState()` - Country-aware state validation
- `isValidPhone()` - Country-aware phone validation
- `createPincodeSchema()` - Zod schema with country validation
- `createStateSchema()` - Zod schema with country validation
- `createPhoneSchema()` - Zod schema with country validation
- `createAddressSchema()` - Complete address schema (country-aware)

**Replaces:** `lib/validations/address.ts` (India-specific)

### 3. User Model (`models/User.ts`)

**Changes:**
- Removed hardcoded `default: '+91'` from countryCode
- Added pre-save hook to set default country code from DB
- Mobile validation now uses country-specific patterns

### 4. Registration Route (`app/api/auth/register/route.ts`)

**Changes:**
- Country code validation against DB active countries
- Mobile validation uses country-specific patterns
- Default country code from DB if not provided

### 5. Product Model (`models/Product.ts`)

**Changes:**
- Removed hardcoded category enum
- Category validated against DB active categories in pre-save hook
- Currency default from DB country/ecommerce settings
- Allows 'other' as fallback category

### 6. Category Formatting (`lib/utils/text-formatting.ts`)

**Changes:**
- `formatCategoryName()` accepts optional `displayName` from DB
- Added `formatCategoryNameFromDB()` for DB category objects
- Falls back to hardcoded map only if DB unavailable

### 7. Image Helpers (`lib/utils/image-helpers.ts`)

**Changes:**
- Removed hardcoded category list fallback
- Returns empty array if no categories provided
- Uses DB category.image values

### 8. Category Helpers (`lib/utils/category-helpers.ts`) - NEW

**New Functions:**
- `getCategoryDisplayName()` - Get display name from DB
- `getCategorySlugs()` - Get all category slugs from DB
- `isValidCategorySlug()` - Validate category against DB

---

## 🔄 Fallback Strategy

All functions use a **fallback chain**:

1. **Database values** (from MongoDB)
2. **Constants** (from `lib/constants.ts` - DEFAULT_COUNTRY)

This ensures:
- ✅ App works even if DB is unavailable
- ✅ No breaking changes to existing code
- ✅ Easy migration path

---

## 📊 Database Structure

### Country Settings Collection

```typescript
{
  countryCode: 'IN',
  countryName: 'India',
  phoneCountryCode: '+91',
  phonePattern: '^[0-9]{10}$',
  phoneLength: 10,
  pincodePattern: '^[0-9]{6}$',
  pincodeLength: 6,
  pincodeLabel: 'Pincode',
  states: ['Andhra Pradesh', 'Assam', ...],
  currency: 'INR',
  currencySymbol: '₹',
  isActive: true,
  isDefault: true,
  order: 0
}
```

---

## 🔧 Adding New Countries

### Via Migration Script

Edit `scripts/migrate-country-settings.ts` and add:

```typescript
const usaData = {
  countryCode: 'US',
  countryName: 'United States',
  phoneCountryCode: '+1',
  phonePattern: '^[0-9]{10}$',
  phoneLength: 10,
  pincodePattern: '^[0-9]{5}(-[0-9]{4})?$',
  pincodeLength: 5,
  pincodeLabel: 'ZIP Code',
  states: [], // Add US states if needed
  currency: 'USD',
  currencySymbol: '$',
  isActive: true,
  isDefault: false,
  order: 1,
};
```

### Via MongoDB Atlas UI

1. Go to MongoDB Atlas → Collections → `countrysettings`
2. Click "Insert Document"
3. Add country data following the schema
4. Set `isDefault: false` (only one default allowed)

---

## 💡 Usage Examples

### Example 1: Get Default Country

```typescript
import { getDefaultCountryWithFallback } from '@/lib/utils/country-helpers';

const country = await getDefaultCountryWithFallback();
console.log(country.phoneCountryCode); // '+91'
console.log(country.currency); // 'INR'
```

### Example 2: Validate Address by Country

```typescript
import { createAddressSchema } from '@/lib/validations/address-country-aware';

const addressSchema = createAddressSchema('IN'); // India
const result = await addressSchema.safeParseAsync(addressData);
```

### Example 3: Get Category Display Name

```typescript
import { getCategoryDisplayName } from '@/lib/utils/category-helpers';

const displayName = await getCategoryDisplayName('rings');
console.log(displayName); // 'Rings' (from DB)
```

### Example 4: Validate Category in Product

```typescript
// Product model automatically validates category against DB
// in pre-save hook - no code changes needed
const product = new Product({
  category: 'rings', // Validated against DB
  // ...
});
await product.save(); // Will validate category exists and is active
```

---

## ⚠️ Important Notes

1. **Backward Compatibility**: All existing code continues to work with fallbacks
2. **Default Country**: Only one country can be `isDefault: true`
3. **Active Countries**: Only countries with `isActive: true` are used
4. **Category Validation**: Products must use active category slugs or 'other'
5. **Phone Validation**: Uses country-specific patterns from DB
6. **Address Validation**: Use new `address-country-aware.ts` instead of old `address.ts`

---

## 📝 Migration Checklist

- [x] Created `CountrySettings` model
- [x] Created country settings data access layer
- [x] Created country helper functions
- [x] Updated User model (country code, mobile validation)
- [x] Updated registration route (country-aware validation)
- [x] Updated Product model (dynamic category validation, currency)
- [x] Updated category formatting (use DB displayName)
- [x] Updated image helpers (removed hardcoded lists)
- [x] Created country-aware address validation
- [x] Created migration script
- [x] Added DEFAULT_COUNTRY constant as fallback
- [x] Added migration script to package.json

---

## 🎯 Next Steps

1. **Run Migration**: `npm run migrate:country-settings`
2. **Update Address Forms**: Use new country-aware validation schemas
3. **Add More Countries**: Extend migration script or add via MongoDB
4. **Test**: Verify registration, address forms, product creation
5. **Update Components**: Use category helpers instead of hardcoded values

---

## 🔍 Files Changed

**New Files:**
- `models/CountrySettings.ts` - Country settings model
- `lib/data/country-settings.ts` - Country data access layer
- `lib/utils/country-helpers.ts` - Country helper functions
- `lib/utils/category-helpers.ts` - Category helper functions
- `lib/validations/address-country-aware.ts` - Country-aware address validation
- `scripts/migrate-country-settings.ts` - Migration script

**Updated Files:**
- `models/User.ts` - Country code, mobile validation
- `models/Product.ts` - Dynamic category validation, currency
- `app/api/auth/register/route.ts` - Country-aware validation
- `lib/utils/text-formatting.ts` - Category formatting with DB
- `lib/utils/image-helpers.ts` - Removed hardcoded lists
- `lib/constants.ts` - Added DEFAULT_COUNTRY constant
- `package.json` - Added migration script

---

## ✅ Benefits

1. **Multi-Country Support**: Easy to add new countries
2. **Configurable**: Change validation rules without code changes
3. **Industry Standard**: Follows best practices for internationalization
4. **Safe Fallbacks**: App works even if DB unavailable
5. **Type-Safe**: Full TypeScript support
6. **Dynamic Validation**: Categories and countries validated against DB
