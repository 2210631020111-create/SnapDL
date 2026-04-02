# 🧪 Quick Testing Guide

## ✅ All Fixes Applied - Ready for Testing

**Server**: http://localhost:3000  
**Status**: ✅ Running  

---

## 🎯 What to Test

### 1. Single Mode - Symbol Display ✅

**Test Steps**:
1. Open http://localhost:3000
2. Enter symbol: `AAPL` (or `3816.KL`)
3. Dates: 2024-01-01 to 2024-12-31
4. Click "Fetch Preview"

**Expected Results**:
- ✅ Corporate Actions card title: "Corporate Actions • AAPL"
- ✅ Each corporate action shows: `[AAPL]` badge
- ✅ Event Window card title: "Event Window Validation (Trading Days) • AAPL"
- ✅ Summary cards: 4 cards total (including Outstanding Shares)
- ✅ Outstanding Shares card: Purple, shows "15,204.9M" format
- ✅ Console log: "Outstanding shares result: {...}"

---

### 2. Bulk Mode - Symbol Display ✅

**Test Steps**:
1. Click "Bulk Symbols" tab
2. Enter:
   ```
   AAPL
   MSFT
   GOOGL
   ```
3. Dates: 2024-01-01 to 2024-12-31
4. Click "Bulk Fetch"

**Expected Results**:
- ✅ Corporate Actions card title: "Corporate Actions • 3 symbols"
- ✅ Each corporate action shows symbol badge (e.g., `[AAPL]`, `[MSFT]`)
- ✅ Event Window card title: "Event Window Validation (Trading Days) • Bulk"
- ✅ Outstanding Shares table appears
- ✅ Table shows all 3 symbols with shares
- ✅ Numbers formatted: "15,204,880,000" (with commas)
- ✅ Shows "N/A" if not available

---

### 3. Excel Export - Bulk Mode ✅

**Test Steps**:
1. After bulk fetch (step 2 above)
2. Click "Download Excel (3 symbols)"
3. Open the .xlsx file

**Expected Results**:

**_SUMMARY Sheet**:
```
Symbol | Rows | Outstanding Shares | Corporate Actions | Status
AAPL   | 252  | 15,204,880,000    | 4                 | Success
MSFT   | 252  | 7,432,649,984     | 2                 | Success
GOOGL  | 252  | 5,856,000,000     | 1                 | Success
```

**_CORPORATE_ACTIONS Sheet**:
```
Symbol | Date       | Type     | Value
AAPL   | 2024-02-09 | DIVIDEND | 0.2400
MSFT   | 2024-02-15 | DIVIDEND | 0.7500
...
```

**Individual Sheets** (e.g., AAPL):
- Data rows with OHLCV
- Bottom note: "Outstanding Shares: 15,204,880,000"

---

## 🔍 Debug Checklist

### If Outstanding Shares Not Showing

**Check 1: Console Log**
- Open browser console (F12)
- Look for: `Outstanding shares result: {...}`
- Should show: `{ symbol: "AAPL", outstandingShares: 15204880000, source: "..." }`

**Check 2: Network Tab**
- Open Network tab (F12)
- Look for: `/api/fetch-outstanding-shares` request
- Status should be: 200 OK
- Response should have `outstandingShares` value

**Check 3: Symbol Has Data**
- Some symbols don't have outstanding shares on Yahoo Finance
- Try these guaranteed symbols:
  - AAPL ✅
  - MSFT ✅
  - GOOGL ✅
  - AMZN ✅
  - META ✅

**Check 4: Grid Layout**
- Summary cards should be 4 columns when outstanding shares exists
- Should be 3 columns when not available

---

## 📊 Visual Checklist

### Single Mode UI

```
┌─────────────────────────────────────────────┐
│ Corporate Actions • AAPL                    │ ← Symbol badge here
├─────────────────────────────────────────────┤
│ [AAPL] DIVIDEND | 2024-02-09 | 0.2400      │ ← Symbol badge here
│ [AAPL] SPLIT | 2024-08-01 | 4:1            │ ← Symbol badge here
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Event Window Validation • AAPL              │ ← Symbol badge here
├─────────────────────────────────────────────┤
│ [AAPL] DIVIDEND | 2024-02-09 | 0.2400      │ ← Symbol in window
└─────────────────────────────────────────────┘

Summary Cards:
┌─────────┬─────────┬─────────┬─────────────┐
│ Total   │ Date    │ Missing │ Outstanding │ ← 4th card
│ 252     │ 2024... │ 0       │ 15,204.9M   │
└─────────┴─────────┴─────────┴─────────────┘
```

### Bulk Mode UI

```
┌─────────────────────────────────────────────┐
│ Corporate Actions • 3 symbols               │ ← Symbol count
├─────────────────────────────────────────────┤
│ [AAPL] DIVIDEND | 2024-02-09 | 0.2400      │ ← Symbol badge
│ [MSFT] DIVIDEND | 2024-02-15 | 0.7500      │ ← Symbol badge
└─────────────────────────────────────────────┘

Outstanding Shares Table:
┌────────┬──────────────────┐
│ Symbol │ Shares           │ ← New table
├────────┼──────────────────┤
│ AAPL   │ 15,204,880,000   │
│ MSFT   │ 7,432,649,984    │
│ GOOGL  │ 5,856,000,000    │
└────────┴──────────────────┘
```

---

## ✅ Quick Verification

**All These Should Be TRUE**:

### Single Mode
- [ ] Corporate Actions card shows symbol in title
- [ ] Each corporate action shows symbol badge
- [ ] Event Window card shows symbol in title
- [ ] Summary cards show 4 cards (if outstanding shares available)
- [ ] Outstanding Shares card is purple
- [ ] Outstanding Shares shows value in millions (e.g., "15,204.9M")

### Bulk Mode
- [ ] Corporate Actions card shows "X symbols" in title
- [ ] Each corporate action shows symbol badge
- [ ] Event Window card shows "Bulk" in title
- [ ] Outstanding Shares table appears
- [ ] Table shows all symbols
- [ ] Numbers formatted with commas

### Excel Export
- [ ] _SUMMARY sheet has "Outstanding Shares" column
- [ ] _CORPORATE_ACTIONS sheet has "Symbol" column
- [ ] Individual sheets have outstanding shares note at bottom

---

## 🎯 Test Symbols

**Recommended for Testing**:

1. **AAPL** - Apple (US)
   - Has outstanding shares ✅
   - Has corporate actions ✅
   - Good for single mode test

2. **3816.KL** - Malaysian stock
   - May have outstanding shares
   - Good for international symbol test

3. **MSFT, GOOGL, AMZN** - Tech stocks
   - All have outstanding shares ✅
   - Good for bulk mode test

**Avoid**:
- Indices (^KLSE, ^GSPC) - No outstanding shares
- Delisted companies - May have no data

---

## 🚀 Ready to Test!

**Server**: http://localhost:3000  
**Status**: ✅ All fixes applied  
**Compilation**: ✅ No errors  

**Silakan test sekarang!** 🎉
