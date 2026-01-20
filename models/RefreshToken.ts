/**
 * Refresh Token Model
 * 
 * Industry standard OAuth 2.0 refresh token implementation:
 * - Separate refresh tokens from access tokens
 * - Token rotation (new token on each use)
 * - Reuse detection (revoke on reuse)
 * - Idle expiration (7 days unused)
 * - Absolute expiration (30 days max)
 * - Revocation support
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string; // Hashed refresh token
  deviceId?: string; // Optional device identifier
  userAgent?: string; // Browser/client info
  ipAddress?: string; // Client IP
  lastUsedAt: Date; // For idle expiration
  expiresAt: Date; // Absolute expiration
  revoked: boolean; // Manual revocation
  revokedAt?: Date; // When revoked
  replacedBy?: mongoose.Types.ObjectId; // Token that replaced this one (rotation)
  familyId: string; // Token family ID for reuse detection
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  isExpired(): boolean;
  isIdleExpired(): boolean;
  isRevoked(): boolean;
  isValid(): boolean;
  markRevoked(replacedBy?: mongoose.Types.ObjectId): Promise<void>;
}

export interface IRefreshTokenModel extends Model<IRefreshToken> {
  // Static methods
  createToken(userId: string, deviceId?: string, userAgent?: string, ipAddress?: string): Promise<{ token: string; refreshToken: IRefreshToken }>;
  findByToken(token: string): Promise<IRefreshToken | null>;
  revokeUserTokens(userId: string, excludeTokenId?: string): Promise<void>;
  revokeTokenFamily(familyId: string): Promise<void>;
  cleanupExpiredTokens(): Promise<number>;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    lastUsedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0, // TTL index - auto-delete expired tokens
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    replacedBy: {
      type: Schema.Types.ObjectId,
      ref: 'RefreshToken',
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
RefreshTokenSchema.index({ userId: 1, revoked: 1 });
RefreshTokenSchema.index({ familyId: 1, revoked: 1 });
// expiresAt index created by index: true and expires: 0

/**
 * Check if token is expired (absolute expiration)
 */
RefreshTokenSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date();
};

/**
 * Check if token is idle expired (not used for 7 days)
 */
RefreshTokenSchema.methods.isIdleExpired = function(): boolean {
  const IDLE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const lastUsed = this.lastUsedAt.getTime();
  const now = Date.now();
  return (now - lastUsed) > IDLE_EXPIRATION_MS;
};

/**
 * Check if token is revoked
 */
RefreshTokenSchema.methods.isRevoked = function(): boolean {
  return this.revoked;
};

/**
 * Check if token is valid (not expired, not idle, not revoked)
 */
RefreshTokenSchema.methods.isValid = function(): boolean {
  return !this.isExpired() && !this.isIdleExpired() && !this.isRevoked();
};

/**
 * Mark token as revoked (for rotation or manual revocation)
 */
RefreshTokenSchema.methods.markRevoked = async function(replacedBy?: mongoose.Types.ObjectId): Promise<void> {
  this.revoked = true;
  this.revokedAt = new Date();
  if (replacedBy) {
    this.replacedBy = replacedBy;
  }
  await this.save();
};

/**
 * Create new refresh token for user
 * Industry standard: Generate secure random token, hash it, store with metadata
 */
RefreshTokenSchema.statics.createToken = async function(
  userId: string,
  deviceId?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ token: string; refreshToken: IRefreshToken }> {
  const crypto = await import('crypto');
  
  // Generate secure random token (32 bytes = 256 bits)
  const rawToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token for storage (industry standard: never store plain tokens)
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  // Generate family ID for reuse detection
  const familyId = crypto.randomBytes(16).toString('hex');
  
  // Set expiration: 30 days absolute expiration
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const refreshToken = await this.create({
    userId,
    token: hashedToken,
    deviceId,
    userAgent,
    ipAddress,
    lastUsedAt: new Date(),
    expiresAt,
    familyId,
  });
  
  return {
    token: rawToken, // Return plain token to client (stored in HTTP-only cookie)
    refreshToken,
  };
};

/**
 * Find refresh token by plain token (hash and lookup)
 */
RefreshTokenSchema.statics.findByToken = async function(token: string): Promise<IRefreshToken | null> {
  const crypto = await import('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return this.findOne({ token: hashedToken, revoked: false });
};

/**
 * Revoke all tokens for a user (logout, password change)
 * Industry standard: Revoke all tokens except current one (if specified)
 */
RefreshTokenSchema.statics.revokeUserTokens = async function(
  userId: string,
  excludeTokenId?: string
): Promise<void> {
  const query: { userId: mongoose.Types.ObjectId; _id?: { $ne: mongoose.Types.ObjectId } } = {
    userId: new mongoose.Types.ObjectId(userId),
  };
  
  if (excludeTokenId) {
    // Validate ObjectId format before using
    if (mongoose.Types.ObjectId.isValid(excludeTokenId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeTokenId) };
    } else {
      // If excludeTokenId is not a valid ObjectId (e.g., it's a token string), find the token document first
      const crypto = await import('crypto');
      const hashedToken = crypto.createHash('sha256').update(excludeTokenId).digest('hex');
      const tokenDoc = await this.findOne({ token: hashedToken, userId: new mongoose.Types.ObjectId(userId) });
      if (tokenDoc) {
        query._id = { $ne: tokenDoc._id };
      }
    }
  }
  
  await this.updateMany(query, {
    revoked: true,
    revokedAt: new Date(),
  });
};

/**
 * Revoke entire token family (reuse detection)
 * Industry standard: If old token is reused, revoke entire family
 */
RefreshTokenSchema.statics.revokeTokenFamily = async function(familyId: string): Promise<void> {
  await this.updateMany(
    { familyId, revoked: false },
    {
      revoked: true,
      revokedAt: new Date(),
    }
  );
};

/**
 * Cleanup expired and revoked tokens (maintenance job)
 */
RefreshTokenSchema.statics.cleanupExpiredTokens = async function(): Promise<number> {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revoked: true, revokedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Delete revoked tokens older than 7 days
    ],
  });
  return result.deletedCount || 0;
};

const RefreshToken = (mongoose.models.RefreshToken as IRefreshTokenModel) ||
  mongoose.model<IRefreshToken, IRefreshTokenModel>('RefreshToken', RefreshTokenSchema);

export default RefreshToken;
