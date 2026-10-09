import type {
  Language,
  LocalizedText,
  SitePageContent,
  SitePageKey,
  SitePages,
  SiteSettings,
  TourCategory,
} from '@/types/site';

const text = (en: string, fr: string): LocalizedText => ({ en, fr });

export const SITE_PAGE_KEYS: SitePageKey[] = ['boat', 'island', 'hiking', 'water', 'gallery', 'contact'];

export const SITE_PAGE_META: Record<SitePageKey, { label: string; path: string }> = {
  boat: { label: 'Boat Tours', path: '/tours/boat' },
  island: { label: 'Island Visits', path: '/tours/island' },
  hiking: { label: 'Hiking & Safaris', path: '/tours/hiking' },
  water: { label: 'Water Activities', path: '/tours/water' },
  gallery: { label: 'Gallery', path: '/gallery' },
  contact: { label: 'Contact', path: '/contact' },
};

export const defaultPages: SitePages = {
  boat: {
    navLabel: text('Boat Tours', 'Excursions en bateau'),
    title: text('Boat Tours', 'Excursions en bateau'),
    eyebrow: text('Tour category', 'Catégorie'),
    description: text(
      'Scenic boat rides across Lake Kivu, island transfers, and private lake experiences.',
      'Balades en bateau sur le lac Kivu, transferts vers les îles et expériences privées.',
    ),
  },
  island: {
    navLabel: text('Island Visits', 'Visites des îles'),
    title: text('Island Visits', 'Visites des îles'),
    eyebrow: text('Tour category', 'Catégorie'),
    description: text(
      'Visit Lake Kivu islands with guided stops, local stories, and memorable views.',
      'Visitez les îles du lac Kivu avec des arrêts guidés, des histoires locales et de belles vues.',
    ),
  },
  hiking: {
    navLabel: text('Hiking & Safaris', 'Randonnée & marche'),
    title: text('Hiking & Safaris', 'Randonnée & marche'),
    eyebrow: text('Tour category', 'Catégorie'),
    description: text(
      'Walk lakeside trails and scenic viewpoints around Kibuye and Karongi.',
      'Parcourez les sentiers au bord du lac et les points de vue autour de Kibuye et Karongi.',
    ),
  },
  water: {
    navLabel: text('Water Activities', 'Activités nautiques'),
    title: text('Water Activities', 'Activités nautiques'),
    eyebrow: text('Tour category', 'Catégorie'),
    description: text(
      'Enjoy swimming, kayaking, and other water activities on Lake Kivu.',
      'Profitez de la baignade, du kayak et d’autres activités nautiques sur le lac Kivu.',
    ),
  },
  gallery: {
    navLabel: text('Gallery', 'Galerie'),
    title: text('Gallery', 'Galerie'),
    eyebrow: text('Visual stories', 'Moments visuels'),
    description: text(
      'Explore the visual side of Visit KIBUYE through destinations, sunsets, islands, and moments on Lake Kivu.',
      'Découvrez l’univers visuel de Visit KIBUYE à travers les destinations, couchers de soleil, îles et moments sur le lac Kivu.',
    ),
  },
  contact: {
    navLabel: text('Contact', 'Contact'),
    title: text('Contact Visit KIBUYE', 'Contactez Visit KIBUYE'),
    eyebrow: text('Plan your trip', 'Planifiez votre voyage'),
    description: text(
      'Reach out for bookings, private trips, custom itineraries, island visits, hiking experiences, fishing activities, and general questions.',
      'Contactez-nous pour les réservations, les excursions privées, les itinéraires personnalisés, les visites d’îles, les randonnées, la pêche et toute question générale.',
    ),
  },
};

function localizedOrDefault(value: unknown, fallback: LocalizedText): LocalizedText {
  if (!value || typeof value !== 'object') return fallback;
  const record = value as Record<string, unknown>;
  return {
    en: typeof record.en === 'string' && record.en.trim() ? record.en : fallback.en,
    fr: typeof record.fr === 'string' && record.fr.trim() ? record.fr : fallback.fr,
  };
}

function pageOrDefault(value: unknown, fallback: SitePageContent): SitePageContent {
  if (!value || typeof value !== 'object') return fallback;
  const record = value as Record<string, unknown>;
  return {
    navLabel: localizedOrDefault(record.navLabel, fallback.navLabel),
    title: localizedOrDefault(record.title, fallback.title),
    description: localizedOrDefault(record.description, fallback.description),
    eyebrow: localizedOrDefault(record.eyebrow, fallback.eyebrow),
  };
}

export function normalizePages(value: unknown): SitePages {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    boat: pageOrDefault(source.boat, defaultPages.boat),
    island: pageOrDefault(source.island, defaultPages.island),
    hiking: pageOrDefault(source.hiking, defaultPages.hiking),
    water: pageOrDefault(source.water, defaultPages.water),
    gallery: pageOrDefault(source.gallery, defaultPages.gallery),
    contact: pageOrDefault(source.contact, defaultPages.contact),
  };
}

export function getSitePage(settings: Pick<SiteSettings, 'pages'> | undefined, key: SitePageKey): SitePageContent {
  return normalizePages(settings?.pages)[key];
}

export function getCategoryLabel(
  settings: Pick<SiteSettings, 'pages'> | undefined,
  category: TourCategory,
  language: Language = 'en',
) {
  return getSitePage(settings, category).navLabel[language];
}

export function getNavPageLabels(settings: Pick<SiteSettings, 'pages'> | undefined, language: Language = 'en') {
  const pages = normalizePages(settings?.pages);
  return {
    boat: pages.boat.navLabel[language],
    island: pages.island.navLabel[language],
    hiking: pages.hiking.navLabel[language],
    water: pages.water.navLabel[language],
    gallery: pages.gallery.navLabel[language],
    contact: pages.contact.navLabel[language],
  };
}
