# MongoDB Models - Complete Guide

**Date:** January 2026  
**Status:** ✅ **ALL MODELS IMPLEMENTED**

---

## 📋 **Overview**

Complete guide to all MongoDB models used in the application, including structure, relationships, methods, and best practices.

---

## 🎯 **Models Overview**

```
models/
├── Product.ts          ✅ Product with inventory management
├── User.ts             ✅ Mobile-based user authentication
├── InventoryLog.ts     ✅ Inventory audit trail
├── Category.ts         ✅ Product categories
├── SiteSettings.ts    ✅ Site configuration
├── Cart.ts             ✅ Shopping cart
├── Order.ts            ✅ E-commerce orders
└── index.ts            ✅ Export all models
```

---

## 📦 **1. Product Model**

**File:** `models/Product.ts`

### **Purpose**
E-commerce product with comprehensive inventory management.

### **Key Features**
- ✅ SKU-based inventory tracking
- ✅ Stock quantity with reserved quantity
- ✅ Low stock alerts
- ✅ Backorder support
- ✅ Multi-image support
- ✅ SEO optimization
- ✅ Product status management
- ✅ Analytics (views, sales count)

### **Inventory Management**
- `inventory.quantity` - Current stock
- `inventory.reservedQuantity` - Items in carts
- `inventory.lowStockThreshold` - Alert threshold
- `inventory.trackQuantity` - Enable/disable tracking
- `inventory.allowBackorder` - Allow orders when out of stock

### **Methods**
- `canPurchase(quantity)` - Check if product can be purchased
- `reserveQuantity(quantity)` - Reserve stock for cart
- `releaseQuantity(quantity)` - Release reserved stock
- `updateStock(quantity, type)` - Update stock (sale/restock/adjustment)

### **Static Methods (Atomic Operations)**
- `Product.reserveStock()` - Atomic stock reservation
- `Product.releaseReservedStock()` - Atomic stock release
- `Product.confirmSale()` - Atomic sale confirmation
- `Product.restoreStock()` - Atomic stock restoration
- `Product.restock()` - Atomic restocking

**See:** [Inventory Guide](./INVENTORY_GUIDE.md) for detailed inventory flow and operations

---

## 👤 **2. User Model**

**File:** `models/User.ts`

### **Purpose**
Mobile-based user authentication and management.

### **Key Features**
- ✅ Mobile number as primary identifier (required, unique)
- ✅ Email optional (unique when provided)
- ✅ Password authentication (bcrypt hashed)
- ✅ OTP verification for mobile
- ✅ User roles (customer/admin/staff)
- ✅ Address management
- ✅ Account locking (5 failed attempts)
- ✅ User preferences

### **Methods**
- `comparePassword(password)` - Verify password
- `generateMobileOTP()` - Generate OTP for mobile verification
- `verifyMobileOTP(otp)` - Verify OTP
- `addAddress(address)` - Add shipping address
- `incrementLoginAttempts()` - Track failed login attempts
- `resetLoginAttempts()` - Reset after successful login

---

## 📊 **3. InventoryLog Model**

**File:** `models/InventoryLog.ts`

### **Purpose**
Audit trail for all inventory changes.

### **Key Features**
- ✅ Tracks all inventory operations (sale, restock, adjustment, return, reserved, released)
- ✅ Links to Product, Order, and User
- ✅ Idempotency key support
- ✅ Reason and notes fields
- ✅ Performed by tracking

### **Log Types**
- `sale` - Product sold
- `restock` - Stock added
- `adjustment` - Manual adjustment
- `return` - Stock returned
- `reserved` - Stock reserved for cart
- `released` - Reserved stock released

---

## 📁 **4. Category Model**

**File:** `models/Category.ts`

### **Purpose**
Product categories with hierarchy support.

### **Key Features**
- ✅ Active/inactive status
- ✅ Parent category support
- ✅ Display order
- ✅ SEO-friendly slugs

### **Fields**
- `active` - Enable/disable category
- `parentCategory` - Parent category reference
- `order` - Display order
- `slug` - URL-friendly identifier

**See:** `CATEGORY_ACTIVE_FIELD_GUIDE.md` for usage details

---

## ⚙️ **5. SiteSettings Model**

**File:** `models/SiteSettings.ts`

### **Purpose**
Site-wide configuration settings.

### **Key Features**
- ✅ Type-based settings (general, hero, about, contact, social, seo)
- ✅ Flexible data structure
- ✅ Multiple setting types

---

## 🛒 **6. Cart Model**

**File:** `models/Cart.ts`

### **Purpose**
Shopping cart for authenticated and guest users.

### **Key Features**
- ✅ User-based carts (authenticated)
- ✅ Session-based carts (guest)
- ✅ Cart expiration (30 days)
- ✅ Automatic total calculation
- ✅ Free shipping threshold support

### **Methods**
- `calculateTotals(freeShippingThreshold, defaultShippingCost)` - Calculate cart totals

---

## 📦 **7. Order Model**

**File:** `models/Order.ts`

### **Purpose**
E-commerce orders with payment tracking.

### **Key Features**
- ✅ Unique order numbers
- ✅ Order status tracking
- ✅ Payment status tracking
- ✅ Idempotency key support
- ✅ Duplicate payment prevention
- ✅ Shipping and delivery timestamps

### **Static Methods**
- `checkDuplicatePayment()` - Prevent duplicate payments
- `checkIdempotencyKey()` - Check if key already used
- `updatePaymentStatus()` - Safely update payment status

---

## 🔗 **Model Relationships**

```
User
  ├── Cart (userId)
  ├── Order (userId)
  └── InventoryLog (userId)

Product
  ├── Cart.items (productId)
  ├── Order.items (productId)
  └── InventoryLog (productId)

Category
  └── Product (categoryId)

Order
  └── InventoryLog (orderId)
```

---

## 📚 **Additional Documentation**

- **Inventory Management:** `INVENTORY_MANAGEMENT_DEEP_DIVE.md`
- **Inventory Flow:** `INVENTORY_FLOW_EXPLAINED.md`
- **Model Structure:** `INVENTORY_MODEL_STRUCTURE.md`
- **Model Review:** `MODELS_FINAL_REVIEW.md`

---

**Last Updated:** January 2026  
