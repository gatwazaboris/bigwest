import { redirect } from 'next/navigation';
import AccountPortal from '@/components/public/pages/AccountPortal';
import PageShell from '@/components/public/pages/PageShell';
import { getClientSession } from '@/lib/auth/session';
import { getClientUserFromApi } from '@/lib/auth/client-user';
import { getPublicSiteData } from '@/lib/server/site-repository';

export default async function AccountPage() {
  const session = await getClientSession();
  if (!session) {
    redirect('/admin/login?next=/account');
  }

  const user = await getClientUserFromApi();
  if (user && !user.emailVerified) {
    redirect('/account/verify');
  }

  const data = await getPublicSiteData();

  return (
    <PageShell settings={data.settings} initialData={data} showBackHome>
      <AccountPortal
        user={
          user || {
            id: session.id,
            email: session.email,
            name: session.name,
            phone: null,
            profileImage: '',
            emailVerified: true,
            createdAt: '',
            updatedAt: '',
          }
        }
      />
    </PageShell>
  );
}
