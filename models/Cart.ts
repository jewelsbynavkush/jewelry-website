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
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and foreign key relationships
CartSchema.index({ userId: 1 }); // Foreign key index for User
// sessionId index created by unique: true
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired carts
CartSchema.index({ 'items.productId': 1 }); // Foreign key index for Product in items

// Pre-save hook to validate foreign keys
CartSchema.pre('save', async function() {
  // Validate userId foreign key if provided (optional for guest carts)
  // Only validate if userId is explicitly set (not undefined/null)
  if (this.userId != null) {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    if (!user) {
      throw new Error('User does not exist');
    }
  }
  
  // Validate productId in items
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
 * Method to calculate totals
 * E-commerce best practice: Applies free shipping threshold automatically
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
  
  // Apply free shipping threshold if provided
  if (freeShippingThreshold !== undefined) {
    if (this.subtotal >= freeShippingThreshold) {
      // Free shipping when threshold is met
      this.shipping = 0;
    } else {
      // Apply default shipping cost if threshold not met
      // Only set if shipping hasn't been explicitly set before
      if (this.shipping === 0 || this.isNew) {
        this.shipping = defaultShippingCost;
      }
    }
  }
  
  this.total = this.subtotal + this.tax + this.shipping - this.discount;
};

// Export Mongoose model with connection caching to prevent duplicate model compilation
const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
