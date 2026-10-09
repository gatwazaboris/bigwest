'use client';

import type { ClientUser } from '@/types/site';

export default function ClientsManager({ clients }: { clients: ClientUser[] }) {
  return (
    <div style={wrapStyle}>
      <div>
        <h2 style={titleStyle}>Clients</h2>
        <p style={subtitleStyle}>People who created accounts to book tours.</p>
      </div>

      {!clients.length ? <div style={emptyStyle}>No client accounts yet.</div> : null}

      <div style={listStyle}>
        {clients.map((client) => (
          <article key={client.id} style={cardStyle}>
            <div>
              <h3 style={cardTitle}>{client.name}</h3>
              <p style={metaStyle}>{client.email}</p>
              <p style={metaStyle}>{client.phone || 'No phone'}</p>
            </div>
            <div style={badgeStyle}>{client.bookingsCount || 0} bookings</div>
          </article>
        ))}
      </div>
    </div>
  );
}

const wrapStyle: React.CSSProperties = { display: 'grid', gap: 16 };
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
  alignItems: 'center',
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: 18,
  padding: 16,
};
const cardTitle: React.CSSProperties = { margin: '0 0 6px', fontSize: 18 };
const metaStyle: React.CSSProperties = { margin: '0 0 4px', color: '#64748b' };
const badgeStyle: React.CSSProperties = {
  background: '#eff6ff',
  color: '#1d4ed8',
  padding: '8px 12px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
};
