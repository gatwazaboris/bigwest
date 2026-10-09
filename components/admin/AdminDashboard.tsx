'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import OffersManager from '@/components/admin/dashboard/OffersManager';
import ToursManager from '@/components/admin/dashboard/ToursManager';
import GalleryManager from '@/components/admin/dashboard/GalleryManager';
import SettingsManager from '@/components/admin/dashboard/SettingsManager';
import PagesManager from '@/components/admin/dashboard/PagesManager';
import BookingsManager from '@/components/admin/dashboard/BookingsManager';
import ClientsManager from '@/components/admin/dashboard/ClientsManager';
import ContactMessagesManager from '@/components/admin/dashboard/ContactMessagesManager';
import { defaultSettings } from '@/lib/constants/site';
import { normalizePages } from '@/lib/utils/site-pages';
import { toEditableGalleryItem, toEditableOffer, toEditableTour } from '@/lib/utils/site-normalizers';
import type {
  AdminSession,
  Booking,
  BookingStatus,
  ClientUser,
  ContactMessage,
  ContactMessageStatus,
  GalleryItem,
  Offer,
  SiteSettings,
  Tour,
} from '@/types/site';

const emptyTour = toEditableTour();
const emptyOffer = toEditableOffer();
const emptyGallery = toEditableGalleryItem();

type TabKey =
  | 'overview'
  | 'bookings'
  | 'clients'
  | 'messages'
  | 'tours'
  | 'offers'
  | 'gallery'
  | 'pages'
  | 'settings';

const NAV_GROUPS: {
  title: string;
  items: { key: TabKey; label: string; hint: string }[];
}[] = [
  {
    title: 'Start here',
    items: [{ key: 'overview', label: 'Overview', hint: 'Quick status' }],
  },
  {
    title: 'Customers',
    items: [
      { key: 'bookings', label: 'Bookings', hint: 'Confirm trip requests' },
      { key: 'clients', label: 'Clients', hint: 'People with accounts' },
      { key: 'messages', label: 'Contact inbox', hint: 'Who contacted you' },
    ],
  },
  {
    title: 'Website content',
    items: [
      { key: 'tours', label: 'Tours', hint: 'Trip packages for sale' },
      { key: 'offers', label: 'Offers', hint: 'Discounts & deals' },
      { key: 'gallery', label: 'Gallery', hint: 'Photos on the site' },
      { key: 'pages', label: 'Pages', hint: 'Menu & page text' },
    ],
  },
  {
    title: 'Company',
    items: [{ key: 'settings', label: 'Settings', hint: 'Name, logo, social, contact' }],
  },
];

const PAGE_COPY: Record<TabKey, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'See what needs attention, then open one clear section at a time.',
  },
  bookings: {
    title: 'Bookings',
    subtitle: 'Review client trip requests and update their status.',
  },
  clients: {
    title: 'Clients',
    subtitle: 'Accounts created by people who book online.',
  },
  messages: {
    title: 'Contact inbox',
    subtitle: 'See who contacted you from the website contact form.',
  },
  tours: {
    title: 'Tours',
    subtitle: 'Create and edit the trip packages shown on the website.',
  },
  offers: {
    title: 'Offers',
    subtitle: 'Manage special deals and discount banners.',
  },
  gallery: {
    title: 'Gallery',
    subtitle: 'Upload photos that appear in the public gallery.',
  },
  pages: {
    title: 'Pages',
    subtitle: 'Edit menu labels and text for Boat Tours, Island Visits, Hiking, Water, Gallery, and Contact.',
  },
  settings: {
    title: 'Company settings',
    subtitle: 'Brand name, logo, hero images, social links, and contact details.',
  },
};

export default function AdminDashboard({ session }: { session: AdminSession }) {
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>('overview');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'ok' | 'error'>('ok');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [tours, setTours] = useState<Tour[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const [tourForm, setTourForm] = useState(emptyTour);
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [galleryForm, setGalleryForm] = useState(emptyGallery);

  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);

  useEffect(() => {
    hydrate().catch(() => {
      flash('Could not load admin data. Check that the backend is running.', 'error');
    });
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 4200);
    return () => window.clearTimeout(timer);
  }, [message]);

  function flash(text: string, tone: 'ok' | 'error' = 'ok') {
    setMessageTone(tone);
    setMessage(text);
  }

  async function hydrate() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/session');
      const sessionPayload = await response.json().catch(() => null);
      if (!response.ok || !sessionPayload?.authenticated) return;

      const [
        toursResponse,
        offersResponse,
        galleryResponse,
        settingsResponse,
        bookingsResponse,
        clientsResponse,
        messagesResponse,
      ] = await Promise.all([
        fetch('/api/admin/tours'),
        fetch('/api/admin/offers'),
        fetch('/api/admin/gallery'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/bookings'),
        fetch('/api/admin/clients'),
        fetch('/api/admin/contact-messages'),
      ]);

      if (
        !toursResponse.ok ||
        !offersResponse.ok ||
        !galleryResponse.ok ||
        !settingsResponse.ok ||
        !bookingsResponse.ok ||
        !clientsResponse.ok ||
        !messagesResponse.ok
      ) {
        throw new Error('Failed to fetch admin data');
      }

      setTours(await toursResponse.json());
      setOffers(await offersResponse.json());
      setGallery(await galleryResponse.json());
      const nextSettings = await settingsResponse.json();
      setSettings({
        ...defaultSettings,
        ...nextSettings,
        heroImages: Array.isArray(nextSettings.heroImages) ? nextSettings.heroImages : [],
        pages: normalizePages(nextSettings.pages),
      });
      setBookings(await bookingsResponse.json());
      setClients(await clientsResponse.json());
      setMessages(await messagesResponse.json());
    } finally {
      setLoading(false);
    }
  }

  async function publishWebsite() {
    try {
      await fetch('/api/revalidate', { method: 'POST' });
    } catch {
      // Live polling still updates the public site.
    }
  }

  async function saveResource(url: string, method: 'POST' | 'PATCH', body: unknown) {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Request failed');
    await publishWebsite();
    return payload;
  }

  async function deleteResource(url: string) {
    const response = await fetch(url, { method: 'DELETE' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Delete failed');
    await publishWebsite();
  }

  async function handleTourSave() {
    setSaving(true);
    try {
      await saveResource(
        editingTourId ? `/api/admin/tours/${editingTourId}` : '/api/admin/tours',
        editingTourId ? 'PATCH' : 'POST',
        tourForm,
      );
      flash(editingTourId ? 'Tour updated on the website' : 'Tour published to the website');
      setTourForm(emptyTour);
      setEditingTourId(null);
      await hydrate();
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Unable to save tour', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleOfferSave() {
    setSaving(true);
    try {
      await saveResource(
        editingOfferId ? `/api/admin/offers/${editingOfferId}` : '/api/admin/offers',
        editingOfferId ? 'PATCH' : 'POST',
        offerForm,
      );
      flash(editingOfferId ? 'Offer updated on the website' : 'Offer added to the website');
      setOfferForm(emptyOffer);
      setEditingOfferId(null);
      await hydrate();
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Unable to save offer', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleGallerySave() {
    setSaving(true);
    try {
      await saveResource(
        editingGalleryId ? `/api/admin/gallery/${editingGalleryId}` : '/api/admin/gallery',
        editingGalleryId ? 'PATCH' : 'POST',
        galleryForm,
      );
      flash(editingGalleryId ? 'Gallery photo updated' : 'Gallery photo added');
      setGalleryForm(emptyGallery);
      setEditingGalleryId(null);
      await hydrate();
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Unable to save gallery item', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSettingsSave() {
    setSaving(true);
    try {
      const nextSettings = await saveResource('/api/admin/settings', 'PATCH', {
        ...settings,
        pages: normalizePages(settings.pages),
      });
      setSettings({
        ...defaultSettings,
        ...nextSettings,
        pages: normalizePages(nextSettings.pages),
      });
      flash('Saved — website updated');
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Unable to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleMessageStatus(id: string, status: ContactMessageStatus) {
    setSaving(true);
    try {
      await saveResource(`/api/admin/contact-messages/${id}`, 'PATCH', { status });
      flash(`Message marked as ${status}`);
      await hydrate();
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Unable to update message', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(url: string, label: string) {
    if (!window.confirm(`Delete this ${label.toLowerCase()}?`)) return;
    setSaving(true);
    try {
      await deleteResource(url);
      flash(`${label} deleted`);
      await hydrate();
    } catch (error) {
      flash(error instanceof Error ? error.message : `Unable to delete ${label.toLowerCase()}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleBookingStatus(id: string, status: BookingStatus) {
    setSaving(true);
    try {
      await saveResource(`/api/admin/bookings/${id}`, 'PATCH', { status });
      flash(`Booking marked as ${status}`);
      await hydrate();
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Unable to update booking', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  function openTab(next: TabKey) {
    setTab(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const pendingBookings = useMemo(
    () => bookings.filter((item) => item.status === 'pending').length,
    [bookings],
  );
  const newMessages = useMemo(
    () => messages.filter((item) => item.status === 'new').length,
    [messages],
  );

  const page = PAGE_COPY[tab];
  const company = settings.companyName || 'Visit KIBUYE';

  return (
    <div style={pageStyle} className="admin-shell">
      <style>{adminCss}</style>

      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div style={brandBlock}>
          <div style={badge}>Admin</div>
          <h1 style={brandTitle}>{company}</h1>
          <p style={brandMeta}>{session.email}</p>
        </div>

        <nav style={navStyle} aria-label="Admin sections">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} style={navGroup}>
              <div style={navGroupTitle}>{group.title}</div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  style={tab === item.key ? activeNavItem : navItem}
                  onClick={() => openTab(item.key)}
                >
                  <span style={navItemLabel}>{item.label}</span>
                  <span style={navItemHint}>{item.hint}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={sidebarActions}>
          <a href="/" style={ghostLink} target="_blank" rel="noreferrer">
            Open website
          </a>
          <button type="button" style={logoutButton} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {menuOpen ? <button type="button" style={backdrop} aria-label="Close menu" onClick={() => setMenuOpen(false)} /> : null}

      <div style={mainColumn}>
        <header style={topBar} className="admin-topbar">
          <button type="button" style={menuToggle} className="admin-menu-toggle" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={topEyebrow}>{company}</div>
            <div style={topTitle}>{page.title}</div>
          </div>
          <div style={topActions}>
            {saving ? <span style={busyPill}>Saving…</span> : null}
            {loading ? <span style={busyPill}>Loading…</span> : null}
          </div>
        </header>

        <main style={mainStyle}>
          <p style={pageSubtitle}>{page.subtitle}</p>

          {message ? (
            <div style={messageTone === 'error' ? errorMessage : okMessage}>{message}</div>
          ) : null}

          {loading && tab === 'overview' ? (
            <div style={loadingCard}>Loading dashboard…</div>
          ) : null}

          {tab === 'overview' ? (
            <section style={overviewGrid}>
              <button type="button" style={quickCard} onClick={() => openTab('bookings')}>
                <div style={quickLabel}>Needs action</div>
                <div style={quickValue}>{pendingBookings}</div>
                <div style={quickHint}>Pending bookings → open Bookings</div>
              </button>
              <button type="button" style={quickCard} onClick={() => openTab('messages')}>
                <div style={quickLabel}>New messages</div>
                <div style={quickValue}>{newMessages}</div>
                <div style={quickHint}>Who contacted you</div>
              </button>
              <button type="button" style={quickCard} onClick={() => openTab('tours')}>
                <div style={quickLabel}>Tours</div>
                <div style={quickValue}>{tours.length}</div>
                <div style={quickHint}>Manage trip packages</div>
              </button>
              <button type="button" style={quickCard} onClick={() => openTab('pages')}>
                <div style={quickLabel}>Pages</div>
                <div style={quickValueSm}>Menu & text</div>
                <div style={quickHint}>Edit Boat, Island, Hiking, Water, Gallery, Contact</div>
              </button>

              <div style={guideCard}>
                <h2 style={guideTitle}>How to use this panel</h2>
                <ol style={guideList}>
                  <li>Check <strong>Bookings</strong> and <strong>Contact inbox</strong> for new requests.</li>
                  <li>Edit <strong>Tours</strong>, <strong>Offers</strong>, <strong>Gallery</strong>, or <strong>Pages</strong> to change website content.</li>
                  <li>Use <strong>Settings</strong> for company name, logo, social links, and contact info.</li>
                </ol>
              </div>
            </section>
          ) : null}

          {tab === 'bookings' ? (
            <BookingsManager bookings={bookings} saving={saving} onStatusChange={handleBookingStatus} />
          ) : null}

          {tab === 'clients' ? <ClientsManager clients={clients} /> : null}

          {tab === 'messages' ? (
            <ContactMessagesManager
              messages={messages}
              saving={saving}
              onStatusChange={handleMessageStatus}
              onDelete={(id) => handleDelete(`/api/admin/contact-messages/${id}`, 'Message')}
            />
          ) : null}

          {tab === 'tours' ? (
            <ToursManager
              tours={tours}
              form={tourForm}
              editingId={editingTourId}
              saving={saving}
              onFormChange={setTourForm}
              onEdit={(tour) => {
                setEditingTourId(tour.id);
                setTourForm(toEditableTour(tour));
              }}
              onReset={() => {
                setEditingTourId(null);
                setTourForm(emptyTour);
              }}
              onSave={handleTourSave}
              onDelete={(id) => handleDelete(`/api/admin/tours/${id}`, 'Tour')}
            />
          ) : null}

          {tab === 'offers' ? (
            <OffersManager
              offers={offers}
              form={offerForm}
              editingId={editingOfferId}
              saving={saving}
              onFormChange={setOfferForm}
              onEdit={(offer) => {
                setEditingOfferId(offer.id);
                setOfferForm(toEditableOffer(offer));
              }}
              onReset={() => {
                setEditingOfferId(null);
                setOfferForm(emptyOffer);
              }}
              onSave={handleOfferSave}
              onDelete={(id) => handleDelete(`/api/admin/offers/${id}`, 'Offer')}
            />
          ) : null}

          {tab === 'gallery' ? (
            <GalleryManager
              items={gallery}
              form={galleryForm}
              editingId={editingGalleryId}
              saving={saving}
              onFormChange={setGalleryForm}
              onEdit={(item) => {
                setEditingGalleryId(item.id);
                setGalleryForm(toEditableGalleryItem(item));
              }}
              onReset={() => {
                setEditingGalleryId(null);
                setGalleryForm(emptyGallery);
              }}
              onSave={handleGallerySave}
              onDelete={(id) => handleDelete(`/api/admin/gallery/${id}`, 'Gallery item')}
            />
          ) : null}

          {tab === 'pages' ? (
            <PagesManager
              form={settings}
              saving={saving}
              onChange={setSettings}
              onSave={handleSettingsSave}
            />
          ) : null}

          {tab === 'settings' ? (
            <SettingsManager
              form={settings}
              saving={saving}
              onChange={setSettings}
              onSave={handleSettingsSave}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

const adminCss = `
  .admin-shell {
    font-family: var(--font-sans), system-ui, sans-serif;
  }
  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(300px, 88vw);
    z-index: 40;
    transform: translateX(-105%);
    transition: transform 180ms ease;
    background: #0b1f2a;
    color: white;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }
  .admin-sidebar.is-open {
    transform: translateX(0);
  }
  .admin-menu-toggle {
    display: inline-flex !important;
  }
  @media (min-width: 960px) {
    .admin-sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      transform: none;
      width: 280px;
      flex: 0 0 280px;
    }
    .admin-shell {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
    }
    .admin-menu-toggle {
      display: none !important;
    }
  }
`;

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f4f7fb',
  color: '#0b1f2a',
};

const brandBlock: React.CSSProperties = { display: 'grid', gap: 6 };
const badge: React.CSSProperties = {
  display: 'inline-flex',
  width: 'fit-content',
  background: 'rgba(255,255,255,0.12)',
  borderRadius: 999,
  padding: '6px 10px',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};
const brandTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.15,
  fontFamily: 'var(--font-display)',
};
const brandMeta: React.CSSProperties = { margin: 0, color: '#94a3b8', fontSize: 13 };

const navStyle: React.CSSProperties = { display: 'grid', gap: 18, flex: 1 };
const navGroup: React.CSSProperties = { display: 'grid', gap: 8 };
const navGroupTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#64748b',
  paddingLeft: 4,
};
const navItem: React.CSSProperties = {
  textAlign: 'left',
  border: '1px solid transparent',
  background: 'transparent',
  color: '#e2e8f0',
  borderRadius: 14,
  padding: '10px 12px',
  cursor: 'pointer',
  display: 'grid',
  gap: 2,
};
const activeNavItem: React.CSSProperties = {
  ...navItem,
  background: '#ffffff',
  color: '#0b1f2a',
};
const navItemLabel: React.CSSProperties = { fontWeight: 800, fontSize: 14 };
const navItemHint: React.CSSProperties = { fontSize: 12, opacity: 0.72, fontWeight: 500 };

const sidebarActions: React.CSSProperties = { display: 'grid', gap: 8, marginTop: 'auto' };
const ghostLink: React.CSSProperties = {
  textAlign: 'center',
  textDecoration: 'none',
  color: 'white',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '11px 12px',
  fontWeight: 700,
};
const logoutButton: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'transparent',
  color: 'white',
  borderRadius: 12,
  padding: '11px 12px',
  fontWeight: 700,
  cursor: 'pointer',
};

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.45)',
  border: 0,
  zIndex: 30,
};

const mainColumn: React.CSSProperties = { minWidth: 0 };
const topBar: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 20,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  background: 'rgba(244,247,251,0.92)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid #e2e8f0',
};
const menuToggle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: 'white',
  borderRadius: 12,
  padding: '10px 12px',
  fontWeight: 800,
  cursor: 'pointer',
};
const topEyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#64748b',
};
const topTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  lineHeight: 1.2,
  fontFamily: 'var(--font-display)',
};
const topActions: React.CSSProperties = { marginLeft: 'auto', display: 'flex', gap: 8 };
const busyPill: React.CSSProperties = {
  background: '#e0f2fe',
  color: '#075985',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 800,
};

const mainStyle: React.CSSProperties = {
  padding: '16px 16px 40px',
  maxWidth: 1100,
};

const pageSubtitle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#64748b',
  lineHeight: 1.55,
  fontSize: 15,
};

const okMessage: React.CSSProperties = {
  background: '#dcfce7',
  color: '#166534',
  padding: '12px 14px',
  borderRadius: 12,
  marginBottom: 16,
  fontWeight: 700,
};
const errorMessage: React.CSSProperties = {
  ...okMessage,
  background: '#fee2e2',
  color: '#991b1b',
};

const loadingCard: React.CSSProperties = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  color: '#64748b',
  border: '1px solid #e2e8f0',
};

const overviewGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14,
};

const quickCard: React.CSSProperties = {
  textAlign: 'left',
  border: '1px solid #e2e8f0',
  background: 'white',
  borderRadius: 18,
  padding: 18,
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
};
const quickLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};
const quickValue: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 800,
  marginTop: 8,
  color: '#0c4a6e',
  fontFamily: 'var(--font-display)',
};
const quickValueSm: React.CSSProperties = {
  ...quickValue,
  fontSize: 22,
  marginTop: 10,
};
const quickHint: React.CSSProperties = {
  marginTop: 8,
  color: '#475569',
  fontSize: 13,
  lineHeight: 1.4,
};

const guideCard: React.CSSProperties = {
  gridColumn: '1 / -1',
  background: '#0c4a6e',
  color: 'white',
  borderRadius: 18,
  padding: 20,
};
const guideTitle: React.CSSProperties = { margin: '0 0 10px', fontSize: 18 };
const guideList: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  display: 'grid',
  gap: 8,
  lineHeight: 1.5,
  color: 'rgba(255,255,255,0.9)',
};
