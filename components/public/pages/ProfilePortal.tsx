'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SingleImageField } from '@/components/admin/forms/ImageField';
import ClientAvatar from '@/components/public/sections/ClientAvatar';
import type { ClientUser } from '@/types/site';

export default function ProfilePortal({ user }: { user: ClientUser }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ClientUser>({ ...user, profileImage: user.profileImage || '' });
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/client/me')
      .then(async (response) => {
        if (!response.ok) return;
        const next = (await response.json()) as ClientUser;
        setProfile(next);
        setName(next.name);
        setEmail(next.email);
        setPhone(next.phone || '');
        setProfileImage(next.profileImage || '');
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/client/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          profileImage,
          currentPassword: newPassword ? currentPassword : '',
          newPassword: newPassword || '',
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message || 'Unable to save profile');
        return;
      }

      const next = payload as ClientUser;
      setProfile(next);
      setName(next.name);
      setEmail(next.email);
      setPhone(next.phone || '');
      setProfileImage(next.profileImage || '');
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Profile saved');
      router.refresh();
    } catch {
      setError('Unable to save profile right now');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>Your account</div>
            <h1 style={titleStyle}>Profile</h1>
            <p style={subtitleStyle}>Update your photo, contact details, and password.</p>
          </div>
          <div style={actionsStyle}>
            <a href="/account" style={secondaryButton}>
              My bookings
            </a>
            <button type="button" style={logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div style={layoutStyle} className="profile-layout">
          <style>{`
            @media (max-width: 800px) {
              .profile-layout {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
          <aside style={asideStyle}>
            <ClientAvatar user={{ name, profileImage }} size={96} />
            <h2 style={asideName}>{name || 'Your name'}</h2>
            <p style={asideMeta}>{email || 'email@example.com'}</p>
            <p style={asideMeta}>{phone || 'No phone yet'}</p>
            {profile.createdAt ? (
              <p style={asideMeta}>
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            ) : null}
          </aside>

          <form onSubmit={handleSave} style={formCard}>
            <h2 style={sectionTitle}>Personal information</h2>
            {loading ? <p style={muted}>Loading profile…</p> : null}

            <SingleImageField
              label="Profile photo"
              value={profileImage}
              onChange={setProfileImage}
            />
            {profileImage ? (
              <button type="button" style={removePhoto} onClick={() => setProfileImage('')}>
                Remove photo
              </button>
            ) : null}
            <p style={helpText}>If you don’t upload a photo, your first name letter is used in the navbar.</p>

            <label style={labelStyle}>Full name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />

            <label style={labelStyle}>Email</label>
            <input
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label style={labelStyle}>Phone</label>
            <input
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250 …"
            />

            <h2 style={{ ...sectionTitle, marginTop: 28 }}>Change password</h2>
            <p style={helpText}>Leave blank to keep your current password.</p>

            <label style={labelStyle}>Current password</label>
            <input
              type="password"
              style={inputStyle}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />

            <label style={labelStyle}>New password</label>
            <input
              type="password"
              style={inputStyle}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />

            {error ? <div style={errorStyle}>{error}</div> : null}
            {message ? <div style={okStyle}>{message}</div> : null}

            <button type="submit" style={saveButton} disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
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
  color: '#0e7490',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
};
const titleStyle: React.CSSProperties = {
  margin: '8px 0',
  fontSize: 'clamp(2rem, 4vw, 3rem)',
  letterSpacing: '-0.03em',
};
const subtitleStyle: React.CSSProperties = { color: '#475569', lineHeight: 1.6, margin: 0 };
const actionsStyle: React.CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap' };
const secondaryButton: React.CSSProperties = {
  textDecoration: 'none',
  background: 'white',
  color: '#0c4a6e',
  border: '1px solid #bae6fd',
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
const layoutStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)',
  gap: 18,
  alignItems: 'start',
};
const asideStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 24,
  padding: 22,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
  display: 'grid',
  justifyItems: 'center',
  textAlign: 'center',
  gap: 8,
};
const asideName: React.CSSProperties = { margin: '8px 0 0', fontSize: 22 };
const asideMeta: React.CSSProperties = { margin: 0, color: '#64748b', fontSize: 14, wordBreak: 'break-word' };
const formCard: React.CSSProperties = {
  background: 'white',
  borderRadius: 24,
  padding: 22,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
};
const sectionTitle: React.CSSProperties = { margin: '0 0 8px', fontSize: 22 };
const labelStyle: React.CSSProperties = { display: 'block', marginTop: 14, marginBottom: 6, fontWeight: 700 };
const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: 14,
  padding: 12,
  fontFamily: 'var(--font-sans)',
};
const helpText: React.CSSProperties = { margin: '8px 0 0', color: '#64748b', fontSize: 13, lineHeight: 1.5 };
const removePhoto: React.CSSProperties = {
  marginTop: 8,
  border: '1px solid #fecaca',
  background: 'white',
  color: '#b91c1c',
  borderRadius: 12,
  padding: '8px 12px',
  fontWeight: 700,
  cursor: 'pointer',
};
const saveButton: React.CSSProperties = {
  marginTop: 20,
  border: 0,
  background: '#0c4a6e',
  color: 'white',
  borderRadius: 14,
  padding: '13px 18px',
  fontWeight: 700,
  cursor: 'pointer',
};
const muted: React.CSSProperties = { color: '#64748b' };
const errorStyle: React.CSSProperties = {
  marginTop: 14,
  background: '#fef2f2',
  color: '#b91c1c',
  padding: 12,
  borderRadius: 12,
};
const okStyle: React.CSSProperties = {
  marginTop: 14,
  background: '#ecfdf5',
  color: '#047857',
  padding: 12,
  borderRadius: 12,
};
