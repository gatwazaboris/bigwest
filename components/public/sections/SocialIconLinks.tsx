import type { SocialLink, SocialNetwork } from '@/lib/utils/social';

function SocialGlyph({ id }: { id: SocialNetwork }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
  };

  if (id === 'facebook') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.2V11H8v3h2.4v8h3.1Z" />
      </svg>
    );
  }

  if (id === 'instagram') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (id === 'tiktok') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M14.5 3c.3 1.7 1.3 3 2.9 3.7.8.4 1.7.6 2.6.6v3.1a8 8 0 0 1-3.8-1V15a6 6 0 1 1-6-6c.4 0 .8 0 1.2.1v3.2a2.8 2.8 0 1 0 1.3 2.4V3h2.8Z" />
      </svg>
    );
  }

  if (id === 'youtube') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M23 12s0-3.1-.4-4.6a2.9 2.9 0 0 0-2-2C19.1 5 12 5 12 5s-7.1 0-8.6.4a2.9 2.9 0 0 0-2 2C1 8.9 1 12 1 12s0 3.1.4 4.6a2.9 2.9 0 0 0 2 2C4.9 19 12 19 12 19s7.1 0 8.6-.4a2.9 2.9 0 0 0 2-2c.4-1.5.4-4.6.4-4.6ZM10 15.5v-7l6 3.5-6 3.5Z" />
      </svg>
    );
  }

  return (
    <svg {...common} fill="currentColor">
      <path d="M18.2 2H21l-6.6 7.5L22 22h-6.2l-4.9-6.4L5.5 22H2.7l7-8L2 2h6.3l4.4 5.8L18.2 2Zm-1.1 18h1.7L7 3.9H5.2L17.1 20Z" />
    </svg>
  );
}

export default function SocialIconLinks({
  links,
  tone = 'dark',
}: {
  links: SocialLink[];
  tone?: 'dark' | 'light';
}) {
  if (!links.length) return null;

  const isDark = tone === 'dark';

  return (
    <div style={rowStyle}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          title={link.label}
          style={{
            ...iconButton,
            background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
            color: isDark ? 'white' : '#0f172a',
          }}
        >
          <SocialGlyph id={link.id} />
        </a>
      ))}
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  alignItems: 'center',
};

const iconButton: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  display: 'grid',
  placeItems: 'center',
  textDecoration: 'none',
};
