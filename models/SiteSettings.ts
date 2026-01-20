import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Site Settings Schema - Site Configuration
 */

export interface ISiteSettings extends Document {
  type: 'general' | 'hero' | 'about' | 'contact' | 'social' | 'seo' | 'shipping' | 'payment';
  data: Record<string, unknown>;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    type: {
      type: String,
      required: true,
      enum: ['general', 'hero', 'about', 'contact', 'social', 'seo', 'shipping', 'payment'],
      unique: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Export model
const SiteSettings: Model<ISiteSettings> = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
