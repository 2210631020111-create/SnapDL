# 🚀 V2 Quick Reference Guide

## New Features Quick Start

### 🎯 Event Window Validation

**What it does**: Checks if corporate actions (dividends/splits) fall within your event study window.

**When to use**: Before running event study analysis to ensure data quality.

**Quick Steps**:
1. Fetch your data first (single or bulk mode)
2. Scroll to "Event Window Validation" card
3. Enter:
   - **Event Date**: Your event date (e.g., earnings announcement)
   - **t- (pre-event)**: Days before event (e.g., 5)
   - **t+ (post-event)**: Days after event (e.g., 5)
4. Check status:
   - ✅ **AMAN** = No corporate actions in window → Safe to use
   - ⚠️ **TIDAK COCOK** = Corporate actions detected → Exclude or adjust

**Example**:
```
Event: Earnings announcement on 2024-03-15
Window: t-5 to t+5 (11 days total)
Range: 2024-03-10 to 2024-03-20

If dividend on 2024-03-12 → Status: TIDAK COCOK
If no corporate actions → Status: AMAN
```

---

### 📦 Bulk Download

**What it does**: Download multiple stock symbols in one go, combined into a single CSV.

**When to use**: When you need data for multiple companies with the same date range.

**Quick Steps**:
1. Click **"Bulk Symbols"** tab in header
2. Enter symbols in textarea (one per line or comma-separated):
   ```
   AAPL
   MSFT
   GOOGL
   ```
3. Set date range and interval (same for all symbols)
4. Select output columns
5. Click **"Bulk Fetch"**
6. Review summary: "✓ Sukses: 3, ✗ Gagal: 0"
7. Click **"Download CSV (3 symbols)"**

**Output CSV format**:
```csv
Symbol,Date,Open,High,Low,Close,Volume
AAPL,2024-01-02,185.0,186.5,184.0,185.5,50000000
AAPL,2024-01-03,185.5,187.0,185.0,186.2,48000000
MSFT,2024-01-02,370.0,372.0,369.0,371.5,25000000
MSFT,2024-01-03,371.5,373.0,370.5,372.0,24000000
```

---

## Mode Comparison

| Feature | Single Symbol | Bulk Symbols |
|---------|---------------|--------------|
| Input method | URL paste or manual | Textarea list |
| Symbols per fetch | 1 | Unlimited (recommended: 10-20) |
| CSV output | One symbol | Combined with Symbol column |
| Fetch time | ~200ms | ~2-3s for 10 symbols |
| Use case | Deep dive one stock | Compare multiple stocks |

---

## Common Workflows

### Workflow 1: Single Stock Event Study
```
1. Single Symbol mode
2. Paste Yahoo URL or enter symbol
3. Set date range (e.g., ±30 days from event)
4. Fetch Preview
5. Event Window: Set event date and window size
6. Check status → If AMAN, proceed
7. Download CSV
8. Analyze in R/Python
```

### Workflow 2: Multi-Stock Comparison
```
1. Bulk Symbols mode
2. Enter list of symbols
3. Set same date range for all
4. Bulk Fetch
5. Review success/failed summary
6. Filter by symbol to preview individual stocks
7. Download combined CSV
8. Panel data analysis
```

### Workflow 3: Event Study with Multiple Stocks
```
1. Bulk Symbols mode
2. Enter symbols (e.g., all tech stocks)
3. Set date range around event
4. Bulk Fetch
5. Event Window: Validate for all symbols
6. If AMAN → Download
7. If TIDAK COCOK → Review which symbols have issues
8. Exclude problematic symbols or adjust methodology
```

---

## Event Window Best Practices

### Standard Window Sizes

| Study Type | Window Pre (t-) | Window Post (t+) | Total Days |
|------------|-----------------|------------------|------------|
| Short-term | 5 | 5 | 11 |
| Medium-term | 10 | 10 | 21 |
| Long-term | 30 | 30 | 61 |

### Interpretation Guide

**Status: AMAN ✅**
- No dividends or splits in window
- Data is clean for abnormal return calculation
- Safe to include in event study sample

**Status: TIDAK COCOK ⚠️**
- Corporate action(s) detected in window
- May contaminate abnormal return calculation
- Options:
  1. Exclude from sample
  2. Use adjusted close prices
  3. Adjust event window to avoid action
  4. Document as limitation

### Corporate Actions Impact

**Dividend:**
- Causes price drop on ex-dividend date
- Affects raw returns
- Solution: Use adjusted close prices

**Stock Split:**
- Changes price level
- Affects return calculation
- Solution: Use adjusted close prices or split-adjusted data

---

## Bulk Download Tips

### Symbol Input Formats

**Newline separated** (recommended):
```
AAPL
MSFT
GOOGL
```

**Comma separated**:
```
AAPL, MSFT, GOOGL
```

**Mixed** (also works):
```
AAPL, MSFT
GOOGL
META, AMZN
```

### Symbol Format Examples

| Market | Format | Example |
|--------|--------|---------|
| US Stocks | TICKER | AAPL, MSFT |
| US Indices | ^TICKER | ^GSPC, ^DJI |
| Indonesia | TICKER.JK | BBCA.JK, TLKM.JK |
| Malaysia | TICKER.KL | MAYBANK.KL |
| Crypto | TICKER-USD | BTC-USD, ETH-USD |

### Error Handling

**If some symbols fail:**
1. Check failed symbols list in summary
2. Verify symbol format
3. Check if symbol exists on Yahoo Finance
4. Download successful symbols anyway
5. Retry failed symbols individually in Single mode

---

## Keyboard Shortcuts & Tips

### Quick Actions
- **Tab** between mode switcher
- **Enter** in symbol input → Auto-focus to dates
- **Ctrl+A** in textarea → Select all symbols
- **Ctrl+V** → Paste symbol list from Excel/CSV

### Time Savers
- Use presets (Minimal/Standard/Full) for quick column selection
- Copy-paste symbol list directly from Excel
- Use symbol filter to quickly check individual stocks in bulk mode
- Set default window size (t-5, t+5) for consistent event studies

---

## Data Quality Checklist

Before downloading, verify:

- [ ] Date range is correct
- [ ] Interval matches your analysis needs (daily/weekly/monthly)
- [ ] All required columns are selected
- [ ] Sort order is appropriate (usually newest first for time series)
- [ ] Event window validated (if doing event study)
- [ ] No failed symbols in bulk mode (or acceptable failures)
- [ ] Headers included (for Excel/R/Python compatibility)

---

## Troubleshooting

### Event Window

**Q: Status shows TIDAK COCOK but I don't see any actions**
A: Check if actions are outside the displayed range. Scroll through all corporate actions or adjust date range.

**Q: Can I use Event Window without fetching data?**
A: No, you need to fetch data first to get corporate actions.

**Q: What if event window spans beyond my data range?**
A: Extend your date range to cover the full event window.

### Bulk Download

**Q: Some symbols failed to fetch**
A: Normal. Check:
- Symbol format (e.g., ^KLSE for index, .JK for Indonesia)
- Symbol exists on Yahoo Finance
- Network connection
- Download successful symbols anyway

**Q: Bulk fetch is slow**
A: Expected for many symbols. Typical times:
- 5 symbols: 1-2s
- 10 symbols: 2-3s
- 20 symbols: 4-6s

**Q: Can I fetch 100 symbols at once?**
A: Technically yes, but recommended to batch in groups of 10-20 for better performance and error handling.

---

## Export Tips

### For Excel
- ✅ Include headers
- ✅ Use comma separator (default)
- ✅ Date format: YYYY-MM-DD (Excel-friendly)

### For R/Python
- ✅ Include headers
- ✅ Symbol column (bulk mode) for grouping
- ✅ Consistent date format for parsing

### For Panel Data Analysis
- ✅ Use bulk mode
- ✅ Sort by date (primary) then symbol
- ✅ Include all necessary columns
- ✅ Symbol column for cross-sectional identifier

---

## Research Applications

### Event Study
```r
# R example
data <- read.csv("BULK_2024-01-01_2024-12-31_1d_desc.csv")
library(dplyr)

# Filter by event window
event_data <- data %>%
  filter(Date >= "2024-03-10" & Date <= "2024-03-20")

# Calculate abnormal returns by symbol
# ... your analysis code
```

### Panel Data Regression
```python
# Python example
import pandas as pd

df = pd.read_csv("BULK_2024-01-01_2024-12-31_1d_desc.csv")
df['Date'] = pd.to_datetime(df['Date'])

# Set multi-index for panel data
df = df.set_index(['Symbol', 'Date'])

# Run panel regression
# ... your analysis code
```

---

## Version Differences

### V1 → V2 Migration

**What's the same:**
- All V1 features work in Single Symbol mode
- URL parsing
- Column selection
- Preview and download
- Corporate actions detection

**What's new:**
- Mode switcher (Single/Bulk)
- Bulk download with Symbol column
- Event Window validation
- Symbol filter in preview
- Success/failed summary

**Breaking changes:**
- None! V1 workflows still work in Single mode

---

## Support & Resources

### Documentation
- `README.md` - Full feature documentation
- `PROJECT_SUMMARY.md` - Technical implementation details
- `EXAMPLES.md` - Usage examples (V1)

### Common Issues
- Symbol not found → Check format and Yahoo Finance availability
- Event window shows wrong status → Verify event date and window size
- Bulk fetch partial failure → Normal, download successful symbols

### Best Practices
- Start with Single mode to understand features
- Use Event Window for all event studies
- Batch bulk downloads in groups of 10-20
- Always validate data quality before analysis
- Document your event window settings in research

---

**Quick Reference Version**: 2.0.0  
**Last Updated**: 2026-01-16

**Need help?** Check README.md for detailed documentation.
