# SnapDL - Yahoo Finance Historical Data Downloader

Download historical stock data from Yahoo Finance with ease. Supports single and bulk downloads with professional Excel export.

## 🚀 Key Features

- **Single Symbol Download** - Fetch and analyze individual stocks
- **Bulk Download** - Download multiple symbols at once
- **Excel Export** - Professional Excel files with separate sheets per company
- **Event Window Analysis** - Trading-day based event windows for research
- **Outstanding Shares** - Automatic share count data
- **Corporate Actions** - Track dividends and splits automatically

## 🛠 Quick Start (Local Development)

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev -- --port 3001
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
# Set API URL (optional, uses http://localhost:3001 by default)
npm run dev -- --port 3000
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Technology Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, ExcelJS, TypeScript
- **Deployment**: Docker-ready, supports Appwrite, Vercel, self-hosted

## 🌐 Live Architecture

- `frontend/` - UI application
- `backend/` - API services
- **Deployment**: Split-ready (separate frontend/backend URLs)

## 📖 Documentation

| Topic | Link |
|-------|------|
| Appwrite Deployment | `APPWRITE_DEPLOYMENT_GUIDE.md` |
| Setup & Features | See `frontend/` and `backend/` README files |
| API Routes | Check `backend/app/api/` folder |
| Security | CORS + rate limiting included |

## ⚡ Key Capabilities

| Feature | Support |
|---------|---------|
| CSV/Excel Export | ✅ Excel (multi-sheet) |
| Date Ranges | ✅ Custom start/end dates |
| Intervals | ✅ 1d, 1wk, 1mo |
| Data Columns | ✅ Open, High, Low, Close, Volume, Adjusted |
| Batch Operations | ✅ Up to 50 symbols |

## 🔒 Security

- CORS whitelist enforcement
- Rate limiting (120 requests/minute default)
- Security headers on all responses
- Health check endpoint included

## 📝 License

Private project

### Download Card

**Bulk Mode:**
- Shows Excel filename
- Lists Excel features:
  - ✓ Separate sheets
  - ✓ Summary sheet
  - ✓ Corporate actions sheet
- Button shows symbol count

---

## 🐛 Troubleshooting

### Event Window

**Q: Event date not aligning correctly**
A: Check alignment mode. Try "Nearest" for most cases.

**Q: Window shows warning "incomplete"**
A: Your data doesn't have enough trading days. Extend date range or reduce window size.

**Q: Status shows TIDAK COCOK but I don't see actions**
A: Actions might be at the edge of window. Check _CORPORATE_ACTIONS sheet in Excel.

### Excel Export

**Q: Excel file won't open**
A: Ensure you have Excel 2007+ or compatible software (LibreOffice, Google Sheets).

**Q: Sheet names look weird**
A: Special characters in symbols are replaced with underscores (Excel limitation).

**Q: Outstanding shares showing N/A**
A: Data not available from Yahoo Finance for this symbol. This is normal for some symbols.

---

## 📊 Performance

| Operation | V2 | V3 | Improvement |
|-----------|----|----|-------------|
| Single fetch | ~200ms | ~200ms | Same |
| Bulk 10 symbols | ~2-3s | ~2-3s | Same |
| Event window calc | Instant | Instant | Same |
| CSV export | ~100ms | N/A | - |
| Excel export | N/A | ~500ms | New |

**Note:** Excel export is slightly slower than CSV but provides much more value.

---

## ✅ Acceptance Criteria

### Trading-Day Event Window ✅
- [x] Uses actual trading dates from data
- [x] t-5 and t+5 are trading days, not calendar
- [x] Window start/end guaranteed to exist in data
- [x] Alignment modes work correctly
- [x] Warnings for incomplete windows
- [x] Status based on trading-day window

### Excel Export ✅
- [x] Generates .xlsx file
- [x] _SUMMARY sheet with stats
- [x] _CORPORATE_ACTIONS sheet
- [x] Separate sheet per symbol
- [x] Styled headers
- [x] Outstanding shares included
- [x] Sorted data per sheet

### Outstanding Shares ✅
- [x] Fetched from Yahoo Finance
- [x] Displayed in single mode
- [x] Included in Excel summary
- [x] Graceful handling when missing
- [x] No errors or crashes

---

## 🎓 Academic Citation

When using V3 for research:

```
Data retrieved using Yahoo Finance Historical Downloader V3
Event window validation: Trading-day based, [alignment mode]
Event date: [date], Window: t-[pre] to t+[post] trading days
Corporate actions: Validated within event window
Outstanding shares: Retrieved from Yahoo Finance quoteSummary
```

---

## 🚀 Migration from V2

**No Breaking Changes!**

V2 features still work:
- Single mode: Same as before
- URL parsing: Same
- Column selection: Same
- Preview: Same
- CSV export (single): Same

**New in V3:**
- Event window now trading-day based (automatic)
- Bulk export now Excel instead of CSV
- Outstanding shares added
- Alignment modes added

**To Use V3 Features:**
1. Fetch data as usual
2. Use event window with alignment mode
3. Download Excel for bulk (instead of CSV)

---

## 📚 Resources

- **V3 Implementation Guide**: `V3_IMPLEMENTATION_GUIDE.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Project Summary**: `PROJECT_SUMMARY.md`
- **Examples**: `EXAMPLES.md`

---

**Version**: 3.0.0  
**Release Date**: 2026-01-16  
**Status**: ✅ Production Ready

**Built with ❤️ for researchers and analysts**

Next.js 16 • TypeScript • TailwindCSS • shadcn/ui • ExcelJS
