# Inventory Flow - Complete Explanation

**Date:** January 2025  
**Purpose:** Understand how inventory is tracked through the entire order lifecycle

---

## 📊 **Inventory States Explained**

### **Product Inventory Fields:**

```typescript
inventory: {
  quantity: 10,              // Total physical stock
  reservedQuantity: 3,        // Items in carts/being checked out
  trackQuantity: true,        // Whether to track inventory
  allowBackorder: false,      // Allow orders when out of stock
  lowStockThreshold: 5,       // Alert threshold
}
```

### **Calculated Values:**

```typescript
availableQuantity = quantity - reservedQuantity
// Example: 10 - 3 = 7 items available

inStock = availableQuantity > 0 || allowBackorder
// Example: 7 > 0 = true (in stock)
```

---

## 🔄 **Complete Inventory Flow**

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

**If Multiple Users Add Same Product:**
- User A adds 3 → Reserved: 3, Available: 7
- User B adds 4 (at same time) → Check: 7 >= 4? ✅ → Reserved: 7, Available: 3
- **No overselling!** ✅

---

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

---

### **Step 3: Cart Expires (30 days)**

**What Happens:**
1. Cart expires (MongoDB TTL index auto-deletes)
2. Background job calls `releaseReservedStock()` for all items
3. Stock is released back to available

**Result:**
- Reserved quantity decreases
- Available quantity increases
- InventoryLog entry created

---

### **Step 4: User Completes Order**

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

---

### **Step 5: Order Cancelled**

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

## 🔒 **How We Prevent Race Conditions**

### **Problem:**
Two users try to buy the last item simultaneously.

### **Solution: MongoDB Atomic Operations**

**Using `findOneAndUpdate` with conditions:**

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

---

## 📋 **Inventory States Throughout Order Lifecycle**

### **Scenario: Product with 10 items, 2 users order**

```
Initial State:
┌─────────────────────────────────────┐
│ quantity: 10                        │
│ reservedQuantity: 0                │
│ availableQuantity: 10              │
└─────────────────────────────────────┘

User A adds 3 to cart:
┌─────────────────────────────────────┐
│ quantity: 10                        │
│ reservedQuantity: 3                │
│ availableQuantity: 7               │
└─────────────────────────────────────┘

User B adds 4 to cart (simultaneously):
┌─────────────────────────────────────┐
│ quantity: 10                        │
│ reservedQuantity: 7                │
│ availableQuantity: 3               │
└─────────────────────────────────────┘

User C tries to add 5 to cart:
┌─────────────────────────────────────┐
│ Check: availableQuantity (3) >= 5? │
│ ❌ NO - Request rejected            │
│ Stock remains: 3 available            │
└─────────────────────────────────────┘

User A completes order:
┌─────────────────────────────────────┐
│ quantity: 7 (10 - 3 sold)          │
│ reservedQuantity: 4 (7 - 3 released)│
│ availableQuantity: 3               │
│ salesCount: 3                       │
└─────────────────────────────────────┘

User B completes order:
┌─────────────────────────────────────┐
│ quantity: 3 (7 - 4 sold)           │
│ reservedQuantity: 0 (4 - 4 released)│
│ availableQuantity: 3               │
│ salesCount: 7                       │
└─────────────────────────────────────┘
```

---

## ✅ **Key Safety Features**

### **1. Atomic Operations**
- ✅ All stock updates use MongoDB atomic operations
- ✅ No race conditions possible
- ✅ Multiple users can order simultaneously safely

### **2. Reservation System**
- ✅ Stock reserved when added to cart
- ✅ Prevents overselling
- ✅ Auto-released on cart expiry

### **3. Transaction Support**
- ✅ Order confirmation uses transactions
- ✅ All-or-nothing: Either all items succeed or all fail
- ✅ No partial updates

### **4. Inventory Log**
- ✅ Every change is logged
- ✅ Complete audit trail
- ✅ Can track who did what and when

### **5. Status Management**
- ✅ Auto-update status based on stock
- ✅ `out_of_stock` when quantity = 0
- ✅ `active` when stock restored

---

## 🎯 **Usage Examples**

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

## 🚨 **Important Notes**

### **1. Always Use Inventory Service**
- ❌ **Don't use:** `product.reserveQuantity()` directly
- ✅ **Use:** `reserveStockForCart()` from inventory-service

### **2. Cart Expiry**
- Carts expire after 30 days
- Reserved stock is released automatically
- Background job should clean up expired carts

### **3. Order Cancellation**
- Always restore stock when order is cancelled
- Update sales count
- Log in InventoryLog

### **4. Error Handling**
- Always check `result.success`
- Handle errors gracefully
- Show user-friendly messages

---

## 📊 **Inventory Metrics**

### **Available Metrics:**
- `totalQuantity` - Total physical stock
- `reservedQuantity` - Items in carts
- `availableQuantity` - Available for purchase
- `salesCount` - Total units sold
- `isLowStock` - Stock below threshold
- `isOutOfStock` - No stock available

### **Inventory Log Metrics:**
- Total sales (type: 'sale')
- Total restocks (type: 'restock')
- Total adjustments (type: 'adjustment')
- Total returns (type: 'return')
- Reservation history (type: 'reserved'/'released')

---

## ✅ **Summary**

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

**Last Updated:** January 2025
