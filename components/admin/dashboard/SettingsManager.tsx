'use client';

import { useState } from 'react';
import { LocalizedInput, LocalizedTextarea } from '@/components/admin/forms/LocalizedFields';
import { MultiImageField, SingleImageField } from '@/components/admin/forms/ImageField';
import type { SiteSettings } from '@/types/site';

type SettingsTab = 'brand' | 'hero' | 'social' | 'contact';

const TABS: { key: SettingsTab; label: string; help: string }[] = [
  { key: 'brand', label: 'Brand', help: 'Company name and logo only' },
  { key: 'hero', label: 'Homepage hero', help: 'Hero text and sliding images' },
  { key: 'social', label: 'Social media', help: 'Facebook, Instagram, and more' },
  { key: 'contact', label: 'Contact', help: 'Phone, email, WhatsApp, location' },
];

export default function SettingsManager({
  form,
  saving,
  onChange,
  onSave,
}: {
  form: SiteSettings;
  saving: boolean;
  onChange: (value: SiteSettings) => void;
  onSave: () => void;
}) {
  const [section, setSection] = useState<SettingsTab>('brand');
  const active = TABS.find((item) => item.key === section) || TABS[0];

  return (
    <section style={wrapStyle}>
      <div style={tabsRow}>
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            style={section === item.key ? activeTab : tab}
            onClick={() => setSection(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={cardStyle}>
        <h2 style={headingStyle}>{active.label}</h2>
        <p style={helpStyle}>{active.help}</p>

        {section === 'brand' ? (
          <div style={stack}>
            <label style={labelStyle}>Company name</label>
            <input
              style={inputStyle}
              value={form.companyName || ''}
              onChange={(event) => onChange({ ...form, companyName: event.target.value })}
              placeholder="Visit KIBUYE"
            />
            <label style={labelStyle}>Short tagline under the name</label>
            <input
              style={inputStyle}
              value={form.companyTagline || ''}
              onChange={(event) => onChange({ ...form, companyTagline: event.target.value })}
              placeholder="Kibuye • Karongi • Lake Kivu"
            />
            <SingleImageField
              label="Logo image"
              value={form.logoImage || ''}
              onChange={(logoImage) => onChange({ ...form, logoImage })}
            />
            {form.logoImage ? (
              <button type="button" style={secondaryButton} onClick={() => onChange({ ...form, logoImage: '' })}>
                Remove logo
              </button>
            ) : null}
          </div>
        ) : null}

        {section === 'hero' ? (
          <div style={stack}>
            <LocalizedInput
              label="Hero title"
              value={form.heroTitle}
              onChange={(value) => onChange({ ...form, heroTitle: value })}
            />
            <LocalizedTextarea
              label="Hero subtitle"
              value={form.heroSubtitle}
              onChange={(value) => onChange({ ...form, heroSubtitle: value })}
            />
            <LocalizedInput
              label="About title"
              value={form.aboutTitle}
              onChange={(value) => onChange({ ...form, aboutTitle: value })}
            />
            <LocalizedTextarea
              label="About text"
              value={form.aboutText}
              onChange={(value) => onChange({ ...form, aboutText: value })}
            />
            <MultiImageField
              label="Hero slideshow images"
              images={form.heroImages || []}
              onChange={(heroImages) => onChange({ ...form, heroImages })}
            />
          </div>
        ) : null}

        {section === 'social' ? (
          <div style={stack}>
            <p style={helpStyle}>Leave a field empty to hide that network on the website.</p>
            <label style={labelStyle}>Facebook URL</label>
            <input
              style={inputStyle}
              value={form.facebookUrl || ''}
              onChange={(event) => onChange({ ...form, facebookUrl: event.target.value })}
              placeholder="https://facebook.com/..."
            />
            <label style={labelStyle}>Instagram URL</label>
            <input
              style={inputStyle}
              value={form.instagramUrl || ''}
              onChange={(event) => onChange({ ...form, instagramUrl: event.target.value })}
              placeholder="https://instagram.com/..."
            />
            <label style={labelStyle}>TikTok URL</label>
            <input
              style={inputStyle}
              value={form.tiktokUrl || ''}
              onChange={(event) => onChange({ ...form, tiktokUrl: event.target.value })}
              placeholder="https://tiktok.com/@..."
            />
            <label style={labelStyle}>YouTube URL</label>
            <input
              style={inputStyle}
              value={form.youtubeUrl || ''}
              onChange={(event) => onChange({ ...form, youtubeUrl: event.target.value })}
              placeholder="https://youtube.com/..."
            />
            <label style={labelStyle}>X / Twitter URL</label>
            <input
              style={inputStyle}
              value={form.twitterUrl || ''}
              onChange={(event) => onChange({ ...form, twitterUrl: event.target.value })}
              placeholder="https://x.com/..."
            />
          </div>
        ) : null}

        {section === 'contact' ? (
          <div style={stack}>
            <label style={labelStyle}>Contact email</label>
            <input
              style={inputStyle}
              value={form.contactEmail}
              onChange={(event) => onChange({ ...form, contactEmail: event.target.value })}
            />
            <label style={labelStyle}>WhatsApp number</label>
            <input
              style={inputStyle}
              value={form.whatsappNumber}
              onChange={(event) => onChange({ ...form, whatsappNumber: event.target.value })}
            />
            <label style={labelStyle}>Phone number</label>
            <input
              style={inputStyle}
              value={form.phoneNumber}
              onChange={(event) => onChange({ ...form, phoneNumber: event.target.value })}
            />
            <label style={labelStyle}>Location</label>
            <input
              style={inputStyle}
              value={form.location}
              onChange={(event) => onChange({ ...form, location: event.target.value })}
            />
          </div>
        ) : null}

        <button style={primaryButton} disabled={saving} onClick={onSave}>
          {saving ? 'Saving…' : 'Save this section'}
        </button>
      </div>
    </section>
  );
}

const wrapStyle: React.CSSProperties = { display: 'grid', gap: 14 };
const tabsRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};
const tab: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: 'white',
  color: '#334155',
  borderRadius: 999,
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};
const activeTab: React.CSSProperties = {
  ...tab,
  background: '#0c4a6e',
  borderColor: '#0c4a6e',
  color: 'white',
};
const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 20,
  padding: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
};
const headingStyle: React.CSSProperties = { margin: '0 0 6px', fontSize: 22 };
const helpStyle: React.CSSProperties = { color: '#64748b', lineHeight: 1.55, marginTop: 0 };
const stack: React.CSSProperties = { display: 'grid', gap: 4 };
const labelStyle: React.CSSProperties = {
  display: 'block',
  marginTop: 12,
  marginBottom: 6,
  fontWeight: 700,
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: 14,
  padding: 12,
  fontSize: 15,
};
const primaryButton: React.CSSProperties = {
  marginTop: 18,
  border: 0,
  background: '#0c4a6e',
  color: 'white',
  borderRadius: 14,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 800,
};
const secondaryButton: React.CSSProperties = {
  marginTop: 10,
  width: 'fit-content',
  border: '1px solid #cbd5e1',
  background: 'white',
  borderRadius: 12,
  padding: '8px 12px',
  cursor: 'pointer',
  fontWeight: 700,
};
