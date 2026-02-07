import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Product Schema - E-commerce Product with Inventory Management
 * 
 * Follows e-commerce best practices:
 * - SKU for inventory tracking
 * - Multi-level inventory management
 * - Stock alerts
 * - Product variants support (for future)
 * - SEO optimization
 * - Status management
 */

export interface IProduct extends Document {
  // Basic Information
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  
  // Product Identification
  sku: string; // Stock Keeping Unit - Unique identifier
  barcode?: string; // Optional barcode for scanning
  
  // Pricing
  price: number; // Current selling price
  compareAtPrice?: number; // Original price (for discounts)
  costPrice?: number; // Cost price (for profit calculation)
  currency: string; // Default: 'INR' or 'USD'
  
  // Category & Classification
  category: string; // Category slug - validated against DB categories in pre-save hook
  categoryId?: mongoose.Types.ObjectId; // Foreign key reference to Category
  subcategory?: string;
  tags?: string[]; // For filtering and search
  
  // Product Details
  material: string;
  weight?: number; // In grams
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'cm' | 'mm' | 'inch';
  };
  
  // Images
  images: string[]; // Array of image URLs
  primaryImage: string; // Main product image
  alt: string; // Alt text for SEO
  
  // Inventory Management
  inventory: {
    quantity: number; // Current stock quantity
    trackQuantity: boolean; // Whether to track inventory
    allowBackorder: boolean; // Allow orders when out of stock
    lowStockThreshold: number; // Alert when stock falls below this
    reservedQuantity: number; // Quantity reserved in carts/orders
    location?: string; // Warehouse/location identifier
  };
  
  // Product Status
  status: 'active' | 'draft' | 'archived' | 'out_of_stock';
  featured: boolean; // Show on homepage
  mostLoved: boolean; // Show in "Most Loved" section
  newArrival: boolean; // Mark as new product
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
  
  // Analytics
  views: number; // Product page views
  salesCount: number; // Total units sold
  rating?: {
    average: number; // Average rating (1-5)
    count: number; // Number of reviews
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date; // When product was published
  
  // Instance Methods
  canPurchase(quantity?: number): boolean;
  reserveQuantity(quantity: number): Promise<boolean>;
  releaseQuantity(quantity: number): Promise<boolean>;
  updateStock(quantity: number, type: 'sale' | 'restock' | 'adjustment'): void;
  
  // Virtual Properties
  availableQuantity: number;
  inStock: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface IProductModel extends Model<IProduct> {
  // Static Methods - Atomic Operations
  reserveStock(productId: mongoose.Types.ObjectId | string, quantity: number, session?: mongoose.ClientSession): Promise<IProduct | null>;
  releaseReservedStock(productId: mongoose.Types.ObjectId | string, quantity: number, session?: mongoose.ClientSession): Promise<IProduct | null>;
  confirmSale(productId: mongoose.Types.ObjectId | string, quantity: number, session?: mongoose.ClientSession): Promise<IProduct | null>;
  restoreStock(productId: mongoose.Types.ObjectId | string, quantity: number, session?: mongoose.ClientSession): Promise<IProduct | null>;
  restock(productId: mongoose.Types.ObjectId | string, quantity: number, session?: mongoose.ClientSession): Promise<IProduct | null>;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true, // For search
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    sku: {
      type: String,
      required: false, // Will be auto-generated in pre-save hook if not provided
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    barcode: {
      type: String,
      required: false, // Explicitly optional
      unique: true, // Unique when provided
      sparse: true, // Allow null, but unique if present
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      // Default removed - will be set from DB ecommerce settings or country settings in pre-save hook
      // Falls back to 'INR' if DB unavailable
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // Enum removed - validated against DB categories in pre-save hook
      // Index defined via ProductSchema.index() below (compound with status)
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    material: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'mm', 'inch'],
        default: 'cm',
      },
    },
    images: [{
      type: String,
      required: true,
    }],
    primaryImage: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    inventory: {
      quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      trackQuantity: {
        type: Boolean,
        default: true,
      },
      allowBackorder: {
        type: Boolean,
        default: false,
      },
      lowStockThreshold: {
        type: Number,
        default: 5, // Alert when stock < 5
        min: 0,
      },
      reservedQuantity: {
        type: Number,
        default: 0,
        min: 0,
      },
      location: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived', 'out_of_stock'],
      default: 'draft',
      // Index defined via ProductSchema.index() below (compound with category/featured/mostLoved)
    },
    featured: {
      type: Boolean,
      default: false,
      // Index defined via ProductSchema.index() below (compound with status)
    },
    mostLoved: {
      type: Boolean,
      default: false,
      // Index defined via ProductSchema.index() below (compound with status)
    },
    newArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      canonicalUrl: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for performance and foreign key relationships
ProductSchema.index({ category: 1, status: 1 }); // Category filtering
ProductSchema.index({ categoryId: 1, status: 1 }); // Foreign key lookup with status (covers categoryId queries)
// categoryId single index created by index: true in schema
ProductSchema.index({ price: 1 }); // Price sorting
ProductSchema.index({ 'inventory.quantity': 1 }); // Stock queries
ProductSchema.index({ featured: 1, status: 1 }); // Featured products
ProductSchema.index({ mostLoved: 1, status: 1 }); // Most loved products
ProductSchema.index({ createdAt: -1 }); // Newest first
ProductSchema.index({ salesCount: -1 }); // Best sellers
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Full-text search

// Virtual for available quantity (quantity - reserved)
ProductSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.inventory.quantity - this.inventory.reservedQuantity);
});

// Virtual for in stock status
ProductSchema.virtual('inStock').get(function() {
  if (!this.inventory.trackQuantity) return true;
  return this.availableQuantity > 0 || this.inventory.allowBackorder;
});

// Virtual for low stock status
ProductSchema.virtual('isLowStock').get(function() {
  if (!this.inventory.trackQuantity) return false;
  return this.availableQuantity <= this.inventory.lowStockThreshold && this.availableQuantity > 0;
});

// Virtual for out of stock status
ProductSchema.virtual('isOutOfStock').get(function() {
  if (!this.inventory.trackQuantity) return false;
  return this.availableQuantity === 0 && !this.inventory.allowBackorder;
});

/**
 * Instance Methods - Product Operations
 * These methods work on the current product instance
 */

// Method to check if product can be purchased (read-only check)
ProductSchema.methods.canPurchase = function(quantity: number = 1): boolean {
  if (this.status !== 'active') return false;
  if (!this.inventory.trackQuantity) return true;
  if (this.inventory.allowBackorder) return true;
  return this.availableQuantity >= quantity;
};

/**
 * Static Methods - Atomic Inventory Operations
 * These methods use MongoDB atomic operations for thread-safe inventory management
 */

/**
 * Atomically reserve stock for cart/checkout
 * Uses MongoDB findOneAndUpdate for atomic operation - safe for concurrent requests
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to reserve
 * @param session - Optional MongoDB session for transactions
 * @returns Updated product document or null if insufficient stock
 */
ProductSchema.statics.reserveStock = async function(
  productId: mongoose.Types.ObjectId | string,
  quantity: number,
  session?: mongoose.ClientSession
): Promise<IProduct | null> {
  // Validate quantity
  if (quantity <= 0) {
    return null;
  }
  
  return await this.findOneAndUpdate(
    {
      _id: productId,
      status: 'active',
      $or: [
        // Case 1: Track quantity and have enough available OR allow backorder
        {
          'inventory.trackQuantity': true,
          $or: [
            {
              $expr: {
                $gte: [
                  { $subtract: ['$inventory.quantity', '$inventory.reservedQuantity'] },
                  quantity
                ]
              }
            },
            { 'inventory.allowBackorder': true }
          ]
        },
        // Case 2: Don't track quantity
        { 'inventory.trackQuantity': false }
      ]
    },
    {
      // Atomically increment reserved quantity
      $inc: { 'inventory.reservedQuantity': quantity }
    },
    {
      new: true, // Return updated document
      session, // Use transaction if provided
    }
  );
};

/**
 * Atomically release reserved stock
 * Uses MongoDB findOneAndUpdate for atomic operation - safe for concurrent requests
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to release
 * @param session - Optional MongoDB session for transactions
 * @returns Updated product document or null if not found
 */
ProductSchema.statics.releaseReservedStock = async function(
  productId: mongoose.Types.ObjectId | string,
  quantity: number,
  session?: mongoose.ClientSession
): Promise<IProduct | null> {
  return await this.findOneAndUpdate(
    { 
      _id: productId,
      // Ensure we have enough reserved quantity to release
      $expr: {
        $gte: ['$inventory.reservedQuantity', quantity]
      }
    },
    {
      // Atomically decrement reserved quantity
      $inc: { 'inventory.reservedQuantity': -quantity }
    },
    {
      new: true,
      session, // Use transaction if provided
    }
  );
};

/**
 * Atomically confirm sale and update stock
 * Converts reserved quantity to actual sale - uses transaction for safety
 * 
 * @param productId - Product ID
 * @param quantity - Quantity sold
 * @param session - MongoDB session for transaction
 * @returns Updated product document or null if insufficient reserved stock
 */
ProductSchema.statics.confirmSale = async function(
  productId: mongoose.Types.ObjectId | string,
  quantity: number,
  session?: mongoose.ClientSession
): Promise<IProduct | null> {
  return await this.findOneAndUpdate(
    {
      _id: productId,
      // Ensure we have enough reserved quantity
      $expr: {
        $gte: ['$inventory.reservedQuantity', quantity]
      }
    },
    {
      // Atomic operation: Convert reserved stock to sold
      // Decreases both quantity and reservedQuantity, increments salesCount
      $inc: {
        'inventory.quantity': -quantity,
        'inventory.reservedQuantity': -quantity,
        salesCount: quantity,
      }
    },
    {
      new: true,
      session, // Use transaction if provided
    }
  );
};

/**
 * Atomically restore stock (for order cancellation)
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to restore
 * @param session - MongoDB session for transaction
 * @returns Updated product document or null if not found
 */
ProductSchema.statics.restoreStock = async function(
  productId: mongoose.Types.ObjectId | string,
  quantity: number,
  session?: mongoose.ClientSession
): Promise<IProduct | null> {
  return await this.findOneAndUpdate(
    { _id: productId },
    {
      // Restore stock quantity and reverse sales count for order cancellation
      $inc: {
        'inventory.quantity': quantity,
        salesCount: -quantity,
      }
    },
    {
      new: true,
      session,
    }
  );
};

/**
 * Atomically restock product
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to add
 * @param session - MongoDB session for transaction
 * @returns Updated product document or null if not found
 */
ProductSchema.statics.restock = async function(
  productId: mongoose.Types.ObjectId | string,
  quantity: number,
  session?: mongoose.ClientSession
): Promise<IProduct | null> {
  return await this.findOneAndUpdate(
    { _id: productId },
    {
      $inc: { 'inventory.quantity': quantity }
    },
    {
      new: true,
      session,
    }
  );
};

/**
 * Instance method to reserve quantity (convenience wrapper)
 * Calls static method for atomic operation
 * 
 * @param quantity - Quantity to reserve
 * @returns Promise resolving to true if successful, false otherwise
 */
ProductSchema.methods.reserveQuantity = async function(quantity: number): Promise<boolean> {
  const Product = this.constructor as IProductModel;
  const updated = await Product.reserveStock(this._id, quantity);
  if (updated) {
    // Update current instance with new values
    this.inventory.reservedQuantity = updated.inventory.reservedQuantity;
    return true;
  }
  return false;
};

/**
 * Instance method to release reserved quantity (convenience wrapper)
 * Calls static method for atomic operation
 * 
 * @param quantity - Quantity to release
 * @returns Promise resolving to true if successful, false otherwise
 */
ProductSchema.methods.releaseQuantity = async function(quantity: number): Promise<boolean> {
  const Product = this.constructor as IProductModel;
  const updated = await Product.releaseReservedStock(this._id, quantity);
  if (updated) {
    // Update current instance with new values
    this.inventory.reservedQuantity = updated.inventory.reservedQuantity;
    return true;
  }
  return false;
};

/**
 * Instance method to update stock (for sales, restocks, adjustments)
 * Note: For sales, use confirmSale() static method for atomic operation
 * 
 * @param quantity - Quantity change
 * @param type - Type of stock change
 */
ProductSchema.methods.updateStock = function(quantity: number, type: 'sale' | 'restock' | 'adjustment'): void {
  if (type === 'sale') {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
    this.salesCount += quantity;
  } else if (type === 'restock') {
    this.inventory.quantity += quantity;
  } else if (type === 'adjustment') {
    this.inventory.quantity = quantity;
  }
  
  // Auto-update status based on stock
  if (this.inventory.trackQuantity) {
    if (this.inventory.quantity === 0 && !this.inventory.allowBackorder) {
      this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock' && this.inventory.quantity > 0) {
      this.status = 'active';
    }
  }
};

// Pre-save hook to validate foreign key, generate SKU, and update status
ProductSchema.pre('save', async function() {
  // Generate SKU if not provided
  if (!this.sku || this.sku.trim() === '') {
    // Generate unique SKU
    const Product = mongoose.model('Product');
    let attempts = 0;
    let sku: string;
    do {
      const random = Math.random().toString(36).substring(2, 10).toUpperCase();
      sku = `SKU-${random}`;
      attempts++;
      
      // Check if SKU already exists (exclude current document if updating)
      const query: Record<string, unknown> = { sku };
      if (!this.isNew) {
        query._id = { $ne: this._id };
      }
      const existing = await Product.findOne(query);
      if (!existing) {
        break;
      }
      
      if (attempts > 10) {
        throw new Error('Failed to generate unique SKU after 10 attempts');
      }
    } while (true);
    
    this.sku = sku;
  }
  
  // Validate category against DB categories
  const Category = mongoose.model('Category');
  const category = this.categoryId 
    ? await Category.findById(this.categoryId)
    : await Category.findOne({ slug: this.category.toLowerCase(), active: true });
  
  if (!category) {
    // Allow 'other' as fallback category if not found in DB
    if (this.category.toLowerCase() !== 'other') {
      throw new Error(`Category "${this.category}" does not exist or is not active. Use an active category slug or "other".`);
    }
  } else {
    // Sync categoryId if category slug was provided
    if (!this.categoryId) {
      this.categoryId = category._id;
    }
    // Ensure category slug matches
    this.category = category.slug;
  }
  
  // Set default currency from DB if not provided
  if (!this.currency) {
    try {
      const { getDefaultCountry } = await import('@/lib/data/country-settings');
      const defaultCountry = await getDefaultCountry();
      if (defaultCountry?.currency) {
        this.currency = defaultCountry.currency;
      } else {
        // Fallback to ecommerce settings or INR
        const { getSiteSettings } = await import('@/lib/data/site-settings');
        const settings = await getSiteSettings();
        this.currency = settings.ecommerce?.currency || 'INR';
      }
    } catch {
      // If DB unavailable, use fallback
      this.currency = 'INR';
    }
  }
  
  // Update status based on inventory
  if (this.inventory.trackQuantity) {
    if (this.inventory.quantity === 0 && !this.inventory.allowBackorder && this.status === 'active') {
      this.status = 'out_of_stock';
    }
  }
});

// Export model with proper typing
const Product = (mongoose.models.Product as IProductModel) || mongoose.model<IProduct, IProductModel>('Product', ProductSchema);

export default Product;
