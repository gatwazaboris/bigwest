import { defaultSettings } from '@/lib/constants/site';
import { normalizePages } from '@/lib/utils/site-pages';
import type { GalleryItem, LocalizedText, Offer, SiteSettings, Tour } from '@/types/site';

function localized(value: unknown): LocalizedText {
  if (!value || typeof value !== 'object') return { en: '', fr: '' };
  const item = value as Partial<LocalizedText>;
  return {
    en: typeof item.en === 'string' ? item.en : '',
    fr: typeof item.fr === 'string' ? item.fr : '',
  };
}

export function serializeTour(item: {
  id: string;
  name: unknown;
  description: unknown;
  duration: unknown;
  category: string;
  priceUsd: number;
  status: string;
  featured: boolean;
  images: unknown;
  createdAt: Date;
  updatedAt: Date;
}): Tour {
  return {
    id: item.id,
    name: localized(item.name),
    description: localized(item.description),
    duration: localized(item.duration),
    category: item.category as Tour['category'],
    priceUsd: item.priceUsd,
    status: item.status as Tour['status'],
    featured: item.featured,
    images: Array.isArray(item.images)
      ? item.images.filter((value): value is string => typeof value === 'string')
      : [],
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeOffer(item: {
  id: string;
  title: unknown;
  description: unknown;
  discountPercent: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Offer {
  return {
    id: item.id,
    title: localized(item.title),
    description: localized(item.description),
    discountPercent: item.discountPercent,
    active: item.active,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeGalleryItem(item: {
  id: string;
  title: unknown;
  imageData: string;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): GalleryItem {
  return {
    id: item.id,
    title: localized(item.title),
    imageData: item.imageData,
    featured: item.featured,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeSiteSettings(item: {
  companyName?: string | null;
  companyTagline?: string | null;
  logoImage?: string | null;
  heroTitle: unknown;
  heroSubtitle: unknown;
  aboutTitle: unknown;
  aboutText: unknown;
  heroImages?: unknown;
  pages?: unknown;
  contactEmail: string;
  whatsappNumber: string;
  phoneNumber: string;
  location: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  twitterUrl?: string | null;
}): SiteSettings {
  return {
    ...defaultSettings,
    companyName: item.companyName || defaultSettings.companyName,
    companyTagline: item.companyTagline || defaultSettings.companyTagline,
    logoImage: item.logoImage || '',
    heroTitle: localized(item.heroTitle),
    heroSubtitle: localized(item.heroSubtitle),
    aboutTitle: localized(item.aboutTitle),
    aboutText: localized(item.aboutText),
    heroImages: Array.isArray(item.heroImages)
      ? item.heroImages.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : defaultSettings.heroImages,
    pages: normalizePages(item.pages),
    contactEmail: item.contactEmail,
    whatsappNumber: item.whatsappNumber,
    phoneNumber: item.phoneNumber,
    location: item.location,
    facebookUrl: item.facebookUrl || '',
    instagramUrl: item.instagramUrl || '',
    tiktokUrl: item.tiktokUrl || '',
    youtubeUrl: item.youtubeUrl || '',
    twitterUrl: item.twitterUrl || '',
  };
}
