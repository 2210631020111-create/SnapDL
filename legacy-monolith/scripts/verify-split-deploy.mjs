#!/usr/bin/env node

/*
  Usage:
  API_BASE_URL=https://api.example.com FRONTEND_ORIGIN=https://app.example.com npm run verify:split

  Optional:
  RUN_RATE_LIMIT_CHECK=true RATE_LIMIT_ATTEMPTS=140 npm run verify:split
*/

const apiBaseUrl = (process.env.API_BASE_URL || '').replace(/\/$/, '');
const frontendOrigin = (process.env.FRONTEND_ORIGIN || '').replace(/\/$/, '');
const runRateLimitCheck = String(process.env.RUN_RATE_LIMIT_CHECK || 'false').toLowerCase() === 'true';
const rateLimitAttempts = Number.parseInt(process.env.RATE_LIMIT_ATTEMPTS || '140', 10);

if (!apiBaseUrl) {
  console.error('Missing API_BASE_URL. Example: https://api.yourdomain.com');
  process.exit(1);
}

if (!frontendOrigin) {
  console.error('Missing FRONTEND_ORIGIN. Example: https://app.yourdomain.com');
  process.exit(1);
}

function fullUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalized}`;
}

async function checkHealth() {
  const res = await fetch(fullUrl('/api/health'));
  const data = await res.json().catch(() => ({}));

  return {
    pass: res.ok && data?.ok === true,
    detail: `status=${res.status} ok=${String(data?.ok)}`,
  };
}

async function checkAllowedOriginPost() {
  const res = await fetch(fullUrl('/api/parse-url'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: frontendOrigin,
    },
    body: JSON.stringify({
      url: 'https://finance.yahoo.com/quote/AAPL/history/?period1=1704067200&period2=1735689600',
    }),
  });

  const allowOriginHeader = res.headers.get('access-control-allow-origin');
  return {
    pass: res.status !== 403 && allowOriginHeader === frontendOrigin,
    detail: `status=${res.status} access-control-allow-origin=${allowOriginHeader || 'none'}`,
  };
}

async function checkPreflight() {
  const res = await fetch(fullUrl('/api/fetch-history'), {
    method: 'OPTIONS',
    headers: {
      Origin: frontendOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });

  return {
    pass: res.status === 204,
    detail: `status=${res.status}`,
  };
}

async function checkBlockedOrigin() {
  const evilOrigin = 'https://evil.invalid';
  const res = await fetch(fullUrl('/api/parse-url'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: evilOrigin,
    },
    body: JSON.stringify({
      url: 'https://finance.yahoo.com/quote/AAPL/history/?period1=1704067200&period2=1735689600',
    }),
  });

  return {
    pass: res.status === 403,
    detail: `status=${res.status}`,
  };
}

async function checkRateLimit() {
  let got429 = false;
  let first429At = -1;

  for (let i = 1; i <= rateLimitAttempts; i += 1) {
    const res = await fetch(fullUrl('/api/parse-url'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: frontendOrigin,
      },
      body: JSON.stringify({
        url: 'https://finance.yahoo.com/quote/AAPL/history/?period1=1704067200&period2=1735689600',
      }),
    });

    if (res.status === 429) {
      got429 = true;
      first429At = i;
      break;
    }
  }

  return {
    pass: got429,
    detail: got429 ? `429 observed at request #${first429At}` : `no 429 in ${rateLimitAttempts} requests`,
  };
}

async function run() {
  const checks = [
    ['health', checkHealth],
    ['allowed-origin-post', checkAllowedOriginPost],
    ['preflight-options', checkPreflight],
    ['blocked-origin', checkBlockedOrigin],
  ];

  if (runRateLimitCheck) {
    checks.push(['rate-limit', checkRateLimit]);
  }

  let allPass = true;

  console.log(`Split deploy verification for ${apiBaseUrl}`);
  console.log(`Frontend origin: ${frontendOrigin}`);
  console.log('---');

  for (const [name, fn] of checks) {
    try {
      const result = await fn();
      allPass = allPass && result.pass;
      console.log(`${result.pass ? 'PASS' : 'FAIL'} ${name}: ${result.detail}`);
    } catch (error) {
      allPass = false;
      console.log(`FAIL ${name}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  console.log('---');
  if (!allPass) {
    console.error('Verification failed. Check env vars and deployment config.');
    process.exit(1);
  }

  console.log('Verification passed. Split deployment security baseline is working.');
}

run();
