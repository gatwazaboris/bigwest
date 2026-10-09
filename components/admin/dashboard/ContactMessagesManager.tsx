'use client';

import type { ContactMessage, ContactMessageStatus } from '@/types/site';

const statuses: ContactMessageStatus[] = ['new', 'read', 'archived'];

export default function ContactMessagesManager({
  messages,
  saving,
  onStatusChange,
  onDelete,
}: {
  messages: ContactMessage[];
  saving: boolean;
  onStatusChange: (id: string, status: ContactMessageStatus) => void;
  onDelete: (id: string) => void;
}) {
  const newCount = messages.filter((item) => item.status === 'new').length;

  return (
    <div style={wrapStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Who contacted you</h2>
        <p style={subtitleStyle}>
          Messages sent from the public Contact page. {newCount ? `${newCount} new.` : 'No new messages.'}
        </p>
      </div>

      {!messages.length ? (
        <div style={emptyStyle}>No contact messages yet. When visitors submit the contact form, they appear here.</div>
      ) : null}

      <div style={listStyle}>
        {messages.map((item) => (
          <article key={item.id} style={item.status === 'new' ? newCardStyle : cardStyle}>
            <div>
              <div style={badgeRow}>
                <span style={statusPill(item.status)}>{item.status}</span>
                <span style={dateStyle}>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <h3 style={cardTitle}>{item.name}</h3>
              <p style={metaStyle}>
                <a href={`mailto:${item.email}`} style={linkStyle}>
                  {item.email}
                </a>
                {item.phone ? (
                  <>
                    {' · '}
                    <a href={`tel:${item.phone}`} style={linkStyle}>
                      {item.phone}
                    </a>
                  </>
                ) : null}
              </p>
              <p style={messageStyle}>{item.message}</p>
            </div>

            <div style={controlsStyle}>
              <select
                style={selectStyle}
                value={item.status}
                disabled={saving}
                onChange={(event) =>
                  onStatusChange(item.id, event.target.value as ContactMessageStatus)
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <a href={`mailto:${item.email}?subject=Re: your Visit KIBUYE message`} style={replyButton}>
                Reply
              </a>
              <button type="button" style={deleteButton} disabled={saving} onClick={() => onDelete(item.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function statusPill(status: string): React.CSSProperties {
  const tones: Record<string, { bg: string; color: string }> = {
    new: { bg: '#fef3c7', color: '#92400e' },
    read: { bg: '#e0f2fe', color: '#075985' },
    archived: { bg: '#f1f5f9', color: '#475569' },
  };
  const tone = tones[status] || tones.new;
  return {
    display: 'inline-flex',
    background: tone.bg,
    color: tone.color,
    padding: '6px 10px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12,
    textTransform: 'capitalize',
  };
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
  borderRadius: 18,
  padding: 18,
  border: '1px solid #e2e8f0',
};
const newCardStyle: React.CSSProperties = {
  ...cardStyle,
  borderColor: '#fcd34d',
  boxShadow: '0 10px 24px rgba(146,64,14,0.08)',
};
const badgeRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 8,
  flexWrap: 'wrap',
};
const dateStyle: React.CSSProperties = { color: '#94a3b8', fontSize: 13 };
const cardTitle: React.CSSProperties = { margin: '0 0 6px', fontSize: 20 };
const metaStyle: React.CSSProperties = { margin: '0 0 10px', color: '#64748b' };
const linkStyle: React.CSSProperties = { color: '#0c4a6e', fontWeight: 700, textDecoration: 'none' };
const messageStyle: React.CSSProperties = {
  margin: 0,
  color: '#334155',
  lineHeight: 1.65,
  whiteSpace: 'pre-wrap',
};
const controlsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minWidth: 140,
};
const selectStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  padding: '10px 12px',
  fontWeight: 600,
};
const replyButton: React.CSSProperties = {
  textAlign: 'center',
  textDecoration: 'none',
  background: '#0c4a6e',
  color: 'white',
  borderRadius: 12,
  padding: '10px 12px',
  fontWeight: 700,
};
const deleteButton: React.CSSProperties = {
  border: '1px solid #fecaca',
  background: 'white',
  color: '#b91c1c',
  borderRadius: 12,
  padding: '10px 12px',
  fontWeight: 700,
  cursor: 'pointer',
};
