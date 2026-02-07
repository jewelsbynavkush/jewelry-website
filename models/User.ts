import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { SECURITY_CONFIG } from '@/lib/security/constants';

/**
 * User Schema - Email Based Authentication
 * 
 * E-commerce User Management:
 * - Email as primary identifier (required)
 * - Mobile optional (required during order)
 * - Password authentication
 * - OTP verification for email
 * - User roles and permissions
 * - Address management
 * - Order history
 */

export interface IAddress {
  id: string;
  type: 'shipping' | 'billing' | 'both';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  countryCode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  // Primary Identification (Email-based)
  email: string; // Required - Primary identifier
  emailVerified: boolean;
  emailVerificationOTP?: string;
  emailVerificationOTPExpires?: Date;
  
  // Optional Mobile (required during order)
  mobile?: string; // Optional - Used in shipping/billing address
  countryCode?: string; // e.g., '+91' for India
  
  // Personal Information
  firstName: string;
  lastName: string;
  displayName?: string; // Computed: firstName + lastName
  
  // Authentication
  password: string; // Hashed password
  passwordChangedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  
  // User Role & Permissions
  role: 'customer' | 'admin' | 'staff';
  isActive: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  blockedAt?: Date;
  
  // Addresses
  addresses: IAddress[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  
  // Preferences
  preferences: {
    currency: string;
    language: string;
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
  };
  
  // Account Status
  lastLogin?: Date;
  lastLoginIP?: string;
  loginAttempts: number;
  lockUntil?: Date;
  
  // Analytics
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Instance Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailOTP(): string;
  verifyEmailOTP(otp: string): boolean;
  incLoginAttempts(): Promise<IUser | null>;
  resetLoginAttempts(): Promise<IUser | null>;
  addAddress(addressData: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>): string;
  getDefaultShippingAddress(): IAddress | null;
  getDefaultBillingAddress(): IAddress | null;
  
  // Virtual Properties
  fullName: string;
  fullMobile?: string;
  isLocked: boolean;
}

export interface IUserModel extends Model<IUser> {
  // Static Methods - Atomic Operations
  incrementLoginAttempts(userId: mongoose.Types.ObjectId | string): Promise<IUser | null>;
  resetLoginAttempts(userId: mongoose.Types.ObjectId | string): Promise<IUser | null>;
}

const AddressSchema = new Schema<IAddress>(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    type: {
      type: String,
      enum: ['shipping', 'billing', 'both'],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: 'India',
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      default: '+91',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOTP: {
      type: String,
    },
    emailVerificationOTPExpires: {
      type: Date,
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Mobile number must be 10 digits',
      },
    },
    countryCode: {
      type: String,
      required: false,
      // Default removed - will be set from DB country settings in pre-save hook
      // Falls back to '+91' if DB unavailable
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    displayName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    passwordChangedAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'staff'],
      default: 'customer',
      // Index defined via UserSchema.index() below (compound with isActive)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
    },
    blockedAt: {
      type: Date,
    },
    addresses: [AddressSchema],
    defaultShippingAddressId: {
      type: String,
    },
    defaultBillingAddressId: {
      type: String,
    },
    preferences: {
      currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR'],
      },
      language: {
        type: String,
        default: 'en',
      },
      newsletter: {
        type: Boolean,
        default: false,
      },
      smsNotifications: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
    lastLogin: {
      type: Date,
    },
    lastLoginIP: {
      type: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Email index created automatically by unique: true
UserSchema.index({ mobile: 1, countryCode: 1 }, { sparse: true }); // Mobile lookup (sparse for optional field)
UserSchema.index({ role: 1, isActive: 1 }); // Admin queries
UserSchema.index({ createdAt: -1 }); // New users

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for full mobile number
UserSchema.virtual('fullMobile').get(function() {
  if (!this.mobile || !this.countryCode) return undefined;
  return `${this.countryCode}${this.mobile}`;
});

// Virtual for account locked status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save hook to hash password
UserSchema.pre('save', async function() {
  // Only hash password if it's modified
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Pre-save hook to set displayName
UserSchema.pre('save', async function() {
  if (!this.displayName) {
    this.displayName = `${this.firstName} ${this.lastName}`.trim();
  }
});

// Pre-save hook to set default country code from DB
UserSchema.pre('save', async function() {
  if (!this.countryCode) {
    try {
      const { getDefaultCountry } = await import('@/lib/data/country-settings');
      const defaultCountry = await getDefaultCountry();
      this.countryCode = defaultCountry?.phoneCountryCode || '+91'; // Fallback to +91 if DB unavailable
    } catch {
      // If DB unavailable, use fallback
      this.countryCode = '+91';
    }
  }
  
  // Validate mobile against country pattern if mobile is provided
  if (this.mobile && this.countryCode) {
    try {
      const { getCountryByPhoneCode } = await import('@/lib/data/country-settings');
      const country = await getCountryByPhoneCode(this.countryCode);
      if (country) {
        const regex = new RegExp(country.phonePattern);
        if (!regex.test(this.mobile.trim())) {
          throw new Error(`Mobile number must match pattern for ${country.countryName}: ${country.phonePattern}`);
        }
      }
    } catch (error) {
      // If validation fails, throw error
      if (error instanceof Error && error.message.includes('Mobile number')) {
        throw error;
      }
      // If DB unavailable, use default validation (10 digits)
      const defaultRegex = /^[0-9]{10}$/;
      if (!defaultRegex.test(this.mobile.trim())) {
        throw new Error('Mobile number must be 10 digits');
      }
    }
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email OTP
UserSchema.methods.generateEmailOTP = function(): string {
  if (!this.email) {
    throw new Error('Email is required to generate OTP');
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.emailVerificationOTP = otp;
  this.emailVerificationOTPExpires = new Date(Date.now() + SECURITY_CONFIG.OTP_EXPIRATION_MS);
  return otp;
};

// Method to verify email OTP
UserSchema.methods.verifyEmailOTP = function(otp: string): boolean {
  if (!this.emailVerificationOTP || !this.emailVerificationOTPExpires) {
    return false;
  }
  if (this.emailVerificationOTPExpires < new Date()) {
    return false; // OTP expired
  }
  return this.emailVerificationOTP === otp;
};

/**
 * Static Methods - Atomic User Operations
 */

/**
 * Atomically increment login attempts
 * Uses MongoDB atomic operations to prevent race conditions
 * 
 * @param userId - User ID
 * @returns Updated user document or null if not found
 */
UserSchema.statics.incrementLoginAttempts = async function(
  userId: mongoose.Types.ObjectId | string
): Promise<IUser | null> {
  const user = await this.findById(userId);
  if (!user) return null;

  // Reset login attempts if previous lock period has expired
  // Allows user to attempt login again after lockout period ends
  if (user.lockUntil && user.lockUntil < new Date()) {
    return await this.findByIdAndUpdate(
      userId,
      {
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 },
      },
      { new: true }
    );
  }

  const updates: Record<string, unknown> = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  // Check lockUntil directly (not isLocked virtual) since virtuals may not be available in static methods
  const isCurrentlyLocked = user.lockUntil && user.lockUntil > new Date();
  if (user.loginAttempts + 1 >= 5 && !isCurrentlyLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
  }
  
  return await this.findByIdAndUpdate(userId, updates, { new: true });
};

/**
 * Atomically reset login attempts
 * 
 * @param userId - User ID
 * @returns Updated user document or null if not found
 */
UserSchema.statics.resetLoginAttempts = async function(
  userId: mongoose.Types.ObjectId | string
): Promise<IUser | null> {
  return await this.findByIdAndUpdate(
    userId,
    {
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 },
    },
    { new: true }
  );
};

/**
 * Instance Methods - Convenience Wrappers
 */

// Method to increment login attempts (convenience wrapper)
UserSchema.methods.incLoginAttempts = async function(): Promise<IUser | null> {
  const User = this.constructor as IUserModel;
  const updated = await User.incrementLoginAttempts(this._id);
  if (updated) {
    // Synchronize instance with database state to reflect updated login attempts
    this.loginAttempts = updated.loginAttempts;
    this.lockUntil = updated.lockUntil;
  }
  return updated;
};

// Method to reset login attempts (convenience wrapper)
UserSchema.methods.resetLoginAttempts = async function(): Promise<IUser | null> {
  const User = this.constructor as IUserModel;
  const updated = await User.resetLoginAttempts(this._id);
  if (updated) {
    // Synchronize instance with database state to reflect reset login attempts
    this.loginAttempts = updated.loginAttempts;
    this.lockUntil = updated.lockUntil;
  }
  return updated;
};

// Method to add address
UserSchema.methods.addAddress = function(addressData: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>): string {
  const addressId = new mongoose.Types.ObjectId().toString();
  const address: IAddress = {
    ...addressData,
    id: addressId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Set as default address if this is the first address or explicitly marked as default
  // E-commerce best practice: Ensures users always have at least one default address for checkout
  if (this.addresses.length === 0 || addressData.isDefault) {
    if (addressData.type === 'shipping' || addressData.type === 'both') {
      this.defaultShippingAddressId = addressId;
    }
    if (addressData.type === 'billing' || addressData.type === 'both') {
      this.defaultBillingAddressId = addressId;
    }
    // Unset default from other addresses
    this.addresses.forEach((addr: IAddress) => {
      if (addr.id !== addressId) {
        addr.isDefault = false;
      }
    });
  }
  
  this.addresses.push(address);
  return addressId;
};

// Method to get default shipping address
UserSchema.methods.getDefaultShippingAddress = function(): IAddress | null {
  if (this.defaultShippingAddressId) {
    return this.addresses.find((addr: IAddress) => addr.id === this.defaultShippingAddressId) || null;
  }
  return this.addresses.find((addr: IAddress) => addr.type === 'shipping' || addr.type === 'both') || null;
};

// Method to get default billing address
UserSchema.methods.getDefaultBillingAddress = function(): IAddress | null {
  if (this.defaultBillingAddressId) {
    return this.addresses.find((addr: IAddress) => addr.id === this.defaultBillingAddressId) || null;
  }
  return this.addresses.find((addr: IAddress) => addr.type === 'billing' || addr.type === 'both') || null;
};

// Export Mongoose model with connection caching and proper TypeScript typing
// Prevents duplicate model compilation and ensures type safety
const User = (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
