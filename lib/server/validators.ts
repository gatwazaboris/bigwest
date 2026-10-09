import { z } from 'zod';

const localizedTextSchema = z.object({
  en: z.string().trim(),
  fr: z.string().trim(),
});

export const tourInputSchema = z.object({
  name: localizedTextSchema,
  description: localizedTextSchema,
  duration: localizedTextSchema,
  category: z.enum(['boat', 'island', 'hiking', 'water']),
  priceUsd: z.coerce.number().min(0),
  status: z.enum(['draft', 'published']),
  featured: z.boolean().default(false),
  images: z.array(z.string().trim().min(1)).default([]),
});

export const offerInputSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  discountPercent: z.coerce.number().int().min(0).max(100),
  active: z.boolean().default(true),
});

export const galleryInputSchema = z.object({
  title: localizedTextSchema,
  imageData: z.string().trim().min(1),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const settingsInputSchema = z.object({
  heroTitle: localizedTextSchema,
  heroSubtitle: localizedTextSchema,
  aboutTitle: localizedTextSchema,
  aboutText: localizedTextSchema,
  contactEmail: z.string().trim().email(),
  whatsappNumber: z.string().trim().min(5),
  phoneNumber: z.string().trim().min(5),
  location: z.string().trim().min(2),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});
