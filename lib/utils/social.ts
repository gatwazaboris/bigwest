import type { SiteSettings } from '@/types/site';

export type SocialNetwork = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'twitter';

export type SocialLink = {
  id: SocialNetwork;
  label: string;
  href: string;
};

export function getSocialLinks(settings: SiteSettings): SocialLink[] {
  const links: SocialLink[] = [
    { id: 'facebook', label: 'Facebook', href: settings.facebookUrl },
    { id: 'instagram', label: 'Instagram', href: settings.instagramUrl },
    { id: 'tiktok', label: 'TikTok', href: settings.tiktokUrl },
    { id: 'youtube', label: 'YouTube', href: settings.youtubeUrl },
    { id: 'twitter', label: 'X', href: settings.twitterUrl },
  ];
  return links.filter((item) => Boolean(item.href && item.href.trim()));
}
