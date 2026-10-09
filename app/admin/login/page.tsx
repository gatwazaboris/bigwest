import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/Login';
import { getAdminSession, getClientSession } from '@/lib/auth/session';

export default async function AdminLoginPage() {
  const [admin, client] = await Promise.all([getAdminSession(), getClientSession()]);
  if (admin) redirect('/admin');
  if (client) redirect('/account');

  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
