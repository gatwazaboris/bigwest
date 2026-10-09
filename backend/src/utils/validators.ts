import { z } from 'zod';

const localizedTextSchema = z.object({
  en: z.string().trim(),
  fr: z.string().trim(),
});

const pageContentSchema = z.object({
  navLabel: localizedTextSchema,
  title: localizedTextSchema,
  description: localizedTextSchema,
  eyebrow: localizedTextSchema,
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
  companyName: z.string().trim().min(2).max(120),
  companyTagline: z.string().trim().max(180).default(''),
  logoImage: z.string().trim().default(''),
  heroTitle: localizedTextSchema,
  heroSubtitle: localizedTextSchema,
  aboutTitle: localizedTextSchema,
  aboutText: localizedTextSchema,
  heroImages: z.array(z.string().trim().min(1)).default([]),
  pages: z
    .object({
      boat: pageContentSchema,
      island: pageContentSchema,
      hiking: pageContentSchema,
      water: pageContentSchema,
      gallery: pageContentSchema,
      contact: pageContentSchema,
    })
    .optional(),
  contactEmail: z.string().trim().email(),
  whatsappNumber: z.string().trim().min(5),
  phoneNumber: z.string().trim().min(5),
  location: z.string().trim().min(2),
  facebookUrl: z.string().trim().default(''),
  instagramUrl: z.string().trim().default(''),
  tiktokUrl: z.string().trim().default(''),
  youtubeUrl: z.string().trim().default(''),
  twitterUrl: z.string().trim().default(''),
});

export const contactMessageInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(64).optional().or(z.literal('')),
  message: z.string().trim().min(5).max(4000),
});

export const contactMessageStatusSchema = z.object({
  status: z.enum(['new', 'read', 'archived']),
});

export const clientProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email(),
    phone: z.string().trim().max(64).optional().or(z.literal('')),
    profileImage: z.string().trim().default(''),
    currentPassword: z.string().min(8).optional().or(z.literal('')),
    newPassword: z.string().min(8).optional().or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword && !value.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Current password is required to set a new password',
        path: ['currentPassword'],
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  phone: z.string().trim().min(5).optional().or(z.literal('')),
  profileImage: z.string().trim().default(''),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(6).max(128),
});

export const bookingInputSchema = z.object({
  tourId: z.string().trim().min(1),
  tourDate: z.string().trim().min(8),
  guests: z.coerce.number().int().min(1).max(50),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  contactPhone: z.string().trim().min(5).optional().or(z.literal('')),
});

export const bookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  adminNotes: z.string().trim().max(2000).optional().or(z.literal('')),
});
