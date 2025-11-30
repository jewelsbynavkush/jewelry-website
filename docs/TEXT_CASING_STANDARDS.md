# Text Casing Standards & Best Practices

**Date:** November 2024  
**Status:** ✅ **Text Casing Standardized Across Application**

---

## 📋 **Text Casing Standards**

### **1. Brand Name** ✅
**Standard:** `Jewels by NavKush`

**Rules:**
- ✅ Always use `getBrandName()` utility function
- ✅ "NavKush" must have capital N and K (case-sensitive)
- ✅ Never use variations: "navkush", "Navkush", "navKush"

**Implementation:**
```typescript
import { getBrandName } from '@/lib/utils/text-formatting';
const brandName = getBrandName(); // Returns: "Jewels by NavKush"
```

**Used In:**
- ✅ All metadata (SEO)
- ✅ Structured data (Schema.org)
- ✅ Header brand name
- ✅ Footer brand name
- ✅ All page content

---

### **2. Category Names** ✅
**Standard:** Title Case (e.g., "Rings", "Earrings", "Necklaces", "Bracelets")

**Rules:**
- ✅ Always use `formatCategoryName()` utility function
- ✅ Title Case for normal display (e.g., "Rings")
- ✅ UPPERCASE for section headings (e.g., "RINGS")
- ✅ Never use lowercase or inconsistent casing

**Implementation:**
```typescript
import { formatCategoryName } from '@/lib/utils/text-formatting';

// Normal display (Title Case)
const category = formatCategoryName('rings'); // Returns: "Rings"

// Section headings (UPPERCASE)
const heading = formatCategoryName('rings').toUpperCase(); // Returns: "RINGS"
```

**Used In:**
- ✅ Category filter buttons
- ✅ Product detail pages
- ✅ Breadcrumbs
- ✅ Metadata
- ✅ Structured data

---

### **3. Navigation Menu Items** ✅
**Standard:** UPPERCASE

**Examples:**
- ✅ `ALL PRODUCTS`
- ✅ `RINGS`
- ✅ `EARRINGS`
- ✅ `NECKLACES`
- ✅ `BRACELETS`
- ✅ `ABOUT US`
- ✅ `CONTACT`

**Rules:**
- ✅ All navigation items in UPPERCASE
- ✅ Consistent across header and mobile menu
- ✅ Defined in `lib/constants.ts`

---

### **4. Section Headings** ✅
**Standard:** UPPERCASE

**Examples:**
- ✅ `ABOUT US`
- ✅ `OUR PRODUCTS`
- ✅ `OUR DESIGNS`
- ✅ `OUR MOST LOVED CREATIONS`
- ✅ `COLLECTION 2025`
- ✅ `CONTACT US`

**Rules:**
- ✅ All major section headings in UPPERCASE
- ✅ Consistent styling with `font-section-heading`
- ✅ Used for visual hierarchy and emphasis

---

### **5. Button Text** ✅
**Standard:** UPPERCASE

**Examples:**
- ✅ `DISCOVER`
- ✅ `MORE ABOUT US`
- ✅ `VIEW ALL`

**Rules:**
- ✅ All button text in UPPERCASE
- ✅ Consistent across all buttons
- ✅ Defined in `lib/constants.ts` or from CMS

---

### **6. Product Titles** ✅
**Standard:** Preserve Original Casing from CMS

**Rules:**
- ✅ Use `formatProductTitle()` utility function
- ✅ Preserves original casing from Sanity CMS
- ✅ Only trims whitespace
- ✅ No automatic capitalization

**Implementation:**
```typescript
import { formatProductTitle } from '@/lib/utils/text-formatting';
const title = formatProductTitle(design.title); // Preserves original casing
```

---

### **7. Body Text** ✅
**Standard:** Sentence Case

**Rules:**
- ✅ Normal sentence case for body text
- ✅ Proper capitalization at start of sentences
- ✅ Brand name always uses correct casing: "Jewels by NavKush"

**Examples:**
- ✅ "At Jewels by NavKush, we believe..."
- ✅ "Our commitment to excellence..."
- ✅ "Discover our collection..."

---

### **8. Footer Links** ✅
**Standard:** Title Case

**Examples:**
- ✅ `Our Story`
- ✅ `Materials`
- ✅ `Sustainability`
- ✅ `Shipping & Returns`
- ✅ `FAQs`
- ✅ `Contact Us`
- ✅ `Privacy Policy`
- ✅ `Terms of Service`

**Rules:**
- ✅ Title Case for footer links
- ✅ Consistent with navigation structure
- ✅ Defined in `lib/constants.ts`

---

## 🔧 **Utility Functions**

### **Location:** `lib/utils/text-formatting.ts`

**Functions:**
1. ✅ `capitalize(str)` - Capitalizes first letter
2. ✅ `titleCase(str)` - Title Case for each word
3. ✅ `formatCategoryName(category)` - Formats category (Title Case)
4. ✅ `getBrandName()` - Returns standardized brand name
5. ✅ `formatProductTitle(title)` - Preserves product title casing

---

## ✅ **Best Practices**

### **1. Always Use Utility Functions** ✅
- ✅ Never hardcode brand names
- ✅ Never manually format category names
- ✅ Use utility functions for consistency

### **2. Consistent Casing Rules** ✅
- ✅ UPPERCASE: Navigation, headings, buttons
- ✅ Title Case: Categories, footer links
- ✅ Sentence Case: Body text
- ✅ Preserve: Product titles (from CMS)

### **3. Case Sensitivity** ✅
- ✅ Brand name "NavKush" is case-sensitive
- ✅ Always use `getBrandName()` for brand name
- ✅ Never use variations of brand name

### **4. CSS Classes** ✅
- ✅ Remove `capitalize` CSS class when using utility functions
- ✅ Utility functions handle casing, not CSS
- ✅ CSS `capitalize` can conflict with utility functions

---

## 📊 **Verification Checklist**

### **Brand Name** ✅
- ✅ All instances use `getBrandName()`
- ✅ No hardcoded "Jewels by NavKush"
- ✅ Consistent "NavKush" casing (capital N and K)

### **Category Names** ✅
- ✅ All instances use `formatCategoryName()`
- ✅ Title Case for normal display
- ✅ UPPERCASE for headings (with `.toUpperCase()`)
- ✅ Sanity schema uses utility function

### **Navigation & Headings** ✅
- ✅ All navigation items in UPPERCASE
- ✅ All section headings in UPPERCASE
- ✅ Consistent across all pages

### **Product Titles** ✅
- ✅ Uses `formatProductTitle()` (preserves CMS casing)
- ✅ No automatic capitalization

### **Body Text** ✅
- ✅ Sentence case for body text
- ✅ Brand name uses correct casing

---

## 🎯 **Implementation Status**

### **Fixed Issues:**
1. ✅ Sanity schema now uses `formatCategoryName()` utility
2. ✅ Removed redundant `capitalize` CSS class from category links
3. ✅ All brand names use `getBrandName()` utility
4. ✅ All category names use `formatCategoryName()` utility

### **Consistent Usage:**
- ✅ Brand name: `getBrandName()` → "Jewels by NavKush"
- ✅ Categories: `formatCategoryName()` → "Rings", "Earrings", etc.
- ✅ Headings: UPPERCASE for emphasis
- ✅ Navigation: UPPERCASE for consistency
- ✅ Buttons: UPPERCASE for emphasis

---

## ✅ **Conclusion**

**Text casing is now standardized across the entire application:**

1. ✅ **Brand Name**: Consistent "Jewels by NavKush" (case-sensitive)
2. ✅ **Category Names**: Title Case via utility function
3. ✅ **Navigation**: UPPERCASE for consistency
4. ✅ **Headings**: UPPERCASE for emphasis
5. ✅ **Buttons**: UPPERCASE for emphasis
6. ✅ **Body Text**: Sentence case
7. ✅ **Product Titles**: Preserve CMS casing

**All text casing follows best practices and is consistent throughout the application!**

---

**Last Updated:** November 2024  
**Status:** ✅ **TEXT CASING STANDARDIZED - PRODUCTION READY**

