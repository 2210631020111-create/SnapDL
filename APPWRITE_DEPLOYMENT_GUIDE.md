# Deploy SnapDL ke Appwrite - Complete Guide

Step-by-step tutorial untuk deploy frontend dan backend ke Appwrite menggunakan student program (10 projects).

---

## 📋 Prerequisites

- ✅ Appwrite student account aktif
- ✅ GitHub repo sudah push (untuk CI/CD integration)
- ✅ Custom domain siap (optional, tp recommended)

---

## 🎯 Deployment Strategy

Kita pakai **2 projects** (dari 10 yang tersedia):

| Project | Folder | Purpose | Domain |
|---------|--------|---------|--------|
| snapdl-dev | frontend + backend | Development | dev.yourdomain.com |
| snapdl-prod | frontend + backend | Production | app.yourdomain.com |

Nanti bisa expand ke 3+ projects kalau ada staging/testing.

---

## ⚙️ Part 1: Setup Appwrite Dashboard

### 1.1 Login ke Appwrite

1. Buka [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Login dengan akun student Anda
3. Klik **"Create project"**

### 1.2 Buat Project untuk DEV

**Project name**: `snapdl-dev`

**Project ID**: `snapdl-dev` (auto-generated, biarkan saja)

**Region**: Pilih terdekat dengan lokasi Anda (contoh: Singapore untuk Indo)

Klik **"Create"**

Catat **Project ID** dan **API Key** (akan digunakan nanti).

---

## 🔧 Part 2: Deploy Backend Terlebih Dulu

### 2.1 Siapkan Repository

Di root project lokal:

```bash
# Pastikan .env backend sudah ada
cat > backend/.env << 'EOF'
# CORS untuk split deploy
CORS_ALLOWED_ORIGINS=https://frontend-dev.yourdomain.com
API_RATE_LIMIT_ENABLED=true
API_RATE_LIMIT_MAX=120
API_RATE_LIMIT_WINDOW_MS=60000
NODE_ENV=production
EOF
```

**Jangan push .env ke GitHub**. Env vars akan dikonfigurasi di Appwrite UI.

### 2.2 Di Appwrite Dashboard - Buat Service untuk Backend

1. Login ke Appwrite project `snapdl-dev`
2. Sidebar → **Functions** → **New Function**
3. Konfigurasi:
   - **Function name**: `snapdl-backend`
   - **Runtime**: `Node.js 20` (atau latest available)
   - **Execute as**: `User` (default)
   - **Authorization**: `Any` (API terbuka)

4. Klik **Create Function**

### 2.3 Connect GitHub Repository

1. Di halaman function, tab **Settings**
2. **Git Configuration**:
   - **Repository**: Pilih GitHub repo SnapDL
   - **Root directory**: `backend/`
   - **Branch**: `main`
   - **Auto deploy**: Toggle ON

3. Klik **Connect**

GitHub akan meminta authorization. Accept dan confirm.

### 2.4 Build Command Configuration

1. Tab **Settings** → **Build Settings**
2. **Install command**:
   ```bash
   npm ci
   ```

3. **Build command**:
   ```bash
   npm run build
   ```

4. **Entrypoint**:
   ```bash
   npm run start
   ```

### 2.5 Environment Variables untuk Backend

1. Tab **Variables**
2. Tambah setiap key:

| Key | Value | Notes |
|-----|-------|-------|
| `CORS_ALLOWED_ORIGINS` | `https://frontend-dev.yourdomain.com` | Frontend URL nanti |
| `API_RATE_LIMIT_ENABLED` | `true` | Rate limit ON |
| `API_RATE_LIMIT_MAX` | `120` | Max requests |
| `API_RATE_LIMIT_WINDOW_MS` | `60000` | Per 60 seconds |
| `NODE_ENV` | `production` | Production mode |

Klik **Save** setelah setiap tambahan.

### 2.6 Deploy Backend

1. Tab **Overview**
2. Klik **Deploy** (atau otomatis jika auto-deploy enabled)
3. Tunggu sampai status **"Active"** ✅

**Catat Backend URL**:
- Appwrite akan memberi URL publik, contoh: `https://function-xxxxx.appwrite.io`
- Ini adalah `NEXT_PUBLIC_API_BASE_URL` untuk frontend

---

## 🎨 Part 3: Deploy Frontend

### 3.1 Siapkan Frontend .env

```bash
# Di lokal, buat frontend/.env.production
cat > frontend/.env.production << 'EOF'
NEXT_PUBLIC_API_BASE_URL=https://function-xxxxx.appwrite.io
EOF
```

Ganti `function-xxxxx.appwrite.io` dengan actual backend URL dari step 2.6.

### 3.2 Di Appwrite Dashboard - Hosting Setup

1. Sidebar → **Databases** (atau **Buckets** jika tersedia)
2. Appwrite Cloud memakai **Static Files Hosting** built-in
3. Atau gunakan **Deployments** untuk Next.js native

**Rekomendasi untuk Next.js**: Pakai **Vercel** atau **Netlify** integration daripada Appwrite hosting (lebih optimal untuk Next.js).

Tapi kalau mau tetap di Appwrite:

### 3.3 Menggunakan Vercel untuk Frontend (RECOMMENDED)

1. Push frontend code ke GitHub branch `main`
2. Go to [https://vercel.com/](https://vercel.com/)
3. **Import Project** → Select GitHub repo
4. **Framework Preset**: Next.js
5. **Root Directory**: `frontend/`
6. **Build Command**: `npm run build`
7. **Output Directory**: `.next`
8. **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://function-xxxxx.appwrite.io`

9. Klik **Deploy**

Vercel akan build dan deploy otomatis. Catat **Vercel URL**.

### 3.4 Alternatif: Appwrite Static Hosting

Jika prefer tetap di Appwrite (tanpa Vercel):

1. Sidebar → **Storage** 
2. **Create Bucket**: `frontend-builds`
3. Di lokal:
   ```bash
   cd frontend
   npm run build
   ```

4. Build results di `frontend/.next/` dan `frontend/public/`
5. Upload keseluruhan ke bucket via Appwrite CLI atau dashboard

---

## 🔗 Part 4: Konfigurasi Domain Custom

### 4.1 Backend Custom Domain

1. Appwrite Function → **Settings** → **Custom Domains**
2. **Add Domain**: `api-dev.yourdomain.com`
3. Appwrite akan kasih CNAME record
4. Edit DNS provider (Namecheap, Cloudflare, dll):
   - Add CNAME: `api-dev` → `function-xxxxx.appwrite.io`
   - Wait untuk DNS propagate (~5-30 mins)

5. Verify di Appwrite UI

### 4.2 Frontend Custom Domain

Jika pakai Vercel:
1. Vercel project → **Settings** → **Domains**
2. Add domain: `app-dev.yourdomain.com`
3. Vercel kasih CNAME records
4. Edit DNS provider, add CNAME

---

## ✅ Part 5: Verification

### 5.1 Test Backend Health

```bash
curl https://api-dev.yourdomain.com/api/health
# Expected response:
# {"ok":true,"service":"snapdl-api","timestamp":"2026-04-02T..."}
```

### 5.2 Test Frontend Load

Buka di browser: `https://app-dev.yourdomain.com`

Harus muncul aplikasi SnapDL.

### 5.3 Test Split Deploy Integration

Di frontend, buka DevTools → Network:

1. Go to `/finance/single`
2. Enter symbol `AAPL`
3. Click fetch
4. Check Network tab:
   - Request should go to `https://api-dev.yourdomain.com/api/fetch-history`
   - Status harus 200
   - CORS headers harus ada

### 5.4 Automated Verification (Optional)

```bash
$env:API_BASE_URL='https://api-dev.yourdomain.com'
$env:FRONTEND_ORIGIN='https://app-dev.yourdomain.com'
npm --prefix frontend run verify:split
```

Expected output:
```
PASS health: status=200 ok=true
PASS allowed-origin-post: status=200 access-control-allow-origin=...
PASS preflight-options: status=204
PASS blocked-origin: status=403
---
Verification passed.
```

---

## 🚀 Part 6: Production Deployment

Ulangi semua steps untuk project `snapdl-prod`:

1. **Create project** `snapdl-prod` di Appwrite
2. **Deploy backend** dengan env:
   - `CORS_ALLOWED_ORIGINS=https://app.yourdomain.com` (production frontend)
3. **Deploy frontend** dengan env:
   - `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com` (production backend)
4. **Setup custom domains** (production):
   - Backend: `api.yourdomain.com`
   - Frontend: `app.yourdomain.com`
5. **Verify** seperti part 5

---

## 🔒 Security Checklist

- [ ] CORS_ALLOWED_ORIGINS hanya frontend domain
- [ ] API_RATE_LIMIT_ENABLED=true di production
- [ ] NODE_ENV=production
- [ ] .env tidak di-commit ke GitHub
- [ ] Health endpoint accessible (untuk monitoring)
- [ ] Backend health check sebelum frontend requests

---

## 🐛 Troubleshooting

### Backend Deploy Failed

**Error**: "npm run build failed"

**Solution**:
1. Periksa build command di local dulu:
   ```bash
   cd backend
   npm run build
   ```
2. Fix any errors lokal
3. Push ke GitHub, Appwrite rebuild otomatis

### Frontend Cannot Connect to Backend

**Error**: "CORS error" atau "Cannot reach API"

**Solution**:
1. Check CORS_ALLOWED_ORIGINS di backend env
2. Verify frontend URL same as CORS_ALLOWED_ORIGINS
3. Test health endpoint dengan curl:
   ```bash
   curl -H "Origin: https://app-dev.yourdomain.com" https://api-dev.yourdomain.com/api/health
   ```

### Domain Not Working

**Error**: "Cannot resolve domain" atau "CNAME not found"

**Solution**:
1. Check DNS propagation: [https://dnschecker.org/](https://dnschecker.org/)
2. Wait 15-30 minutes untuk DNS spread
3. Clear browser cache atau test incognito mode
4. Verify CNAME record di DNS provider

### Rate Limit Too Aggressive

**Error**: "429 Too Many Requests" saat testing

**Solution**:
```bash
# Increase limit di backend env:
API_RATE_LIMIT_MAX=500
# Or disable for dev:
API_RATE_LIMIT_ENABLED=false
```

---

## 📊 Monitoring & Logging

### Appwrite Dashboard

1. Function → **Execution logs**
   - Real-time logs dari backend
   - Errors dan performance metrics

2. Function → **Statistics**
   - Request count
   - Success/Failure rate
   - Response time

### Vercel Dashboard (jika pakai Vercel)

1. Project → **Analytics**
   - Frontend performance
   - Build times
   - Deployment history

---

## 💾 Backup & Rollback

### GitHub Integration

Appwrite auto-deploy dari GitHub `main` branch:

1. **Push update**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. Appwrite automatic re-deploy dalam 1-2 menit

### Manual Rollback

Jika ada issue:

1. Revert commit di GitHub:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. Appwrite rebuild otomatis dengan commit lama

---

## 🎓 Best Practices

1. **Separate Dev & Prod**: Jangan modify production env
2. **Test di Dev Dulu**: Deploy ke dev, verifikasi, baru ke prod
3. **Monitor Health**: Check backend health endpoint regularly
4. **Scale Gradually**: Start dengan 1-2 projects, expand kalau perlu
5. **Use GitHub CI/CD**: Push → auto-deploy, tidak perlu manual upload
6. **Document Env Vars**: Keep `.env.example` di root untuk reference
7. **Rate Limiting**: Calibrate sesuai expected traffic

---

## 📞 Support & Resources

- Appwrite Docs: [https://appwrite.io/docs](https://appwrite.io/docs)
- Appwrite Discord: [https://discord.gg/appwrite](https://discord.gg/appwrite)
- SnapDL Issues: Check GitHub repo issues

---

**Summary**: Deploy take ~30 mins (backend 10 mins + frontend 10 mins + domain setup 10 mins)

Ready? Let's deploy! 🚀
