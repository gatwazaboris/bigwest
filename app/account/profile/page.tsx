import { redirect } from 'next/navigation';
import PageShell from '@/components/public/pages/PageShell';
import ProfilePortal from '@/components/public/pages/ProfilePortal';
import { getClientSession } from '@/lib/auth/session';
import { getClientUserFromApi } from '@/lib/auth/client-user';
import { getPublicSiteData } from '@/lib/server/site-repository';

export default async function ProfilePage() {
  const session = await getClientSession();
  if (!session) {
    redirect('/admin/login?next=/account/profile');
  }

  const user = await getClientUserFromApi();
  if (user && !user.emailVerified) {
    redirect('/account/verify');
  }

  const data = await getPublicSiteData();

  return (
    <PageShell settings={data.settings} initialData={data} showBackHome>
      <ProfilePortal
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
