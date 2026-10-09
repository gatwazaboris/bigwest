'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell, { usePageShell } from '@/components/public/pages/PageShell';
import SocialIconLinks from '@/components/public/sections/SocialIconLinks';
import { useClientAuth } from '@/lib/hooks/useClientAuth';
import { getSocialLinks } from '@/lib/utils/social';
import { getSitePage } from '@/lib/utils/site-pages';
import type { PublicSiteData } from '@/types/site';

const copy = {
  en: {
    quickTitle: 'Quick contact',
    quickBody:
      'Choose the best way to reach us. WhatsApp is the fastest option for bookings and urgent questions.',
    phone: 'Phone',
    email: 'Email',
    location: 'Location',
    whatsapp: 'WhatsApp',
    emailUs: 'Email us',
    social: 'Social media',
    map: 'Find us',
    feedback: 'Send a message',
    feedbackBody:
      'Tell us what you are looking for, suggest an improvement, or ask for a custom trip plan.',
    name: 'Your name',
    yourEmail: 'Your email',
    yourPhone: 'Phone (optional)',
    feedbackPlaceholder: 'Write your message here...',
    sendFeedback: 'Send message',
    sending: 'Sending...',
    loginRequired: 'Sign in to send a message',
    loginHint: 'You need an account to contact us through this form.',
    success: 'Thanks — your message was sent. We emailed you a confirmation and will get back to you soon.',
  },
  fr: {
    quickTitle: 'Contact rapide',
    quickBody:
      'Choisissez le meilleur moyen de nous joindre. WhatsApp est l’option la plus rapide pour les réservations et les questions urgentes.',
    phone: 'Téléphone',
    email: 'Email',
    location: 'Lieu',
    whatsapp: 'WhatsApp',
    emailUs: 'Nous écrire',
    social: 'Réseaux sociaux',
    map: 'Nous trouver',
    feedback: 'Envoyer un message',
    feedbackBody:
      'Dites-nous ce que vous cherchez, proposez une amélioration, ou demandez un voyage personnalisé.',
    name: 'Votre nom',
    yourEmail: 'Votre email',
    yourPhone: 'Téléphone (optionnel)',
    feedbackPlaceholder: 'Écrivez votre message ici...',
    sendFeedback: 'Envoyer',
    sending: 'Envoi...',
    loginRequired: 'Connectez-vous pour envoyer un message',
    loginHint: 'Un compte est requis pour nous contacter via ce formulaire.',
    success: 'Merci — message envoyé. Un email de confirmation vous a été envoyé.',
  },
} as const;

export default function ContactPageClient({ initialData }: { initialData: PublicSiteData }) {
  return (
    <PageShell
      settings={initialData.settings}
      initialData={initialData}
      showBackHome
      showFooterContact={false}
    >
      <ContactPageBody />
    </PageShell>
  );
}

function ContactPageBody() {
  const router = useRouter();
  const { language, data } = usePageShell();
  const { user, loading: authLoading } = useClientAuth();
  const labels = copy[language];
  const settings = data.settings;
  const page = getSitePage(settings, 'contact');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
  }, [user]);

  const cleanWhatsapp = String(settings.whatsappNumber || '').replace(/\D/g, '');
  const whatsappHref = `https://wa.me/${cleanWhatsapp}`;
  const emailHref = `mailto:${settings.contactEmail || ''}`;
  const mapsQuery = encodeURIComponent(settings.location || 'Kibuye, Karongi, Rwanda');
  const mapEmbedSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.2261489965226!2d29.348810211020016!3d-2.065458336966419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dd29c3604dcfc5%3A0x139f807b93348730!2sBig%20West%20Tours%20%26%20Boat%20Safari!5e0!3m2!1sen!2srw!4v1791366055939!5m2!1sen!2srw" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin`;
  const loginHref = '/admin/login?next=/contact';

  function requireLogin() {
    router.push(loginHref);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!user) {
      requireLogin();
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name || name,
          email: user.email || email,
          phone: phone || user.phone || '',
          message,
        }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        requireLogin();
        return;
      }
      if (!response.ok) {
        setError(payload.message || 'Unable to send message');
        return;
      }
      setStatus(labels.success);
      setMessage('');
    } catch {
      setError('Unable to send message right now');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={mainStyle}>
      <section style={heroSectionStyle}>
        <div style={containerStyle}>
          <div style={heroGridStyle}>
            <div style={heroTextWrapStyle}>
              <div style={eyebrowStyle}>{page.eyebrow[language]}</div>
              <h1 style={titleStyle}>{page.title[language]}</h1>
              <p style={introStyle}>{page.description[language]}</p>

              <div style={contactCardsStyle}>
                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>{labels.phone}</div>
                  <a href={`tel:${settings.phoneNumber || ''}`} style={infoLinkStyle}>
                    {settings.phoneNumber || '-'}
                  </a>
                </div>

                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>{labels.email}</div>
                  <a href={emailHref} style={infoLinkStyle}>
                    {settings.contactEmail || '-'}
                  </a>
                </div>

                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>{labels.location}</div>
                  <div style={infoValueStyle}>{settings.location || '-'}</div>
                </div>
              </div>
            </div>

            <div style={quickCardStyle}>
              <h2 style={cardTitleStyle}>{labels.quickTitle}</h2>
              <p style={cardBodyStyle}>{labels.quickBody}</p>

              <div style={quickActionsStyle}>
                <a href={whatsappHref} style={primaryButtonStyle}>
                  <WhatsAppIcon />
                  <span>{labels.whatsapp}</span>
                </a>

                <a href={emailHref} style={secondaryButtonStyle}>
                  <EmailIcon />
                  <span>{labels.emailUs}</span>
                </a>
              </div>

              <div style={socialBlockStyle}>
                <div style={socialTitleStyle}>{labels.social}</div>
                {getSocialLinks(settings).length ? (
                  <SocialIconLinks links={getSocialLinks(settings)} tone="light" />
                ) : (
                  <div style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
                    Social links will appear here once added in admin settings.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={contentSectionStyle}>
        <div style={containerStyle}>
          <div style={contentGridStyle}>
            <div style={mapCardStyle}>
              <div style={sectionLabelStyle}>{labels.map}</div>
              <h2 style={sectionTitleStyle}>{settings.location || 'Kibuye, Karongi, Rwanda'}</h2>
              <div style={mapWrapStyle}>
                <iframe
                  src={mapEmbedSrc}
                  width="100%"
                  height="100%"
                  style={iframeStyle}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Visit KIBUYE Map"
                />
              </div>
            </div>

            <div style={feedbackCardStyle}>
              <div style={sectionLabelStyle}>{labels.feedback}</div>
              <h2 style={sectionTitleStyle}>{labels.feedback}</h2>
              <p style={feedbackBodyStyle}>{labels.feedbackBody}</p>

              {!authLoading && !user ? (
                <div style={loginGateStyle}>
                  <p style={loginHintStyle}>{labels.loginHint}</p>
                  <button type="button" style={submitStyle} onClick={requireLogin}>
                    {labels.loginRequired}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={feedbackFormStyle}>
                  <input
                    style={{ ...inputStyle, background: '#f8fafc' }}
                    value={name}
                    readOnly
                    placeholder={labels.name}
                    required
                  />
                  <input
                    type="email"
                    style={{ ...inputStyle, background: '#f8fafc' }}
                    value={email}
                    readOnly
                    placeholder={labels.yourEmail}
                    required
                  />
                  <input
                    style={inputStyle}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={labels.yourPhone}
                  />
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onFocus={() => {
                      if (!authLoading && !user) requireLogin();
                    }}
                    placeholder={labels.feedbackPlaceholder}
                    style={textareaStyle}
                    required
                  />
                  {error ? <div style={errorStyle}>{error}</div> : null}
                  {status ? <div style={successStyle}>{status}</div> : null}
                  <button type="submit" style={submitStyle} disabled={loading || authLoading}>
                    {loading ? labels.sending : labels.sendFeedback}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.83 11.83 0 0 0 5.79 1.48h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.24-6.17-3.47-8.44ZM12.08 21.8a9.83 9.83 0 0 1-5-1.37l-.36-.21-3.73.98 1-3.64-.24-.37a9.81 9.81 0 0 1-1.51-5.28c0-5.45 4.43-9.88 9.88-9.88 2.64 0 5.12 1.03 6.99 2.9a9.81 9.81 0 0 1 2.9 6.99c0 5.45-4.43 9.88-9.87 9.88Zm5.42-7.4c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.66.15-.2.3-.76.98-.93 1.18-.17.2-.34.22-.64.08-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.74-1.66-2.03-.17-.3-.02-.46.13-.61.14-.14.3-.34.44-.52.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.08 2.88 1.23 3.08c.15.2 2.12 3.23 5.13 4.53.72.31 1.28.49 1.72.62.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.44.25-.71.25-1.32.17-1.45-.07-.12-.27-.2-.56-.34Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

const mainStyle: React.CSSProperties = { paddingBottom: 48 };
const heroSectionStyle: React.CSSProperties = { padding: '8px 12px 12px' };
const contentSectionStyle: React.CSSProperties = { padding: '8px 12px 0' };
const containerStyle: React.CSSProperties = { maxWidth: 1280, margin: '0 auto' };
const heroGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 22,
  alignItems: 'stretch',
};
const heroTextWrapStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #081225 0%, #0f172a 100%)',
  color: 'white',
  borderRadius: 32,
  padding: 28,
  boxShadow: '0 22px 50px rgba(15,23,42,0.18)',
};
const eyebrowStyle: React.CSSProperties = {
  color: '#7dd3fc',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
};
const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(2.2rem, 4vw, 3.8rem)',
  margin: '10px 0 14px',
  lineHeight: 0.98,
  letterSpacing: '-0.04em',
};
const introStyle: React.CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.8,
  maxWidth: 720,
  fontSize: 17,
};
const contactCardsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14,
  marginTop: 22,
};
const infoCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 22,
  padding: 18,
};
const infoLabelStyle: React.CSSProperties = {
  color: '#93c5fd',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};
const infoLinkStyle: React.CSSProperties = {
  color: 'white',
  marginTop: 8,
  lineHeight: 1.6,
  display: 'inline-block',
  textDecoration: 'none',
  wordBreak: 'break-word',
};
const infoValueStyle: React.CSSProperties = {
  color: 'white',
  marginTop: 8,
  lineHeight: 1.6,
  wordBreak: 'break-word',
};
const quickCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.96)',
  color: '#0f172a',
  borderRadius: 32,
  padding: 28,
  boxShadow: '0 18px 40px rgba(2,6,23,0.12)',
  display: 'flex',
  flexDirection: 'column',
};
const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 'clamp(1.9rem, 3vw, 2.4rem)',
  lineHeight: 1.05,
};
const cardBodyStyle: React.CSSProperties = { color: '#475569', lineHeight: 1.7, marginTop: 14 };
const quickActionsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 18,
};
const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  textDecoration: 'none',
  background: 'linear-gradient(135deg, #10b981, #14b8a6)',
  color: 'white',
  padding: '14px 20px',
  borderRadius: 999,
  fontWeight: 700,
};
const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  textDecoration: 'none',
  background: 'white',
  color: '#0f172a',
  padding: '14px 20px',
  borderRadius: 999,
  fontWeight: 700,
  border: '1px solid #cbd5e1',
};
const socialBlockStyle: React.CSSProperties = { marginTop: 24 };
const socialTitleStyle: React.CSSProperties = { fontWeight: 700, marginBottom: 10 };
const contentGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 22,
};
const mapCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 32,
  padding: 24,
  boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
};
const feedbackCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 32,
  padding: 24,
  boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
};
const sectionLabelStyle: React.CSSProperties = {
  color: '#2563eb',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};
const sectionTitleStyle: React.CSSProperties = {
  margin: '10px 0 14px',
  fontSize: 30,
  lineHeight: 1.1,
};
const mapWrapStyle: React.CSSProperties = {
  overflow: 'hidden',
  borderRadius: 24,
  minHeight: 360,
  border: '1px solid #e2e8f0',
};
const iframeStyle: React.CSSProperties = { border: 0, display: 'block', minHeight: 360 };
const feedbackBodyStyle: React.CSSProperties = {
  color: '#475569',
  lineHeight: 1.7,
  marginBottom: 14,
};
const feedbackFormStyle: React.CSSProperties = { display: 'grid', gap: 12 };
const loginGateStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  padding: 16,
  borderRadius: 18,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};
const loginHintStyle: React.CSSProperties = { margin: 0, color: '#475569', lineHeight: 1.6 };
const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 16,
  border: '1px solid #cbd5e1',
  padding: '12px 14px',
  fontSize: 15,
  fontFamily: 'var(--font-sans)',
};
const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 140,
  borderRadius: 20,
  border: '1px solid #cbd5e1',
  padding: 16,
  fontFamily: 'var(--font-sans)',
  fontSize: 15,
  resize: 'vertical',
};
const submitStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  borderRadius: 16,
  background: '#0c4a6e',
  color: 'white',
  padding: '14px 18px',
  fontWeight: 700,
  cursor: 'pointer',
};
const errorStyle: React.CSSProperties = {
  background: '#fef2f2',
  color: '#b91c1c',
  padding: 12,
  borderRadius: 12,
};
const successStyle: React.CSSProperties = {
  background: '#ecfdf5',
  color: '#047857',
  padding: 12,
  borderRadius: 12,
};
