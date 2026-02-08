# Inventory Management - Complete Guide

**Date:** January 2026  
**Status:** ✅ **COMPREHENSIVE GUIDE**

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Inventory Model Structure](#inventory-model-structure)
3. [Inventory Flow](#inventory-flow)
4. [Concurrency & Race Conditions](#concurrency--race-conditions)
5. [Operations](#operations)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## 🎯 **Overview**

The inventory system uses atomic operations and a reservation system to prevent overselling and race conditions. Stock is reserved when items are added to cart and converted to sales when orders are confirmed.

### **Key Features:**
- ✅ Atomic stock operations (no race conditions)
- ✅ Reservation system (prevents overselling)
- ✅ Transaction support (all-or-nothing)
- ✅ Complete audit trail (InventoryLog)
- ✅ Automatic status management

---

## 📊 **Inventory Model Structure**

### **Product Inventory Fields:**

```typescript
inventory: {
  quantity: number,              // Total physical stock
  reservedQuantity: number,       // Items reserved in carts/checkout
  trackQuantity: boolean,        // Whether to track inventory
  allowBackorder: boolean,       // Allow orders when out of stock
  lowStockThreshold: number,     // Alert when stock < this
  location?: string,              // Warehouse/location (optional)
}
```

### **Calculated Values (Virtuals):**

```typescript
availableQuantity = quantity - reservedQuantity
// Example: 10 - 3 = 7 items available

inStock = availableQuantity > 0 || allowBackorder
// Example: 7 > 0 = true

isLowStock = availableQuantity <= lowStockThreshold && availableQuantity > 0
// Example: 3 <= 5 = true (low stock)

isOutOfStock = availableQuantity === 0 && !allowBackorder
// Example: 0 === 0 && false = true (out of stock)
```

### **Inventory States:**

1. **Available Stock:** `quantity: 10, reservedQuantity: 0, available: 10`
2. **Items in Cart:** `quantity: 10, reservedQuantity: 3, available: 7`
3. **Multiple Carts:** `quantity: 10, reservedQuantity: 7, available: 3`
4. **Low Stock:** `quantity: 10, reservedQuantity: 7, available: 3, threshold: 5`
5. **Out of Stock:** `quantity: 0, reservedQuantity: 0, available: 0, allowBackorder: false`
6. **Backorder Allowed:** `quantity: 0, reservedQuantity: 0, available: 0, allowBackorder: true`

---

## 🔄 **Inventory Flow**

### **Step 1: User Adds Item to Cart**

**What Happens:**
1. User clicks "Add to Cart" for Product A (quantity: 2)
2. System calls `reserveStockForCart(productId, 2)`
3. **Atomic Operation:**
   - Check: `availableQuantity >= 2` ✅
   - Update: `reservedQuantity += 2` (atomically)
   - Log: InventoryLog entry (type: 'reserved')

**Result:**
```
Before: quantity: 10, reservedQuantity: 0, available: 10
After:  quantity: 10, reservedQuantity: 2, available: 8
```

### **Step 2: User Removes Item from Cart**

**What Happens:**
1. User removes Product A from cart (quantity: 2)
2. System calls `releaseReservedStock(productId, 2)`
3. **Atomic Operation:**
   - Update: `reservedQuantity -= 2` (atomically)
   - Log: InventoryLog entry (type: 'released')

**Result:**
```
Before: quantity: 10, reservedQuantity: 2, available: 8
After:  quantity: 10, reservedQuantity: 0, available: 10
```

### **Step 3: User Completes Order**

**What Happens:**
1. User proceeds to checkout
2. Payment is successful
3. System calls `confirmOrderAndUpdateStock(orderItems, orderId)`
4. **Atomic Transaction:**
   - For each item:
     - Check: `reservedQuantity >= orderQuantity` ✅
     - Update: `quantity -= orderQuantity` (sold)
     - Update: `reservedQuantity -= orderQuantity` (released)
     - Update: `salesCount += orderQuantity`
   - Log: InventoryLog entry (type: 'sale')

**Result:**
```
Before: quantity: 10, reservedQuantity: 2, available: 8
After:  quantity: 8, reservedQuantity: 0, available: 8
Sales Count: 0 → 2
```

### **Step 4: Order Cancelled**

**What Happens:**
1. User/admin cancels order
2. System calls `cancelOrderAndRestoreStock(orderItems, orderId)`
3. **Atomic Transaction:**
   - For each item:
     - Update: `quantity += orderQuantity` (restored)
     - Update: `salesCount -= orderQuantity`
   - Log: InventoryLog entry (type: 'return')

**Result:**
```
Before: quantity: 8, reservedQuantity: 0, available: 8
After:  quantity: 10, reservedQuantity: 0, available: 10
Sales Count: 2 → 0
```

---

## 🔒 **Concurrency & Race Conditions**

### **The Problem: Concurrent Orders**

**Scenario:**
- Product has **5 items** in stock
- User A adds **3 items** to cart
- User B adds **4 items** to cart (at the same time)
- Both users proceed to checkout
- **Problem:** Both orders might succeed, but only 5 items exist!

### **Why This Happens:**
- **Race Condition:** Two requests check stock at the same time
- **Both see:** 5 items available
- **Both reserve:** 3 + 4 = 7 items (but only 5 exist!)
- **Result:** Overselling!

### **Solution: Atomic Operations**

**Using MongoDB `findOneAndUpdate` with conditions:**

```typescript
Product.findOneAndUpdate(
  {
    _id: productId,
    // Atomic check: available >= quantity
    $expr: {
      $gte: [
        { $subtract: ['$inventory.quantity', '$inventory.reservedQuantity'] },
        quantity
      ]
    }
  },
  {
    // Atomic update: increment reserved
    $inc: { 'inventory.reservedQuantity': quantity }
  }
)
```

**How It Works:**
1. MongoDB checks condition **atomically** (single operation)
2. If condition fails → Update doesn't happen → Returns `null`
3. If condition passes → Update happens → Returns updated document
4. **No race condition possible!** ✅

### **Example: Concurrent Orders**

**Initial State:**
```
Product: quantity: 5, reservedQuantity: 0, available: 5
```

**User A adds 3 to cart:**
```typescript
await reserveStockForCart('product123', 3, 'userA');
// Result: quantity: 5, reservedQuantity: 3, available: 2
```

**User B adds 4 to cart (simultaneously):**
```typescript
// Atomic operation checks: available (2) >= 4? ❌ NO
await reserveStockForCart('product123', 4, 'userB');
// Result: { success: false, error: 'Insufficient stock' }
// Stock unchanged: quantity: 5, reservedQuantity: 3, available: 2
```

**Key Point:** ✅ **No overselling possible!** Atomic operations prevent race conditions.

---

## 🛠️ **Operations**

### **1. Reserve Stock (Add to Cart)**

**Operation:** `reserveStockForCart(productId, quantity, userId)`

**What It Does:**
- Atomically checks: `availableQuantity >= quantity`
- Atomically updates: `reservedQuantity += quantity`
- Logs: InventoryLog (type: 'reserved')

**Safety:**
- ✅ Atomic operation (no race conditions)
- ✅ Multiple users can reserve simultaneously
- ✅ Prevents overselling

### **2. Release Stock (Remove from Cart)**

**Operation:** `releaseReservedStock(productId, quantity, userId)`

**What It Does:**
- Atomically updates: `reservedQuantity -= quantity`
- Logs: InventoryLog (type: 'released')

### **3. Confirm Order (Convert Reservation to Sale)**

**Operation:** `confirmOrderAndUpdateStock(orderItems, orderId)`

**What It Does:**
- Atomically checks: `reservedQuantity >= orderQuantity`
- Atomically updates:
  - `quantity -= orderQuantity` (sold)
  - `reservedQuantity -= orderQuantity` (released)
  - `salesCount += orderQuantity`
- Logs: InventoryLog (type: 'sale')

**Safety:**
- ✅ Uses MongoDB transaction
- ✅ All items succeed or all fail
- ✅ No partial updates

### **4. Cancel Order (Restore Stock)**

**Operation:** `cancelOrderAndRestoreStock(orderItems, orderId)`

**What It Does:**
- Atomically updates:
  - `quantity += orderQuantity` (restored)
  - `salesCount -= orderQuantity`
- Logs: InventoryLog (type: 'return')

### **5. Restock Product**

**Operation:** `restockProduct(productId, quantity, reason, userId)`

**What It Does:**
- Atomically updates: `quantity += quantity`
- Updates status if back in stock
- Logs: InventoryLog (type: 'restock')

---

## 📊 **Inventory Log Structure**

### **Log Entry Fields:**

```typescript
{
  productId: ObjectId,           // Product reference
  productSku: string,            // SKU for quick lookup
  productTitle: string,           // Product name
  type: 'sale' | 'restock' | 'adjustment' | 'return' | 'reserved' | 'released',
  quantity: number,               // Change amount (+ or -)
  previousQuantity: number,       // Stock before change
  newQuantity: number,           // Stock after change
  orderId?: ObjectId,            // If related to order
  userId?: ObjectId,              // User who triggered change
  reason?: string,                // Reason for change
  performedBy: {
    userId?: ObjectId,
    type: 'system' | 'admin' | 'customer' | 'api',
    name?: string,
  },
  createdAt: Date,
}
```

### **Log Types:**

1. **`reserved`** - Item added to cart (quantity: positive)
2. **`released`** - Item removed from cart (quantity: negative)
3. **`sale`** - Order confirmed (quantity: negative)
4. **`restock`** - Stock added (quantity: positive)
5. **`return`** - Order cancelled/returned (quantity: positive)
6. **`adjustment`** - Manual correction (quantity: can be + or -)

---

## ✅ **Best Practices**

### **1. Always Use Inventory Service**
- ✅ Use `reserveStockForCart()` - Don't modify directly
- ✅ Use `confirmOrderAndUpdateStock()` - Don't update manually
- ✅ Use transactions for order operations

### **2. Check Availability First**
- ✅ Check `checkProductAvailability()` before showing "Add to Cart"
- ✅ Show stock status to users
- ✅ Disable "Add to Cart" if out of stock

### **3. Handle Errors Gracefully**
- ✅ Check `result.success` after every operation
- ✅ Show user-friendly error messages
- ✅ Log errors for debugging

### **4. Monitor Inventory**
- ✅ Set up low stock alerts
- ✅ Review InventoryLog regularly
- ✅ Monitor reserved quantities (prevent stuck reservations)

### **5. Cart Expiry**
- ✅ Set cart expiry (30 days)
- ✅ Release reserved stock on expiry
- ✅ Background job to clean expired carts

---

## 🎯 **Examples**

### **Example 1: Add to Cart (Safe)**

```typescript
import { reserveStockForCart } from '@/lib/inventory/inventory-service';

// User adds 2 items to cart
const result = await reserveStockForCart(productId, 2, userId);

if (result.success) {
  // Add to cart
  // Stock is now reserved
} else {
  // Show error: "Insufficient stock"
}
```

### **Example 2: Complete Order (Safe)**

```typescript
import { confirmOrderAndUpdateStock } from '@/lib/inventory/inventory-service';

// Order items
const orderItems = [
  { productId: '...', quantity: 2, sku: 'RING-001' },
  { productId: '...', quantity: 1, sku: 'EARRING-001' },
];

const result = await confirmOrderAndUpdateStock(orderItems, orderId);

if (result.success) {
  // Order confirmed
  // Stock updated atomically
} else {
  // Handle error (shouldn't happen if cart was valid)
}
```

### **Example 3: Check Availability (Read-Only)**

```typescript
import { checkProductAvailability } from '@/lib/inventory/inventory-service';

const availability = await checkProductAvailability(productId, 2);

if (availability.available) {
  // Show "Add to Cart" button
} else if (availability.canBackorder) {
  // Show "Pre-order" button
} else {
  // Show "Out of Stock" message
}
```

---

## 📝 **Summary**

### **How It Works:**
1. ✅ **Reserve** stock when added to cart (atomic)
2. ✅ **Release** stock when removed/expired (atomic)
3. ✅ **Confirm** order converts reservation to sale (transaction)
4. ✅ **Cancel** order restores stock (transaction)
5. ✅ **Log** everything in InventoryLog

### **Safety Guarantees:**
- ✅ No overselling (atomic checks)
- ✅ No race conditions (MongoDB transactions)
- ✅ Complete audit trail (InventoryLog)
- ✅ Proper stock tracking (reserved vs available)

---

**See Also:**
- [Models Guide](./MODELS_GUIDE.md) - Complete model documentation
- [Inventory Service](../lib/inventory/inventory-service.ts) - Implementation

---

**Last Updated:** January 2026  
