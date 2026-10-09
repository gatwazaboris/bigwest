'use client';

import PageShell, { usePageShell } from '@/components/public/pages/PageShell';
import { formatPrice } from '@/lib/utils/price';
import { getSitePage } from '@/lib/utils/site-pages';
import type { PublicSiteData, TourCategory } from '@/types/site';

const pageCopy = {
  en: {
    empty: 'No published tours in this category yet.',
    from: 'from',
    details: 'View details',
  },
  fr: {
    empty: 'Aucune excursion publiée dans cette catégorie pour le moment.',
    from: 'à partir de',
    details: 'Voir détails',
  },
} as const;

export default function TourCategoryPageClient({
  initialData,
  category,
}: {
  initialData: PublicSiteData;
  category: TourCategory;
}) {
  return (
    <PageShell settings={initialData.settings} initialData={initialData} showBackHome>
      <TourCategoryPageBody category={category} />
    </PageShell>
  );
}

function TourCategoryPageBody({
  category,
}: {
  category: TourCategory;
}) {
  const { language, currency, data } = usePageShell();
  const text = pageCopy[language];
  const page = getSitePage(data.settings, category);
  const tours = data.tours.filter((tour) => tour.category === category);

  return (
    <main style={mainStyle}>
      <section style={heroStyle}>
        <div style={containerStyle}>
          <div style={eyebrowStyle}>{page.eyebrow[language]}</div>
          <h1 style={titleStyle}>{page.title[language]}</h1>
          <p style={descriptionStyle}>{page.description[language]}</p>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={containerStyle}>
          {tours.length ? (
            <div style={gridStyle}>
              {tours.map((tour) => (
                <article key={tour.id} style={cardStyle}>
                  <a href={`/tour/${tour.id}`} style={mediaLinkStyle}>
                    {tour.images[0] ? (
                      <img src={tour.images[0]} alt={tour.name[language]} style={imageStyle} />
                    ) : (
                      <div style={imageFallbackStyle} />
                    )}
                    <div style={priceBadgeStyle}>
                      {text.from} {formatPrice(tour.priceUsd, currency)}
                    </div>
                  </a>

                  <div style={contentStyle}>
                    <div style={durationPillStyle}>{tour.duration[language]}</div>
                    <h2 style={cardTitleStyle}>{tour.name[language]}</h2>
                    <p style={cardBodyStyle}>{tour.description[language]}</p>
                    <a href={`/tour/${tour.id}`} style={detailButtonStyle}>
                      {text.details}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={emptyStyle}>{text.empty}</div>
          )}
        </div>
      </section>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  paddingBottom: 40,
};

const heroStyle: React.CSSProperties = {
  padding: '8px 12px 8px',
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
  fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
  lineHeight: 0.96,
  margin: '10px 0 12px',
  letterSpacing: '-0.04em',
};

const descriptionStyle: React.CSSProperties = {
  maxWidth: 760,
  lineHeight: 1.7,
  color: '#475569',
  fontSize: 17,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
  gap: 22,
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 28,
  overflow: 'hidden',
  boxShadow: '0 18px 40px rgba(15,23,42,0.1)',
  border: '1px solid rgba(148,163,184,0.14)',
};

const mediaLinkStyle: React.CSSProperties = {
  position: 'relative',
  display: 'block',
  textDecoration: 'none',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: 240,
  objectFit: 'cover',
  display: 'block',
};

const imageFallbackStyle: React.CSSProperties = {
  height: 240,
  background: 'linear-gradient(135deg, #bfdbfe, #dbeafe)',
};

const priceBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  right: 14,
  bottom: 14,
  background: '#fef3c7',
  color: '#92400e',
  padding: '8px 12px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
  boxShadow: '0 8px 20px rgba(146,64,14,0.16)',
};

const contentStyle: React.CSSProperties = {
  padding: 20,
};

const durationPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  background: '#eff6ff',
  color: '#1d4ed8',
  padding: '8px 12px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
};

const cardTitleStyle: React.CSSProperties = {
  margin: '14px 0 10px',
  fontSize: 28,
  lineHeight: 1.06,
};

const cardBodyStyle: React.CSSProperties = {
  color: '#475569',
  lineHeight: 1.7,
  minHeight: 92,
};

const detailButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  background: '#2563eb',
  color: 'white',
  padding: '11px 16px',
  borderRadius: 14,
  fontWeight: 700,
  marginTop: 12,
};

const emptyStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 24,
  padding: 24,
  color: '#64748b',
};