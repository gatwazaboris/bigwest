import { getBackendUrl } from '@/lib/config/backend';
import { defaultSettings } from '@/lib/constants/site';
import { normalizePublicData } from '@/lib/public/site-data';
import type { PublicSiteData } from '@/types/site';

const BACKEND_URL = getBackendUrl();

export async function getPublicSiteData(): Promise<PublicSiteData> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/public/bootstrap`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    return normalizePublicData((await response.json()) as PublicSiteData);
  } catch (error) {
    console.error('Failed to load public site data from backend:', error);
    return {
      settings: defaultSettings,
      tours: [],
      offers: [],
      gallery: [],
    };
  }
}
