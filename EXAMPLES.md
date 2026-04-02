# Quick Start Examples

## Example 1: Download Apple Stock (AAPL) Daily Data

1. **Get the URL**:
   - Go to: https://finance.yahoo.com/quote/AAPL/history/
   - Copy the URL from your browser

2. **In the App**:
   - Paste URL in "Paste Yahoo History URL" field
   - Click "Parse URL"
   - Verify symbol shows "AAPL"
   - Adjust dates if needed

3. **Select Columns**:
   - Click "Standard" preset (Date, Open, High, Low, Close, Volume)

4. **Preview**:
   - Click "Fetch Preview"
   - Review the data

5. **Download**:
   - Click "Download CSV"

---

## Example 2: Download Malaysian Stock Index (^KLSE) Weekly Data

1. **Manual Entry**:
   - Symbol: `^KLSE`
   - Start Date: `2024-01-01`
   - End Date: `2024-12-31`
   - Interval: Click "Weekly"

2. **Select Columns**:
   - Click "Full" preset (includes Adj Close)

3. **Sort Order**:
   - Select "Terlama → Terbaru" (Oldest first)

4. **Preview & Download**:
   - Click "Fetch Preview"
   - Click "Download CSV"

---

## Example 3: Check Dividends for Microsoft (MSFT)

1. **Setup**:
   - Symbol: `MSFT`
   - Start Date: `2023-01-01`
   - End Date: `2023-12-31`
   - Interval: Daily

2. **Fetch Data**:
   - Click "Fetch Preview"

3. **Check Corporate Actions**:
   - Scroll to "Corporate Actions" card
   - View all dividends and splits in the date range
   - Each event shows:
     - Date
     - Type (DIVIDEND or SPLIT)
     - Value

4. **Download**:
   - Select desired columns
   - Download CSV with price data

---

## Example 4: Custom Export with Minimal Columns

1. **Setup**:
   - Symbol: `GOOGL`
   - Date range: Last 3 months
   - Interval: Daily

2. **Column Selection**:
   - Click "Minimal" preset (Date, Close, Volume)
   - Or manually select only:
     - ✅ Date (required)
     - ✅ Close
     - ✅ Volume

3. **Custom Filename**:
   - Enter: `google_q4_2024.csv`

4. **Download**:
   - Toggle "Include Headers" ON
   - Click "Download CSV"

---

## Example 5: Monthly Data for Long-Term Analysis

1. **Setup**:
   - Symbol: `SPY` (S&P 500 ETF)
   - Start Date: `2020-01-01`
   - End Date: `2024-12-31`
   - Interval: Click "Monthly"

2. **Sort Order**:
   - Select "Terlama → Terbaru" (for chronological order)

3. **Columns**:
   - Click "Full" preset

4. **Preview**:
   - Click "Fetch Preview"
   - Use search to find specific months
   - Navigate through pages

5. **Download**:
   - Click "Download CSV"
   - File will be: `SPY_2020-01-01_2024-12-31_1mo_asc.csv`

---

## Pro Tips

### 🎯 URL Parsing
- Always use the history page URL, not the quote page
- URL format: `https://finance.yahoo.com/quote/{SYMBOL}/history/`
- The parser will extract period1 and period2 if present

### 📅 Date Selection
- Start date must be before end date
- Yahoo Finance has data going back many years
- Some symbols have limited historical data

### 🔄 Intervals
- **Daily (1d)**: Best for short-term analysis (days to months)
- **Weekly (1wk)**: Good for medium-term (months to years)
- **Monthly (1mo)**: Best for long-term trends (years to decades)

### 📊 Column Selection
- **Minimal**: Quick analysis, smaller file size
- **Standard**: Most common use case
- **Full**: Includes Adj Close for dividend-adjusted analysis

### 🔍 Search & Filter
- Search works across all columns
- Type date, price, or volume to filter
- Case-insensitive search

### 💾 Export Tips
- Include headers for Excel/Google Sheets compatibility
- Use descriptive filenames for organization
- Sort order affects both preview and export

### 🏢 Corporate Actions
- Dividends show the amount per share
- Splits show the ratio (e.g., "2:1" means 2-for-1 split)
- Events are sorted by date (newest first)
- Empty state means no events in date range

---

## Common Symbols

### US Stocks
- `AAPL` - Apple
- `MSFT` - Microsoft
- `GOOGL` - Google (Alphabet)
- `AMZN` - Amazon
- `TSLA` - Tesla
- `META` - Meta (Facebook)

### Indices
- `^GSPC` - S&P 500
- `^DJI` - Dow Jones
- `^IXIC` - NASDAQ
- `^KLSE` - Malaysia KLSE

### ETFs
- `SPY` - S&P 500 ETF
- `QQQ` - NASDAQ-100 ETF
- `VOO` - Vanguard S&P 500 ETF

### Crypto (via Yahoo Finance)
- `BTC-USD` - Bitcoin
- `ETH-USD` - Ethereum

---

## Troubleshooting

### "Invalid Yahoo Finance history URL"
- Make sure you're on the `/history/` page
- URL should contain `finance.yahoo.com/quote/`

### "Failed to fetch data"
- Check if symbol is valid on Yahoo Finance
- Verify date range is reasonable
- Some symbols may have limited data

### "No data to export"
- Click "Fetch Preview" first
- Ensure date range has trading days
- Check if symbol exists

### Empty Corporate Actions
- Not all stocks pay dividends
- No splits occurred in the date range
- This is normal for many stocks
