# Typography Guide - Design Implementation

## 🎨 Typography System

This guide documents the typography system matching the CELESTIQUE design.

---

## 📝 Font Families

### **Serif Font (Playfair Display)**
Used for:
- Brand name (CELESTIQUE)
- Section headings (ABOUT US, OUR PRODUCTS, etc.)
- Tagline

**Characteristics:**
- Elegant, classic serif
- Large sizes for impact
- Letter spacing: 0.08em - 0.15em
- Light grey color (#9a9a9a) for section headings
- Dark grey (#2c2c2c) for brand name

### **Sans-Serif Font (Inter/System)**
Used for:
- Body text
- Navigation
- Buttons
- Product information

**Characteristics:**
- Clean, modern sans-serif
- Readable sizes
- Standard letter spacing

---

## 📏 Font Sizes

### **Brand Name**
- **Size:** Responsive (clamp: 2rem - 4rem)
- **Weight:** 400 (regular)
- **Letter Spacing:** 0.15em
- **Color:** #2c2c2c (dark grey)
- **Decoration:** Star/diamond (✦) on the 'I'

### **Tagline**
- **Size:** text-sm md:text-base (14px - 16px)
- **Weight:** 400 (regular)
- **Letter Spacing:** 0.1em
- **Color:** #9a9a9a (light grey)

### **Section Headings** (ABOUT US, OUR PRODUCTS, etc.)
- **Size:** Responsive (clamp: 2.5rem - 5rem)
- **Weight:** 400 (regular)
- **Letter Spacing:** 0.1em
- **Color:** #9a9a9a (light grey)
- **Style:** Uppercase, serif font

### **Hero Collection Title** (COLLECTION 2025)
- **Size:** Responsive (clamp: 1.5rem - 3rem)
- **Weight:** 700 (bold)
- **Letter Spacing:** 0.15em
- **Color:** #4a4a4a (medium grey)
- **Style:** Uppercase, sans-serif

### **Body Text**
- **Size:** text-base md:text-lg (16px - 18px)
- **Weight:** 400 (regular)
- **Line Height:** Relaxed (1.6 - 1.8)
- **Color:** #6a6a6a (medium grey)

### **Product Titles**
- **Size:** text-base md:text-lg (16px - 18px)
- **Weight:** 600 (semibold)
- **Color:** #2c2c2c (dark grey)

### **Product Material/Price**
- **Size:** text-sm md:text-base (14px - 16px)
- **Weight:** 400 (regular) for material, 700 (bold) for price
- **Color:** #9a9a9a (light grey) for material, #4a4a4a for price

### **Category Links**
- **Size:** text-base md:text-lg (16px - 18px)
- **Weight:** 500 (medium)
- **Letter Spacing:** Wide (0.05em)
- **Color:** #4a4a4a (medium grey)

---

## 🎨 Color Palette

### **Text Colors:**
- **Dark Grey (#2c2c2c):** Brand name, product titles, headings
- **Medium Grey (#4a4a4a):** Buttons, category links, prices
- **Light Grey (#6a6a6a):** Body text, descriptions
- **Very Light Grey (#9a9a9a):** Section headings, tagline, material text

### **Background Colors:**
- **Light Beige (#faf8f5):** Main background
- **Cream (#f5f1eb):** Card backgrounds, image placeholders
- **White (#ffffff):** Product cards

---

## ✨ Special Features

### **Star/Diamond Decoration**
- Added to the 'I' in CELESTIQUE
- Position: Above the 'I'
- Size: 0.5em - 0.6em
- Character: ✦ (star/diamond symbol)

### **Letter Spacing**
- Brand name: 0.15em (wide)
- Section headings: 0.1em (wide)
- Tagline: 0.1em (wide)
- Category links: 0.05em (moderate)

---

## 📐 Responsive Typography

All typography uses responsive sizing:
- **Mobile:** Smaller sizes for readability
- **Tablet:** Medium sizes
- **Desktop:** Larger sizes for impact

Using `clamp()` for smooth scaling:
```css
font-size: clamp(min, preferred, max);
```

---

## 🔤 Text Transformations

- **Uppercase:** Section headings, collection title, category names
- **Normal Case:** Body text, product titles, descriptions

---

## 📊 Typography Scale

| Element | Mobile | Desktop | Weight | Color |
|---------|--------|---------|--------|-------|
| Brand Name | 2rem | 4rem | 400 | #2c2c2c |
| Section Heading | 2.5rem | 5rem | 400 | #9a9a9a |
| Hero Title | 1.5rem | 3rem | 700 | #4a4a4a |
| Body Text | 16px | 18px | 400 | #6a6a6a |
| Product Title | 16px | 18px | 600 | #2c2c2c |
| Tagline | 14px | 16px | 400 | #9a9a9a |

---

## 💡 Best Practices

1. **Maintain Hierarchy:** Use size and weight to create visual hierarchy
2. **Consistent Spacing:** Use consistent letter spacing for brand elements
3. **Readability:** Ensure sufficient contrast between text and background
4. **Responsive:** All text should scale appropriately on different devices
5. **Brand Consistency:** Use serif font for all brand-related text

---

## 🎯 Implementation

All typography styles are defined in:
- `app/globals.css` - Base typography classes
- Component files - Specific implementations

**CSS Classes:**
- `.font-serif-brand` - Brand name and serif headings
- `.font-section-heading` - Large section headings
- `.font-hero-title` - Hero collection title

---

**Typography matches the elegant CELESTIQUE design!** ✨

