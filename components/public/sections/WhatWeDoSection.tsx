import type { Language, SiteSettings } from '@/types/site';

const copy = {
  en: {
    eyebrow: 'What we do',
    title: 'Local Lake Kivu experiences, simply booked',
    body: 'Visit KIBUYE helps travelers and locals enjoy Kibuye and Karongi with guided boat tours, island visits, hiking, and water activities.',
    stepsTitle: 'How to book',
    steps: [
      {
        n: '01',
        title: 'Choose an experience',
        text: 'Browse boat, island, hiking, or water activities and open the tour you like.',
      },
      {
        n: '02',
        title: 'Create your account',
        text: 'Sign up once so you can request bookings and track them in one place.',
      },
      {
        n: '03',
        title: 'Send your booking',
        text: 'Pick a date and guests. Our team confirms and can also help on WhatsApp.',
      },
    ],
    pillars: [
      { title: 'Boat tours', text: 'Scenic lake crossings and private boat trips.' },
      { title: 'Island visits', text: 'Day trips to nearby islands and quiet shores.' },
      { title: 'Hiking & walking', text: 'Local trails with views over Lake Kivu.' },
      { title: 'Water activities', text: 'Easy lake activities for families and groups.' },
    ],
    cta: 'See experiences',
    account: 'Open my account',
  },
  fr: {
    eyebrow: 'Ce que nous faisons',
    title: 'Des expériences locales sur le lac Kivu, faciles à réserver',
    body: 'Visit KIBUYE aide voyageurs et habitants à profiter de Kibuye et Karongi avec des excursions en bateau, visites d’îles, randonnées et activités nautiques.',
    stepsTitle: 'Comment réserver',
    steps: [
      {
        n: '01',
        title: 'Choisissez une expérience',
        text: 'Parcourez bateau, îles, randonnée ou activités nautiques, puis ouvrez l’excursion.',
      },
      {
        n: '02',
        title: 'Créez votre compte',
        text: 'Inscrivez-vous une fois pour demander et suivre vos réservations.',
      },
      {
        n: '03',
        title: 'Envoyez votre demande',
        text: 'Choisissez la date et le nombre de voyageurs. Notre équipe confirme, aussi via WhatsApp.',
      },
    ],
    pillars: [
      { title: 'Excursions en bateau', text: 'Traversées et sorties privées sur le lac.' },
      { title: 'Visites des îles', text: 'Journées sur les îles et rivages calmes.' },
      { title: 'Randonnée & marche', text: 'Sentiers locaux avec vue sur le lac Kivu.' },
      { title: 'Activités nautiques', text: 'Activités simples pour familles et groupes.' },
    ],
    cta: 'Voir les expériences',
    account: 'Ouvrir mon compte',
  },
} as const;

export default function WhatWeDoSection({
  language,
  settings,
}: {
  language: Language;
  settings: SiteSettings;
}) {
  const text = copy[language];

  return (
    <section style={sectionStyle} id="about" aria-labelledby="what-we-do-title">
      <div style={containerStyle}>
        <div style={introGrid}>
          <div>
            <div style={eyebrow}>{text.eyebrow}</div>
            <h2 id="what-we-do-title" style={titleStyle}>
              {text.title}
            </h2>
            <p style={bodyStyle}>{text.body}</p>
            <p style={aboutStyle}>{settings.aboutText[language]}</p>

            <div style={actionRow}>
              <a href="#experiences" style={primaryLink}>
                {text.cta}
              </a>
              <a href="/admin/login?next=/account" style={secondaryLink}>
                {text.account}
              </a>
            </div>
          </div>

          <div style={stepsWrap}>
            <div style={stepsLabel}>{text.stepsTitle}</div>
            <ol style={stepsList}>
              {text.steps.map((step) => (
                <li key={step.n} style={stepItem}>
                  <div style={stepNumber}>{step.n}</div>
                  <div>
                    <div style={stepTitle}>{step.title}</div>
                    <p style={stepText}>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div style={pillarsGrid}>
          {text.pillars.map((pillar) => (
            <div key={pillar.title} style={pillarItem}>
              <h3 style={pillarTitle}>{pillar.title}</h3>
              <p style={pillarText}>{pillar.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: '56px 18px 8px',
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: '0 auto',
};

const introGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 36,
  alignItems: 'start',
  marginBottom: 36,
};

const eyebrow: React.CSSProperties = {
  color: 'var(--lake)',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.9rem, 4vw, 3rem)',
  lineHeight: 1.05,
  margin: '12px 0 14px',
  letterSpacing: '-0.03em',
  maxWidth: 560,
};

const bodyStyle: React.CSSProperties = {
  color: 'var(--muted)',
  fontSize: 17,
  lineHeight: 1.7,
  margin: '0 0 12px',
  maxWidth: 540,
};

const aboutStyle: React.CSSProperties = {
  color: '#335466',
  fontSize: 15,
  lineHeight: 1.7,
  margin: '0 0 22px',
  maxWidth: 540,
};

const actionRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
};

const primaryLink: React.CSSProperties = {
  textDecoration: 'none',
  background: 'var(--lake-deep)',
  color: 'white',
  padding: '12px 18px',
  borderRadius: 12,
  fontWeight: 700,
};

const secondaryLink: React.CSSProperties = {
  textDecoration: 'none',
  background: 'transparent',
  color: 'var(--lake-deep)',
  padding: '12px 18px',
  borderRadius: 12,
  fontWeight: 700,
  border: '1px solid rgba(12, 74, 110, 0.28)',
};

const stepsWrap: React.CSSProperties = {
  background: 'linear-gradient(160deg, #0c4a6e 0%, #155e75 55%, #0e7490 100%)',
  color: 'white',
  borderRadius: 28,
  padding: 24,
};

const stepsLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  opacity: 0.8,
  marginBottom: 16,
};

const stepsList: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gap: 16,
};

const stepItem: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '48px 1fr',
  gap: 12,
  alignItems: 'start',
};

const stepNumber: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  fontWeight: 700,
  opacity: 0.85,
};

const stepTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 17,
  marginBottom: 4,
};

const stepText: React.CSSProperties = {
  margin: 0,
  color: 'rgba(255,255,255,0.82)',
  lineHeight: 1.55,
  fontSize: 14,
};

const pillarsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 14,
};

const pillarItem: React.CSSProperties = {
  padding: '18px 8px 8px',
  borderTop: '1px solid rgba(12, 74, 110, 0.16)',
};

const pillarTitle: React.CSSProperties = {
  margin: '0 0 8px',
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  letterSpacing: '-0.02em',
};

const pillarText: React.CSSProperties = {
  margin: 0,
  color: 'var(--muted)',
  lineHeight: 1.55,
  fontSize: 15,
};
