'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils/price';
import { getCategoryLabel } from '@/lib/utils/site-pages';
import type { Currency, Language, SiteSettings, Tour, TourCategory } from '@/types/site';

const DESCRIPTION_LINE_CLAMP = 3;

const labels = {
  en: {
    from: 'from',
    book: 'Book Now',
    ask: 'Ask AI',
    empty: 'More tours coming soon.',
    viewAll: 'View all',
    showMore: 'Show more',
    showLess: 'Show less',
  },
  fr: {
    from: 'à partir de',
    book: 'Réserver',
    ask: 'Demander',
    empty: 'Plus d’excursions bientôt.',
    viewAll: 'Voir tout',
    showMore: 'Voir plus',
    showLess: 'Voir moins',
  },
} as const;

function ExpandableDescription({
  text,
  showMoreLabel,
  showLessLabel,
}: {
  text: string;
  showMoreLabel: string;
  showLessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.trim().length > 110;

  const toggle = (event: React.MouseEvent) => {
    if (!isLong) return;
    event.preventDefault();
    event.stopPropagation();
    setExpanded((value) => !value);
  };

  return (
    <div style={descriptionWrap}>
      <p
        role={isLong ? 'button' : undefined}
        tabIndex={isLong ? 0 : undefined}
        aria-expanded={isLong ? expanded : undefined}
        onClick={toggle}
        onKeyDown={(event) => {
          if (!isLong) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            setExpanded((value) => !value);
          }
        }}
        style={{
          ...bodyText,
          cursor: isLong ? 'pointer' : 'default',
          ...(expanded || !isLong
            ? {}
            : {
                display: '-webkit-box',
                WebkitLineClamp: DESCRIPTION_LINE_CLAMP,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
        }}
      >
        {text}
      </p>

      {isLong ? (
        <button type="button" style={toggleButton} onClick={toggle} aria-expanded={expanded}>
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </div>
  );
}

export default function ToursSection({
  toursByCategory,
  language,
  currency,
  settings,
}: {
  toursByCategory: Record<TourCategory, Tour[]>;
  language: Language;
  currency: Currency;
  settings?: SiteSettings;
}) {
  const text = labels[language];

  return (
    <section style={sectionStyle} id="tours">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={containerStyle}>
        {(['boat', 'island', 'hiking', 'water'] as TourCategory[]).map((category) => (
          <div key={category} style={categoryBlock} id={category}>
            <div style={categoryHeadingRow}>
              <div>
                <div style={categoryEyebrow}>
                  {language === 'en' ? 'Curated experiences' : 'Expériences sélectionnées'}
                </div>
                <h2 style={categoryTitle}>{getCategoryLabel(settings, category, language)}</h2>
              </div>

              <a href={`/tours/${category}`} style={viewAllLink}>
                {text.viewAll}
              </a>
            </div>

            {toursByCategory[category].length ? (
              <div className="no-scrollbar" style={sliderWrap}>
                <div style={sliderStyle}>
                  {toursByCategory[category].map((tour) => (
                    <a key={tour.id} href={`/tour/${tour.id}`} style={cardLink}>
                      <article style={cardStyle}>
                        <div style={mediaWrap}>
                          {tour.images[0] ? (
                            <img src={tour.images[0]} alt={tour.name[language]} style={imageStyle} />
                          ) : (
                            <div style={imageFallback} />
                          )}
                          <div style={floatingPrice}>
                            {text.from} {formatPrice(tour.priceUsd, currency)}
                          </div>
                        </div>

                        <div style={contentStyle}>
                          <h3 style={cardTitle}>{tour.name[language]}</h3>

                          <ExpandableDescription
                            text={tour.description[language]}
                            showMoreLabel={text.showMore}
                            showLessLabel={text.showLess}
                          />

                          <div style={footerRow}>
                            <span style={durationPill}>{tour.duration[language]}</span>

                            <div style={actionButtons}>
                              <span style={bookButton}>{text.book}</span>
                              <span style={askButton}>{text.ask}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div style={emptyStyle}>{text.empty}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = { padding: '46px 18px 0' };
const containerStyle: React.CSSProperties = { maxWidth: 1280, margin: '0 auto' };
const categoryBlock: React.CSSProperties = { marginTop: 32 };

const categoryHeadingRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'end',
  gap: 16,
  marginBottom: 18,
  flexWrap: 'wrap',
};

const categoryEyebrow: React.CSSProperties = {
  color: '#2563eb',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
};

const categoryTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.9rem, 4vw, 2.6rem)',
  margin: '8px 0 0',
  letterSpacing: '-0.03em',
};

const viewAllLink: React.CSSProperties = {
  textDecoration: 'none',
  color: '#2563eb',
  fontWeight: 700,
  fontSize: 15,
};

const sliderWrap: React.CSSProperties = {
  overflowX: 'auto',
  paddingBottom: 16,
  paddingTop: 8,
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
  scrollSnapType: 'x mandatory',
};

const sliderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  gap: 20,
  minWidth: 'max-content',
};

const cardLink: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  flex: '0 0 340px',
  scrollSnapAlign: 'start',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 26,
  overflow: 'hidden',
  boxShadow: '0 18px 40px rgba(15,23,42,0.1)',
  border: '1px solid rgba(148,163,184,0.14)',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const mediaWrap: React.CSSProperties = { position: 'relative', flexShrink: 0 };

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: 218,
  objectFit: 'cover',
  display: 'block',
};

const imageFallback: React.CSSProperties = {
  height: 218,
  background: 'linear-gradient(135deg, #bfdbfe, #dbeafe)',
};

const floatingPrice: React.CSSProperties = {
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
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontSize: 28,
  lineHeight: 1.08,
  letterSpacing: '-0.02em',
};

const descriptionWrap: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 14,
  flex: 1,
};

const bodyText: React.CSSProperties = {
  color: '#475569',
  lineHeight: 1.65,
  margin: 0,
};

const toggleButton: React.CSSProperties = {
  marginTop: 6,
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: '#2563eb',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const footerRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 'auto',
};

const durationPill: React.CSSProperties = {
  background: '#eff6ff',
  color: '#1d4ed8',
  padding: '8px 12px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
};

const actionButtons: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
};

const bookButton: React.CSSProperties = {
  background: '#2563eb',
  color: 'white',
  padding: '10px 14px',
  borderRadius: 12,
  fontWeight: 700,
};

const askButton: React.CSSProperties = {
  background: 'white',
  color: '#334155',
  padding: '10px 14px',
  borderRadius: 12,
  fontWeight: 700,
  border: '1px solid #cbd5e1',
};

const emptyStyle: React.CSSProperties = {
  background: 'white',
  padding: 22,
  borderRadius: 20,
  color: '#64748b',
};
