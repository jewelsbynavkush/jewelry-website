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

**Standard Grid Gap:** `gap-4 sm:gap-5 md:gap-6 lg:gap-8`

**Applied to:**
- Product grids
- Card grids
- Layout grids

**Responsive Breakpoints:**
- Mobile: `gap-4` (16px)
- Tablet: `sm:gap-5` (20px)
- Desktop: `md:gap-6` (24px)
- Large Desktop: `lg:gap-8` (32px)

**Large Gap:** `gap-6 sm:gap-8 md:gap-10 lg:gap-12`
- Used for: Section spacing, large layouts

**Small Gap:** `gap-3 sm:gap-4 md:gap-6`
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

**Standard:** `border-[#e8e5e0]`

**Applied to:**
- All cards
- All input fields
- All dividers

**Variants:**
- Light border: `border-[#e8e5e0]` - **Standard**
- White border: `border-white/30` - Headers/footers

---

### **6. Background Colors** ✅

**Standard Colors:**
- Beige: `bg-[#CCC4BA]` - Primary background
- Cream: `bg-[#faf8f5]` - Secondary background
- Light Beige: `bg-[#f5f1eb]` - Placeholder backgrounds

---

### **7. Text Colors** ✅

**Standard Colors:**
- On Beige: `text-white`
- On Cream: `text-[#2c2c2c]`
- Secondary: `text-[#6a6a6a]`
- Muted: `text-[#9a9a9a]`
- Dark: `text-[#4a4a4a]`

---

### **8. Card Styling** ✅

**Standard Card Classes:**
```css
bg-[#faf8f5] rounded-lg border border-[#e8e5e0] p-6 sm:p-8 hover:shadow-lg transition-shadow
```

**Applied to:**
- Product cards
- Info cards
- Contact cards

---

### **9. Input Styling** ✅

**Standard Input Classes:**
```css
w-full px-4 py-3 border border-[#e8e5e0] rounded-lg focus:outline-none focus:border-[#4a4a4a] bg-[#faf8f5] min-h-[44px] text-base
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

**Colors:**
- Primary: `rgb(51, 45, 41)` background, `rgb(255, 255, 255)` text
- Outline: Transparent background, `rgb(51, 45, 41)` border and text

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
- Mobile: `gap-4`
- Tablet: `sm:gap-5` or `sm:gap-6`
- Desktop: `md:gap-6` or `md:gap-8`
- Large: `lg:gap-8` or `lg:gap-12`

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
- ✅ All cards use `rounded-lg`
- ✅ All borders use `border-[#e8e5e0]`
- ✅ All inputs use standard styling
- ✅ All buttons use standard styling

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

