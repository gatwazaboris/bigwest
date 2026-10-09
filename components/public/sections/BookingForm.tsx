'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, Tour } from '@/types/site';

const copy = {
  en: {
    title: 'Book this tour',
    date: 'Tour date',
    guests: 'Guests',
    phone: 'Contact phone',
    notes: 'Notes (optional)',
    submit: 'Confirm booking',
    submitting: 'Sending...',
    loginFirst: 'Log in or create an account to book',
    success: 'Booking submitted. Check your email and track it in your account.',
    viewAccount: 'View my bookings',
  },
  fr: {
    title: 'Réserver cette excursion',
    date: 'Date',
    guests: 'Voyageurs',
    phone: 'Téléphone',
    notes: 'Notes (optionnel)',
    submit: 'Confirmer la réservation',
    submitting: 'Envoi...',
    loginFirst: 'Connectez-vous ou créez un compte pour réserver',
    success: 'Réservation envoyée. Vérifiez votre email et suivez-la dans votre compte.',
    viewAccount: 'Voir mes réservations',
  },
} as const;

export default function BookingForm({
  tour,
  language,
}: {
  tour: Tour;
  language: Language;
}) {
  const router = useRouter();
  const text = copy[language];
  const [tourDate, setTourDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const sessionResponse = await fetch('/api/auth/session');
      const sessionPayload = await sessionResponse.json().catch(() => null);
      if (!sessionPayload?.authenticated || sessionPayload.role !== 'client') {
        router.push(`/admin/login?next=/tour/${tour.id}`);
        return;
      }

      const response = await fetch('/api/client/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour.id,
          tourDate,
          guests,
          contactPhone,
          notes,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message || 'Booking failed');
        return;
      }

      setMessage(text.success);
      setNotes('');
    } catch {
      setError('Unable to create booking right now');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={titleStyle}>{text.title}</h2>

      <label style={labelStyle}>{text.date}</label>
      <input
        type="date"
        style={inputStyle}
        value={tourDate}
        onChange={(event) => setTourDate(event.target.value)}
        required
      />

      <label style={labelStyle}>{text.guests}</label>
      <input
        type="number"
        min={1}
        max={50}
        style={inputStyle}
        value={guests}
        onChange={(event) => setGuests(Number(event.target.value))}
        required
      />

      <label style={labelStyle}>{text.phone}</label>
      <input
        style={inputStyle}
        value={contactPhone}
        onChange={(event) => setContactPhone(event.target.value)}
        placeholder="+250 ..."
      />

      <label style={labelStyle}>{text.notes}</label>
      <textarea
        style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      {error ? <div style={errorStyle}>{error}</div> : null}
      {message ? (
        <div style={successStyle}>
          {message}{' '}
          <a href="/account" style={{ color: 'inherit', fontWeight: 800 }}>
            {text.viewAccount}
          </a>
        </div>
      ) : null}

      <button type="submit" style={buttonStyle} disabled={loading}>
        {loading ? text.submitting : text.submit}
      </button>
    </form>
  );
}

const formStyle: React.CSSProperties = {
  marginTop: 24,
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: 24,
  padding: 20,
  boxShadow: '0 14px 34px rgba(15,23,42,0.08)',
  maxWidth: 460,
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 24,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginTop: 12,
  marginBottom: 6,
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: 14,
  padding: 12,
  fontSize: 15,
  fontFamily: 'inherit',
};

const buttonStyle: React.CSSProperties = {
  marginTop: 16,
  width: '100%',
  border: 0,
  borderRadius: 14,
  padding: 14,
  background: '#2563eb',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
  marginTop: 12,
  background: '#fee2e2',
  color: '#991b1b',
  padding: 10,
  borderRadius: 12,
};

const successStyle: React.CSSProperties = {
  marginTop: 12,
  background: '#dcfce7',
  color: '#166534',
  padding: 10,
  borderRadius: 12,
};
