'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultHeroImages } from '@/lib/constants/site';
import type { Language, SiteSettings } from '@/types/site';

const copy = {
  en: {
    place: 'Kibuye • Karongi • Lake Kivu',
    explore: 'Explore tours',
    book: 'Book a trip',
  },
  fr: {
    place: 'Kibuye • Karongi • Lac Kivu',
    explore: 'Voir les excursions',
    book: 'Réserver',
  },
} as const;

const SLIDE_MS = 5500;
const ANIM_MS = 900;

export default function HeroSection({
  settings,
  language,
}: {
  settings: SiteSettings;
  language: Language;
}) {
  const labels = copy[language];
  const images = useMemo(() => {
    const fromSettings = (settings.heroImages || []).filter(Boolean);
    return fromSettings.length ? fromSettings : defaultHeroImages;
  }, [settings.heroImages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const activeRef = useRef(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    activeRef.current = 0;
    animatingRef.current = false;
    setActiveIndex(0);
    setIncomingIndex(null);
    setIsAnimating(false);
  }, [images.join('|')]);

  useEffect(() => {
    if (images.length < 2) return;

    const timer = window.setInterval(() => {
      if (animatingRef.current) return;
      const next = (activeRef.current + 1) % images.length;
      animatingRef.current = true;
      setIncomingIndex(next);
      setIsAnimating(true);

      window.setTimeout(() => {
        activeRef.current = next;
        setActiveIndex(next);
        setIncomingIndex(null);
        setIsAnimating(false);
        animatingRef.current = false;
      }, ANIM_MS);
    }, SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [images.length]);

  function goTo(index: number) {
    if (index === activeRef.current || animatingRef.current || images.length < 2) return;
    animatingRef.current = true;
    setIncomingIndex(index);
    setIsAnimating(true);
    window.setTimeout(() => {
      activeRef.current = index;
      setActiveIndex(index);
      setIncomingIndex(null);
      setIsAnimating(false);
      animatingRef.current = false;
    }, ANIM_MS);
  }

  return (
    <section style={sectionStyle} id="top" aria-label="Visit KIBUYE hero">
      <div style={slideshowStyle} aria-hidden>
        {images.map((image, index) => {
          const isActive = index === activeIndex;
          const isIncoming = index === incomingIndex;
          let className = 'hero-slide';
          if (isActive && isAnimating) className += ' hero-slide-exit-ltr';
          else if (isActive) className += ' hero-slide-active';
          if (isIncoming) className += ' hero-slide-enter-ltr';

          return (
            <div
              key={`${image.slice(0, 48)}-${index}`}
              className={className}
              style={{
                ...slideStyle,
                backgroundImage: `url("${image}")`,
                zIndex: isIncoming ? 2 : isActive ? 1 : 0,
              }}
            />
          );
        })}
      </div>

      <div style={veilStyle} />

      <div style={contentShell}>
        <div className="rise-in" style={brandBlock}>
          {settings.logoImage ? (
            <img src={settings.logoImage} alt={settings.companyName} style={logoStyle} />
          ) : null}
          <div style={brandMark}>{settings.companyName || 'Visit KIBUYE'}</div>
          <div style={placeLine}>{settings.companyTagline || labels.place}</div>
        </div>

        <h1 className="rise-in-delay" style={titleStyle}>
          {settings.heroTitle[language]}
        </h1>

        <p className="rise-in-delay-2" style={subtitleStyle}>
          {settings.heroSubtitle[language]}
        </p>

        <div className="rise-in-delay-2" style={actionRow}>
          <a href="#experiences" style={primaryButton}>
            {labels.explore}
          </a>
          <a href="/admin/login?next=/account" style={secondaryButton}>
            {labels.book}
          </a>
        </div>

        {images.length > 1 ? (
          <div style={dotsRow} role="tablist" aria-label="Hero images">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Hero image ${index + 1}`}
                onClick={() => goTo(index)}
                style={{
                  ...dotStyle,
                  background: index === activeIndex ? 'white' : 'rgba(255,255,255,0.35)',
                  width: index === activeIndex ? 28 : 10,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  position: 'relative',
  minHeight: '92vh',
  display: 'flex',
  alignItems: 'flex-end',
  overflow: 'hidden',
  color: 'white',
};

const slideshowStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
};

const slideStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const veilStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 3,
  background:
    'linear-gradient(180deg, rgba(8,29,40,0.28) 0%, rgba(8,29,40,0.45) 42%, rgba(8,29,40,0.88) 100%)',
  pointerEvents: 'none',
};

const contentShell: React.CSSProperties = {
  position: 'relative',
  zIndex: 4,
  width: '100%',
  maxWidth: 1180,
  margin: '0 auto',
  padding: '72px 20px 64px',
};

const brandBlock: React.CSSProperties = {
  marginBottom: 18,
};

const logoStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  objectFit: 'cover',
  borderRadius: 18,
  marginBottom: 14,
  border: '1px solid rgba(255,255,255,0.28)',
  background: 'rgba(255,255,255,0.12)',
};

const brandMark: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2.6rem, 7vw, 4.8rem)',
  fontWeight: 700,
  letterSpacing: '-0.04em',
  lineHeight: 0.95,
};

const placeLine: React.CSSProperties = {
  marginTop: 10,
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.78)',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(1.55rem, 3.6vw, 2.35rem)',
  fontWeight: 600,
  lineHeight: 1.15,
  maxWidth: 720,
  margin: '0 0 14px',
  color: 'rgba(255,255,255,0.96)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 'clamp(1.02rem, 2.2vw, 1.22rem)',
  lineHeight: 1.65,
  maxWidth: 560,
  margin: '0 0 28px',
  color: 'rgba(255,255,255,0.84)',
};

const actionRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
};

const primaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#e0f2fe',
  color: '#0c4a6e',
  textDecoration: 'none',
  padding: '14px 22px',
  borderRadius: 14,
  fontWeight: 700,
  fontSize: 15,
};

const secondaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  color: 'white',
  textDecoration: 'none',
  padding: '14px 22px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.45)',
  fontWeight: 700,
  fontSize: 15,
};

const dotsRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  marginTop: 28,
};

const dotStyle: React.CSSProperties = {
  height: 10,
  borderRadius: 999,
  border: 0,
  padding: 0,
  cursor: 'pointer',
  transition: 'width 60ms ease, background 60ms ease',
};
