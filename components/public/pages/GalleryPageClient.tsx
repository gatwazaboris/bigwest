'use client';

import PageShell, { usePageShell } from '@/components/public/pages/PageShell';
import { getSitePage } from '@/lib/utils/site-pages';
import type { PublicSiteData } from '@/types/site';

export default function GalleryPageClient({ initialData }: { initialData: PublicSiteData }) {
  return (
    <PageShell settings={initialData.settings} initialData={initialData} showBackHome>
      <GalleryPageBody />
    </PageShell>
  );
}

function GalleryPageBody() {
  const { language, data } = usePageShell();
  const page = getSitePage(data.settings, 'gallery');

  return (
    <main style={mainStyle}>
      <section style={heroStyle}>
        <div style={containerStyle}>
          <div style={eyebrowStyle}>{page.eyebrow[language]}</div>
          <h1 style={titleStyle}>{page.title[language]}</h1>
          <p style={bodyStyle}>{page.description[language]}</p>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={containerStyle}>
          <div style={gridStyle}>
            {data.gallery.map((item) => (
              <article key={item.id} style={cardStyle}>
                <img src={item.imageData} alt={item.title[language]} style={imageStyle} />
                <div style={captionStyle}>
                  <h2 style={captionTitleStyle}>{item.title[language]}</h2>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  paddingBottom: 40,
};

const heroStyle: React.CSSProperties = {
  padding: '8px 12px 6px',
};

const sectionStyle: React.CSSProperties = {
  padding: '12px 12px 0',
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
};

const eyebrowStyle: React.CSSProperties = {
  color: '#2563eb',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
};

const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
  margin: '10px 0 14px',
  letterSpacing: '-0.04em',
  lineHeight: 0.98,
};

const bodyStyle: React.CSSProperties = {
  maxWidth: 760,
  color: '#475569',
  lineHeight: 1.8,
  fontSize: 17,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 16px 36px rgba(15,23,42,0.08)',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: 240,
  objectFit: 'cover',
  display: 'block',
};

const captionStyle: React.CSSProperties = {
  padding: 16,
};

const captionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
};
