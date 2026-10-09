import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/backend';

const BACKEND_URL = getBackendUrl();

function rewriteSetCookie(value: string, request: NextRequest) {
  let cookie = value
    // Cookie must belong to the Next.js host (localhost / frontend domain), not the API host
    .replace(/;\s*Domain=[^;]*/gi, '')
    .replace(/;\s*SameSite=None/gi, '; SameSite=Lax');

  // Remote API sets Secure because it runs in production; strip for local HTTP so the browser keeps it
  if (request.nextUrl.protocol !== 'https:') {
    cookie = cookie.replace(/;\s*Secure/gi, '');
  }

  return cookie;
}

async function proxy(request: NextRequest, path: string[]) {
  const search = request.nextUrl.search;
  const target = `${BACKEND_URL}/api/${path.join('/')}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('cookie', cookie);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return NextResponse.json(
      {
        message: `Backend API is unreachable at ${BACKEND_URL}. Restart the Node.js app in cPanel.`,
      },
      { status: 502 },
    );
  }

  // cPanel often returns HTML 503 pages when the Node worker crashed (Prisma not generated, etc.)
  const upstreamType = upstream.headers.get('content-type') || '';
  if (
    (upstream.status === 502 || upstream.status === 503 || upstream.status === 504) &&
    !upstreamType.includes('application/json')
  ) {
    return NextResponse.json(
      {
        message:
          `Backend returned ${upstream.status} from ${BACKEND_URL}. ` +
          'In cPanel Terminal run: source ~/nodevenv/b.bigwesttours.com/22/bin/activate && ' +
          'cd ~/b.bigwesttours.com && ./node_modules/.bin/prisma generate && then Restart the app.',
      },
      { status: upstream.status },
    );
  }

  const responseHeaders = new Headers();
  if (upstreamType) responseHeaders.set('content-type', upstreamType);

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });

  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [];

  if (setCookies.length) {
    for (const value of setCookies) {
      response.headers.append('set-cookie', rewriteSetCookie(value, request));
    }
  } else {
    const single = upstream.headers.get('set-cookie');
    if (single) response.headers.append('set-cookie', rewriteSetCookie(single, request));
  }

  return response;
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: Ctx) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: Ctx) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: Ctx) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: Ctx) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const { path } = await context.params;
  return proxy(request, path);
}
