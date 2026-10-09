'use client';

import { useState } from 'react';
import { LocalizedInput, LocalizedTextarea } from '@/components/admin/forms/LocalizedFields';
import { SITE_PAGE_KEYS, SITE_PAGE_META, normalizePages } from '@/lib/utils/site-pages';
import type { SitePageKey, SiteSettings } from '@/types/site';

export default function PagesManager({
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
  const pages = normalizePages(form.pages);
  const [section, setSection] = useState<SitePageKey>('boat');
  const active = SITE_PAGE_META[section];
  const page = pages[section];

  function updatePage(next: typeof page) {
    onChange({
      ...form,
      pages: {
        ...pages,
        [section]: next,
      },
    });
  }

  return (
    <section style={wrapStyle}>
      <p style={introStyle}>
        Edit the menu labels and page text for Boat Tours, Island Visits, Hiking & Walking, Water Activities,
        Gallery, and Contact. Changes appear on the live website after you save.
      </p>

      <div style={tabsRow}>
        {SITE_PAGE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            style={section === key ? activeTab : tab}
            onClick={() => setSection(key)}
          >
            {SITE_PAGE_META[key].label}
          </button>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={headingRow}>
          <div>
            <h2 style={headingStyle}>{active.label}</h2>
            <p style={helpStyle}>
              Public URL: <code style={codeStyle}>{active.path}</code>
            </p>
          </div>
        </div>

        <div style={stack}>
          <LocalizedInput
            label="Menu label"
            value={page.navLabel}
            onChange={(navLabel) => updatePage({ ...page, navLabel })}
          />
          <LocalizedInput
            label="Page eyebrow"
            value={page.eyebrow}
            onChange={(eyebrow) => updatePage({ ...page, eyebrow })}
          />
          <LocalizedInput
            label="Page title"
            value={page.title}
            onChange={(title) => updatePage({ ...page, title })}
          />
          <LocalizedTextarea
            label="Page description"
            value={page.description}
            onChange={(description) => updatePage({ ...page, description })}
          />
        </div>

        <button type="button" style={saveButton} disabled={saving} onClick={onSave}>
          {saving ? 'Saving...' : 'Save page content'}
        </button>
      </div>
    </section>
  );
}

const wrapStyle: React.CSSProperties = { display: 'grid', gap: 16 };
const introStyle: React.CSSProperties = { margin: 0, color: '#64748b', lineHeight: 1.6 };
const tabsRow: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8 };
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
  color: 'white',
  borderColor: '#0c4a6e',
};
const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 24,
  padding: 22,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
};
const headingRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 8,
};
const headingStyle: React.CSSProperties = { margin: 0 };
const helpStyle: React.CSSProperties = { margin: '8px 0 0', color: '#64748b' };
const codeStyle: React.CSSProperties = {
  background: '#f1f5f9',
  padding: '2px 8px',
  borderRadius: 8,
  fontSize: 13,
};
const stack: React.CSSProperties = { display: 'grid', gap: 4 };
const saveButton: React.CSSProperties = {
  marginTop: 18,
  border: 0,
  background: '#0c4a6e',
  color: 'white',
  borderRadius: 14,
  padding: '12px 18px',
  fontWeight: 700,
  cursor: 'pointer',
};
