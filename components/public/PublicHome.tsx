'use client';

import { useEffect, useMemo, useState } from 'react';
import { currencies } from '@/lib/constants/site';
import { usePreferredCurrency } from '@/lib/hooks/usePreferredCurrency';
import { fetchPublicSiteDataClient } from '@/lib/public/site-data';
import { getCategoryLabel, getNavPageLabels } from '@/lib/utils/site-pages';
import type { PublicSiteData, TourCategory } from '@/types/site';
import SiteHeader from './sections/SiteHeader';
import HeroSection from './sections/HeroSection';
import WhatWeDoSection from './sections/WhatWeDoSection';
import OffersSection from './sections/OffersSection';
import ToursSection from './sections/ToursSection';
import GallerySection from './sections/GallerySection';
import ContactSection from './sections/ContactSection';
import FloatingWhatsApp from './sections/FloatingWhatsApp';
import CategoryHighlights from './sections/CategoryHighlights';

export default function PublicHome({ initialData }: { initialData: PublicSiteData }) {
  const language = 'en' as const;
  const { currency, setCurrency } = usePreferredCurrency();
  const [data, setData] = useState<PublicSiteData>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const next = await fetchPublicSiteDataClient();
        if (!cancelled) setData(next);
      } catch {
        // Keep showing the last good payload.
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

  const toursByCategory = useMemo(() => {
    const buckets: Record<TourCategory, PublicSiteData['tours']> = {
      boat: [],
      island: [],
      hiking: [],
      water: [],
    };

    for (const tour of data.tours) {
      buckets[tour.category].push(tour);
    }

    return buckets;
  }, [data.tours]);

  const categoryCards = useMemo(
    () =>
      (['boat', 'island', 'hiking', 'water'] as TourCategory[]).map((category) => ({
        id: category,
        title: getCategoryLabel(data.settings, category, language),
        count: toursByCategory[category].length,
        image:
          toursByCategory[category][0]?.images?.[0] ||
          data.gallery.find((item) => item.featured)?.imageData ||
          data.gallery[0]?.imageData ||
          '',
      })),
    [data.gallery, data.settings, language, toursByCategory],
  );

  return (
    <div style={pageStyle}>
      <SiteHeader
        currency={currency}
        currencies={currencies}
        onCurrencyChange={setCurrency}
        companyName={data.settings.companyName}
        companyTagline={data.settings.companyTagline}
        logoImage={data.settings.logoImage}
        pageNav={getNavPageLabels(data.settings, language)}
      />

      <div style={homeContentOffset}>
        <HeroSection settings={data.settings} language={language} />
        <WhatWeDoSection language={language} settings={data.settings} />
        <CategoryHighlights language={language} cards={categoryCards} />
        <OffersSection offers={data.offers} language={language} />
        <ToursSection
          toursByCategory={toursByCategory}
          language={language}
          currency={currency}
          settings={data.settings}
        />
        <GallerySection items={data.gallery} language={language} />
        <ContactSection settings={data.settings} language={language} />
      </div>
      <FloatingWhatsApp whatsappNumber={data.settings.whatsappNumber} />
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  color: 'var(--ink)',
  minHeight: '100vh',
};

const homeContentOffset: React.CSSProperties = {
  paddingTop: 88,
};
