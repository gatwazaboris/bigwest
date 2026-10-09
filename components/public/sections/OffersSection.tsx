import type { Language, Offer } from '@/types/site';

export default function OffersSection({ offers, language }: { offers: Offer[]; language: Language }) {
  if (!offers.length) return null;

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <div style={headingWrap}>
          <div style={eyebrow}>{language === 'en' ? 'Deals' : 'Offres'}</div>
          <h2 style={titleStyle}>{language === 'en' ? 'Special offers' : 'Offres spéciales'}</h2>
        </div>
        <div style={gridStyle}>
          {offers.map((offer) => (
            <article key={offer.id} style={cardStyle}>
              <div style={glowStyle} />
              <span style={badgeStyle}>{offer.discountPercent}% OFF</span>
              <h3 style={cardTitle}>{offer.title[language]}</h3>
              <p style={bodyStyle}>{offer.description[language]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = { padding: '48px 18px 0' };
const containerStyle: React.CSSProperties = { maxWidth: 1280, margin: '0 auto' };
const headingWrap: React.CSSProperties = { marginBottom: 18 };
const eyebrow: React.CSSProperties = { color: '#2563eb', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em' };
const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 34,
  margin: '8px 0 0',
  letterSpacing: '-0.03em',
};
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 };
const cardStyle: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(140deg, #0f172a 0%, #1d4ed8 100%)',
  color: 'white',
  borderRadius: 28,
  padding: 24,
  boxShadow: '0 18px 40px rgba(37,99,235,0.24)',
};
const glowStyle: React.CSSProperties = { position: 'absolute', width: 180, height: 180, right: -40, top: -50, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' };
const badgeStyle: React.CSSProperties = { position: 'relative', display: 'inline-block', background: 'rgba(255,255,255,0.16)', color: '#ffffff', borderRadius: 999, padding: '7px 12px', fontWeight: 700, marginBottom: 16, border: '1px solid rgba(255,255,255,0.18)' };
const cardTitle: React.CSSProperties = { position: 'relative', margin: 0, fontSize: 28 };
const bodyStyle: React.CSSProperties = { position: 'relative', color: 'rgba(255,255,255,0.86)', lineHeight: 1.7 };
