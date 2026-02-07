import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Country Settings Schema
 * Stores country-specific configuration for validation, formatting, and business rules
 */

export interface ICountrySettings extends Document {
  countryCode: string; // ISO country code (e.g., 'IN', 'US')
  countryName: string; // Full country name (e.g., 'India', 'United States')
  phoneCountryCode: string; // Phone country code (e.g., '+91', '+1')
  phonePattern: string; // Regex pattern for phone validation (e.g., '^[0-9]{10}$')
  phoneLength: number; // Expected phone number length
  pincodePattern: string; // Regex pattern for postal code (e.g., '^[0-9]{6}$')
  pincodeLength: number; // Expected pincode length
  pincodeLabel: string; // Label for postal code field (e.g., 'Pincode', 'ZIP Code')
  states?: string[]; // List of valid states/provinces (optional, for validation)
  currency: string; // Currency code (e.g., 'INR', 'USD')
  currencySymbol: string; // Currency symbol (e.g., '₹', '$')
  isActive: boolean; // Whether this country is enabled
  isDefault: boolean; // Whether this is the default country
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
}

const CountrySettingsSchema = new Schema<ICountrySettings>(
  {
    countryCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function(v: string) {
          return /^[A-Z]{2}$/.test(v);
        },
        message: 'Country code must be a 2-letter ISO code (e.g., IN, US)',
      },
    },
    countryName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phoneCountryCode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\+[0-9]{1,4}$/.test(v);
        },
        message: 'Phone country code must start with + followed by 1-4 digits',
      },
    },
    phonePattern: {
      type: String,
      required: true,
      trim: true,
    },
    phoneLength: {
      type: Number,
      required: true,
      min: 5,
      max: 15,
    },
    pincodePattern: {
      type: String,
      required: true,
      trim: true,
    },
    pincodeLength: {
      type: Number,
      required: true,
      min: 3,
      max: 10,
    },
    pincodeLabel: {
      type: String,
      required: true,
      trim: true,
      default: 'Pincode',
    },
    states: {
      type: [String],
      default: [],
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 3,
    },
    currencySymbol: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default country
CountrySettingsSchema.pre('save', async function() {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('CountrySettings').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

// Indexes
CountrySettingsSchema.index({ isActive: 1, order: 1 });
CountrySettingsSchema.index({ isDefault: 1 });
CountrySettingsSchema.index({ countryCode: 1, isActive: 1 });

// Export model
const CountrySettings: Model<ICountrySettings> = 
  mongoose.models.CountrySettings || 
  mongoose.model<ICountrySettings>('CountrySettings', CountrySettingsSchema);

export default CountrySettings;
