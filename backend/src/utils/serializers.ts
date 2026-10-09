import { defaultSiteSettingsPayload } from './default-settings.js';

type LocalizedText = { en: string; fr: string };
type PageContent = {
  navLabel: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  eyebrow: LocalizedText;
};

function localized(value: unknown): LocalizedText {
  if (!value || typeof value !== 'object') return { en: '', fr: '' };
  const item = value as Partial<LocalizedText>;
  return {
    en: typeof item.en === 'string' ? item.en : '',
    fr: typeof item.fr === 'string' ? item.fr : '',
  };
}

function pageContent(value: unknown, fallback: PageContent): PageContent {
  if (!value || typeof value !== 'object') return fallback;
  const record = value as Record<string, unknown>;
  const navLabel = localized(record.navLabel);
  const title = localized(record.title);
  const description = localized(record.description);
  const eyebrow = localized(record.eyebrow);
  return {
    navLabel: navLabel.en || navLabel.fr ? navLabel : fallback.navLabel,
    title: title.en || title.fr ? title : fallback.title,
    description: description.en || description.fr ? description : fallback.description,
    eyebrow: eyebrow.en || eyebrow.fr ? eyebrow : fallback.eyebrow,
  };
}

function serializePages(value: unknown) {
  const defaults = defaultSiteSettingsPayload.pages;
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    boat: pageContent(source.boat, defaults.boat),
    island: pageContent(source.island, defaults.island),
    hiking: pageContent(source.hiking, defaults.hiking),
    water: pageContent(source.water, defaults.water),
    gallery: pageContent(source.gallery, defaults.gallery),
    contact: pageContent(source.contact, defaults.contact),
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
}) {
  return {
    id: item.id,
    name: localized(item.name),
    description: localized(item.description),
    duration: localized(item.duration),
    category: item.category,
    priceUsd: item.priceUsd,
    status: item.status,
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
}) {
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
}) {
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
}) {
  return {
    companyName: item.companyName || 'Visit KIBUYE',
    companyTagline: item.companyTagline || 'Kibuye • Karongi • Lake Kivu',
    logoImage: item.logoImage || '',
    heroTitle: localized(item.heroTitle),
    heroSubtitle: localized(item.heroSubtitle),
    aboutTitle: localized(item.aboutTitle),
    aboutText: localized(item.aboutText),
    heroImages: Array.isArray(item.heroImages)
      ? item.heroImages.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : [],
    pages: serializePages(item.pages),
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

export function serializeContactMessage(item: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    message: item.message,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeClientUser(item: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  profileImage?: string | null;
  emailVerified?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: item.id,
    email: item.email,
    name: item.name,
    phone: item.phone,
    profileImage: item.profileImage || '',
    emailVerified: Boolean(item.emailVerified),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeBooking(item: {
  id: string;
  clientUserId: string;
  tourId: string;
  tourDate: Date;
  guests: number;
  status: string;
  notes: string | null;
  contactPhone: string | null;
  totalPriceUsd: number;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  tour?: {
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
  } | null;
  clientUser?: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}) {
  return {
    id: item.id,
    clientUserId: item.clientUserId,
    tourId: item.tourId,
    tourDate: item.tourDate.toISOString().slice(0, 10),
    guests: item.guests,
    status: item.status,
    notes: item.notes,
    contactPhone: item.contactPhone,
    totalPriceUsd: item.totalPriceUsd,
    adminNotes: item.adminNotes,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    tour: item.tour ? serializeTour(item.tour) : undefined,
    clientUser: item.clientUser ? serializeClientUser(item.clientUser) : undefined,
  };
}
