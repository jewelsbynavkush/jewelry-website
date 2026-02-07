import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and dots')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .max(254, 'Email must not exceed 254 characters')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters')
    .trim(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

