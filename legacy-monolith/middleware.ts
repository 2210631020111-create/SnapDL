import { NextRequest, NextResponse } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_STORE_KEY = '__SNAPDL_RATE_STORE__';

declare global {
  // eslint-disable-next-line no-var
  var __SNAPDL_RATE_STORE__: Map<string, RateLimitEntry> | undefined;
}

function getRateStore() {
  if (!globalThis[RATE_STORE_KEY as keyof typeof globalThis]) {
    globalThis.__SNAPDL_RATE_STORE__ = new Map<string, RateLimitEntry>();
  }
  return globalThis.__SNAPDL_RATE_STORE__ as Map<string, RateLimitEntry>;
}

function toPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getAllowedOrigins(req: NextRequest) {
  const envOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const defaultOrigins = new Set<string>([req.nextUrl.origin]);

  if (process.env.NEXT_PUBLIC_APP_URL) {
    defaultOrigins.add(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''));
  }

  if (process.env.NODE_ENV !== 'production') {
    defaultOrigins.add('http://localhost:3000');
    defaultOrigins.add('http://127.0.0.1:3000');
  }

  for (const origin of envOrigins) {
    defaultOrigins.add(origin.replace(/\/$/, ''));
  }

  return defaultOrigins;
}

function isOriginAllowed(req: NextRequest, origin: string | null) {
  if (!origin) return true;
  return getAllowedOrigins(req).has(origin.replace(/\/$/, ''));
}

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

function setCorsHeaders(req: NextRequest, response: NextResponse) {
  const origin = req.headers.get('origin');
  if (origin && isOriginAllowed(req, origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '600');
}

function setSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
}

function applyRateLimit(req: NextRequest) {
  const isEnabled = (process.env.API_RATE_LIMIT_ENABLED ?? 'true') !== 'false';
  if (!isEnabled) {
    return {
      allowed: true,
      limit: 0,
      remaining: 0,
      resetAt: Date.now(),
      retryAfterSeconds: 0,
    };
  }

  const limit = toPositiveInt(process.env.API_RATE_LIMIT_MAX, 120);
  const windowMs = toPositiveInt(process.env.API_RATE_LIMIT_WINDOW_MS, 60_000);

  const now = Date.now();
  const ip = getClientIp(req);
  const key = `${ip}:${req.nextUrl.pathname}`;
  const store = getRateStore();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(key, current);
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

function setRateLimitHeaders(response: NextResponse, data: ReturnType<typeof applyRateLimit>) {
  if (data.limit <= 0) return;
  response.headers.set('X-RateLimit-Limit', String(data.limit));
  response.headers.set('X-RateLimit-Remaining', String(data.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.floor(data.resetAt / 1000)));
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const origin = req.headers.get('origin');
  if (origin && !isOriginAllowed(req, origin)) {
    const blocked = NextResponse.json({ error: 'Origin is not allowed' }, { status: 403 });
    setSecurityHeaders(blocked);
    return blocked;
  }

  if (req.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    setCorsHeaders(req, preflight);
    setSecurityHeaders(preflight);
    return preflight;
  }

  const skipRateLimit = req.nextUrl.pathname === '/api/health';
  const rate = skipRateLimit ? {
    allowed: true,
    limit: 0,
    remaining: 0,
    resetAt: Date.now(),
    retryAfterSeconds: 0,
  } : applyRateLimit(req);

  if (!rate.allowed) {
    const blocked = NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 },
    );
    blocked.headers.set('Retry-After', String(rate.retryAfterSeconds));
    setCorsHeaders(req, blocked);
    setSecurityHeaders(blocked);
    setRateLimitHeaders(blocked, rate);
    return blocked;
  }

  const response = NextResponse.next();
  setCorsHeaders(req, response);
  setSecurityHeaders(response);
  setRateLimitHeaders(response, rate);
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
