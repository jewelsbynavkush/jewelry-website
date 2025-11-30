# E-Commerce Implementation Guide

## 🎯 Quick Start: Adding E-Commerce Features

This guide outlines how to transform the current showcase website into a full e-commerce platform.

---

## 📦 Phase 1: Shopping Cart System

### **Step 1: Install Dependencies**
```bash
npm install zustand  # State management for cart
# or
npm install @tanstack/react-query  # Alternative state management
```

### **Step 2: Create Cart Store**
Create `lib/store/cart-store.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find(i => i.id === item.id);
        if (existingItem) {
          set({
            items: get().items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map(i =>
              i.id === id ? { ...i, quantity } : i
            )
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### **Step 3: Update Add to Cart Button**
Update `app/designs/[slug]/page.tsx`:
```typescript
'use client';
import { useCartStore } from '@/lib/store/cart-store';

// In component:
const addToCart = useCartStore(state => state.addItem);

<Button 
  onClick={() => addToCart({
    id: design._id,
    title: design.title,
    price: design.price || 0,
    image: urlFor(design.image).url(),
  })}
>
  ADD TO CART
</Button>
```

### **Step 4: Update Cart Page**
Update `app/cart/page.tsx` to display cart items and allow management.

---

## 🔐 Phase 2: User Authentication

### **Step 1: Install Firebase Auth**
Already installed, just need to configure.

### **Step 2: Create Auth Context**
Create `lib/auth/auth-context.tsx`:
```typescript
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### **Step 3: Create Login/Register Pages**
Create `app/login/page.tsx` and `app/register/page.tsx`.

---

## 💳 Phase 3: Payment Integration (Stripe)

### **Step 1: Install Stripe**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **Step 2: Create Checkout Page**
Create `app/checkout/page.tsx` with Stripe Elements.

### **Step 3: Create Payment API**
Create `app/api/checkout/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  // Handle payment processing
}
```

---

## 📦 Phase 4: Order Management

### **Step 1: Create Order Schema in Firebase**
Store orders in Firestore with structure:
```typescript
interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  paymentIntentId: string;
}
```

### **Step 2: Create Order API**
Create `app/api/orders/route.ts` for order creation and retrieval.

### **Step 3: Create Order History Page**
Create `app/orders/page.tsx` to display user's order history.

---

## 🔍 Phase 5: Product Search & Filtering

### **Step 1: Add Search Bar**
Add search input to header.

### **Step 2: Implement Search API**
Create `app/api/search/route.ts`:
```typescript
import { getDesigns } from '@/lib/cms/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  // Search logic
}
```

### **Step 3: Add Advanced Filters**
Add price range, material, category filters to designs page.

---

## ⚖️ Phase 6: Legal Pages

### **Create Legal Pages:**
- `app/privacy/page.tsx` - Privacy Policy
- `app/terms/page.tsx` - Terms of Service
- `app/refunds/page.tsx` - Refund Policy
- `app/shipping/page.tsx` - Shipping Policy

---

## 📊 Phase 7: Analytics

### **Step 1: Install Google Analytics**
```bash
npm install @next/third-parties
```

### **Step 2: Add Analytics to Layout**
Update `app/layout.tsx`:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google';

<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

---

## 📧 Phase 8: Email Notifications

### **Option 1: Firebase Extensions**
Use Firebase Extensions for email sending.

### **Option 2: Resend/SendGrid**
Integrate email service for order confirmations.

---

## ✅ Implementation Checklist

- [ ] Shopping cart system
- [ ] User authentication
- [ ] Checkout process
- [ ] Payment integration (Stripe)
- [ ] Order management
- [ ] Product search
- [ ] Legal pages
- [ ] Analytics integration
- [ ] Email notifications
- [ ] Wishlist functionality
- [ ] Product reviews
- [ ] Inventory management

---

**Estimated Time:** 4-7 weeks for complete implementation

**Priority Order:**
1. Shopping Cart (Week 1)
2. Authentication (Week 1-2)
3. Checkout & Payment (Week 2-3)
4. Order Management (Week 3)
5. Search & Filters (Week 4)
6. Legal Pages (Week 4)
7. Analytics & Email (Week 5)
8. Advanced Features (Week 6-7)

