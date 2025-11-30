import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .max(254, 'Email must not exceed 254 characters')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .max(20, 'Phone number must not exceed 20 characters')
    .optional()
    .or(z.literal('')),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters')
    .trim(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

