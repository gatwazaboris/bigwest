'use client';

import type { Booking, BookingStatus } from '@/types/site';

const statuses: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function BookingsManager({
  bookings,
  saving,
  onStatusChange,
}: {
  bookings: Booking[];
  saving: boolean;
  onStatusChange: (id: string, status: BookingStatus, adminNotes?: string) => void;
}) {
  return (
    <div style={wrapStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Bookings</h2>
        <p style={subtitleStyle}>Review client requests and update booking status.</p>
      </div>

      {!bookings.length ? <div style={emptyStyle}>No bookings yet.</div> : null}

      <div style={listStyle}>
        {bookings.map((booking) => (
          <article key={booking.id} style={cardStyle}>
            <div>
              <h3 style={cardTitle}>
                {booking.tour?.name?.en || 'Tour'} · {booking.tourDate}
              </h3>
              <p style={metaStyle}>
                {booking.clientUser?.name || 'Client'} ({booking.clientUser?.email || '—'}) ·{' '}
                {booking.guests} guests · ${booking.totalPriceUsd}
              </p>
              {booking.contactPhone ? <p style={metaStyle}>Phone: {booking.contactPhone}</p> : null}
              {booking.notes ? <p style={metaStyle}>Notes: {booking.notes}</p> : null}
              {booking.adminNotes ? <p style={metaStyle}>Admin notes: {booking.adminNotes}</p> : null}
            </div>

            <div style={controlsStyle}>
              <select
                style={selectStyle}
                value={booking.status}
                disabled={saving}
                onChange={(event) =>
                  onStatusChange(booking.id, event.target.value as BookingStatus)
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const wrapStyle: React.CSSProperties = { display: 'grid', gap: 16 };
const headerStyle: React.CSSProperties = { marginBottom: 4 };
const titleStyle: React.CSSProperties = { margin: 0 };
const subtitleStyle: React.CSSProperties = { margin: '8px 0 0', color: '#64748b' };
const emptyStyle: React.CSSProperties = {
  background: '#f8fafc',
  borderRadius: 16,
  padding: 18,
  color: '#64748b',
};
const listStyle: React.CSSProperties = { display: 'grid', gap: 12 };
const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: 18,
  padding: 16,
};
const cardTitle: React.CSSProperties = { margin: '0 0 8px', fontSize: 18 };
const metaStyle: React.CSSProperties = { margin: '0 0 4px', color: '#64748b', lineHeight: 1.5 };
const controlsStyle: React.CSSProperties = { minWidth: 160 };
const selectStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  padding: 10,
  fontWeight: 700,
};
