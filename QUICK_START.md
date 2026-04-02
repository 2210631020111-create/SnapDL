# 🚀 Yahoo Finance Historical Downloader V3 - Quick Start Guide

## ⚡ Quick Start (5 Minutes)

### 1. Start the Application

```bash
cd "c:\Users\lenov\Documents\scraper baru yahoo"
npm run dev
```

**Server will start at:** http://localhost:3000

---

## 📖 Basic Usage

### Single Symbol Mode

1. **Open** http://localhost:3000
2. **Paste Yahoo URL** (optional) or enter symbol manually
3. **Set date range** (Start Date → End Date)
4. **Select interval** (Daily/Weekly/Monthly)
5. **Click "Fetch Preview"**
6. **Review data** in preview table
7. **Download CSV**

**Example:**
```
Symbol: AAPL
Start: 2024-01-01
End: 2024-12-31
Interval: Daily
```

---

### Bulk Symbol Mode

1. **Click "Bulk Symbols" tab**
2. **Enter symbols** (one per line or comma-separated):
   ```
   AAPL
   MSFT
   GOOGL
   ```
3. **Set date range** (same for all symbols)
4. **Click "Bulk Fetch"**
5. **Review summary** (Success/Failed count)
6. **Download Excel** (separate sheets per company)

**Excel File Structure:**
```
BULK_2024-01-01_2024-12-31_1d_desc.xlsx
├── _SUMMARY (overview of all symbols)
├── _CORPORATE_ACTIONS (all dividends/splits)
├── AAPL (individual data)
├── MSFT (individual data)
└── GOOGL (individual data)
```

---

## 🎯 Event Window Validation (V3 Feature)

### Purpose
Validate if corporate actions (dividends/splits) fall within your event study window.

### Steps

1. **Fetch data first** (Single or Bulk mode)
2. **Scroll to "Event Window Validation" card**
3. **Enter event date** (e.g., earnings announcement date)
4. **Set window size:**
   - t- (pre-event): 5 trading days
   - t+ (post-event): 5 trading days
5. **Choose alignment mode:**
   - **Nearest**: Closest trading day (recommended)
   - **Previous**: Last trading day before event
   - **Next**: First trading day after event
6. **Review results:**
   - ✅ **AMAN** = No corporate actions in window (safe for analysis)
   - ❌ **TIDAK COCOK** = Corporate actions detected (contaminated)

### Example

**Input:**
```
Event Date: 2024-03-16 (Saturday)
t-: 5
t+: 5
Alignment: Nearest
```

**Output:**
```
Event Date Aligned: 2024-03-16 → 2024-03-15 (Friday)
Window: 2024-03-08 s/d 2024-03-22
Window Size: 11 trading days
Status: AMAN ✅
```

---

## 📊 Column Selection

### Presets

- **Minimal**: Date, Close, Volume
- **Standard**: Date, Open, High, Low, Close, Volume
- **Full**: Date, Open, High, Low, Close, Adj Close, Volume

### Custom Selection

Check/uncheck individual columns. Date is always required.

---

## 💾 Export Options

### Single Mode
- **Format**: CSV
- **Filename**: `{symbol}_{startDate}_{endDate}_{interval}_{sortOrder}.csv`
- **Includes**: Selected columns only

### Bulk Mode
- **Format**: Excel (.xlsx)
- **Filename**: `BULK_{startDate}_{endDate}_{interval}_{sortOrder}.xlsx`
- **Includes**:
  - _SUMMARY sheet (symbol, rows, outstanding shares, corporate actions)
  - _CORPORATE_ACTIONS sheet (all events)
  - Individual sheets per symbol
  - Outstanding shares note per sheet

---

## 🎓 Research Use Cases

### Event Study

**Goal:** Analyze stock price reaction to earnings announcement

**Steps:**
1. Bulk fetch all companies in sample
2. Enter earnings date as event date
3. Set window: t-5, t+5
4. Check status for each symbol
5. Exclude TIDAK COCOK symbols
6. Download Excel with clean data
7. Analyze in Excel/R/Python

**Time Saved:** 90% vs manual approach

---

### Panel Data Analysis

**Goal:** Compare multiple companies over time

**Steps:**
1. Bulk fetch all companies
2. Same date range for all
3. Download Excel
4. Each company in separate sheet
5. Use Excel pivot tables or import to R/Python
6. Outstanding shares available for normalization

**Benefits:**
- Professional format
- Ready for analysis
- All metadata included

---

## 🔧 Troubleshooting

### Common Issues

**Q: "Gagal fetch data" error**
- Check symbol format (e.g., AAPL, ^KLSE, BBCA.JK)
- Verify date range is valid
- Ensure internet connection

**Q: Outstanding shares showing "N/A"**
- Normal for some symbols
- Data not available from Yahoo Finance
- Doesn't affect other features

**Q: Excel file won't open**
- Ensure Excel 2007+ or compatible software
- Check file downloaded completely

**Q: Event window shows "incomplete"**
- Extend date range to include more trading days
- Or reduce window size (t- and t+)

---

## 📚 Documentation

### Full Documentation
- **README.md**: Complete feature documentation
- **V3_IMPLEMENTATION_GUIDE.md**: Technical details
- **V3_COMPLETE_SUMMARY.md**: Implementation summary
- **EXAMPLES.md**: Real-world examples

### Quick Reference
- **Single Mode**: URL → Symbol → Dates → Fetch → Download CSV
- **Bulk Mode**: Symbols → Dates → Bulk Fetch → Download Excel
- **Event Window**: Fetch → Event Date → Window Size → Validate

---

## 🎯 Best Practices

### Symbol Input
- Use official Yahoo Finance symbols
- Malaysian stocks: Add `.KL` (e.g., `1155.KL`)
- Indonesian stocks: Add `.JK` (e.g., `BBCA.JK`)
- Indices: Use `^` prefix (e.g., `^KLSE`)

### Date Range
- Minimum: 1 day
- Maximum: No limit (but longer = slower)
- Recommended: 1 year for daily data

### Bulk Fetching
- Recommended: 10-20 symbols per batch
- Maximum: 50 symbols (performance)
- Very large: Split into multiple batches

### Event Window
- Standard window: t-5, t+5 (11 trading days)
- Short-term: t-1, t+1 (3 trading days)
- Long-term: t-30, t+30 (61 trading days)

---

## 🎉 Tips & Tricks

### Keyboard Shortcuts
- **Tab**: Navigate between fields
- **Enter**: Submit forms (where applicable)
- **Ctrl+A**: Select all in textarea

### Bulk Symbol Input
- One symbol per line (recommended)
- Or comma-separated: `AAPL, MSFT, GOOGL`
- Duplicates automatically removed
- Case-insensitive (converted to uppercase)

### Excel Tips
- Open _SUMMARY sheet first for overview
- Use filters on corporate actions
- Compare companies side-by-side
- Export individual sheets as CSV if needed

### Event Window
- Use "Nearest" alignment for most cases
- Use "Previous" if event after market close
- Use "Next" if event before market open
- Check warning messages for data issues

---

## 📞 Need Help?

### Documentation
1. Check **README.md** for detailed feature docs
2. Read **V3_IMPLEMENTATION_GUIDE.md** for technical details
3. See **EXAMPLES.md** for real-world use cases

### Common Questions
- **How to format symbols?** → See "Symbol Input" above
- **How to use event window?** → See "Event Window Validation" above
- **How to export Excel?** → Switch to Bulk mode and download

---

## ✅ Checklist for First Use

- [ ] Server running (`npm run dev`)
- [ ] Browser open (http://localhost:3000)
- [ ] Understand Single vs Bulk mode
- [ ] Know how to enter symbols
- [ ] Know how to set date range
- [ ] Know how to fetch data
- [ ] Know how to download (CSV or Excel)
- [ ] Understand event window validation (optional)

---

**Version**: 3.0.0  
**Status**: Production Ready  
**Server**: http://localhost:3000  

**Happy Analyzing! 📊**
