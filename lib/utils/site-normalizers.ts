import { defaultSettings } from '@/lib/constants/site';
import { normalizePages } from '@/lib/utils/site-pages';
import type { GalleryItem, LocalizedText, Offer, SiteSettings, Tour, TourCategory } from '@/types/site';

export function normalizeLocalizedText(value: unknown): LocalizedText {
  if (!value || typeof value !== 'object') return { en: '', fr: '' };
  const text = value as Partial<LocalizedText>;
  return {
    en: typeof text.en === 'string' ? text.en : '',
    fr: typeof text.fr === 'string' ? text.fr : '',
  };
}

export function normalizeCategory(value: unknown): TourCategory {
  return value === 'boat' || value === 'island' || value === 'hiking' || value === 'water' ? value : 'boat';
}

export function normalizeSiteSettings(value: unknown): SiteSettings {
  if (!value || typeof value !== 'object') {
    return { ...defaultSettings };
  }

  const settings = value as Partial<SiteSettings>;
  return {
    ...defaultSettings,
    ...settings,
    companyName: typeof settings.companyName === 'string' ? settings.companyName : defaultSettings.companyName,
    companyTagline:
      typeof settings.companyTagline === 'string' ? settings.companyTagline : defaultSettings.companyTagline,
    logoImage: typeof settings.logoImage === 'string' ? settings.logoImage : '',
    heroTitle: normalizeLocalizedText(settings.heroTitle || defaultSettings.heroTitle),
    heroSubtitle: normalizeLocalizedText(settings.heroSubtitle || defaultSettings.heroSubtitle),
    aboutTitle: normalizeLocalizedText(settings.aboutTitle || defaultSettings.aboutTitle),
    aboutText: normalizeLocalizedText(settings.aboutText || defaultSettings.aboutText),
    heroImages: Array.isArray(settings.heroImages)
      ? settings.heroImages.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : defaultSettings.heroImages,
    pages: normalizePages(settings.pages),
    contactEmail: typeof settings.contactEmail === 'string' ? settings.contactEmail : defaultSettings.contactEmail,
    whatsappNumber:
      typeof settings.whatsappNumber === 'string' ? settings.whatsappNumber : defaultSettings.whatsappNumber,
    phoneNumber: typeof settings.phoneNumber === 'string' ? settings.phoneNumber : defaultSettings.phoneNumber,
    location: typeof settings.location === 'string' ? settings.location : defaultSettings.location,
    facebookUrl: typeof settings.facebookUrl === 'string' ? settings.facebookUrl : '',
    instagramUrl: typeof settings.instagramUrl === 'string' ? settings.instagramUrl : '',
    tiktokUrl: typeof settings.tiktokUrl === 'string' ? settings.tiktokUrl : '',
    youtubeUrl: typeof settings.youtubeUrl === 'string' ? settings.youtubeUrl : '',
    twitterUrl: typeof settings.twitterUrl === 'string' ? settings.twitterUrl : '',
  };
}

export function toEditableTour(value?: Partial<Tour>): Omit<Tour, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: normalizeLocalizedText(value?.name),
    description: normalizeLocalizedText(value?.description),
    duration: normalizeLocalizedText(value?.duration),
    category: normalizeCategory(value?.category),
    priceUsd: typeof value?.priceUsd === 'number' ? value.priceUsd : Number(value?.priceUsd) || 0,
    status: value?.status === 'published' ? 'published' : 'draft',
    featured: Boolean(value?.featured),
    images: Array.isArray(value?.images)
      ? value.images.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [],
  };
}

export function toEditableOffer(value?: Partial<Offer>): Omit<Offer, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: normalizeLocalizedText(value?.title),
    description: normalizeLocalizedText(value?.description),
    discountPercent:
      typeof value?.discountPercent === 'number' ? value.discountPercent : Number(value?.discountPercent) || 0,
    active: typeof value?.active === 'boolean' ? value.active : true,
  };
}

export function toEditableGalleryItem(
  value?: Partial<GalleryItem>,
): Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: normalizeLocalizedText(value?.title),
    imageData: typeof value?.imageData === 'string' ? value.imageData : '',
    featured: Boolean(value?.featured),
    sortOrder: typeof value?.sortOrder === 'number' ? value.sortOrder : Number(value?.sortOrder) || 0,
  };
}
