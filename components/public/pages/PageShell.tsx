'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Currency, Language, PublicSiteData, SiteSettings } from '@/types/site';
import { currencies } from '@/lib/constants/site';
import { usePreferredCurrency } from '@/lib/hooks/usePreferredCurrency';
import { fetchPublicSiteDataClient } from '@/lib/public/site-data';
import { getNavPageLabels } from '@/lib/utils/site-pages';
import SiteHeader from '@/components/public/sections/SiteHeader';
import ContactSection from '@/components/public/sections/ContactSection';
import FloatingWhatsApp from '@/components/public/sections/FloatingWhatsApp';

type PageShellContextValue = {
  language: Language;
  currency: Currency;
  settings: SiteSettings;
  data: PublicSiteData;
};

const PageShellContext = createContext<PageShellContextValue | null>(null);

export function usePageShell() {
  const value = useContext(PageShellContext);
  if (!value) {
    throw new Error('usePageShell must be used inside PageShell');
  }
  return value;
}

export default function PageShell({
  settings,
  initialData,
  children,
  showBackHome = false,
  showFooterContact = true,
}: {
  settings: SiteSettings;
  initialData?: PublicSiteData;
  children: React.ReactNode;
  showBackHome?: boolean;
  showFooterContact?: boolean;
}) {
  const language: Language = 'en';
  const { currency, setCurrency } = usePreferredCurrency();
  const [data, setData] = useState<PublicSiteData>(
    initialData || {
      settings,
      tours: [],
      offers: [],
      gallery: [],
    },
  );

  useEffect(() => {
    if (initialData) setData(initialData);
    else setData((prev) => ({ ...prev, settings }));
  }, [initialData, settings]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const next = await fetchPublicSiteDataClient();
        if (!cancelled) setData(next);
      } catch {
        // Keep last good content.
      }
    }

    refresh();
    const onFocus = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(refresh, 15000);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
    };
  }, []);

  const contextValue = useMemo(
    () => ({ language, currency, settings: data.settings, data }),
    [currency, data, language],
  );

  return (
    <PageShellContext.Provider value={contextValue}>
      <div style={pageStyle}>
        <div style={fixedHeaderWrap}>
          <SiteHeader
            currency={currency}
            currencies={currencies}
            onCurrencyChange={setCurrency}
            companyName={data.settings.companyName}
            companyTagline={data.settings.companyTagline}
            logoImage={data.settings.logoImage}
            pageNav={getNavPageLabels(data.settings, language)}
          />
        </div>

        <div style={contentOffsetStyle}>
          {showBackHome ? (
            <div style={backWrapStyle}>
              <a href="/" style={backButtonStyle}>
                <span style={backIconStyle}>←</span>
                <span>Back to home</span>
              </a>
            </div>
          ) : null}

          {children}
        </div>

        {showFooterContact ? (
          <ContactSection settings={data.settings} language={language} />
        ) : null}

        <FloatingWhatsApp whatsappNumber={data.settings.whatsappNumber} />
      </div>
    </PageShellContext.Provider>
  );
}

const pageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  color: 'var(--ink)',
  minHeight: '100vh',
};

const fixedHeaderWrap: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
};

const contentOffsetStyle: React.CSSProperties = {
  paddingTop: 108,
};

const backWrapStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '0 12px 8px',
};

const backButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
  color: '#0f172a',
  background: 'rgba(255,255,255,0.88)',
  border: '1px solid rgba(148,163,184,0.22)',
  borderRadius: 999,
  padding: '10px 14px',
  fontWeight: 700,
  boxShadow: '0 8px 20px rgba(15,23,42,0.06)',
};

const backIconStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 16,
  lineHeight: 1,
};
