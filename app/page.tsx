import PublicHome from '@/components/public/PublicHome';
import { getPublicSiteData } from '@/lib/server/site-repository';

export default async function Page() {
  const data = await getPublicSiteData();
  return <PublicHome initialData={data} />;
}
