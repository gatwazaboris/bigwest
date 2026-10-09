'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Currency } from '@/types/site';
import { useClientAuth } from '@/lib/hooks/useClientAuth';
import { currencyButtonLabel, currencyFullLabel } from '@/lib/utils/price';
import ClientAvatar from '@/components/public/sections/ClientAvatar';

type PageNavLabels = {
  boat: string;
  island: string;
  hiking: string;
  water: string;
  gallery: string;
  contact: string;
};

const defaultPageNav: PageNavLabels = {
  boat: 'Boat Tours',
  island: 'Island Visits',
  hiking: 'Hiking &safaris',
  water: 'Water Activities',
  gallery: 'Gallery',
  contact: 'Contact',
};

export default function SiteHeader({
  currency = 'USD',
  currencies = ['USD'],
  onCurrencyChange,
  companyName = 'Visit KIBUYE',
  companyTagline = 'Kibuye • Karongi • Lake Kivu',
  logoImage = '',
  pageNav,
}: {
  currency?: Currency;
  currencies?: Currency[];
  onCurrencyChange?: (currency: Currency) => void;
  tone?: 'hero' | 'page';
  companyName?: string;
  companyTagline?: string;
  logoImage?: string;
  pageNav?: Partial<PageNavLabels>;
}) {
  const router = useRouter();
  const { user, loading, logout } = useClientAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const nav = { ...defaultPageNav, ...pageNav };
  const safeCurrencies = currencies?.length ? currencies : (['USD'] as Currency[]);
  const brand = companyName || 'Visit KIBUYE';
  const tagline = companyTagline || 'Kibuye • Karongi • Lake Kivu';

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  async function handleLogout() {
    setAccountOpen(false);
    setMenuOpen(false);
    await logout();
    router.push('/');
    router.refresh();
  }

  return (
    <header style={headerStyle}>
      <div style={shellStyle}>
        <div style={mainRowStyle} className="site-header-main-row">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            style={menuButton}
            className="site-header-menu-button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close' : 'Menu'}
          >
            <span style={menuIconLine} />
            <span style={menuIconLine} />
            <span style={menuIconLine} />
          </button>

          <a href="/" style={brandStyle}>
            {logoImage ? (
              <img src={logoImage} alt={brand} style={brandLogoImage} />
            ) : (
              <span style={brandIcon}>✦</span>
            )}
            <div style={brandTextWrap}>
              <div style={brandTitle}>{brand}</div>
              <div style={brandSubtitle}>{tagline}</div>
            </div>
          </a>

          <div className="site-header-desktop-right" style={desktopRightStyle}>
            <nav className="site-header-desktop-nav" style={desktopNavStyle} aria-label="Main">
              <a href="/tours/boat" style={navLink}>
                {nav.boat}
              </a>
              <a href="/tours/island" style={navLink}>
                {nav.island}
              </a>
              <a href="/tours/hiking" style={navLink}>
                {nav.hiking}
              </a>
              <a href="/tours/water" style={navLink}>
                {nav.water}
              </a>
              <a href="/gallery" style={navLink}>
                {nav.gallery}
              </a>
              <a href="/contact" style={navLink}>
                {nav.contact}
              </a>
            </nav>

            <div className="site-header-desktop-switches" style={desktopSwitchesStyle}>
              <div style={currencyWrap} title={`Prices shown in ${currencyFullLabel(currency)}`}>
                <span style={currencyLabel}>Currency</span>
                <div style={currencyPill} role="group" aria-label="Choose currency">
                  {safeCurrencies.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onCurrencyChange?.(item)}
                      style={currency === item ? activeCurrency : chipButton}
                      aria-pressed={currency === item}
                      title={currencyFullLabel(item)}
                    >
                      {currencyButtonLabel(item)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div ref={accountRef} style={accountWrap}>
            {user ? (
              <>
                <button
                  type="button"
                  style={avatarButton}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label={`Account menu for ${user.name}`}
                  title={user.name}
                  onClick={() => setAccountOpen((prev) => !prev)}
                >
                  <ClientAvatar user={user} size={36} />
                </button>
                {accountOpen ? (
                  <div style={dropdownStyle} role="menu">
                    <div style={dropdownHeader}>
                      <ClientAvatar user={user} size={40} />
                      <div style={{ minWidth: 0 }}>
                        <div style={dropdownName}>{user.name}</div>
                        <div style={dropdownEmail}>{user.email}</div>
                      </div>
                    </div>
                    <a href="/account/profile" style={dropdownLink} role="menuitem" onClick={() => setAccountOpen(false)}>
                      Profile
                    </a>
                    <a href="/account" style={dropdownLink} role="menuitem" onClick={() => setAccountOpen(false)}>
                      My bookings
                    </a>
                    <button type="button" style={dropdownDanger} role="menuitem" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <a
                href="/admin/login?next=/account"
                style={accountButton}
                aria-label="Account"
                title={loading ? 'Checking account…' : 'Sign in'}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="8" r="4" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {menuOpen ? (
          <div className="site-header-mobile-menu-panel" style={mobileMenuPanelStyle}>
            <nav style={mobileNavStyle}>
              <a href="/tours/boat" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                {nav.boat}
              </a>
              <a href="/tours/island" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                {nav.island}
              </a>
              <a href="/tours/hiking" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                {nav.hiking}
              </a>
              <a href="/tours/water" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                {nav.water}
              </a>
              <a href="/gallery" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                {nav.gallery}
              </a>
              <a href="/contact" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                {nav.contact}
              </a>
            </nav>

            {user ? (
              <div style={menuSectionStyle}>
                <div style={menuSectionLabel}>Account</div>
                <div style={mobileAccountCard}>
                  <ClientAvatar user={user} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <div style={dropdownName}>{user.name}</div>
                    <div style={dropdownEmail}>{user.email}</div>
                  </div>
                </div>
                <a href="/account/profile" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                  Profile
                </a>
                <a href="/account" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                  My bookings
                </a>
                <button type="button" style={mobileLogout} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div style={menuSectionStyle}>
                <a href="/admin/login?next=/account" style={mobileNavLink} onClick={() => setMenuOpen(false)}>
                  Sign in
                </a>
              </div>
            )}

            <div style={menuSectionStyle}>
              <div style={menuSectionLabel}>Currency</div>
              <p style={currencyHelp}>Prices update across tours when you change currency.</p>
              <div style={{ ...currencyPill, flexWrap: 'wrap' }}>
                {safeCurrencies.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onCurrencyChange?.(item);
                      setMenuOpen(false);
                    }}
                    style={currency === item ? activeCurrency : chipButton}
                    aria-pressed={currency === item}
                  >
                    {currencyButtonLabel(item)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  padding: '12px 12px 0',
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  position: 'relative',
};

const mainRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '44px minmax(0, 1fr) 44px',
  alignItems: 'center',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 22,
  background: 'rgba(255,255,255,0.96)',
  color: '#0b1f2a',
  border: '1px solid rgba(148,163,184,0.28)',
  boxShadow: '0 12px 34px rgba(15, 23, 42, 0.1)',
  backdropFilter: 'blur(14px)',
};

const menuButton: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: '1px solid rgba(148,163,184,0.4)',
  background: '#f8fafc',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
};

const menuIconLine: React.CSSProperties = {
  width: 18,
  height: 2,
  background: '#0b1f2a',
  borderRadius: 999,
};

const brandStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  color: '#0b1f2a',
  textDecoration: 'none',
  minWidth: 0,
};

const brandIcon: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 12,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(14,116,144,0.12)',
  color: '#0e7490',
  fontSize: 16,
  flexShrink: 0,
};

const brandLogoImage: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 12,
  objectFit: 'cover',
  flexShrink: 0,
  display: 'block',
  background: 'rgba(14,116,144,0.08)',
};

const brandTextWrap: React.CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
};

const brandTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 'clamp(1rem, 2.4vw, 1.35rem)',
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  color: '#0b1f2a',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const brandSubtitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.35,
  color: '#475569',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: 2,
};

const accountWrap: React.CSSProperties = {
  position: 'relative',
  justifySelf: 'end',
};

const accountButton: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  display: 'grid',
  placeItems: 'center',
  textDecoration: 'none',
  color: '#0b1f2a',
  border: '1px solid rgba(148,163,184,0.4)',
  background: '#f8fafc',
};

const avatarButton: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  border: '1px solid rgba(148,163,184,0.4)',
  background: '#f8fafc',
  padding: 3,
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: 0,
  width: 240,
  background: 'white',
  borderRadius: 18,
  border: '1px solid #e2e8f0',
  boxShadow: '0 18px 40px rgba(15,23,42,0.14)',
  padding: 10,
  zIndex: 120,
  display: 'grid',
  gap: 4,
};

const dropdownHeader: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  padding: '8px 8px 12px',
  borderBottom: '1px solid #e2e8f0',
  marginBottom: 4,
};

const dropdownName: React.CSSProperties = {
  fontWeight: 800,
  color: '#0f172a',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const dropdownEmail: React.CSSProperties = {
  color: '#64748b',
  fontSize: 12,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const dropdownLink: React.CSSProperties = {
  display: 'block',
  textDecoration: 'none',
  color: '#0f172a',
  fontWeight: 700,
  padding: '10px 12px',
  borderRadius: 12,
  background: '#f8fafc',
};

const dropdownDanger: React.CSSProperties = {
  border: 0,
  textAlign: 'left',
  color: '#b91c1c',
  fontWeight: 700,
  padding: '10px 12px',
  borderRadius: 12,
  background: '#fef2f2',
  cursor: 'pointer',
};

const desktopRightStyle: React.CSSProperties = {
  display: 'none',
  alignItems: 'center',
  gap: 16,
  minWidth: 0,
};

const desktopSwitchesStyle: React.CSSProperties = {
  display: 'none',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
};

const desktopNavStyle: React.CSSProperties = {
  display: 'none',
  alignItems: 'center',
  gap: 4,
  flexWrap: 'nowrap',
  minWidth: 0,
};

const navLink: React.CSSProperties = {
  color: '#0f172a',
  textDecoration: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
  padding: '8px 10px',
  borderRadius: 10,
};

const currencyWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const currencyLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#64748b',
};

const currencyPill: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  background: '#e2e8f0',
  borderRadius: 999,
  padding: 4,
};

const chipButton: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#334155',
  borderRadius: 999,
  padding: '8px 12px',
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: 12,
  fontFamily: 'var(--font-sans)',
  whiteSpace: 'nowrap',
  lineHeight: 1,
};

const activeCurrency: React.CSSProperties = {
  ...chipButton,
  background: '#0c4a6e',
  color: '#ffffff',
};

const mobileMenuPanelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  left: 0,
  padding: 14,
  borderRadius: 20,
  background: '#ffffff',
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
  border: '1px solid rgba(148,163,184,0.28)',
};

const mobileNavStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
};

const mobileNavLink: React.CSSProperties = {
  color: '#0b1f2a',
  textDecoration: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 16,
  fontWeight: 700,
  padding: '12px 14px',
  borderRadius: 14,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const menuSectionStyle: React.CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gap: 8,
};

const menuSectionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#64748b',
  fontFamily: 'var(--font-sans)',
};

const currencyHelp: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: 13,
  lineHeight: 1.45,
};

const mobileAccountCard: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  padding: 12,
  borderRadius: 14,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const mobileLogout: React.CSSProperties = {
  border: '1px solid #fecaca',
  background: '#fef2f2',
  color: '#b91c1c',
  borderRadius: 14,
  padding: '12px 14px',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  textAlign: 'left',
};
