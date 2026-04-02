# SnapDl Split Deployment Guide (Frontend + Backend)

This project now supports **single deploy** and **split deploy**.

## 0) Folder split status

This repository now has physical split folders:

- `frontend/` -> UI app (no `app/api`)
- `backend/` -> API app (`app/api/*` + `middleware.ts`)

## 1) Current architecture

- Frontend: Next.js pages/components (`app/*`, `components/*`)
- Backend API: Next.js route handlers (`app/api/*`)
- API client bridge: `lib/client/api.ts`
  - Uses `NEXT_PUBLIC_API_BASE_URL`
  - Empty value = same-origin `/api/*`
  - Set value = call external backend host

## 2) URL structure

- Home Yahoo downloader: `/Yfinance`
- Mode pages:
  - `/finance/single`
  - `/finance/lite`
  - `/finance/bulk`
  - `/finance/panduan`
- Compatibility:
  - `/financebulk` -> redirects to `/finance/bulk`

## 3) How to split frontend and backend

### Frontend deployment

- Deploy this repo as frontend app
- Set env:
  - `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`

### Backend deployment options

1. Keep using Next.js `app/api/*` routes in the same repo (no migration needed)
2. Or move `app/api/*` to separate service later (Express/Fastify/Nest)
   - Keep endpoint paths identical (`/api/fetch-history`, etc.)
   - Frontend will continue working via `NEXT_PUBLIC_API_BASE_URL`

## 4) Recommended next migration steps

- Move Yahoo service logic from route handlers into reusable `lib/server/*`
- Add auth/rate-limit at API gateway
- Add CORS policy for frontend origin if backend is separated
- Add health endpoint (`/api/health`) for monitoring

## 5) Security hardening that is now ready

The project now includes centralized API middleware at `middleware.ts` for:

- CORS allowlist enforcement for split deployment
- API preflight handling (`OPTIONS`)
- Basic IP-based rate limiting per API path
- Security headers on all `/api/*` responses
- Monitoring endpoint at `/api/health`

### Required env for split deployment backend

- `CORS_ALLOWED_ORIGINS=https://frontend.yourdomain.com`
- `API_RATE_LIMIT_ENABLED=true`
- `API_RATE_LIMIT_MAX=120`
- `API_RATE_LIMIT_WINDOW_MS=60000`

### Frontend env (unchanged)

- `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`

## 6) Quick verification checklist

1. Call backend health endpoint:
  - `GET https://api.yourdomain.com/api/health`
2. Test allowed origin from frontend domain:
  - API requests should succeed.
3. Test disallowed origin:
  - Should return `403 Origin is not allowed`.
4. Burst requests (> limit in window):
  - Should return `429 Too many requests` with `Retry-After` header.

## 7) Notes

- Local dev remains unchanged if `NEXT_PUBLIC_API_BASE_URL` is empty.
- File download endpoints continue to work with the same API contract.

## 8) Step-by-step deploy (recommended)

### Step 1 - Deploy backend API

1. Deploy `backend/` to your backend host.
2. Set backend environment variables:
  - `CORS_ALLOWED_ORIGINS=https://frontend.yourdomain.com`
  - `API_RATE_LIMIT_ENABLED=true`
  - `API_RATE_LIMIT_MAX=120`
  - `API_RATE_LIMIT_WINDOW_MS=60000`
3. Confirm backend URL, example:
  - `https://api.yourdomain.com`

### Step 2 - Deploy frontend app

1. Deploy `frontend/` to your frontend host.
2. Set frontend environment variable:
  - `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com`
3. Confirm frontend URL, example:
  - `https://app.yourdomain.com`

### Step 3 - Run automated verification

From local machine:

1. Go to frontend folder.
2. Install dependencies.
3. Run verification.

Commands:

`cd frontend`

`npm install`

`API_BASE_URL=https://api.yourdomain.com FRONTEND_ORIGIN=https://app.yourdomain.com npm run verify:split`

Windows PowerShell:

`cd frontend`

`npm install`

`$env:API_BASE_URL='https://api.yourdomain.com'; $env:FRONTEND_ORIGIN='https://app.yourdomain.com'; npm run verify:split`

Expected result:
- health check passes
- allowed origin request passes
- preflight OPTIONS passes
- blocked origin returns 403

Optional rate-limit stress test:

`API_BASE_URL=https://api.yourdomain.com FRONTEND_ORIGIN=https://app.yourdomain.com RUN_RATE_LIMIT_CHECK=true RATE_LIMIT_ATTEMPTS=140 npm run verify:split`

Windows PowerShell:

`$env:API_BASE_URL='https://api.yourdomain.com'; $env:FRONTEND_ORIGIN='https://app.yourdomain.com'; $env:RUN_RATE_LIMIT_CHECK='true'; $env:RATE_LIMIT_ATTEMPTS='140'; npm run verify:split`
