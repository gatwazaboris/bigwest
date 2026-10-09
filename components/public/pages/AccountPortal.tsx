'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePageShell } from '@/components/public/pages/PageShell';
import ClientAvatar from '@/components/public/sections/ClientAvatar';
import { formatPrice } from '@/lib/utils/price';
import type { Booking, ClientUser } from '@/types/site';

const text = {
  title: 'My account',
  subtitle: 'Manage your bookings and trip requests.',
  bookings: 'My bookings',
  empty: 'No bookings yet. Browse tours and book your next Lake Kivu experience.',
  browse: 'Browse tours',
  profile: 'Edit profile',
  logout: 'Sign out',
  guests: 'guests',
  cancel: 'Cancel booking',
  status: 'Status',
  total: 'Total',
  date: 'Date',
  phone: 'Phone',
} as const;

export default function AccountPortal({ user }: { user: ClientUser }) {
  const router = useRouter();
  const { language, currency } = usePageShell();
  const [profile, setProfile] = useState<ClientUser>(user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    const [meResponse, bookingsResponse] = await Promise.all([
      fetch('/api/client/me'),
      fetch('/api/client/bookings'),
    ]);

    if (meResponse.ok) {
      setProfile(await meResponse.json());
    }

    if (!bookingsResponse.ok) {
      setMessage('Unable to load bookings');
      setLoading(false);
      return;
    }
    setBookings(await bookingsResponse.json());
    setLoading(false);
  }

  useEffect(() => {
    loadBookings().catch(() => {
      setMessage('Unable to load bookings');
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  async function handleCancel(id: string) {
    const response = await fetch(`/api/client/bookings/${id}/cancel`, { method: 'PATCH' });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.message || 'Unable to cancel booking');
      return;
    }
    setMessage('Booking cancelled');
    await loadBookings();
  }

  const pendingCount = useMemo(
    () => bookings.filter((item) => item.status === 'pending').length,
    [bookings],
  );

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <ClientAvatar user={profile} size={64} />
            <div>
              <div style={eyebrowStyle}>Visit KIBUYE</div>
              <h1 style={titleStyle}>{text.title}</h1>
              <p style={subtitleStyle}>
                {text.subtitle} Signed in as <strong>{profile.name}</strong> ({profile.email})
              </p>
            </div>
          </div>
          <div style={actionsStyle}>
            <a href="/account/profile" style={secondaryButton}>
              {text.profile}
            </a>
            <a href="/tours/boat" style={secondaryButton}>
              {text.browse}
            </a>
            <button type="button" style={logoutButton} onClick={handleLogout}>
              {text.logout}
            </button>
          </div>
        </div>

        <div style={statsRow}>
          <div style={statCard}>
            <div style={statLabel}>Bookings</div>
            <div style={statValue}>{bookings.length}</div>
          </div>
          <div style={statCard}>
            <div style={statLabel}>Pending</div>
            <div style={statValue}>{pendingCount}</div>
          </div>
          <div style={statCard}>
            <div style={statLabel}>{text.phone}</div>
            <div style={{ ...statValue, fontSize: 18 }}>{profile.phone || '—'}</div>
          </div>
        </div>

        {message ? <div style={messageStyle}>{message}</div> : null}

        <section style={sectionStyle}>
          <h2 style={sectionTitle}>{text.bookings}</h2>
          {loading ? <p style={muted}>Loading...</p> : null}
          {!loading && !bookings.length ? <p style={muted}>{text.empty}</p> : null}

          <div style={listStyle}>
            {bookings.map((booking) => (
              <article key={booking.id} style={cardStyle}>
                <div>
                  <h3 style={cardTitle}>
                    {booking.tour?.name?.[language] || booking.tour?.name?.en || 'Tour'}
                  </h3>
                  <p style={muted}>
                    {text.date}: {booking.tourDate} · {booking.guests} {text.guests}
                  </p>
                  <p style={muted}>
                    {text.total}: {formatPrice(booking.totalPriceUsd, currency)}
                  </p>
                  {booking.notes ? <p style={muted}>{booking.notes}</p> : null}
                </div>
                <div style={cardAside}>
                  <span style={statusPill(booking.status)}>{booking.status}</span>
                  {booking.status === 'pending' || booking.status === 'confirmed' ? (
                    <button type="button" style={cancelButton} onClick={() => handleCancel(booking.id)}>
                      {text.cancel}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function statusPill(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    confirmed: { bg: '#dcfce7', color: '#166534' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' },
    completed: { bg: '#e0e7ff', color: '#3730a3' },
  };
  const tone = colors[status] || colors.pending;
  return {
    display: 'inline-flex',
    background: tone.bg,
    color: tone.color,
    padding: '8px 12px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'capitalize',
  };
}

const pageStyle: React.CSSProperties = { padding: '24px 16px 48px' };
const containerStyle: React.CSSProperties = { maxWidth: 960, margin: '0 auto' };
const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  alignItems: 'start',
  marginBottom: 24,
};
const eyebrowStyle: React.CSSProperties = {
  color: '#2563eb',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
};
const titleStyle: React.CSSProperties = {
  margin: '8px 0 8px',
  fontSize: 'clamp(2rem, 4vw, 3rem)',
  letterSpacing: '-0.03em',
};
const subtitleStyle: React.CSSProperties = { color: '#475569', lineHeight: 1.6, margin: 0 };
const actionsStyle: React.CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap' };
const secondaryButton: React.CSSProperties = {
  textDecoration: 'none',
  background: 'white',
  color: '#1d4ed8',
  border: '1px solid #bfdbfe',
  padding: '12px 16px',
  borderRadius: 14,
  fontWeight: 700,
};
const logoutButton: React.CSSProperties = {
  border: 0,
  background: '#0f172a',
  color: 'white',
  padding: '12px 16px',
  borderRadius: 14,
  fontWeight: 700,
  cursor: 'pointer',
};
const statsRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 14,
  marginBottom: 20,
};
const statCard: React.CSSProperties = {
  background: 'white',
  borderRadius: 20,
  padding: 18,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
};
const statLabel: React.CSSProperties = { color: '#64748b', fontSize: 13, fontWeight: 700 };
const statValue: React.CSSProperties = { fontSize: 28, fontWeight: 800, marginTop: 6 };
const messageStyle: React.CSSProperties = {
  background: '#eff6ff',
  color: '#1d4ed8',
  padding: 12,
  borderRadius: 12,
  marginBottom: 16,
};
const sectionStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 24,
  padding: 20,
  border: '1px solid #e2e8f0',
};
const sectionTitle: React.CSSProperties = { marginTop: 0, marginBottom: 16 };
const muted: React.CSSProperties = { color: '#64748b', lineHeight: 1.6 };
const listStyle: React.CSSProperties = { display: 'grid', gap: 14 };
const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  padding: 16,
  borderRadius: 18,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};
const cardTitle: React.CSSProperties = { margin: '0 0 8px', fontSize: 20 };
const cardAside: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  alignItems: 'flex-end',
};
const cancelButton: React.CSSProperties = {
  border: '1px solid #fecaca',
  background: 'white',
  color: '#b91c1c',
  padding: '8px 12px',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};
