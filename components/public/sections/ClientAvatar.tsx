'use client';

import type { ClientUser } from '@/types/site';

export function getClientInitial(name?: string | null) {
  const trimmed = (name || '').trim();
  return (trimmed.charAt(0) || 'U').toUpperCase();
}

export default function ClientAvatar({
  user,
  size = 36,
}: {
  user: Pick<ClientUser, 'name' | 'profileImage'> | { name: string; profileImage?: string };
  size?: number;
}) {
  const initial = getClientInitial(user.name);
  const image = user.profileImage?.trim() || '';

  if (image) {
    return (
      <img
        src={image}
        alt={user.name}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          objectFit: 'cover',
          display: 'block',
          background: '#e2e8f0',
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #0c4a6e, #0e7490)',
        color: 'white',
        fontWeight: 800,
        fontSize: Math.max(12, Math.round(size * 0.4)),
        fontFamily: 'var(--font-sans)',
        letterSpacing: '0.02em',
      }}
    >
      {initial}
    </span>
  );
}
