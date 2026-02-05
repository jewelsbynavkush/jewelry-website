import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Cart Schema - Shopping Cart
 * Supports both authenticated users and guest carts
 */

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  title: string;
  image: string;
  price: number; // Price at time of adding to cart
  quantity: number;
  subtotal: number; // price * quantity
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for guest carts
  sessionId?: string; // For guest carts
  items: ICartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  expiresAt?: Date; // For guest carts (default: 30 days)
  createdAt: Date;
  updatedAt: Date;
  calculateTotals(freeShippingThreshold?: number, defaultShippingCost?: number): void;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
      unique: true, // Session ID should be unique for guest carts
      sparse: true, // Allow null for authenticated users, but unique if present
    },
    items: [CartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR', // Default currency - matches ECOMMERCE.currency in lib/constants.ts
      enum: ['INR', 'USD', 'EUR'], // Supported currencies
    },
    expiresAt: {
      type: Date,
      // E-commerce best practice: Only guest carts expire (30 days)
      // User carts (with userId) should not expire
      // Default is set for guest carts, but should be undefined for user carts
      default: function() {
        // Only set expiration for guest carts (no userId)
        // Use constant value directly to avoid circular dependency (30 days = 30 * 24 * 60 * 60 * 1000 ms)
        // This matches ECOMMERCE.guestCartExpirationDays in lib/constants.ts
        return this.userId ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
  }
);

// Database indexes for query performance and data integrity
CartSchema.index({ userId: 1 }); // Fast lookup by user ID
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired guest carts
CartSchema.index({ 'items.productId': 1 }); // Fast product lookup in cart items

// Pre-save hook: Validate foreign keys and enforce cart expiration rules
CartSchema.pre('save', async function() {
  // User carts never expire (persistent across sessions)
  // Guest carts expire after 30 days to free up database space
  if (this.userId != null) {
    this.expiresAt = undefined;
    
    // Validate user exists to prevent orphaned carts
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    if (!user) {
      throw new Error('User does not exist');
    }
  } else if (this.sessionId && !this.expiresAt) {
    // Set expiration for new guest carts (matches ECOMMERCE.guestCartExpirationDays)
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Validate all products exist to prevent invalid cart items
  if (this.items && this.items.length > 0) {
    const Product = mongoose.model('Product');
    for (const item of this.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} does not exist`);
      }
    }
  }
});

/**
 * Calculate cart totals including subtotal, shipping, tax, and discount
 * 
 * Applies free shipping threshold automatically when subtotal meets minimum.
 * Rounds final total to 2 decimal places to prevent floating-point precision errors.
 * 
 * @param freeShippingThreshold - Minimum subtotal for free shipping (optional)
 * @param defaultShippingCost - Default shipping cost if threshold not met (optional, defaults to 0)
 */
CartSchema.methods.calculateTotals = function(
  freeShippingThreshold?: number,
  defaultShippingCost: number = 0
): void {
  const items: ICartItem[] = this.items;
  this.subtotal = items.reduce((sum: number, item: ICartItem): number => {
    return sum + item.subtotal;
  }, 0);
  
  // Apply free shipping when subtotal meets threshold
  if (freeShippingThreshold !== undefined) {
    if (this.subtotal >= freeShippingThreshold) {
      this.shipping = 0;
    } else {
      // Only override shipping if not explicitly set (preserves custom shipping costs)
      if (this.shipping === 0 || this.isNew) {
        this.shipping = defaultShippingCost;
      }
    }
  }
  
  // Round to 2 decimal places to prevent floating-point precision errors in financial calculations
  this.total = Math.round((this.subtotal + this.tax + this.shipping - this.discount) * 100) / 100;
};

// Export Mongoose model with connection caching to prevent duplicate model compilation
const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
