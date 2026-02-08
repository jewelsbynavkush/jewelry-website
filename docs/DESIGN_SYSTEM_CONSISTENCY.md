# Design System Consistency Guide

**Date:** Current  
**Status:** ✅ **STANDARDIZED**

---

## 📋 **STANDARDIZED DESIGN TOKENS**

### **1. Container Padding** ✅

**Standard:** `px-4 sm:px-6`

**Applied to:**
- All page containers
- All section containers
- All component containers

**Responsive Breakpoints:**
- Mobile: `px-4` (16px)
- Tablet+: `sm:px-6` (24px)

---

### **2. Section Padding** ✅

**Standard:** `py-12 sm:py-16 md:py-20 lg:py-24`

**Applied to:**
- All main page sections
- All content sections

**Responsive Breakpoints:**
- Mobile: `py-12` (48px)
- Tablet: `sm:py-16` (64px)
- Desktop: `md:py-20` (80px)
- Large Desktop: `lg:py-24` (96px)

**Smaller Variant:** `py-8 sm:py-12 md:py-16`
- Used for: Compact sections, headers, footers

---

### **3. Gap Spacing** ✅

**Standard Grid Gap (use `.standard-gap` or same values):** `gap-4 sm:gap-6 md:gap-8 lg:gap-12`

**Applied to:**
- Product grids
- Card grids
- Layout grids

**Responsive Breakpoints:**
- Mobile: `gap-4` (16px)
- Tablet: `sm:gap-6` (24px)
- Desktop: `md:gap-8` (32px)
- Large Desktop: `lg:gap-12` (48px)

**Large Gap:** `gap-6 sm:gap-8 md:gap-10 lg:gap-12`
- Used for: Section spacing, large layouts

**Small Gap (use `.standard-gap-small`):** `gap-3 sm:gap-4 md:gap-6`
- Used for: Tight layouts, filter buttons

---

### **4. Border Radius** ✅

**Standard:** `rounded-lg`

**Applied to:**
- All cards
- All images
- All input fields
- All buttons (rounded-full)

**Variants:**
- Small: `rounded` (4px)
- Medium: `rounded-lg` (8px) - **Standard**
- Large: `rounded-xl` (12px)
- Full: `rounded-full` (9999px) - Buttons only

---

### **5. Border Colors** ✅

**Standard (Always use CSS variables):**
- Light border: `border-[var(--border-light)]` - **Standard** (#e8e5e0)
- White border: `border-[var(--border-white-light)]` - For beige backgrounds (rgba(255, 255, 255, 0.3))
- Status borders: `border-[var(--success-border)]`, `border-[var(--error-border)]`

**Applied to:**
- All cards
- All input fields
- All dividers

**Note:** Never use hardcoded colors. Always use CSS variables for consistency.

---

### **6. Background Colors** ✅

**Standard Colors (Always use CSS variables):**
- Beige: `bg-[var(--beige)]` - Primary background (#CCC4BA)
- Cream: `bg-[var(--cream)]` - Secondary background (#faf8f5)
- Beige Hover: `bg-[var(--beige-hover)]` - Hover state (#b8afa3)

**Note:** Never use hardcoded colors. Always use CSS variables for consistency.

---

### **7. Text Colors** ✅

**Standard Colors (Always use CSS variables):**
- On Beige: `text-[var(--text-on-beige)]` - White text on beige
- On Cream: `text-[var(--text-on-cream)]` - Primary content on cream (headings, key values)
- Secondary: `text-[var(--text-secondary)]` - Labels, descriptions, metadata
- Muted: `text-[var(--text-muted)]` - Hints, optional text, separators
- Status: `text-[var(--success-text)]`, `text-[var(--error-text)]`, `text-[var(--warning-text)]`, `text-[var(--info-text)]`
- Active: `var(--active-dark)` - Dark gray for buttons

**Hierarchy:** See **Text color hierarchy (on cream backgrounds)** in [COLOR_CONSISTENCY_AUDIT_2025.md](./COLOR_CONSISTENCY_AUDIT_2025.md) for when to use primary vs secondary vs muted.

**Note:** Never use hardcoded colors. Always use CSS variables for consistency.

---

### **8. Card Styling** ✅

**Standard Card Classes:**
```css
bg-[var(--cream)] rounded-lg border border-[var(--border-light)] p-6 sm:p-8 hover:shadow-lg transition-shadow
```

**Applied to:**
- Product cards
- Info cards
- Contact cards

---

### **9. Input Styling** ✅

**Standard Input Classes:**
```css
w-full px-4 py-3 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--text-on-cream)] bg-[var(--cream)] text-[var(--text-on-cream)] min-h-[44px] text-base
```

**Applied to:**
- All text inputs
- All textareas
- All select fields

---

### **10. Button Styling** ✅

**Standard Button:**
```css
px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-full text-button transition-colors min-h-[44px] flex items-center justify-center text-center
```

**Colors (Using CSS variables):**
- Primary: `backgroundColor: 'var(--active-dark)'`, `color: 'var(--text-on-beige)'`
- Outline: `backgroundColor: 'transparent'`, `color: 'var(--text-on-cream)'`, `border: '2px solid var(--text-on-cream)'`

---

## 📱 **RESPONSIVE BREAKPOINTS**

### **Standard Breakpoints:**
- **Mobile:** Default (320px - 767px)
- **Tablet:** `sm:` (640px+)
- **Desktop:** `md:` (768px+)
- **Large Desktop:** `lg:` (1024px+)
- **XL Desktop:** `xl:` (1280px+)

### **Consistent Responsive Patterns:**

**Padding:**
- Mobile: Base value
- Tablet: `sm:` prefix
- Desktop: `md:` prefix
- Large: `lg:` prefix

**Gaps:**
- Standard (`.standard-gap`): `gap-4 sm:gap-6 md:gap-8 lg:gap-12`
- Small (`.standard-gap-small`): `gap-3 sm:gap-4 md:gap-6`
- Grid utilities: `.responsive-grid-2`, `.responsive-grid-3`, `.responsive-grid-4`

**Typography:**
- Mobile: Base size
- Tablet: `sm:text-*`
- Desktop: `md:text-*`
- Large: `lg:text-*`

---

## ✅ **VERIFICATION CHECKLIST**

### **Container Consistency:**
- ✅ All containers use `container mx-auto px-4 sm:px-6`
- ✅ No hardcoded padding values
- ✅ Consistent across all pages

### **Section Consistency:**
- ✅ All sections use `py-12 sm:py-16 md:py-20 lg:py-24`
- ✅ Consistent vertical spacing
- ✅ Proper responsive scaling

### **Grid Consistency:**
- ✅ All grids use standardized gap patterns
- ✅ Consistent spacing between items
- ✅ Proper responsive breakpoints

### **Component Consistency:**
- ✅ All cards use `rounded-lg` and `border-[var(--border-light)]`
- ✅ All borders use CSS variable `border-[var(--border-light)]`
- ✅ All inputs use standard styling (`.standard-input` or equivalent)
- ✅ All buttons use standard styling and `min-h-[44px]` / `.touch-target`

---

## 🎯 **STANDARDIZATION SUMMARY**

**Status:** ✅ **FULLY STANDARDIZED**

All design tokens are now consistent across:
- ✅ Container padding
- ✅ Section padding
- ✅ Gap spacing
- ✅ Border radius
- ✅ Border colors
- ✅ Background colors
- ✅ Text colors
- ✅ Card styling
- ✅ Input styling
- ✅ Button styling
- ✅ Responsive breakpoints

**Result:** The entire application now follows a unified design system with consistent spacing, colors, and styling across all devices.

---

**Last Updated:** Current  
**Maintained By:** Design System


