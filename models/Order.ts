import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Order Schema - E-commerce Orders
 */

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productSku: string;
  productTitle: string;
  image: string;
  quantity: number;
  price: number; // Price at time of order
  total: number; // price * quantity
}

export interface IOrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string; // Required for order delivery
  countryCode: string; // Required for order delivery
}

export interface IOrder extends Document {
  orderNumber: string; // Unique order number (e.g., ORD-2025-001234)
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: IOrderAddress;
  billingAddress: IOrderAddress;
  paymentMethod: 'razorpay' | 'cod' | 'bank_transfer' | 'other';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentIntentId?: string; // Razorpay order ID
  paymentId?: string; // Razorpay payment ID
  idempotencyKey?: string; // Idempotency key for payment processing (prevents duplicate processing)
  trackingNumber?: string;
  carrier?: string; // Shipping carrier
  notes?: string;
  customerNotes?: string; // Notes from customer
  cancelledAt?: Date;
  cancelledReason?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderModel extends Model<IOrder> {
  // Static Methods - Atomic Operations
  generateOrderNumber(): Promise<string>;
  checkDuplicatePayment(paymentIntentId?: string, paymentId?: string, excludeOrderId?: string): Promise<boolean>;
  checkIdempotencyKey(idempotencyKey: string): Promise<IOrder | null>;
  updatePaymentStatus(
    orderId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded',
    paymentIntentId?: string,
    paymentId?: string,
    idempotencyKey?: string
  ): Promise<IOrder | null>;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productSku: {
      type: String,
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: String,
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    phone: { type: String, required: true },
    countryCode: { type: String, required: true, default: '+91' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: false, // Will be auto-generated in pre-save hook if not provided
      unique: true,
      // Index defined via OrderSchema.index() below
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function(items: IOrderItem[]) {
          return items && items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
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
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR', // Default currency - matches ECOMMERCE.currency in lib/constants.ts
      enum: ['INR', 'USD', 'EUR'], // Supported currencies
    },
    shippingAddress: {
      type: OrderAddressSchema,
      required: true,
    },
    billingAddress: {
      type: OrderAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod', 'bank_transfer', 'other'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    paymentIntentId: {
      type: String,
      unique: true, // Razorpay order ID is unique
      sparse: true, // Allow null, but unique if present
      // Index defined via OrderSchema.index() below (compound with paymentStatus)
    },
    paymentId: {
      type: String,
      unique: true, // Razorpay payment ID is unique
      sparse: true, // Allow null, but unique if present
      // Index defined via OrderSchema.index() below (compound with paymentStatus)
    },
    idempotencyKey: {
      type: String,
      unique: true, // Idempotency key must be unique
      sparse: true, // Allow null, but unique if present
      // Index defined via OrderSchema.index() below
    },
    trackingNumber: {
      type: String,
      unique: true, // Tracking numbers are unique
      sparse: true, // Allow null, but unique if present
      index: true,
    },
    carrier: {
      type: String,
    },
    notes: {
      type: String,
    },
    customerNotes: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledReason: {
      type: String,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and foreign key relationships
OrderSchema.index({ userId: 1, createdAt: -1 }); // Foreign key: User orders
OrderSchema.index({ userId: 1 }); // Foreign key index for User
OrderSchema.index({ status: 1, createdAt: -1 }); // Status queries
OrderSchema.index({ paymentStatus: 1 }); // Payment queries
// orderNumber index created by unique: true
OrderSchema.index({ 'items.productId': 1 }); // Foreign key index for Product in items
OrderSchema.index({ paymentIntentId: 1, paymentStatus: 1 }); // Duplicate payment prevention
OrderSchema.index({ paymentId: 1, paymentStatus: 1 }); // Duplicate payment prevention
// idempotencyKey index created by unique: true

/**
 * Static Methods - Atomic Order Operations
 */

/**
 * Atomically generate unique order number
 * Uses MongoDB atomic operations to prevent race conditions
 * 
 * @returns Unique order number
 */
OrderSchema.statics.generateOrderNumber = async function(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Ensure database connection
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }
  
  // Use findOneAndUpdate with upsert for atomic counter
  const result = await mongoose.connection.db.collection('orderCounters').findOneAndUpdate(
    { year },
    { $inc: { count: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  
  // Handle both old and new MongoDB driver return formats
  const count = result?.value?.count || result?.count || 1;
  return `ORD-${year}-${String(count).padStart(6, '0')}`;
};

/**
 * Check if payment already exists (duplicate payment prevention)
 * Atomically checks if paymentIntentId or paymentId is already used in another order
 * 
 * @param paymentIntentId - Razorpay order ID (optional)
 * @param paymentId - Razorpay payment ID (optional)
 * @param excludeOrderId - Order ID to exclude from check (for updates)
 * @returns True if duplicate payment found, false otherwise
 */
OrderSchema.statics.checkDuplicatePayment = async function(
  paymentIntentId?: string,
  paymentId?: string,
  excludeOrderId?: string
): Promise<boolean> {
  if (!paymentIntentId && !paymentId) {
    return false; // No payment IDs provided, can't check for duplicates
  }

  interface DuplicatePaymentQuery {
    $or?: Array<{ paymentIntentId?: string } | { paymentId?: string }>;
    _id?: { $ne: mongoose.Types.ObjectId };
    paymentStatus: { $in: string[] };
  }

  const query: DuplicatePaymentQuery = {
    $or: [],
    paymentStatus: { $in: ['paid', 'partially_refunded'] },
  };

  // Exclude current order if updating
  if (excludeOrderId) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeOrderId) };
  }

  // Check for duplicate paymentIntentId
  if (paymentIntentId) {
    query.$or!.push({ paymentIntentId });
  }

  // Check for duplicate paymentId
  if (paymentId) {
    query.$or!.push({ paymentId });
  }

  const existingOrder = await this.findOne(query);
  return !!existingOrder;
};

/**
 * Check if idempotency key has already been processed
 * Returns the existing order if idempotency key was already used
 * 
 * @param idempotencyKey - Idempotency key to check
 * @returns Existing order if key was used, null otherwise
 */
OrderSchema.statics.checkIdempotencyKey = async function(
  idempotencyKey: string
): Promise<IOrder | null> {
  if (!idempotencyKey) {
    return null;
  }
  
  return await this.findOne({ idempotencyKey });
};

/**
 * Atomically update payment status with duplicate payment and idempotency prevention
 * Use this method when processing payment webhooks to ensure no duplicate payments
 * 
 * @param orderId - Order ID to update
 * @param paymentStatus - New payment status
 * @param paymentIntentId - Razorpay order ID (optional)
 * @param paymentId - Razorpay payment ID (optional)
 * @param idempotencyKey - Idempotency key for webhook processing (optional but recommended)
 * @returns Updated order or null if not found or duplicate payment detected
 */
OrderSchema.statics.updatePaymentStatus = async function(
  orderId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded',
  paymentIntentId?: string,
  paymentId?: string,
  idempotencyKey?: string
): Promise<IOrder | null> {
  const OrderModel = this as IOrderModel;
  
  // First, check idempotency key if provided (prevents duplicate webhook processing)
  if (idempotencyKey) {
    const existingOrder = await OrderModel.checkIdempotencyKey(idempotencyKey);
    if (existingOrder) {
      // Idempotency key already used - return existing order (idempotent operation)
      return existingOrder;
    }
  }
  
  // Second, check for duplicate payments before updating
  if (paymentIntentId || paymentId) {
    const isDuplicate = await OrderModel.checkDuplicatePayment(paymentIntentId, paymentId, orderId);
    if (isDuplicate) {
      throw new Error(
        `Duplicate payment detected. Payment ${paymentIntentId || paymentId} has already been processed in another order.`
      );
    }
  }

  // Build update object
  const update: {
    paymentStatus: string;
    paymentIntentId?: string;
    paymentId?: string;
    idempotencyKey?: string;
    status?: string;
  } = {
    paymentStatus,
  };

  if (paymentIntentId) {
    update.paymentIntentId = paymentIntentId;
  }

  if (paymentId) {
    update.paymentId = paymentId;
  }

  if (idempotencyKey) {
    update.idempotencyKey = idempotencyKey;
  }

  // Auto-update order status based on payment status
  if (paymentStatus === 'paid') {
    update.status = 'confirmed';
  } else if (paymentStatus === 'failed') {
    update.status = 'pending'; // Keep as pending for retry
  } else if (paymentStatus === 'refunded') {
    update.status = 'refunded';
  }

  // Use findOneAndUpdate for atomic operation
  const updatedOrder = await this.findOneAndUpdate(
    { _id: orderId },
    { $set: update },
    { new: true }
  );

  return updatedOrder;
};

// Pre-save hook to validate foreign keys, prevent duplicate payments, and generate order number
OrderSchema.pre('save', async function() {
  // Validate userId foreign key
  if (this.userId) {
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
  
  // Check idempotency key if provided (prevents duplicate webhook processing)
  if (this.idempotencyKey && this.isModified('idempotencyKey')) {
    const Order = this.constructor as IOrderModel;
    const existingOrder = await Order.checkIdempotencyKey(this.idempotencyKey);
    if (existingOrder && !existingOrder._id.equals(this._id)) {
      throw new Error(
        `Idempotency key ${this.idempotencyKey} has already been used for order ${existingOrder.orderNumber}`
      );
    }
  }
  
  // Prevent duplicate payments - Critical for payment security
  if (this.paymentIntentId || this.paymentId) {
    const Order = this.constructor as IOrderModel;
    const isDuplicate = await Order.checkDuplicatePayment(
      this.paymentIntentId,
      this.paymentId,
      this._id?.toString()
    );
    
    if (isDuplicate) {
      throw new Error(
        `Duplicate payment detected. Payment ${this.paymentIntentId || this.paymentId} has already been processed.`
      );
    }
  }
  
  // Additional validation: Ensure payment IDs are only set when payment is successful
  if ((this.paymentIntentId || this.paymentId) && this.paymentStatus === 'pending') {
    // Allow payment IDs to be set during payment processing
    // Payment IDs may be set before payment confirmation (e.g., Razorpay order creation)
    // This is acceptable as payment gateway may provide IDs before actual payment
    if (this.isModified('paymentIntentId') || this.isModified('paymentId')) {
      // Payment IDs can be set before payment is confirmed - this is expected behavior
    }
  }
  
  // Generate order number if not set
  if (!this.orderNumber) {
    const Order = this.constructor as IOrderModel;
    this.orderNumber = await Order.generateOrderNumber();
  }
  
  // Set shippedAt when status changes to shipped
  if (this.isModified('status') && this.status === 'shipped' && !this.shippedAt) {
    this.shippedAt = new Date();
  }
  
  // Set deliveredAt when status changes to delivered
  if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
});

// Export model with proper typing
const Order = (mongoose.models.Order as IOrderModel) || mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);

export default Order;
