'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientAvatar from '@/components/public/sections/ClientAvatar';
import type { ClientUser } from '@/types/site';

function VerifyPageBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromEmail = (searchParams.get('code') || '').replace(/\D/g, '').slice(0, 6);
  const tokenFromUrl = searchParams.get('token') || '';

  const [code, setCode] = useState(codeFromEmail);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [autoTried, setAutoTried] = useState(false);

  async function loadSession() {
    const response = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
    const payload = await response.json().catch(() => null);
    if (!payload?.authenticated || payload.role !== 'client' || !payload.user) {
      router.replace('/admin/login?next=/account/verify');
      return;
    }
    if (payload.user.emailVerified) {
      router.replace('/account');
      return;
    }
    setUser(payload.user);
    setChecking(false);
  }

  async function verify(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter the 6-digit code from your email');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: trimmed }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message || 'Verification failed');
        return;
      }
      setMessage('Email verified. Redirecting to your account…');
      window.location.assign('/account');
    } catch {
      setError('Unable to verify right now');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message || 'Unable to resend email');
        return;
      }
      if (payload.alreadyVerified) {
        window.location.assign('/account');
        return;
      }
      setCode('');
      setMessage(
        payload.verificationHint
          ? `${payload.verificationHint} Code: ${payload.verificationCode}`
          : 'A new verification email was sent. Enter the 6-digit code from that email.',
      );
    } catch {
      setError('Unable to resend email right now');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession().catch(() => router.replace('/admin/login?next=/account/verify'));
  }, []);

  useEffect(() => {
    if (codeFromEmail) setCode(codeFromEmail);
  }, [codeFromEmail]);

  // One-click verify when opening the old-style email token link
  useEffect(() => {
    if (checking || autoTried || !tokenFromUrl) return;
    setAutoTried(true);
    verify(tokenFromUrl).catch(() => undefined);
  }, [checking, tokenFromUrl, autoTried]);

  if (checking) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>Checking your account…</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <div style={badge}>Email verification</div>
        <h1 style={title}>Enter your email code</h1>
        <p style={body}>
          Check your inbox for a message from Visit KIBUYE. Enter the <strong>6-digit code</strong>{' '}
          we sent to <strong>{user?.email}</strong>.
        </p>

        {user ? (
          <div style={userRow}>
            <ClientAvatar user={user} size={48} />
            <div>
              <div style={userName}>{user.name}</div>
              <div style={userEmail}>{user.email}</div>
            </div>
          </div>
        ) : null}

        <label style={label}>Code from email</label>
        <input
          style={input}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
        />

        {error ? <div style={errorStyle}>{error}</div> : null}
        {message ? <div style={okStyle}>{message}</div> : null}

        <button
          type="button"
          style={primaryButton}
          disabled={loading || code.length < 6}
          onClick={() => verify(code)}
        >
          {loading ? 'Verifying…' : 'Verify with email code'}
        </button>
        <button type="button" style={secondaryButton} disabled={loading} onClick={resend}>
          Resend verification email
        </button>
        <a href="/account" style={skipLink}>
          Go to account
        </a>
      </div>
    </main>
  );
}

export default function VerifyEmailClient() {
  return (
    <Suspense
      fallback={
        <main style={pageStyle}>
          <div style={cardStyle}>Loading verification…</div>
        </main>
      }
    >
      <VerifyPageBody />
    </Suspense>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '70vh',
  display: 'grid',
  placeItems: 'center',
  padding: '24px 16px 48px',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 520,
  background: 'white',
  borderRadius: 28,
  padding: 28,
  border: '1px solid #e2e8f0',
  boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
};

const badge: React.CSSProperties = {
  display: 'inline-flex',
  background: '#ecfeff',
  color: '#0e7490',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const title: React.CSSProperties = {
  margin: '14px 0 10px',
  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
  letterSpacing: '-0.03em',
};

const body: React.CSSProperties = {
  color: '#475569',
  lineHeight: 1.7,
  margin: '0 0 18px',
};

const userRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  marginBottom: 18,
  padding: 12,
  borderRadius: 16,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const userName: React.CSSProperties = { fontWeight: 800 };
const userEmail: React.CSSProperties = { color: '#64748b', fontSize: 13 };

const label: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: 14,
  padding: 14,
  fontSize: 22,
  letterSpacing: '0.28em',
  fontWeight: 800,
  textAlign: 'center',
};

const primaryButton: React.CSSProperties = {
  width: '100%',
  marginTop: 16,
  border: 0,
  borderRadius: 14,
  padding: 14,
  background: '#0c4a6e',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
};

const secondaryButton: React.CSSProperties = {
  width: '100%',
  marginTop: 10,
  border: '1px solid #cbd5e1',
  borderRadius: 14,
  padding: 14,
  background: 'white',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
};

const skipLink: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  marginTop: 14,
  color: '#64748b',
  fontWeight: 600,
  textDecoration: 'none',
};

const errorStyle: React.CSSProperties = {
  marginTop: 12,
  background: '#fef2f2',
  color: '#b91c1c',
  padding: 12,
  borderRadius: 12,
};

const okStyle: React.CSSProperties = {
  marginTop: 12,
  background: '#ecfdf5',
  color: '#047857',
  padding: 12,
  borderRadius: 12,
};
