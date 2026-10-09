import GalleryPageClient from '@/components/public/pages/GalleryPageClient';
import { getPublicSiteData } from '@/lib/server/site-repository';

export default async function GalleryPage() {
  const data = await getPublicSiteData();
  return <GalleryPageClient initialData={data} />;
}
