# 🎯 V3 Upgrade Implementation Summary

## ✅ Completed Backend Changes

### 1. Updated Types (`lib/types.ts`) ✅
- Added `alignmentMode` to `EventWindowConfig`
- Extended `EventWindowResult` with:
  - `eventTradingDate` - The aligned trading date
  - `windowSize` - Total trading days in window
  - `warning` - Warning message for incomplete windows
- Added `OutstandingSharesData` interface

### 2. Updated Utils (`lib/utils.ts`) ✅
- **CRITICAL**: Rewrote `validateEventWindow()` to use trading days
  - Now requires `tradingDates: string[]` parameter
  - Supports 3 alignment modes:
    - `nearest_trading_day` - Find closest trading day
    - `previous_trading_day` - Use previous trading day
    - `next_trading_day` - Use next trading day
  - Calculates window using array indices, not calendar math
  - Returns `eventTradingDate`, `windowSize`, and `warning`

### 3. New API Routes ✅

#### `/api/fetch-outstanding-shares` ✅
- Fetches outstanding shares from Yahoo quoteSummary
- Returns `{ symbol, outstandingShares, source }`
- Gracefully returns null if not available

#### Updated `/api/bulk-fetch-history` ✅
- Now fetches outstanding shares for each symbol
- Returns `outstandingShares` in success items
- Fixed TypeScript errors with explicit types

#### `/api/bulk-export-xlsx` ✅ (NEW)
- Exports Excel file with multiple sheets:
  - `_SUMMARY` - Symbol, rows count, outstanding shares, corporate actions count
  - `_CORPORATE_ACTIONS` - All corporate actions from all symbols
  - Individual sheets per symbol (sanitized names)
- Uses ExcelJS library
- Styled headers (bold, colored)
- Sorted data per sheet
- Outstanding shares as note at bottom of each sheet

### 4. Installed Dependencies ✅
- `exceljs` - For Excel file generation

---

## 🔧 Frontend Changes Required

### Key State Additions Needed

```typescript
// Event Window - Trading Day Based
const [alignmentMode, setAlignmentMode] = useState<'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day'>('nearest_trading_day');

// Outstanding Shares
const [outstandingShares, setOutstandingShares] = useState<number | null>(null);
const [bulkOutstandingShares, setBulkOutstandingShares] = useState<Record<string, number | null>>({});
```

### Event Window Validation Update

**OLD (Calendar-based):**
```typescript
const eventWindowResult = eventDate && windowPre >= 0 && windowPost >= 0
  ? validateEventWindow({ eventDate, windowPre, windowPost }, currentCorporateActions)
  : null;
```

**NEW (Trading-day based):**
```typescript
// Get trading dates from current data
const tradingDates = mode === 'single' 
  ? data.map(row => row.date)
  : bulkData.map(row => row.date).filter((v, i, a) => a.indexOf(v) === i).sort();

const eventWindowResult = eventDate && windowPre >= 0 && windowPost >= 0 && tradingDates.length > 0
  ? validateEventWindow(
      { eventDate, windowPre, windowPost, alignmentMode }, 
      currentCorporateActions,
      tradingDates
    )
  : null;
```

### Bulk Download Change

**OLD (CSV):**
```typescript
const response = await fetch('/api/bulk-export-csv', { ... });
const blob = await response.blob();
const filename = `BULK_${startDate}_${endDate}_${interval}_${sortOrder}.csv`;
```

**NEW (Excel):**
```typescript
const response = await fetch('/api/bulk-export-xlsx', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bulkData: bulkSuccessData, // Array of { symbol, rows, corporateActions, outstandingShares }
    selectedColumns,
    sortOrder,
    includeHeaders,
    startDate,
    endDate,
    interval,
  }),
});

const blob = await response.blob();
const filename = `BULK_${startDate}_${endDate}_${interval}_${sortOrder}.xlsx`;
```

### Outstanding Shares Display

**Single Mode - Summary Cards:**
```tsx
{outstandingShares && (
  <div className="rounded-lg bg-purple-50 p-3">
    <div className="text-xs text-purple-600">Outstanding Shares</div>
    <div className="text-lg font-bold text-purple-900">
      {outstandingShares.toLocaleString()}
    </div>
  </div>
)}
```

**Bulk Mode - Already in Excel _SUMMARY sheet**

### Event Window Card UI Updates

```tsx
<Card className="rounded-2xl border-slate-200 shadow-sm">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      Event Window Validation (Trading Days)
    </CardTitle>
    <CardDescription>
      Validasi berdasarkan hari trading aktual, bukan kalender
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Event Date */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">Tanggal Event</label>
      <Input
        type="date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
      />
    </div>

    {/* Window Size */}
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">t- (hari trading)</label>
        <Input
          type="number"
          min="0"
          max="60"
          value={windowPre}
          onChange={(e) => setWindowPre(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">t+ (hari trading)</label>
        <Input
          type="number"
          min="0"
          max="60"
          value={windowPost}
          onChange={(e) => setWindowPost(parseInt(e.target.value) || 0)}
        />
      </div>
    </div>

    {/* Alignment Mode */}
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">Alignment Mode</label>
      <select
        value={alignmentMode}
        onChange={(e) => setAlignmentMode(e.target.value as any)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="nearest_trading_day">Trading day terdekat</option>
        <option value="previous_trading_day">Trading day sebelumnya</option>
        <option value="next_trading_day">Trading day berikutnya</option>
      </select>
    </div>

    {/* Results */}
    {eventWindowResult && (
      <>
        <Separator />
        
        {/* Aligned Event Date */}
        {eventWindowResult.eventTradingDate !== eventDate && (
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="text-xs text-blue-600">Event Date Aligned</div>
            <div className="text-sm font-medium text-blue-900">
              {eventDate} → {eventWindowResult.eventTradingDate}
            </div>
          </div>
        )}

        {/* Window Info */}
        <div className="rounded-lg border p-3">
          <div className="text-xs text-slate-500 mb-1">Event Window (Trading Days)</div>
          <div className="text-sm font-medium">
            {eventWindowResult.windowStart} s/d {eventWindowResult.windowEnd}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {eventWindowResult.windowSize} trading days
          </div>
        </div>

        {/* Warning */}
        {eventWindowResult.warning && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-700">{eventWindowResult.warning}</div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="text-sm font-medium text-slate-700">Status Validasi</div>
          <Badge 
            variant={eventWindowResult.status === 'AMAN' ? 'default' : 'destructive'}
            className="gap-1"
          >
            {eventWindowResult.status === 'AMAN' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {eventWindowResult.status}
          </Badge>
        </div>

        {/* Actions in Window */}
        {eventWindowResult.actionsInWindow.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">
              Corporate Actions dalam Event Window:
            </div>
            {eventWindowResult.actionsInWindow.map((action, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <Badge variant="destructive" className="text-xs">
                  {action.type}
                </Badge>
                <div>
                  <div className="text-sm font-medium text-red-900">{action.date}</div>
                  <div className="text-xs text-red-700">{action.value}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
            <p className="mt-2 text-sm font-medium text-green-900">
              Tidak ada corporate action dalam event window
            </p>
            <p className="text-xs text-green-700">
              Data cocok untuk analisis event study
            </p>
          </div>
        )}
      </>
    )}
  </CardContent>
</Card>
```

---

## 📋 Testing Checklist

### Event Window (Trading Days)
- [ ] Event date on weekend → aligns to nearest trading day
- [ ] t-5 and t+5 use actual trading dates from data
- [ ] Window start and end are real dates in preview table
- [ ] Warning shows when window incomplete (insufficient data)
- [ ] Status changes based on corporate actions in trading-day window

### Outstanding Shares
- [ ] Displays in single mode summary (if available)
- [ ] Shows in Excel _SUMMARY sheet (bulk mode)
- [ ] Gracefully shows "N/A" when not available
- [ ] No crashes when data missing

### Bulk Excel Export
- [ ] Generates .xlsx file (not .csv)
- [ ] _SUMMARY sheet shows all symbols with stats
- [ ] _CORPORATE_ACTIONS sheet shows all events
- [ ] Individual sheets per symbol with correct data
- [ ] Outstanding shares note at bottom of each sheet
- [ ] Sorting works correctly in each sheet

---

## 🎯 Key Differences from V2

| Feature | V2 | V3 |
|---------|----|----|
| Event Window Calculation | Calendar days | **Trading days** |
| Event Date Alignment | None | **3 modes** (nearest/previous/next) |
| Window Validation | Simple date range | **Index-based with warnings** |
| Bulk Export Format | CSV (combined) | **Excel (separate sheets)** |
| Outstanding Shares | Not available | **Fetched and displayed** |
| Excel Sheets | N/A | **_SUMMARY + _CORPORATE_ACTIONS + per-symbol** |

---

## 🚨 Critical Implementation Notes

1. **Trading Dates Array**: Must be extracted from actual data rows
   ```typescript
   const tradingDates = data.map(row => row.date).sort();
   ```

2. **Event Window Validation**: Always pass trading dates
   ```typescript
   validateEventWindow(config, corporateActions, tradingDates)
   ```

3. **Bulk Data Structure**: Must include outstandingShares
   ```typescript
   bulkSuccessData = result.success.map(item => ({
     symbol: item.symbol,
     rows: item.rows,
     corporateActions: item.corporateActions,
     outstandingShares: item.outstandingShares
   }))
   ```

4. **Excel Export**: Use `/api/bulk-export-xlsx` not `/api/bulk-export-csv`

5. **File Extension**: Change from `.csv` to `.xlsx`

---

## 📦 Dependencies Added

```json
{
  "exceljs": "^4.x.x"
}
```

---

## 🎨 UI/UX Improvements

1. **Event Window Card**:
   - Added alignment mode dropdown
   - Shows aligned event date if different
   - Displays window size in trading days
   - Warning badge for incomplete windows

2. **Outstanding Shares**:
   - Purple summary card in single mode
   - Included in Excel _SUMMARY sheet

3. **Download Card (Bulk)**:
   - Changed file type indicator to `.xlsx`
   - Updated button text

---

## ✅ Status

**Backend**: ✅ Complete
- Types updated
- Utils rewritten for trading days
- API routes created/updated
- ExcelJS integrated

**Frontend**: ⚠️ Requires integration
- Need to update page.tsx with new state and logic
- Event window card UI needs update
- Bulk download needs to call Excel endpoint
- Outstanding shares display needs to be added

---

**Next Step**: Update `app/page.tsx` with the changes outlined above.
