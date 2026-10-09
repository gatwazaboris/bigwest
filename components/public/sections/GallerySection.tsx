import type { GalleryItem, Language } from '@/types/site';

export default function GallerySection({
  items,
  language,
}: {
  items: GalleryItem[];
  language: Language;
}) {
  if (!items.length) return null;

  return (
    <section style={sectionStyle}>
      {/* Inline style tag to hide WebKit scrollbars cleanly without touching global CSS files */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={containerStyle}>
        <div style={headingWrap}>
          <div>
            <div style={eyebrow}>{language === 'en' ? 'Visual stories' : 'Moments visuels'}</div>
            <h2 style={titleStyle}>{language === 'en' ? 'Gallery' : 'Galerie'}</h2>
          </div>

          <a href="/gallery" style={viewAllLink}>
            {language === 'en' ? 'View full gallery' : 'Voir toute la galerie'}
          </a>
        </div>

        <div className="no-scrollbar" style={sliderWrap}>
          <div style={sliderStyle}>
            {items.map((item) => (
              <a key={item.id} href="/gallery" style={cardLink}>
                <article style={cardStyle}>
                  <img src={item.imageData} alt={item.title[language]} style={imageStyle} />
                  <div style={captionStyle}>
                    <h3 style={captionTitle}>{item.title[language]}</h3>
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

const sectionStyle: React.CSSProperties = {
  padding: '56px 12px 0',
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
};

const headingWrap: React.CSSProperties = {
  marginBottom: 18,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'end',
  gap: 16,
  flexWrap: 'wrap',
};

const eyebrow: React.CSSProperties = {
  color: '#2563eb',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
};

const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(2rem, 5vw, 2.2rem)',
  margin: '8px 0 0',
};

const viewAllLink: React.CSSProperties = {
  textDecoration: 'none',
  color: '#2563eb',
  fontWeight: 700,
  fontSize: 15,
};

const sliderWrap: React.CSSProperties = {
  overflowX: 'auto',
  paddingBottom: 16, // Extra space so card shadows aren't cut off at the bottom
  paddingTop: 8,
  scrollbarWidth: 'none', // Hides scrollbar on Firefox
  msOverflowStyle: 'none', // Hides scrollbar on legacy Edge/IE
  WebkitOverflowScrolling: 'touch', // Smooth momentum scroll on iOS
  scrollSnapType: 'x mandatory', // Enables snap behavior for cards
};

const sliderStyle: React.CSSProperties = {
  display: 'flex',
  gap: 18,
  minWidth: 'max-content',
};

const cardLink: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  flex: '0 0 min(82vw, 320px)',
  scrollSnapAlign: 'start', // Cards align cleanly to the container edge when swiped
};

const cardStyle: React.CSSProperties = {
  position: 'relative',
  minHeight: 320,
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  inset: 0,
};

const captionStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 'auto 0 0 0',
  padding: 18,
  color: 'white',
  background: 'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.84) 100%)',
};

const captionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.15,
};