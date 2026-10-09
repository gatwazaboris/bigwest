import { redirect } from 'next/navigation';
import PageShell from '@/components/public/pages/PageShell';
import VerifyEmailClient from '@/components/public/pages/VerifyEmailClient';
import { getClientSession } from '@/lib/auth/session';
import { getPublicSiteData } from '@/lib/server/site-repository';

export default async function VerifyEmailPage() {
  const session = await getClientSession();
  if (!session) {
    redirect('/admin/login?next=/account/verify');
  }

  const data = await getPublicSiteData();

  return (
    <PageShell settings={data.settings} initialData={data} showBackHome showFooterContact={false}>
      <VerifyEmailClient />
    </PageShell>
  );
}
