import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Inventory Log Schema - Track All Inventory Changes
 * 
 * E-commerce Inventory Management:
 * - Track all stock movements
 * - Audit trail for inventory
 * - Support for sales, restocks, adjustments, returns
 * - Link to orders and users
 */

export interface IInventoryLog extends Document {
  // Product Reference
  productId: mongoose.Types.ObjectId;
  productSku: string;
  productTitle: string;
  
  // Inventory Change Details
  type: 'sale' | 'restock' | 'adjustment' | 'return' | 'reserved' | 'released';
  quantity: number; // Positive for restock/return, negative for sale
  previousQuantity: number; // Stock before change
  newQuantity: number; // Stock after change
  
  // Context
  reason?: string; // Reason for adjustment
  notes?: string; // Additional notes
  
  // References
  orderId?: mongoose.Types.ObjectId; // If related to an order
  userId?: mongoose.Types.ObjectId; // User who made the change (for admin adjustments)
  idempotencyKey?: string; // Idempotency key to prevent duplicate processing
  
  // Metadata
  performedBy: {
    userId?: mongoose.Types.ObjectId;
    type: 'system' | 'admin' | 'customer' | 'api';
    name?: string; // Admin name or system process name
  };
  
  // Timestamps
  createdAt: Date;
}

const InventoryLogSchema = new Schema<IInventoryLog>(
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
    type: {
      type: String,
      enum: ['sale', 'restock', 'adjustment', 'return', 'reserved', 'released'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    newQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    idempotencyKey: {
      type: String,
      unique: true, // Idempotency key must be unique
      sparse: true, // Allow null, but unique if present
    },
    performedBy: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: ['system', 'admin', 'customer', 'api'],
        required: true,
        default: 'system',
      },
      name: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation
  }
);

// Pre-save hook to validate foreign keys
InventoryLogSchema.pre('save', async function() {
  // Get session if available (for transaction support)
  const session = this.$session();
  
  // Validate productId foreign key
  if (this.productId) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.productId).session(session || null);
    if (!product) {
      throw new Error('Product does not exist');
    }
  }
  
  // Validate orderId foreign key if provided
  // Note: In transactions, order might not be visible yet, so we skip validation
  // if we're in a transaction (session exists)
  if (this.orderId && !session) {
    const Order = mongoose.model('Order');
    const order = await Order.findById(this.orderId);
    if (!order) {
      throw new Error('Order does not exist');
    }
  }
  
  // Validate userId foreign key if provided
  if (this.userId) {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId).session(session || null);
    if (!user) {
      throw new Error('User does not exist');
    }
  }
});

// Indexes for efficient queries and foreign key relationships
InventoryLogSchema.index({ productId: 1, createdAt: -1 }); // Foreign key: Product history
InventoryLogSchema.index({ productId: 1 }); // Foreign key index for Product
InventoryLogSchema.index({ orderId: 1 }); // Foreign key index for Order
InventoryLogSchema.index({ userId: 1 }); // Foreign key index for User
InventoryLogSchema.index({ idempotencyKey: 1 }); // Idempotency key lookup
InventoryLogSchema.index({ type: 1, createdAt: -1 }); // Type-based queries
InventoryLogSchema.index({ createdAt: -1 }); // Recent changes
InventoryLogSchema.index({ productSku: 1, createdAt: -1 }); // SKU-based queries

// Export model
const InventoryLog: Model<IInventoryLog> = mongoose.models.InventoryLog || mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema);

export default InventoryLog;
