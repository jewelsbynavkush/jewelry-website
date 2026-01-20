# Inventory Management - Deep Dive & Standards

**Date:** January 2025  
**Focus:** Proper inventory tracking for concurrent orders

---

## 🎯 **The Problem: Concurrent Orders**

### **Scenario:**
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

---

## ✅ **Solution: Atomic Operations & Proper Flow**

### **Key Principles:**

1. **Atomic Stock Checks:** Use MongoDB transactions
2. **Reservation System:** Reserve stock when added to cart
3. **Order Confirmation:** Convert reservation to sale atomically
4. **Proper Release:** Release reservations on cart expiry/cancellation
5. **Inventory Log:** Track every change for audit

---

## 📊 **Inventory Flow Diagram**

```
┌─────────────────────────────────────────────────────────┐
│                    INVENTORY STATES                     │
└─────────────────────────────────────────────────────────┘

Product Stock: 10 items

┌──────────────┐
│ Available: 10 │  ← quantity - reservedQuantity
└──────────────┘
       │
       ├─ User A adds 3 to cart
       │  └─> Reserve 3 (reservedQuantity = 3)
       │      Available: 7
       │
       ├─ User B adds 4 to cart (at same time)
       │  └─> Check: Available (7) >= 4? ✅
       │      Reserve 4 (reservedQuantity = 7)
       │      Available: 3
       │
       ├─ User A completes order
       │  └─> Convert reservation to sale
       │      quantity: 10 → 7 (sold 3)
       │      reservedQuantity: 7 → 4 (released 3)
       │      Available: 3
       │
       └─ User B completes order
          └─> Convert reservation to sale
              quantity: 7 → 3 (sold 4)
              reservedQuantity: 4 → 0 (released 4)
              Available: 3
```

---

## 🔒 **Critical: Atomic Operations**

### **Problem with Current Implementation:**

**Current `reserveQuantity()` method:**
```typescript
ProductSchema.methods.reserveQuantity = function(quantity: number): boolean {
  if (!this.canPurchase(quantity)) return false;
  this.inventory.reservedQuantity += quantity; // ❌ NOT ATOMIC!
  return true;
};
```

**Issue:** If two users call this simultaneously:
1. Both check `canPurchase()` → both return `true`
2. Both increment `reservedQuantity` → overselling!

### **Solution: Use MongoDB Transactions**

We need to use MongoDB's atomic operations or transactions to prevent race conditions.

---

## 🛠️ **Improved Inventory Management**

I'll create an improved version with proper atomic operations.
