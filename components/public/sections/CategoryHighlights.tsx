import type { Language } from '@/types/site';

type CategoryCard = {
  id: string;
  title: string;
  count: number;
  image: string;
};

const copy = {
  en: {
    eyebrow: 'Experiences',
    title: 'Pick what you want to do',
    support: 'Four clear ways to enjoy Lake Kivu. Tap one to see available tours and book.',
    tours: 'tours',
    open: 'View tours',
  },
  fr: {
    eyebrow: 'Expériences',
    title: 'Choisissez votre activité',
    support: 'Quatre façons de profiter du lac Kivu. Ouvrez une catégorie pour voir et réserver.',
    tours: 'excursions',
    open: 'Voir les excursions',
  },
} as const;

export default function CategoryHighlights({
  language,
  cards,
}: {
  language: Language;
  cards: CategoryCard[];
}) {
  const text = copy[language];

  return (
    <section style={sectionStyle} id="experiences">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={containerStyle}>
        <div style={headingRow}>
          <div style={eyebrow}>{text.eyebrow}</div>
          <h2 style={titleStyle}>{text.title}</h2>
          <p style={supportStyle}>{text.support}</p>
        </div>

        <div className="no-scrollbar" style={sliderWrap}>
          <div style={sliderStyle}>
            {cards.map((card) => (
              <a key={card.id} href={`/tours/${card.id}`} style={cardLink}>
                <article style={cardStyle}>
                  <div
                    style={{
                      ...imageStyle,
                      backgroundImage: card.image
                        ? `linear-gradient(180deg, rgba(8,29,40,0.05), rgba(8,29,40,0.72)), url(${card.image})`
                        : 'linear-gradient(135deg, #67e8f9, #0e7490)',
                    }}
                  />
                  <div style={cardOverlay}>
                    <div style={cardTitle}>{card.title}</div>
                    <div style={cardMeta}>
                      {card.count} {text.tours} · {text.open}
                    </div>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = { padding: '40px 18px 0' };

const containerStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: '0 auto',
};

const headingRow: React.CSSProperties = {
  marginBottom: 20,
  maxWidth: 640,
};

const eyebrow: React.CSSProperties = {
  color: 'var(--lake)',
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
  margin: '10px 0 10px',
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
};

const supportStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--muted)',
  lineHeight: 1.65,
  fontSize: 16,
};

const sliderWrap: React.CSSProperties = {
  overflowX: 'auto',
  paddingBottom: 12,
  paddingTop: 4,
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
  scrollSnapType: 'x mandatory',
};

const sliderStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  minWidth: 'max-content',
};

const cardLink: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  flex: '0 0 min(78vw, 300px)',
  scrollSnapAlign: 'start',
};

const cardStyle: React.CSSProperties = {
  position: 'relative',
  minHeight: 250,
  borderRadius: 24,
  overflow: 'hidden',
};

const imageStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const cardOverlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: 18,
  color: 'white',
};

const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 30,
  fontWeight: 600,
  lineHeight: 1.05,
};

const cardMeta: React.CSSProperties = {
  marginTop: 10,
  fontWeight: 600,
  fontSize: 14,
  color: 'rgba(255,255,255,0.9)',
};
