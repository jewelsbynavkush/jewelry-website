# Inventory Model Structure - Complete Reference

**Date:** January 2025  
**Purpose:** Complete reference for inventory management structure

---

## 📊 **Product Inventory Fields**

### **Core Inventory Fields:**

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

---

## 🔄 **Inventory States**

### **State 1: Available Stock**
```
quantity: 10
reservedQuantity: 0
availableQuantity: 10
Status: ✅ In Stock
```

### **State 2: Items in Cart**
```
quantity: 10
reservedQuantity: 3 (User A has 3 in cart)
availableQuantity: 7
Status: ✅ In Stock (7 available)
```

### **State 3: Multiple Carts**
```
quantity: 10
reservedQuantity: 7 (User A: 3, User B: 4)
availableQuantity: 3
Status: ✅ In Stock (3 available)
```

### **State 4: Low Stock**
```
quantity: 10
reservedQuantity: 7
availableQuantity: 3
lowStockThreshold: 5
Status: ⚠️ Low Stock (3 <= 5)
```

### **State 5: Out of Stock**
```
quantity: 0
reservedQuantity: 0
availableQuantity: 0
allowBackorder: false
Status: ❌ Out of Stock
```

### **State 6: Backorder Allowed**
```
quantity: 0
reservedQuantity: 0
availableQuantity: 0
allowBackorder: true
Status: ✅ Pre-order Available
```

---

## 📋 **Inventory Operations**

### **1. Reserve Stock (Add to Cart)**

**Operation:** `reserveStockForCart(productId, quantity, userId)`

**What It Does:**
- Atomically checks: `availableQuantity >= quantity`
- Atomically updates: `reservedQuantity += quantity`
- Logs: InventoryLog (type: 'reserved')

**Example:**
```typescript
// Before: quantity: 10, reservedQuantity: 0
await reserveStockForCart('product123', 2, 'user456');
// After: quantity: 10, reservedQuantity: 2
```

**Safety:**
- ✅ Atomic operation (no race conditions)
- ✅ Multiple users can reserve simultaneously
- ✅ Prevents overselling

---

### **2. Release Stock (Remove from Cart)**

**Operation:** `releaseReservedStock(productId, quantity, userId)`

**What It Does:**
- Atomically updates: `reservedQuantity -= quantity`
- Logs: InventoryLog (type: 'released')

**Example:**
```typescript
// Before: quantity: 10, reservedQuantity: 2
await releaseReservedStock('product123', 2, 'user456');
// After: quantity: 10, reservedQuantity: 0
```

---

### **3. Confirm Order (Convert Reservation to Sale)**

**Operation:** `confirmOrderAndUpdateStock(orderItems, orderId)`

**What It Does:**
- Atomically checks: `reservedQuantity >= orderQuantity`
- Atomically updates:
  - `quantity -= orderQuantity` (sold)
  - `reservedQuantity -= orderQuantity` (released)
  - `salesCount += orderQuantity`
- Logs: InventoryLog (type: 'sale')

**Example:**
```typescript
// Before: quantity: 10, reservedQuantity: 2, salesCount: 0
await confirmOrderAndUpdateStock([
  { productId: 'product123', quantity: 2, sku: 'RING-001' }
], 'order789');
// After: quantity: 8, reservedQuantity: 0, salesCount: 2
```

**Safety:**
- ✅ Uses MongoDB transaction
- ✅ All items succeed or all fail
- ✅ No partial updates

---

### **4. Cancel Order (Restore Stock)**

**Operation:** `cancelOrderAndRestoreStock(orderItems, orderId)`

**What It Does:**
- Atomically updates:
  - `quantity += orderQuantity` (restored)
  - `salesCount -= orderQuantity`
- Logs: InventoryLog (type: 'return')

**Example:**
```typescript
// Before: quantity: 8, salesCount: 2
await cancelOrderAndRestoreStock([
  { productId: 'product123', quantity: 2, sku: 'RING-001' }
], 'order789');
// After: quantity: 10, salesCount: 0
```

---

### **5. Restock Product**

**Operation:** `restockProduct(productId, quantity, reason, userId)`

**What It Does:**
- Atomically updates: `quantity += quantity`
- Updates status if back in stock
- Logs: InventoryLog (type: 'restock')

**Example:**
```typescript
// Before: quantity: 0, status: 'out_of_stock'
await restockProduct('product123', 10, 'New shipment arrived', 'admin123');
// After: quantity: 10, status: 'active'
```

---

## 🔒 **Concurrency Handling**

### **Scenario: Two Users Order Same Product**

**Initial State:**
```
Product: quantity: 5, reservedQuantity: 0, available: 5
```

**User A adds 3 to cart:**
```typescript
// Atomic operation
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

**User A completes order:**
```typescript
// Transaction
await confirmOrderAndUpdateStock([
  { productId: 'product123', quantity: 3, sku: 'RING-001' }
], 'orderA');
// Result: quantity: 2, reservedQuantity: 0, available: 2
```

**User B tries again:**
```typescript
// Now available: 2
await reserveStockForCart('product123', 2, 'userB');
// Result: { success: true }
// Stock: quantity: 2, reservedQuantity: 2, available: 0
```

**Key Point:** ✅ **No overselling possible!** Atomic operations prevent race conditions.

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

1. **`reserved`** - Item added to cart
   - Quantity: positive
   - Example: `quantity: 2` (reserved 2 items)

2. **`released`** - Item removed from cart
   - Quantity: negative
   - Example: `quantity: -2` (released 2 items)

3. **`sale`** - Order confirmed
   - Quantity: negative
   - Example: `quantity: -2` (sold 2 items)

4. **`restock`** - Stock added
   - Quantity: positive
   - Example: `quantity: 10` (restocked 10 items)

5. **`return`** - Order cancelled/returned
   - Quantity: positive
   - Example: `quantity: 2` (returned 2 items)

6. **`adjustment`** - Manual correction
   - Quantity: can be + or -
   - Example: `quantity: -1` (adjusted down by 1)

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

## 🎯 **Complete Flow Example**

### **Scenario: User Orders Product**

```
1. User views product
   └─> checkProductAvailability(productId, 2)
       └─> Returns: { available: true, availableQuantity: 10 }

2. User adds 2 items to cart
   └─> reserveStockForCart(productId, 2, userId)
       └─> Stock: quantity: 10, reservedQuantity: 2
       └─> Log: InventoryLog (type: 'reserved', quantity: 2)

3. User proceeds to checkout
   └─> (Stock remains reserved)

4. User completes payment
   └─> confirmOrderAndUpdateStock(orderItems, orderId)
       └─> Stock: quantity: 8, reservedQuantity: 0
       └─> Log: InventoryLog (type: 'sale', quantity: -2)

5. Order shipped
   └─> (No stock change, already sold)

6. If order cancelled
   └─> cancelOrderAndRestoreStock(orderItems, orderId)
       └─> Stock: quantity: 10, reservedQuantity: 0
       └─> Log: InventoryLog (type: 'return', quantity: 2)
```

---

## 📝 **Summary**

### **Inventory Structure:**
- ✅ `quantity` - Total physical stock
- ✅ `reservedQuantity` - Items in carts
- ✅ `availableQuantity` - Available for purchase (calculated)
- ✅ `trackQuantity` - Enable/disable tracking
- ✅ `allowBackorder` - Allow pre-orders

### **Safety Features:**
- ✅ Atomic operations (no race conditions)
- ✅ Transaction support (all-or-nothing)
- ✅ Complete audit trail (InventoryLog)
- ✅ Proper status management

### **Operations:**
- ✅ Reserve (add to cart)
- ✅ Release (remove from cart)
- ✅ Confirm (order placed)
- ✅ Cancel (order cancelled)
- ✅ Restock (admin operation)

---

**See Also:**
- [Inventory Service](./lib/inventory/inventory-service.ts) - Implementation
- [Inventory Flow Explained](./INVENTORY_FLOW_EXPLAINED.md) - Detailed flow
- [Models Guide](./MODELS_GUIDE.md) - All models

---

**Last Updated:** January 2025
