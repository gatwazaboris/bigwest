import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import { getPublicSiteData } from '@/lib/server/site-repository';
import './globals.css';

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const sans = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

function iconVersion(logoImage: string) {
  if (!logoImage) return 'default';
  return `${logoImage.length}-${logoImage.slice(0, 24)}-${logoImage.slice(-16)}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPublicSiteData();
  const companyName = data.settings.companyName?.trim() || 'Visit KIBUYE';
  const tagline = data.settings.companyTagline?.trim();
  const version = encodeURIComponent(iconVersion(data.settings.logoImage || ''));

  return {
    title: {
      default: tagline ? `${companyName} | ${tagline}` : `${companyName} | Lake Kivu experiences`,
      template: `%s | ${companyName}`,
    },
    description:
      data.settings.aboutText?.en ||
      'Book boat tours, island visits, hiking, and water activities around Kibuye and Karongi on Lake Kivu, Rwanda.',
    applicationName: companyName,
    icons: {
      icon: [{ url: `/api/site-icon?v=${version}` }],
      shortcut: [`/api/site-icon?v=${version}`],
      apple: [{ url: `/api/site-icon?v=${version}` }],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
