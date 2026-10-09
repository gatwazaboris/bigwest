import { notFound } from 'next/navigation';
import TourDetailPageClient from '@/components/public/pages/TourDetailPageClient';
import { getPublicSiteData } from '@/lib/server/site-repository';

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicSiteData();
  const tour = data.tours.find((item) => item.id === id);

  if (!tour) {
    notFound();
  }

  return <TourDetailPageClient initialData={data} tour={tour} />;
}
