import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Category Schema - Product Categories
 */

export interface ICategory extends Document {
  slug: string;
  name: string;
  displayName: string;
  description?: string;
  image: string;
  alt: string;
  order: number; // For sorting
  active: boolean;
  parentCategory?: mongoose.Types.ObjectId; // For subcategories (future)
  productCount?: number; // Cached count of products
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function(v: string) {
          // Slug must be lowercase alphanumeric with hyphens, no spaces or special chars
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
        },
        message: 'Slug must be lowercase alphanumeric with hyphens only (e.g., "my-category")',
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, // Limit name length
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to validate foreign key and prevent self-reference
CategorySchema.pre('save', async function() {
  // Validate parentCategory foreign key if provided
  if (this.parentCategory) {
    // Prevent self-reference
    if (this._id && this._id.equals(this.parentCategory)) {
      throw new Error('Category cannot reference itself as parent');
    }
    
    const Category = mongoose.model('Category');
    const parent = await Category.findById(this.parentCategory);
    if (!parent) {
      throw new Error('Parent category does not exist');
    }
  }
});

// Indexes for performance and foreign key relationships
CategorySchema.index({ active: 1, order: 1 }); // Active categories sorted
CategorySchema.index({ parentCategory: 1 }); // Foreign key index for parent Category

// Export model
const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
