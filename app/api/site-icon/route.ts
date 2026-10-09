import { getPublicSiteData } from '@/lib/server/site-repository';

function parseDataUrl(value: string) {
  const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,([\s\S]*)$/i.exec(value.trim());
  if (!match) return null;

  const mime = (match[1] || 'application/octet-stream').toLowerCase();
  const isBase64 = Boolean(match[2]);
  const payload = match[3] || '';

  try {
    if (isBase64) {
      const buffer = Buffer.from(payload, 'base64');
      return { mime, body: buffer };
    }

    const decoded = decodeURIComponent(payload);
    if (mime.includes('svg')) {
      return { mime: 'image/svg+xml', body: Buffer.from(decoded, 'utf8') };
    }
    return { mime, body: Buffer.from(decoded, 'utf8') };
  } catch {
    return null;
  }
}

function defaultIconSvg(companyName: string) {
  const initial = (companyName.trim().charAt(0) || 'K').toUpperCase();
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#0c4a6e"/>
  <text x="32" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#ffffff">${initial}</text>
</svg>`;
}

export async function GET() {
  const data = await getPublicSiteData();
  const logo = data.settings.logoImage?.trim() || '';

  if (logo.startsWith('data:')) {
    const parsed = parseDataUrl(logo);
    if (parsed?.body.length) {
      return new Response(new Uint8Array(parsed.body), {
        headers: {
          'Content-Type': parsed.mime,
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      });
    }
  }

  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    try {
      const upstream = await fetch(logo, { cache: 'no-store' });
      if (upstream.ok) {
        const contentType = upstream.headers.get('content-type') || 'image/png';
        const body = await upstream.arrayBuffer();
        return new Response(body, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          },
        });
      }
    } catch {
      // fall through to default
    }
  }

  const svg = defaultIconSvg(data.settings.companyName || 'Visit KIBUYE');
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}
