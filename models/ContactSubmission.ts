import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 254 },
    phone: { type: String, maxlength: 10 },
    message: { type: String, required: true, maxlength: 5000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ContactSubmissionSchema.index({ createdAt: -1 });
ContactSubmissionSchema.index({ email: 1, createdAt: -1 });

const ContactSubmission: Model<IContactSubmission> =
  mongoose.models.ContactSubmission ||
  mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);

export default ContactSubmission;
