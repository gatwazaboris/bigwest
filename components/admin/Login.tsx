'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fileToDataUrl } from '@/lib/utils/images';
import ClientAvatar from '@/components/public/sections/ClientAvatar';

type AuthMode = 'login' | 'signup';

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '';

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function redirectAfterAuth(role: string, needsVerification?: boolean) {
    // Hard navigation so the browser commits Set-Cookie before the admin page loads.
    if (role === 'admin') {
      window.location.assign('/admin');
      return;
    }

    if (needsVerification) {
      window.location.assign('/account/verify');
      return;
    }

    window.location.assign(nextPath.startsWith('/') ? nextPath : '/account');
  }

  async function handleProfileFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileImage(await fileToDataUrl(file));
    event.target.value = '';
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const raw = await response.text();
        let payload: { message?: string; role?: string; needsVerification?: boolean } = {};
        try {
          payload = raw ? JSON.parse(raw) : {};
        } catch {
          payload = {};
        }

        if (!response.ok) {
          setMessage(
            payload.message ||
              (response.status === 503 || response.status === 502
                ? 'Backend API is unavailable (503). Restart the Node.js app on cPanel after running prisma generate.'
                : 'Login failed'),
          );
          return;
        }

        redirectAfterAuth(payload.role || 'client', Boolean(payload.needsVerification));
        return;
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, phone, profileImage }),
      });

      const raw = await response.text();
      let payload: {
        message?: string;
        verificationCode?: string;
        verificationHint?: string;
      } = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = {};
      }

      if (!response.ok) {
        setMessage(
          payload.message ||
            (response.status === 503 || response.status === 502
              ? 'Backend API is unavailable (503). Restart the Node.js app on cPanel after running prisma generate.'
              : 'Signup failed'),
        );
        return;
      }

      // Only keep a local fallback code when SMTP is disabled (dev).
      // With real email, users must enter the code from their inbox.
      if (payload.verificationCode && payload.verificationHint) {
        try {
          sessionStorage.setItem('visit_kibuye_verify_code', String(payload.verificationCode));
        } catch {
          // ignore
        }
      }

      redirectAfterAuth('client', true);
    } catch {
      setMessage(
        mode === 'login'
          ? 'Unable to sign in right now'
          : 'Unable to create account right now',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <div style={backgroundGlowOne} />
      <div style={backgroundGlowTwo} />

      <section style={wrapStyle}>
        <div style={topStyle}>
          <a href="/" style={brandStyle}>
            <span style={brandIcon}>✦</span>
            <div>
              <div style={brandTitle}>Visit KIBUYE</div>
              <div style={brandSubtitle}>Kibuye • Karongi • Lake Kivu</div>
            </div>
          </a>
        </div>

        <div style={contentStyle}>
          <div style={introStyle}>
            <div style={badgeStyle}>Welcome</div>
            <h1 style={headingStyle}>
              {mode === 'login' ? 'Login to your account' : 'Create your account'}
            </h1>
            <p style={introTextStyle}>
              {mode === 'login'
                ? 'Clients manage bookings here. Admins open the control panel with the same login page.'
                : 'Add your photo, create an account, then verify your email to start booking tours.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={switchWrapStyle}>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMessage('');
                }}
                style={mode === 'login' ? activeSwitchStyle : switchStyle}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setMessage('');
                }}
                style={mode === 'signup' ? activeSwitchStyle : switchStyle}
              >
                Sign up
              </button>
            </div>

            {mode === 'signup' ? (
              <>
                <div style={avatarBlock}>
                  <ClientAvatar user={{ name: name || 'U', profileImage }} size={72} />
                  <div>
                    <label style={labelStyle}>Profile image</label>
                    <input type="file" accept="image/*" onChange={handleProfileFile} />
                    {profileImage ? (
                      <button type="button" style={removePhoto} onClick={() => setProfileImage('')}>
                        Remove photo
                      </button>
                    ) : (
                      <p style={helpText}>Optional. If skipped, your name initial is used.</p>
                    )}
                  </div>
                </div>

                <label style={labelStyle}>Full name</label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  required
                />

                <label style={labelStyle}>Phone (optional)</label>
                <input
                  style={inputStyle}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+250 ..."
                />
              </>
            ) : null}

            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />

            {message ? <div style={messageStyle}>{message}</div> : null}

            <button type="submit" style={submitStyle} disabled={loading}>
              {loading
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                  ? 'Login'
                  : 'Sign up'}
            </button>

            <div style={footerTextStyle}>
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setMessage('');
                    }}
                    style={textButtonStyle}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setMessage('');
                    }}
                    style={textButtonStyle}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(180deg, #dbeafe 0%, #eef4ff 38%, #ffffff 100%)',
  padding: '24px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const wrapStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1080,
  position: 'relative',
  zIndex: 1,
};

const topStyle: React.CSSProperties = {
  marginBottom: 18,
};

const brandStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  textDecoration: 'none',
  color: '#0f172a',
};

const brandIcon: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  display: 'grid',
  placeItems: 'center',
  background: '#1d4ed8',
  color: 'white',
  fontSize: 16,
  boxShadow: '0 10px 24px rgba(37,99,235,0.22)',
};

const brandTitle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 20,
  lineHeight: 1.1,
};

const brandSubtitle: React.CSSProperties = {
  fontSize: 12,
  color: '#64748b',
};

const contentStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 24,
  alignItems: 'center',
  background: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(255,255,255,0.65)',
  borderRadius: 32,
  padding: 20,
  backdropFilter: 'blur(16px)',
  boxShadow: '0 24px 70px rgba(15,23,42,0.12)',
};

const introStyle: React.CSSProperties = {
  padding: '10px 6px',
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  background: 'rgba(37,99,235,0.12)',
  color: '#1d4ed8',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'clamp(2rem, 5vw, 3.4rem)',
  lineHeight: 0.98,
  margin: '16px 0 14px',
  color: '#0f172a',
  letterSpacing: '-0.04em',
};

const introTextStyle: React.CSSProperties = {
  color: '#475569',
  fontSize: 16,
  lineHeight: 1.7,
  maxWidth: 480,
};

const formStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 28,
  padding: 22,
  border: '1px solid #e2e8f0',
  boxShadow: '0 12px 30px rgba(15,23,42,0.07)',
};

const switchWrapStyle: React.CSSProperties = {
  display: 'inline-flex',
  gap: 6,
  padding: 4,
  borderRadius: 999,
  background: '#e2e8f0',
  marginBottom: 18,
};

const switchStyle: React.CSSProperties = {
  border: 0,
  background: 'transparent',
  color: '#334155',
  borderRadius: 999,
  padding: '10px 16px',
  fontWeight: 700,
  cursor: 'pointer',
};

const activeSwitchStyle: React.CSSProperties = {
  ...switchStyle,
  background: 'white',
  color: '#0f172a',
  boxShadow: '0 4px 14px rgba(15,23,42,0.08)',
};

const avatarBlock: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  alignItems: 'center',
  marginBottom: 8,
  padding: 12,
  borderRadius: 18,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const helpText: React.CSSProperties = {
  margin: '6px 0 0',
  color: '#64748b',
  fontSize: 13,
};

const removePhoto: React.CSSProperties = {
  marginTop: 8,
  border: '1px solid #fecaca',
  background: 'white',
  color: '#b91c1c',
  borderRadius: 10,
  padding: '6px 10px',
  fontWeight: 700,
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginTop: 14,
  marginBottom: 6,
  fontWeight: 700,
  color: '#0f172a',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: 16,
  padding: 14,
  fontSize: 16,
  background: 'white',
  color: '#0f172a',
  outline: 'none',
};

const submitStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 18,
  padding: 14,
  border: 0,
  borderRadius: 16,
  background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
  color: 'white',
  fontWeight: 800,
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 14px 28px rgba(37,99,235,0.22)',
};

const messageStyle: React.CSSProperties = {
  marginTop: 14,
  background: '#fee2e2',
  color: '#991b1b',
  padding: 12,
  borderRadius: 12,
  lineHeight: 1.5,
};

const footerTextStyle: React.CSSProperties = {
  marginTop: 16,
  color: '#64748b',
  fontSize: 14,
  lineHeight: 1.6,
};

const textButtonStyle: React.CSSProperties = {
  border: 0,
  background: 'transparent',
  color: '#2563eb',
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
};

const backgroundGlowOne: React.CSSProperties = {
  position: 'absolute',
  width: 360,
  height: 360,
  borderRadius: '50%',
  background: 'rgba(37,99,235,0.14)',
  filter: 'blur(70px)',
  top: -80,
  right: -40,
};

const backgroundGlowTwo: React.CSSProperties = {
  position: 'absolute',
  width: 300,
  height: 300,
  borderRadius: '50%',
  background: 'rgba(14,165,233,0.12)',
  filter: 'blur(70px)',
  bottom: -80,
  left: -40,
};
