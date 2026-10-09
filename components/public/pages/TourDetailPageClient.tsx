'use client';

import PageShell, { usePageShell } from '@/components/public/pages/PageShell';
import BookingForm from '@/components/public/sections/BookingForm';
import { getCategoryLabel } from '@/lib/utils/site-pages';
import { formatPrice } from '@/lib/utils/price';
import type { PublicSiteData, Tour } from '@/types/site';

const copy = {
  en: {
    from: 'From',
    contact: 'Ask on WhatsApp',
    gallery: 'Tour images',
  },
  fr: {
    from: 'À partir de',
    contact: 'Demander sur WhatsApp',
    gallery: 'Images de l’excursion',
  },
} as const;

export default function TourDetailPageClient({
  initialData,
  tour,
}: {
  initialData: PublicSiteData;
  tour: Tour;
}) {
  return (
    <PageShell settings={initialData.settings} initialData={initialData} showBackHome>
      <TourDetailPageBody tour={tour} />
    </PageShell>
  );
}

function TourDetailPageBody({
  tour: initialTour,
}: {
  tour: Tour;
}) {
  const { language, currency, data } = usePageShell();
  const labels = copy[language];
  const tour = data.tours.find((item) => item.id === initialTour.id) || initialTour;

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={heroGridStyle}>
          <div>
            <div style={eyebrowStyle}>{getCategoryLabel(data.settings, tour.category, language)}</div>
            <h1 style={titleStyle}>{tour.name[language]}</h1>
            <p style={descriptionStyle}>{tour.description[language]}</p>

            <div style={metaRowStyle}>
              <span style={pillStyle}>{tour.duration[language]}</span>
              <span style={priceStyle}>
                {labels.from} {formatPrice(tour.priceUsd, currency)}
              </span>
            </div>

            <a
              href={`https://wa.me/${data.settings.whatsappNumber}`}
              style={ctaStyle}
            >
              {labels.contact}
            </a>

            <BookingForm tour={tour} language={language} />
          </div>

          <div style={leadMediaStyle}>
            {tour.images[0] ? (
              <img src={tour.images[0]} alt={tour.name[language]} style={leadImageStyle} />
            ) : (
              <div style={leadFallbackStyle} />
            )}
          </div>
        </div>

        {tour.images.length > 1 ? (
          <section style={gallerySectionStyle}>
            <h2 style={sectionTitleStyle}>{labels.gallery}</h2>
            <div style={galleryGridStyle}>
              {tour.images.slice(1).map((image, index) => (
                <img
                  key={`${tour.id}-${index}`}
                  src={image}
                  alt={`${tour.name[language]} ${index + 2}`}
                  style={galleryImageStyle}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  padding: '8px 12px 40px',
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
};

const heroGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 28,
  alignItems: 'start',
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
  margin: '10px 0 14px',
  letterSpacing: '-0.04em',
};

const descriptionStyle: React.CSSProperties = {
  maxWidth: 760,
  lineHeight: 1.8,
  color: '#475569',
  fontSize: 17,
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 16,
};

const pillStyle: React.CSSProperties = {
  background: '#eff6ff',
  color: '#1d4ed8',
  padding: '8px 12px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
};

const priceStyle: React.CSSProperties = {
  background: '#fef3c7',
  color: '#92400e',
  padding: '8px 12px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
};

const ctaStyle: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  background: '#0c4a6e',
  color: 'white',
  padding: '13px 18px',
  borderRadius: 14,
  fontWeight: 700,
  marginTop: 22,
};

const bookHintStyle: React.CSSProperties = {
  margin: '16px 0 0',
  color: '#4b6472',
  fontSize: 14,
  lineHeight: 1.55,
  maxWidth: 420,
};

const leadMediaStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 28,
  padding: 10,
  boxShadow: '0 18px 40px rgba(15,23,42,0.1)',
};

const leadImageStyle: React.CSSProperties = {
  width: '100%',
  height: 400,
  objectFit: 'cover',
  borderRadius: 20,
  display: 'block',
};

const leadFallbackStyle: React.CSSProperties = {
  height: 400,
  borderRadius: 20,
  background: 'linear-gradient(135deg, #bfdbfe, #dbeafe)',
};

const gallerySectionStyle: React.CSSProperties = {
  marginTop: 28,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 30,
  margin: '0 0 16px',
};

const galleryGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
};

const galleryImageStyle: React.CSSProperties = {
  width: '100%',
  height: 220,
  objectFit: 'cover',
  borderRadius: 22,
  boxShadow: '0 18px 40px rgba(15,23,42,0.1)',
};