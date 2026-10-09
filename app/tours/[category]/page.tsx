import { notFound } from 'next/navigation';
import TourCategoryPageClient from '@/components/public/pages/TourCategoryPageClient';
import { getPublicSiteData } from '@/lib/server/site-repository';
import type { TourCategory } from '@/types/site';

const validCategories: TourCategory[] = ['boat', 'island', 'hiking', 'water'];

export default async function TourCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!validCategories.includes(category as TourCategory)) {
    notFound();
  }

  const data = await getPublicSiteData();

  return <TourCategoryPageClient initialData={data} category={category as TourCategory} />;
}
