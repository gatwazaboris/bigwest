import ContactPageClient from '@/components/public/pages/ContactPageClient';
import { getPublicSiteData } from '@/lib/server/site-repository';

export default async function ContactPage() {
  const data = await getPublicSiteData();
  return <ContactPageClient initialData={data} />;
}
