import type { Language, SiteSettings } from '@/types/site';
import { getSocialLinks } from '@/lib/utils/social';
import SocialIconLinks from '@/components/public/sections/SocialIconLinks';

export default function ContactSection({
  settings,
  language,
}: {
  settings: SiteSettings;
  language: Language;
}) {
  const whatsappHref = `https://wa.me/${String(settings.whatsappNumber || '').replace(/\D/g, '')}`;
  const socialLinks = getSocialLinks(settings);

  return (
    <section style={sectionStyle} id="contact">
      <div style={containerStyle}>
        <div>
          <div style={eyebrow}>
            {language === 'en' ? 'Plan your trip' : 'Planifiez votre voyage'}
          </div>

          <h2 style={titleStyle}>{settings.aboutTitle[language]}</h2>

          <p style={bodyText}>{settings.aboutText[language]}</p>

          <div style={contactGrid}>
            <div style={infoCard}>
              <div style={infoLabel}>{language === 'en' ? 'Phone' : 'Téléphone'}</div>
              <div style={infoValue}>{settings.phoneNumber || '-'}</div>
            </div>

            <div style={infoCard}>
              <div style={infoLabel}>{language === 'en' ? 'Email' : 'Email'}</div>
              <div style={infoValue}>{settings.contactEmail || '-'}</div>
            </div>

            <div style={infoCard}>
              <div style={infoLabel}>{language === 'en' ? 'Location' : 'Lieu'}</div>
              <div style={infoValue}>{settings.location || '-'}</div>
            </div>
          </div>

          {socialLinks.length ? (
            <div style={socialWrap}>
              <div style={infoLabel}>{language === 'en' ? 'Follow us' : 'Suivez-nous'}</div>
              <div style={{ marginTop: 12 }}>
                <SocialIconLinks links={socialLinks} tone="dark" />
              </div>
            </div>
          ) : null}
        </div>

        <div style={ctaCard}>
          <div style={ctaBadge}>
            {language === 'en' ? 'Quick booking help' : 'Aide rapide à la réservation'}
          </div>

          <h3 style={ctaTitle}>
            {language === 'en' ? 'Book or ask a question' : 'Réserver ou poser une question'}
          </h3>

          <p style={ctaBody}>
            {language === 'en'
              ? 'Book online from a tour page, or message us on WhatsApp for quick help with dates and groups.'
              : 'Réservez en ligne depuis une page d’excursion, ou écrivez-nous sur WhatsApp pour les dates et groupes.'}
          </p>

          <div style={ctaActions}>
            <a href="/admin/login?next=/account" style={primaryButton}>
              {language === 'en' ? 'My account' : 'Mon compte'}
            </a>
            <a href={whatsappHref} style={secondaryButton}>
              WhatsApp
            </a>
            <a href={`mailto:${settings.contactEmail || ''}`} style={secondaryButton}>
              {language === 'en' ? 'Email us' : 'Nous écrire'}
            </a>
          </div>

          {socialLinks.length ? (
            <div style={ctaSocialWrap}>
              <div style={ctaSocialLabel}>
                {language === 'en' ? 'Social media' : 'Réseaux sociaux'}
              </div>
              <SocialIconLinks links={socialLinks} tone="light" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: '64px 12px 80px',
  marginTop: 56,
  background: 'linear-gradient(180deg, #081225 0%, #0f172a 100%)',
  color: 'white',
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 24,
  alignItems: 'start',
};

const eyebrow: React.CSSProperties = {
  color: '#7dd3fc',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
};

const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(2rem, 5vw, 2.5rem)',
  margin: '8px 0 14px',
  lineHeight: 1.05,
};

const bodyText: React.CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.8,
  maxWidth: 680,
};

const contactGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14,
  marginTop: 22,
};

const infoCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 22,
  padding: 18,
};

const infoLabel: React.CSSProperties = {
  color: '#93c5fd',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const infoValue: React.CSSProperties = {
  color: 'white',
  marginTop: 8,
  lineHeight: 1.6,
  wordBreak: 'break-word',
};

const ctaCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.96)',
  color: '#0f172a',
  borderRadius: 28,
  padding: 24,
  boxShadow: '0 18px 40px rgba(2,6,23,0.24)',
};

const ctaBadge: React.CSSProperties = {
  display: 'inline-flex',
  background: '#dcfce7',
  color: '#166534',
  borderRadius: 999,
  padding: '7px 12px',
  fontWeight: 700,
  fontSize: 12,
  marginBottom: 14,
};

const ctaTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 'clamp(1.7rem, 4vw, 2rem)',
  lineHeight: 1.08,
};

const ctaBody: React.CSSProperties = {
  color: '#475569',
  lineHeight: 1.7,
  marginTop: 12,
};

const ctaActions: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 16,
};

const socialWrap: React.CSSProperties = {
  marginTop: 22,
};

const ctaSocialWrap: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 16,
  borderTop: '1px solid #e2e8f0',
};

const ctaSocialLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 10,
};

const primaryButton: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  background: 'linear-gradient(135deg, #10b981, #14b8a6)',
  color: 'white',
  padding: '14px 22px',
  borderRadius: 999,
  fontWeight: 700,
};

const secondaryButton: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  background: 'white',
  color: '#0f172a',
  padding: '14px 22px',
  borderRadius: 999,
  fontWeight: 700,
  border: '1px solid #cbd5e1',
};