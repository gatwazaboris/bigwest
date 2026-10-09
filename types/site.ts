export type Language = 'en' | 'fr';
export type Currency = 'USD' | 'EUR' | 'RWF';

export type LocalizedText = {
  en: string;
  fr: string;
};

export type TourCategory = 'boat' | 'island' | 'hiking' | 'water';
export type PublishStatus = 'draft' | 'published';

export type Tour = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  duration: LocalizedText;
  category: TourCategory;
  priceUsd: number;
  status: PublishStatus;
  featured: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type Offer = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  discountPercent: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GalleryItem = {
  id: string;
  title: LocalizedText;
  imageData: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SitePageKey = TourCategory | 'gallery' | 'contact';

export type SitePageContent = {
  navLabel: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  eyebrow: LocalizedText;
};

export type SitePages = Record<SitePageKey, SitePageContent>;

export type SiteSettings = {
  companyName: string;
  companyTagline: string;
  logoImage: string;
  heroTitle: LocalizedText;
  heroSubtitle: LocalizedText;
  aboutTitle: LocalizedText;
  aboutText: LocalizedText;
  heroImages: string[];
  pages: SitePages;
  contactEmail: string;
  whatsappNumber: string;
  phoneNumber: string;
  location: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
};

export type PublicSiteData = {
  settings: SiteSettings;
  tours: Tour[];
  offers: Offer[];
  gallery: GalleryItem[];
};

export type AdminSession = {
  id: string;
  email: string;
  name?: string | null;
};

export type ClientSession = {
  id: string;
  email: string;
  name: string;
};

export type ClientUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  profileImage: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  bookingsCount?: number;
};

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Booking = {
  id: string;
  clientUserId: string;
  tourId: string;
  tourDate: string;
  guests: number;
  status: BookingStatus;
  notes: string | null;
  contactPhone: string | null;
  totalPriceUsd: number;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  tour?: Tour;
  clientUser?: ClientUser;
};

export type ContactMessageStatus = 'new' | 'read' | 'archived';

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
};
