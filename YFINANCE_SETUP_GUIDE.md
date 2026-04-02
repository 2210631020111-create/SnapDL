# Outstanding Shares dengan yfinance - Setup Guide

## 🎯 Kenapa Pakai yfinance?

Yahoo Finance API sekarang memerlukan **cookie dan crumb authentication** yang kompleks. Library `yfinance` (Python) sudah handle semua ini secara otomatis, sehingga lebih **reliable dan stabil**.

## 📋 Arsitektur

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Next.js App   │─────▶│  Python Service  │─────▶│ Yahoo Finance   │
│  (Frontend)     │      │   (yfinance)     │      │   (API)         │
└─────────────────┘      └──────────────────┘      └─────────────────┘
   localhost:3000          localhost:5000
```

## 🚀 Setup Instructions

### 1. Install Python

Pastikan Python 3.8+ sudah terinstall:

```bash
python --version
```

Jika belum ada, download dari: https://www.python.org/downloads/

### 2. Install Python Dependencies

```bash
cd python-service
pip install -r requirements.txt
```

Dependencies yang akan diinstall:
- `flask` - Web framework
- `flask-cors` - CORS support untuk Next.js
- `yfinance` - Yahoo Finance data library

### 3. Run Python Service

**Terminal 1** - Python Service:
```bash
cd python-service
python main.py
```

Output:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### 4. Run Next.js App

**Terminal 2** - Next.js:
```bash
npm run dev
```

Output:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

## ✅ Verify Setup

### Test Python Service

```bash
# Health check
curl http://localhost:5000/health

# Test single symbol
curl -X POST http://localhost:5000/api/outstanding-shares \
  -H "Content-Type: application/json" \
  -d "{\"symbol\": \"AAPL\"}"
```

Expected response:
```json
{
  "symbol": "AAPL",
  "outstandingShares": 15204100000,
  "source": "yfinance"
}
```

### Test Next.js Integration

1. Buka browser: http://localhost:3000
2. **Single Mode**:
   - Masukkan symbol: `AAPL`
   - Set tanggal range
   - Klik "Fetch Preview"
   - Lihat **Outstanding Shares Card** di panel kiri
   - Data harus muncul dengan angka yang benar

3. **Bulk Mode**:
   - Switch ke "Bulk Symbols"
   - Masukkan: `AAPL`, `MSFT`, `GOOGL`
   - Klik "Bulk Fetch"
   - Lihat tabel Outstanding Shares di panel kiri

## 🔧 Configuration

### Environment Variables

File: `.env.local`
```bash
PYTHON_SERVICE_URL=http://localhost:5000
```

Jika Python service berjalan di port lain, update URL-nya.

### Change Python Service Port

Edit `python-service/.env`:
```bash
PORT=5001
```

Lalu update `.env.local`:
```bash
PYTHON_SERVICE_URL=http://localhost:5001
```

## 🐛 Troubleshooting

### Python service tidak bisa diakses

**Problem**: Next.js tidak bisa connect ke Python service

**Solution**:
1. Pastikan Python service running di terminal
2. Check port 5000 tidak dipakai aplikasi lain
3. Verify dengan: `curl http://localhost:5000/health`

### yfinance error: "No data found"

**Problem**: Symbol tidak ditemukan

**Solution**:
- Pastikan symbol benar (contoh: `AAPL`, `MSFT`, `3816.KL`)
- Check internet connection
- Beberapa symbol mungkin tidak punya data outstanding shares

### CORS error di browser

**Problem**: Browser block request ke Python service

**Solution**:
- Pastikan `flask-cors` sudah terinstall
- Check Python service logs untuk error
- Restart Python service

### Outstanding Shares tidak muncul

**Problem**: Card kosong atau N/A

**Solution**:
1. Check Python service logs untuk error
2. Test manual dengan curl (lihat section Verify Setup)
3. Beberapa symbol memang tidak punya data outstanding shares

## 📊 Supported Symbols

yfinance mendukung berbagai exchange:

- **US**: `AAPL`, `MSFT`, `GOOGL`, `TSLA`
- **Malaysia**: `3816.KL`, `1155.KL`
- **Indonesia**: `BBCA.JK`, `TLKM.JK`
- **Index**: `^KLSE`, `^JKSE`, `^GSPC`

## 🎓 How It Works

1. **User** klik "Fetch Preview" di Next.js app
2. **Next.js API** (`/api/fetch-outstanding-shares`) call Python service
3. **Python service** menggunakan `yfinance.Ticker(symbol).info`
4. **yfinance** fetch data dari Yahoo Finance (handle auth otomatis)
5. **Python service** return data ke Next.js
6. **Next.js** tampilkan di Outstanding Shares Card

## 📝 Notes

- Python service harus **selalu running** saat menggunakan aplikasi
- Data di-cache oleh yfinance untuk performa
- Jika symbol tidak ada outstanding shares, akan return `null` (bukan error)
- Python service bisa di-deploy terpisah untuk production

## 🚀 Production Deployment

Untuk production, deploy Python service terpisah:

1. Deploy Python service ke Heroku/Railway/Render
2. Get production URL (contoh: `https://your-service.herokuapp.com`)
3. Update `.env.local`:
   ```bash
   PYTHON_SERVICE_URL=https://your-service.herokuapp.com
   ```

## 📚 References

- yfinance documentation: https://pypi.org/project/yfinance/
- Flask documentation: https://flask.palletsprojects.com/
- Yahoo Finance: https://finance.yahoo.com/
