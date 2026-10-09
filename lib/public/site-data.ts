import { defaultSettings } from '@/lib/constants/site';
import { normalizePages } from '@/lib/utils/site-pages';
import type { PublicSiteData } from '@/types/site';

export function normalizePublicData(payload: PublicSiteData): PublicSiteData {
  return {
    settings: {
      ...defaultSettings,
      ...payload.settings,
      heroImages: Array.isArray(payload.settings?.heroImages)
        ? payload.settings.heroImages.filter(Boolean)
        : defaultSettings.heroImages,
      pages: normalizePages(payload.settings?.pages),
    },
    tours: Array.isArray(payload.tours) ? payload.tours : [],
    offers: Array.isArray(payload.offers) ? payload.offers : [],
    gallery: Array.isArray(payload.gallery) ? payload.gallery : [],
  };
}

/** Browser-side fetch so the live website mirrors admin changes. */
export async function fetchPublicSiteDataClient(): Promise<PublicSiteData> {
  const response = await fetch('/api/public/bootstrap', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to refresh website content');
  }
  return normalizePublicData((await response.json()) as PublicSiteData);
}
