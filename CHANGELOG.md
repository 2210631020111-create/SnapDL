# 📝 Changelog

All notable changes to Yahoo Finance Historical Downloader are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-01-16

### 🎉 Major Release: V3

This is a major release with significant new features focused on research-grade data validation and professional Excel export.

### ✨ Added

#### Trading-Day Event Window Validation
- **Trading-day based calculation** instead of calendar days
- **Event date alignment** with 3 modes:
  - Nearest trading day (default)
  - Previous trading day
  - Next trading day
- **Aligned event date display** when different from input
- **Window size indicator** in trading days
- **Incomplete window warning** when data insufficient
- **Real-time validation** against corporate actions
- **Status badges**: AMAN (safe) or TIDAK COCOK (contaminated)
- **Corporate actions in window** display with details

#### Excel Export with Separate Sheets
- **Excel (.xlsx) format** for bulk downloads
- **_SUMMARY sheet** with:
  - Symbol
  - Row count
  - Outstanding shares
  - Corporate actions count
  - Status
- **_CORPORATE_ACTIONS sheet** with all events from all symbols
- **Individual sheets per symbol** with:
  - OHLCV data (selected columns)
  - Sorted by date
  - Outstanding shares note at bottom
- **Styled headers** (bold, colored background)
- **Sanitized sheet names** (Excel-compatible)

#### Outstanding Shares
- **API endpoint** `/api/fetch-outstanding-shares`
- **Single mode display** in purple summary card
- **Bulk mode integration** in Excel _SUMMARY sheet
- **Per-sheet notes** in individual company sheets
- **Graceful N/A handling** when data unavailable
- **No crashes** on missing data

### 🔧 Changed

#### Event Window Validation
- **BREAKING**: `validateEventWindow()` now requires `tradingDates: string[]` parameter
- **Enhanced**: Event window config now includes `alignmentMode` field
- **Enhanced**: Event window result includes:
  - `eventTradingDate` (aligned date)
  - `windowSize` (trading days count)
  - `warning` (optional warning message)

#### Bulk Export
- **BREAKING**: Bulk export now generates Excel (.xlsx) instead of CSV
- **Enhanced**: Filename now ends with `.xlsx` instead of `.csv`
- **Enhanced**: Bulk data structure includes `outstandingShares` field

#### Types
- **Added**: `alignmentMode` to `EventWindowConfig`
- **Added**: `eventTradingDate`, `windowSize`, `warning` to `EventWindowResult`
- **Added**: `OutstandingSharesData` interface
- **Added**: `outstandingShares` to `BulkFetchSuccessItem`

### 📚 Documentation

- **Added**: `V3_COMPLETE_SUMMARY.md` - Complete V3 implementation summary
- **Added**: `QUICK_START.md` - 5-minute quick start guide
- **Updated**: `README.md` - Full V3 feature documentation
- **Updated**: `V3_IMPLEMENTATION_GUIDE.md` - Technical implementation details
- **Updated**: `PROJECT_SUMMARY.md` - Project overview

### 🎯 Acceptance Criteria

All V3 acceptance criteria met:
- ✅ Trading-day event window validation
- ✅ Excel export with separate sheets
- ✅ Outstanding shares fetching and display
- ✅ Backward compatibility with V1/V2
- ✅ Clean modern UI
- ✅ Professional documentation

---

## [2.0.0] - 2026-01-16

### 🎉 Major Release: V2

### ✨ Added

#### Bulk Download
- **Bulk mode** for downloading multiple symbols
- **Textarea input** for symbol list (newline/comma separated)
- **Symbol counter** showing detected symbols
- **Parallel fetching** using `Promise.allSettled`
- **Partial success handling** (some succeed, some fail)
- **Success/Failed summary** display
- **Failed symbols list** with error messages
- **Symbol filter dropdown** in preview
- **Combined CSV export** with Symbol column
- **Proper sorting**: Date (primary) → Symbol (secondary)

#### Event Window Validation (Calendar-based)
- **Event date input** for event study analysis
- **Window pre/post inputs** (t- and t+)
- **Window range calculation** (calendar days)
- **Status validation**: AMAN or TIDAK COCOK
- **Corporate actions in window** display
- **Client-side validation** using utility function

#### API Routes
- **Added**: `/api/bulk-fetch-history` - Fetch multiple symbols in parallel
- **Added**: `/api/bulk-export-csv` - Export combined CSV for bulk mode

### 🔧 Changed

#### UI/UX
- **Added**: Mode switcher tabs (Single Symbol / Bulk Symbols)
- **Enhanced**: Preview card with mode-aware fetch button
- **Enhanced**: Download card with mode-aware filename display
- **Enhanced**: Corporate actions card with limit display (10 max)

#### Types
- **Added**: `BulkHistoricalRow` (extends HistoricalRow with symbol)
- **Added**: `BulkFetchSuccessItem`
- **Added**: `BulkFetchFailedItem`
- **Added**: `BulkFetchResponse`
- **Added**: `EventWindowConfig`
- **Added**: `EventWindowResult`
- **Added**: `AppMode` type

#### Utils
- **Added**: `validateEventWindow()` - Event window validation logic (calendar-based)
- **Added**: `parseSymbolList()` - Parse symbols from textarea

### 📚 Documentation

- **Added**: `PROJECT_SUMMARY.md` - V2 upgrade summary
- **Updated**: `README.md` - V2 features documentation

---

## [1.0.0] - Initial Release

### ✨ Features

#### Single Symbol Download
- **Yahoo URL parsing** from history page
- **Manual symbol input** fallback
- **Date range selection** (start/end)
- **Interval selection** (Daily/Weekly/Monthly)
- **Sorting options** (Ascending/Descending)
- **Column selection** with presets:
  - Minimal (Date, Close, Volume)
  - Standard (Date, OHLC, Volume)
  - Full (Date, OHLC, Adj Close, Volume)
- **Interactive preview** with:
  - Sticky header
  - Zebra rows
  - Hover effects
  - Pagination (25 rows per page)
  - Search functionality
- **Summary cards**:
  - Total rows
  - Date range
  - Missing values
- **Corporate actions detection**:
  - Dividends
  - Stock splits
- **CSV export** with:
  - Selected columns
  - Custom sorting
  - Optional headers
  - Custom filename

#### UI/UX
- **Clean modern design** with TailwindCSS
- **Responsive layout** (desktop/mobile)
- **Card-based interface** with rounded corners and shadows
- **Toast notifications** for user feedback
- **Loading states** for async operations

#### API Routes
- **Added**: `/api/parse-url` - Parse Yahoo Finance URL
- **Added**: `/api/fetch-history` - Fetch OHLCV data + corporate actions
- **Added**: `/api/export-csv` - Export CSV file

#### Tech Stack
- **Framework**: Next.js 16 App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Notifications**: Sonner

### 📚 Documentation

- **Added**: `README.md` - Basic documentation
- **Added**: `.gitignore` - Git ignore rules
- **Added**: `package.json` - Dependencies and scripts

---

## Version Comparison

| Feature | V1 | V2 | V3 |
|---------|----|----|-----|
| Single Symbol Download | ✅ | ✅ | ✅ |
| URL Parsing | ✅ | ✅ | ✅ |
| Column Selection | ✅ | ✅ | ✅ |
| Preview Table | ✅ | ✅ Enhanced | ✅ Enhanced |
| Corporate Actions | ✅ | ✅ Enhanced | ✅ Enhanced |
| CSV Export | ✅ | ✅ | ✅ |
| **Bulk Download** | ❌ | ✅ CSV | ✅ **Excel** |
| **Event Window** | ❌ | ✅ Calendar | ✅ **Trading Days** |
| **Event Date Alignment** | ❌ | ❌ | ✅ **3 Modes** |
| **Outstanding Shares** | ❌ | ❌ | ✅ **NEW** |
| **Separate Sheets** | ❌ | ❌ | ✅ **NEW** |
| **Summary Sheet** | ❌ | ❌ | ✅ **NEW** |
| **Window Warnings** | ❌ | ❌ | ✅ **NEW** |

---

## Migration Guide

### From V2 to V3

**No Breaking Changes for Users!**

All V2 features continue to work. New V3 features are additions.

**What's Different:**
1. **Event Window**: Now uses trading days automatically (more accurate)
2. **Bulk Export**: Now generates Excel instead of CSV (more professional)
3. **Outstanding Shares**: Now displayed (when available)

**To Use V3 Features:**
1. Use event window as before (now more accurate with trading days)
2. Download Excel for bulk mode (instead of CSV)
3. See outstanding shares in summary cards and Excel

**Code Changes:**
- `validateEventWindow()` now requires `tradingDates` parameter
- Bulk export endpoint changed from `/api/bulk-export-csv` to `/api/bulk-export-xlsx`
- Bulk data structure includes `outstandingShares` field

### From V1 to V2

**No Breaking Changes for Users!**

All V1 features continue to work in single mode.

**What's New:**
1. **Bulk Mode**: Download multiple symbols at once
2. **Event Window**: Validate corporate actions in event study windows

**To Use V2 Features:**
1. Click "Bulk Symbols" tab for bulk downloads
2. Use Event Window card for validation

---

## Roadmap

### Potential V4 Features (Future)

- [ ] Event window batch validation (multiple events)
- [ ] Chart visualization of event windows
- [ ] Abnormal return calculator
- [ ] Market model regression
- [ ] Saved symbol lists/portfolios
- [ ] Historical event window results
- [ ] Export to other formats (JSON, Parquet)
- [ ] API authentication for rate limiting
- [ ] Database storage for historical queries
- [ ] Scheduled downloads

---

## Contributors

**Built with ❤️ for researchers, analysts, and finance professionals**

---

## License

This project is private and not licensed for public use.

---

**Latest Version**: 3.0.0  
**Release Date**: 2026-01-16  
**Status**: ✅ Production Ready
