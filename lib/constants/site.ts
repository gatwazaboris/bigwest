import type { Currency, SiteSettings, TourCategory } from '@/types/site';
import { defaultPages } from '@/lib/utils/site-pages';

export const categoryLabels: Record<TourCategory, { en: string; fr: string }> = {
  boat: defaultPages.boat.navLabel,
  island: defaultPages.island.navLabel,
  hiking: defaultPages.hiking.navLabel,
  water: defaultPages.water.navLabel,
};

export const currencies: Currency[] = ['USD', 'EUR', 'RWF'];

export const defaultHeroImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
];

export const defaultSettings: SiteSettings = {
  companyName: 'Visit KIBUYE',
  companyTagline: 'Kibuye • Karongi • Lake Kivu',
  logoImage: '',
  heroTitle: { en: 'Explore Kibuye and Lake Kivu', fr: 'Explorez Kibuye et le lac Kivu' },
  heroSubtitle: {
    en: 'Discover amazing islands, scenic boat rides, beaches, and unforgettable local experiences.',
    fr: 'Découvrez des îles magnifiques, des balades en bateau, des plages et des expériences locales inoubliables.',
  },
  aboutTitle: { en: 'About Visit KIBUYE', fr: 'À propos de Visit KIBUYE' },
  aboutText: {
    en: 'We create memorable local tourism experiences around Kibuye and Karongi.',
    fr: 'Nous créons des expériences touristiques locales mémorables autour de Kibuye et Karongi.',
  },
  heroImages: defaultHeroImages,
  pages: defaultPages,
  contactEmail: 'big_west_tour@gmail.com',
  whatsappNumber: '250784921771',
  phoneNumber: '+250 784 921 771',
  location: 'Kibuye, Karongi, Rwanda',
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  twitterUrl: '',
};
