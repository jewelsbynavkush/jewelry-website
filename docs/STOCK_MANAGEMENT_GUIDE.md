# Stock Management Guide - Complete Walkthrough

**Date:** February 7, 2025  
**Status:** ✅ **PRODUCTION READY**

---

## 📋 **Overview**

This guide explains how to add stock, manage inventory, and ensure orders are properly aligned with available stock.

---

## 🎯 **How Stock Management Works**

### **Inventory System Architecture:**

1. **Reservation System** - Stock is reserved when added to cart
2. **Atomic Operations** - Prevents overselling (race conditions)
3. **Transaction Support** - All-or-nothing order processing
4. **Automatic Status Updates** - Products marked out-of-stock when depleted

### **Key Concepts:**

- **`quantity`** - Total physical stock (e.g., 10 necklaces)
- **`reservedQuantity`** - Items in carts/checkout (e.g., 3 reserved)
- **`availableQuantity`** - Available for purchase = `quantity - reservedQuantity` (e.g., 7 available)

---

## 📦 **How to Add Stock**

### **Method 1: Add Stock When Creating Product (Initial Stock)**

When creating a new product, set the initial stock in the `inventory.quantity` field:

```json
{
  "title": "Diamond Necklace",
  "slug": "diamond-necklace",
  "category": "necklaces",
  "price": 50000,
  "inventory": {
    "quantity": 10,  // ← Initial stock: 10 necklaces
    "trackQuantity": true,
    "allowBackorder": false,
    "lowStockThreshold": 3
  }
}
```

### **Method 2: Restock Existing Product (Add More Stock)**

Use the **Restock API** to add more stock to existing products:

**API Endpoint:** `POST /api/inventory/[productId]/restock`

**Example: Adding 5 more earrings to existing product:**

```bash
# Get product ID first
GET /api/products?category=earrings

# Then restock
POST /api/inventory/[productId]/restock
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "quantity": 5,
  "reason": "New shipment received"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product restocked successfully",
  "inventory": {
    "productId": "...",
    "sku": "SKU-ABC123",
    "title": "Gold Earrings",
    "totalQuantity": 10,  // Was 5, now 10
    "reservedQuantity": 0,
    "availableQuantity": 10,
    "isLowStock": false,
    "isOutOfStock": false
  }
}
```

### **Method 3: Using MongoDB Directly (Admin)**

```javascript
// In MongoDB Atlas or MongoDB Compass
db.products.updateOne(
  { slug: "diamond-necklace" },
  { 
    $inc: { "inventory.quantity": 10 }  // Add 10 more
  }
);
```

---

## 🔄 **How Stock is Managed Automatically**

### **1. When User Adds Item to Cart**

**What Happens:**
- Stock is **reserved** (not sold yet)
- `reservedQuantity` increases
- `availableQuantity` decreases
- Other users see updated availability

**Example:**
```
Before: quantity: 10, reservedQuantity: 0, available: 10
User adds 2 to cart
After:  quantity: 10, reservedQuantity: 2, available: 8
```

### **2. When User Removes Item from Cart**

**What Happens:**
- Reserved stock is **released**
- `reservedQuantity` decreases
- `availableQuantity` increases

**Example:**
```
Before: quantity: 10, reservedQuantity: 2, available: 8
User removes from cart
After:  quantity: 10, reservedQuantity: 0, available: 10
```

### **3. When Order is Confirmed (Payment Successful)**

**What Happens:**
- Reserved stock is **converted to sale**
- `quantity` decreases (stock sold)
- `reservedQuantity` decreases (reservation released)
- `salesCount` increases
- Product status updated if out of stock

**Example:**
```
Before: quantity: 10, reservedQuantity: 2, available: 8, salesCount: 0
Order confirmed (2 items)
After:  quantity: 8, reservedQuantity: 0, available: 8, salesCount: 2
```

### **4. When Order is Cancelled**

**What Happens:**
- Stock is **restored** to inventory
- `quantity` increases
- `salesCount` decreases
- Product status updated if back in stock

**Example:**
```
Before: quantity: 8, reservedQuantity: 0, available: 8, salesCount: 2
Order cancelled (2 items)
After:  quantity: 10, reservedQuantity: 0, available: 10, salesCount: 0
```

---

## ✅ **How Orders Are Aligned with Stock**

### **Atomic Operations (Prevents Overselling)**

The system uses **MongoDB atomic operations** to ensure:

1. **No Race Conditions** - Multiple users can't buy the last item simultaneously
2. **No Overselling** - Stock is checked and reserved in a single atomic operation
3. **Transaction Safety** - Order creation is all-or-nothing (transaction)

### **Order Flow:**

```
1. User adds to cart
   → Stock reserved atomically
   → If insufficient stock, reservation fails

2. User proceeds to checkout
   → Stock remains reserved
   → Other users see reduced availability

3. Payment successful
   → Order created in transaction
   → Stock converted to sale atomically
   → If any item unavailable, entire order fails

4. Order confirmed
   → Stock permanently deducted
   → Inventory updated
   → Audit log created
```

### **Example Scenario:**

**Initial State:**
- Necklaces: `quantity: 10, reservedQuantity: 0, available: 10`
- Earrings: `quantity: 5, reservedQuantity: 0, available: 5`

**User 1 adds 3 necklaces to cart:**
- Necklaces: `quantity: 10, reservedQuantity: 3, available: 7`

**User 2 adds 2 earrings to cart:**
- Earrings: `quantity: 5, reservedQuantity: 2, available: 3`

**User 1 completes order (3 necklaces):**
- Necklaces: `quantity: 7, reservedQuantity: 0, available: 7, salesCount: 3`
- Earrings: `quantity: 5, reservedQuantity: 2, available: 3` (unchanged)

**User 2 completes order (2 earrings):**
- Earrings: `quantity: 3, reservedQuantity: 0, available: 3, salesCount: 2`
- Necklaces: `quantity: 7, reservedQuantity: 0, available: 7` (unchanged)

---

## 🛠️ **Practical Examples**

### **Example 1: Adding Initial Stock for New Products**

**Scenario:** You have 10 necklaces and 5 earrings to add.

**Step 1: Create Necklace Product**
```bash
POST /api/products
Authorization: Bearer <admin-token>

{
  "title": "Diamond Necklace",
  "slug": "diamond-necklace",
  "category": "necklaces",
  "price": 50000,
  "description": "Beautiful diamond necklace",
  "material": "Gold",
  "primaryImage": "/images/necklace.jpg",
  "images": ["/images/necklace.jpg"],
  "alt": "Diamond necklace",
  "inventory": {
    "quantity": 10,  // ← 10 necklaces in stock
    "trackQuantity": true,
    "allowBackorder": false,
    "lowStockThreshold": 3
  },
  "status": "active"
}
```

**Step 2: Create Earring Product**
```bash
POST /api/products
Authorization: Bearer <admin-token>

{
  "title": "Gold Earrings",
  "slug": "gold-earrings",
  "category": "earrings",
  "price": 15000,
  "description": "Elegant gold earrings",
  "material": "Gold",
  "primaryImage": "/images/earrings.jpg",
  "images": ["/images/earrings.jpg"],
  "alt": "Gold earrings",
  "inventory": {
    "quantity": 5,  // ← 5 earrings in stock
    "trackQuantity": true,
    "allowBackorder": false,
    "lowStockThreshold": 2
  },
  "status": "active"
}
```

### **Example 2: Restocking Existing Products**

**Scenario:** You received 5 more necklaces and 3 more earrings.

**Step 1: Restock Necklaces**
```bash
POST /api/inventory/[necklace-product-id]/restock
Authorization: Bearer <admin-token>

{
  "quantity": 5,
  "reason": "New shipment received"
}
```

**Step 2: Restock Earrings**
```bash
POST /api/inventory/[earring-product-id]/restock
Authorization: Bearer <admin-token>

{
  "quantity": 3,
  "reason": "New shipment received"
}
```

### **Example 3: Checking Current Stock**

**Check inventory status:**
```bash
GET /api/inventory/[productId]
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "inventory": {
    "productId": "...",
    "sku": "SKU-ABC123",
    "title": "Diamond Necklace",
    "totalQuantity": 10,
    "reservedQuantity": 2,  // In carts
    "availableQuantity": 8,  // Available for purchase
    "isLowStock": false,
    "isOutOfStock": false
  }
}
```

---

## 📊 **Inventory Tracking Features**

### **1. Low Stock Alerts**

When stock falls below `lowStockThreshold`, the system marks it as low stock:

```bash
GET /api/inventory/low-stock
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "products": [
    {
      "productId": "...",
      "sku": "SKU-ABC123",
      "title": "Diamond Necklace",
      "availableQuantity": 2,
      "lowStockThreshold": 3,
      "isLowStock": true
    }
  ]
}
```

### **2. Inventory Audit Logs**

Every stock change is logged:

```bash
GET /api/inventory/logs?productId=[productId]
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "logs": [
    {
      "type": "restock",
      "quantity": 10,
      "previousQuantity": 0,
      "newQuantity": 10,
      "reason": "Initial stock",
      "performedBy": { "type": "admin", "userId": "..." },
      "createdAt": "2025-02-07T10:00:00Z"
    },
    {
      "type": "sale",
      "quantity": -2,
      "previousQuantity": 10,
      "newQuantity": 8,
      "orderId": "...",
      "performedBy": { "type": "system", "name": "Order Confirmation" },
      "createdAt": "2025-02-07T11:00:00Z"
    }
  ]
}
```

---

## 🔒 **Security & Access Control**

### **Admin-Only Operations:**

- ✅ **Restock Products** - Requires admin authentication
- ✅ **View Inventory Logs** - Requires admin authentication
- ✅ **Low Stock Alerts** - Requires admin authentication

### **Public Operations:**

- ✅ **View Product Availability** - Public (read-only)
- ✅ **Add to Cart** - Authenticated users (stock reservation)

---

## 🎯 **Best Practices**

### **1. Set Low Stock Thresholds**

Set `lowStockThreshold` based on your sales velocity:

```json
{
  "inventory": {
    "quantity": 10,
    "lowStockThreshold": 3,  // Alert when 3 or fewer left
    "trackQuantity": true
  }
}
```

### **2. Use Backorders for Custom Items**

For made-to-order items, enable backorders:

```json
{
  "inventory": {
    "quantity": 0,
    "allowBackorder": true,  // Allow orders even when out of stock
    "trackQuantity": true
  }
}
```

### **3. Monitor Inventory Regularly**

Check low stock alerts weekly:
```bash
GET /api/inventory/low-stock
```

### **4. Use Reasonable Cache Times**

Inventory API has 60-second cache for performance:
- Stock updates reflect within 1 minute
- Use `?no-cache=true` for immediate updates if needed

---

## 📝 **Quick Reference**

### **API Endpoints:**

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/inventory/[productId]` | GET | Check stock status | No |
| `/api/inventory/[productId]/restock` | POST | Add stock | Admin |
| `/api/inventory/low-stock` | GET | Get low stock alerts | Admin |
| `/api/inventory/logs` | GET | View audit logs | Admin |

### **Product Inventory Fields:**

```typescript
inventory: {
  quantity: number,              // Total stock
  reservedQuantity: number,       // In carts
  trackQuantity: boolean,        // Track inventory?
  allowBackorder: boolean,       // Allow backorders?
  lowStockThreshold: number,     // Alert threshold
}
```

### **Calculated Values:**

- `availableQuantity = quantity - reservedQuantity`
- `inStock = availableQuantity > 0 || allowBackorder`
- `isLowStock = availableQuantity <= lowStockThreshold && availableQuantity > 0`
- `isOutOfStock = availableQuantity === 0 && !allowBackorder`

---

## ✅ **Summary**

**To add stock:**
1. **Initial stock:** Set `inventory.quantity` when creating product
2. **Restock:** Use `POST /api/inventory/[productId]/restock` API
3. **Direct DB:** Update MongoDB directly (admin only)

**Stock is managed automatically:**
- ✅ Reserved when added to cart
- ✅ Released when removed from cart
- ✅ Sold when order confirmed
- ✅ Restored when order cancelled

**Orders are aligned properly:**
- ✅ Atomic operations prevent overselling
- ✅ Transactions ensure all-or-nothing
- ✅ Stock checked before reservation
- ✅ Audit logs track all changes

---

**Last Updated:** February 7, 2025
