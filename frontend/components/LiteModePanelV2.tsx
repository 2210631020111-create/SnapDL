'use client';

import { useMemo, useState, type RefObject } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Database, Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { COLUMNS } from '@/lib/constants';
import type { ColumnKey, HistoricalRow, BulkHistoricalRow, TickerResult } from '@/lib/types';
import { parseSymbolList, describeFetchError } from '@/lib/utils';

type ExportFormat = 'csv' | 'json' | 'xlsx';
type LiteFetchResult = { success: boolean; error?: string };

interface LiteModePanelV2Props {
  symbol: string;
  bulkSymbolsInput: string;
  setBulkSymbolsInput: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  eventDate: string;
  setEventDate: (value: string) => void;
  windowPre: number;
  setWindowPre: (value: number) => void;
  windowPost: number;
  setWindowPost: (value: number) => void;
  alignmentMode: 'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day';
  setAlignmentMode: (value: 'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day') => void;
  data: HistoricalRow[];
  bulkRows: BulkHistoricalRow[];
  bulkSuccessCount: number;
  loading: boolean;
  onFetchSingle: () => Promise<LiteFetchResult>;
  onFetchBulk: () => Promise<LiteFetchResult>;
  selectedColumns: ColumnKey[];
  onColumnToggle: (key: ColumnKey) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  onDownload: (options?: { format?: ExportFormat; targetMode?: 'single' | 'bulk' }) => void;
  tickerQuery: string;
  tickerResults: TickerResult[];
  tickerLoading: boolean;
  showTickerDropdown: boolean;
  setShowTickerDropdown: (value: boolean) => void;
  onTickerQueryChange: (value: string) => void;
  onTickerSelect: (symbol: string) => void;
  tickerDropdownRef: RefObject<HTMLDivElement>;
  bulkTickerQuery: string;
  bulkTickerResults: TickerResult[];
  bulkTickerLoading: boolean;
  showBulkTickerDropdown: boolean;
  setShowBulkTickerDropdown: (value: boolean) => void;
  onBulkTickerQueryChange: (value: string) => void;
  onBulkTickerSelect: (symbol: string) => void;
  bulkTickerDropdownRef: RefObject<HTMLDivElement>;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'xlsx', label: 'XLSX' },
];

const DROPDOWN_STYLES = [
  'absolute z-50 mt-1.5 w-full rounded-xl border border-border/80',
  'bg-popover text-popover-foreground shadow-[0_16px_40px_rgba(15,23,42,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]',
  'overflow-hidden animate-scale-in',
].join(' ');

const STEP_MAX = 5;

export function LiteModePanelV2({
  symbol,
  bulkSymbolsInput,
  setBulkSymbolsInput,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  eventDate,
  setEventDate,
  windowPre,
  setWindowPre,
  windowPost,
  setWindowPost,
  alignmentMode,
  setAlignmentMode,
  data,
  bulkRows,
  bulkSuccessCount,
  loading,
  onFetchSingle,
  onFetchBulk,
  selectedColumns,
  onColumnToggle,
  sortOrder,
  setSortOrder,
  onDownload,
  tickerQuery,
  tickerResults,
  tickerLoading,
  showTickerDropdown,
  setShowTickerDropdown,
  onTickerQueryChange,
  onTickerSelect,
  tickerDropdownRef,
  bulkTickerQuery,
  bulkTickerResults,
  bulkTickerLoading,
  showBulkTickerDropdown,
  setShowBulkTickerDropdown,
  onBulkTickerQueryChange,
  onBulkTickerSelect,
  bulkTickerDropdownRef,
}: LiteModePanelV2Props) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [includeEventWindow, setIncludeEventWindow] = useState(false);
  const [liteExportFormat, setLiteExportFormat] = useState<ExportFormat>('csv');
  const [errorDetail, setErrorDetail] = useState<{ message: string; category: string; suggestion: string } | null>(null);

  const parsedSymbols = useMemo(() => parseSymbolList(bulkSymbolsInput), [bulkSymbolsInput]);
  const hasData = mode === 'single' ? data.length > 0 : bulkRows.length > 0;
  const sampleRows: (HistoricalRow | BulkHistoricalRow)[] = mode === 'single'
    ? data.slice(0, 3)
    : bulkRows.slice(0, 3);
  const totalRows = mode === 'single' ? data.length : bulkRows.length;
  const stepProgress = (step / STEP_MAX) * 100;

  const isStepValid = (value: number) => {
    switch (value) {
      case 1:
        return true;
      case 2:
        return mode === 'single' ? Boolean(symbol.trim()) : parsedSymbols.length > 0;
      case 3:
        if (!startDate || !endDate) return false;
        if (new Date(startDate).getTime() > new Date(endDate).getTime()) return false;
        return true;
      case 4:
        if (!includeEventWindow) return true;
        return Boolean(eventDate && !Number.isNaN(new Date(eventDate).getTime()));
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleStepNext = () => {
    if (step < STEP_MAX && isStepValid(step)) setStep((prev) => prev + 1);
  };

  const handleStepPrev = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleLiteFetch = async () => {
    setErrorDetail(null);
    const result = mode === 'single' ? await onFetchSingle() : await onFetchBulk();
    if (!result.success) {
      const described = describeFetchError(result.error ?? '');
      setErrorDetail({
        message: result.error ?? 'Gagal fetch data',
        category: described.category,
        suggestion: described.suggestion,
      });
    }
  };

  const summaryRows = [
    { label: 'Mode', value: mode === 'single' ? 'Single Company' : 'Multiple Companies' },
    {
      label: 'Ticker',
      value: mode === 'single'
        ? symbol || 'Belum diisi'
        : `${parsedSymbols.length} ticker${parsedSymbols.length === 0 ? '' : ` (${parsedSymbols.slice(0, 3).join(', ')}${parsedSymbols.length > 3 ? ', ...' : ''})`}`,
    },
    { label: 'Rentang tanggal', value: startDate && endDate ? `${startDate} → ${endDate}` : 'Belum lengkap' },
    {
      label: 'Event window',
      value: includeEventWindow
        ? `${eventDate || '—'} • t−${windowPre} / t+${windowPost} (${alignmentMode.replace('_', ' ')})`
        : 'Tidak diaktifkan',
    },
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-base font-bold text-foreground">Pilih jenis query</p>
              <p className="text-sm text-muted-foreground">Single untuk satu simbol, bulk untuk banyak ticker dalam satu fetch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('single')}
                className={`relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
                  mode === 'single'
                    ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-lg ring-2 ring-blue-100 dark:ring-blue-950'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 dark:from-blue-900 to-blue-50 dark:to-blue-950 text-3xl">
                    📊
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-foreground">Single company</p>
                    <p className="text-sm text-muted-foreground">Fetch data untuk satu emiten.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('bulk')}
                className={`relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
                  mode === 'bulk'
                    ? 'border-purple-500 bg-white dark:bg-slate-900 shadow-lg ring-2 ring-purple-100 dark:ring-purple-950'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 dark:from-purple-900 to-purple-300 dark:to-purple-800 text-3xl text-white">
                    📈
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-foreground">Multiple companies</p>
                    <p className="text-sm text-muted-foreground">Proses banyak emiten sekaligus.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Masukkan ticker</p>
            {mode === 'single' ? (
              <div className="space-y-3">
                <p className="micro-label">Cari dan pilih ticker</p>
                <div className="relative" ref={tickerDropdownRef}>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari emiten (contoh: AAPL, BBCA)"
                    value={tickerQuery}
                    onChange={(e) => onTickerQueryChange(e.target.value)}
                    onFocus={() => { if (tickerResults.length > 0) setShowTickerDropdown(true); }}
                    className="pl-10 h-11 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus-visible:ring-primary/40"
                    autoComplete="off"
                  />
                  {tickerLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                  {showTickerDropdown && tickerResults.length > 0 && (
                    <div className={DROPDOWN_STYLES}>
                      <div className="max-h-52 overflow-y-auto py-1">
                        {tickerResults.map((item) => (
                          <button
                            key={item.symbol}
                            type="button"
                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent/60 transition-colors"
                            onMouseDown={(e) => { e.preventDefault(); onTickerSelect(item.symbol); setShowTickerDropdown(false); }}
                          >
                            <span className="font-mono text-sm font-semibold text-primary min-w-[60px]">{item.symbol}</span>
                            <span className="flex-1 truncate text-xs text-foreground/70">{item.name}</span>
                            <span className="text-[9px] font-semibold text-muted-foreground">{item.exchange}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Gunakan search autocomplete agar ticker terverifikasi sebelum lanjut ke langkah berikutnya.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="micro-label">Cari lalu tambahkan ke daftar</p>
                  <div className="relative" ref={bulkTickerDropdownRef}>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari ticker untuk menambah ke daftar"
                      value={bulkTickerQuery}
                      onChange={(e) => onBulkTickerQueryChange(e.target.value)}
                      onFocus={() => { if (bulkTickerResults.length > 0) setShowBulkTickerDropdown(true); }}
                      className="pl-10 h-11 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus-visible:ring-primary/40"
                      autoComplete="off"
                    />
                    {bulkTickerLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    )}
                    {showBulkTickerDropdown && bulkTickerResults.length > 0 && (
                      <div className={DROPDOWN_STYLES}>
                        <div className="max-h-48 overflow-y-auto py-1">
                          {bulkTickerResults.map((item) => (
                            <button
                              key={item.symbol}
                              type="button"
                              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent/60 transition-colors"
                              onMouseDown={(e) => { e.preventDefault(); onBulkTickerSelect(item.symbol); setShowBulkTickerDropdown(false); }}
                            >
                              <span className="font-mono text-sm font-semibold text-primary min-w-[60px]">{item.symbol}</span>
                              <span className="flex-1 truncate text-xs text-foreground/70">{item.name}</span>
                              <span className="text-[9px] font-semibold text-muted-foreground">{item.exchange}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Textarea
                  value={bulkSymbolsInput}
                  onChange={(e) => setBulkSymbolsInput(e.target.value)}
                  className="min-h-[120px] text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  placeholder="Satu ticker per baris\nBBCA.JK\nMSFT"
                />
                <p className="text-[11px] text-muted-foreground">{parsedSymbols.length} ticker siap diproses.</p>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Pilih periode data</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mulai</p>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Akhir</p>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Pastikan tanggal mulai tidak melewati tanggal akhir.</p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="toggle-event"
                checked={includeEventWindow}
                onChange={(e) => setIncludeEventWindow(e.target.checked)}
                className="h-4 w-4 rounded border border-border/60 accent-primary"
              />
              <label htmlFor="toggle-event" className="text-sm font-semibold text-foreground">Tambahkan Event Window?</label>
            </div>
            {includeEventWindow ? (
              <div className="space-y-3">
                <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="h-10 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" placeholder="Event date" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input type="number" min={0} value={windowPre} onChange={(e) => setWindowPre(Number(e.target.value))} className="h-10 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" placeholder="t−" />
                  <Input type="number" min={0} value={windowPost} onChange={(e) => setWindowPost(Number(e.target.value))} className="h-10 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" placeholder="t+" />
                </div>
                <select
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  value={alignmentMode}
                  onChange={(e) => setAlignmentMode(e.target.value as 'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day')}
                >
                  <option value="nearest_trading_day">Nearest trading day</option>
                  <option value="previous_trading_day">Previous trading day</option>
                  <option value="next_trading_day">Next trading day</option>
                </select>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground">Event window membantu mengerti aksi korporasi sekitar tanggal tertentu.</p>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Konfirmasi</p>
              {summaryRows.map((item) => (
                <div key={item.label} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-foreground/70">{item.label}</span>
                  <span className="font-semibold text-foreground sm:text-right">{item.value}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={handleLiteFetch}
              size="sm"
              className="w-full justify-center gap-2 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              {loading ? 'Fetching...' : 'Fetch Data'}
            </Button>
            {loading && (
              <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-primary/90">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Getting the data now...
              </div>
            )}
            {errorDetail && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                  <AlertTriangle className="h-4 w-4" />{errorDetail.category}
                </div>
                <p className="mt-1 text-[11px] text-destructive/80">{errorDetail.message}</p>
                <p className="mt-1 text-[12px] font-semibold text-destructive">{errorDetail.suggestion}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderPreview = () => {
    if (!hasData) return null;

    return (
      <Card className="panel-surface">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Preview data snapshot
            </CardTitle>
            <p className="text-xs text-muted-foreground">{totalRows.toLocaleString()} rows • {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-[10px]">{mode === 'single' ? 'Single' : 'Bulk'}</Badge>
            {mode === 'bulk' && bulkSuccessCount > 0 && (
              <Badge variant="outline" className="text-[9px]">
                {bulkSuccessCount} symbols
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Controls - compact and aligned */}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-foreground">Kolom data</p>
              <div className="flex flex-wrap gap-2">
                {COLUMNS.map((column) => (
                  <button
                    key={column.key}
                    onClick={() => onColumnToggle(column.key)}
                    className={`min-w-[88px] px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 text-left ${
                      selectedColumns.includes(column.key)
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-white/60 dark:bg-white/10 text-foreground border border-border/50 hover:bg-white'}
                    `}
                  >
                    {column.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-foreground">Urutan</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      sortOrder === 'asc'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-white/60 dark:bg-white/10 text-foreground border border-border/50 hover:bg-white'}
                    `}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      sortOrder === 'desc'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-white/60 dark:bg-white/10 text-foreground border border-border/50 hover:bg-white'}
                    `}
                  >
                    Newest
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-foreground">Format</p>
                <div className="flex gap-2">
                  {FORMAT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLiteExportFormat(option.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        liteExportFormat === option.value
                          ? 'bg-primary dark:bg-primary text-primary-foreground shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-foreground dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10 dark:bg-white/5" />

          {/* Download Button */}
          <button
            onClick={() => onDownload({ format: liteExportFormat, targetMode: mode })}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary dark:from-primary/80 dark:to-secondary/80 dark:hover:from-primary dark:hover:to-secondary text-white font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            📥 Download {liteExportFormat.toUpperCase()}
          </button>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0">
                <tr>
                  {mode === 'bulk' && (
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 uppercase tracking-wider">Symbol</th>
                  )}
                  {selectedColumns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left font-bold text-foreground/80 uppercase tracking-wider">
                      {COLUMNS.find((c) => c.key === col)?.label ?? col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, idx) => {
                  const isBulk = mode === 'bulk';
                  const bulkRow = row as BulkHistoricalRow;
                  const singleRow = row as HistoricalRow;
                  return (
                    <tr key={idx} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      {isBulk && (
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{bulkRow.symbol}</td>
                      )}
                      {selectedColumns.map((col) => {
                        const raw = isBulk ? bulkRow[col as ColumnKey] : singleRow[col as ColumnKey];
                        const display = col === 'volume'
                          ? raw != null ? Number(raw).toLocaleString() : '—'
                          : col === 'date'
                            ? raw
                            : raw != null ? Number(raw).toFixed(2) : '—';
                        return (
                          <td key={col} className="px-4 py-3 text-xs text-foreground/80">{display}</td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const previewCard = renderPreview();

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="relative space-y-5">
  {/* Hero form card */}
  <div className="rounded-3xl border border-white/70 dark:border-purple-500/30 bg-white dark:bg-slate-950/40 dark:backdrop-blur-md shadow-[0_30px_70px_rgba(15,23,42,0.14)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.45)] px-5 py-6 sm:px-8 sm:py-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-foreground">Lite Mode</h2>
              <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Step {step}/{STEP_MAX}
              </span>
            </div>

            <div className="h-[3px] rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
                style={{ width: `${stepProgress}%` }}
              />
            </div>

            <div className="space-y-4">
              {renderStepContent()}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40 gap-2">
              <Button
                size="sm"
                onClick={handleStepPrev}
                disabled={step === 1}
                variant="outline"
                className="flex-1 gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {step < STEP_MAX ? (
                <Button
                  size="sm"
                  onClick={handleStepNext}
                  disabled={!isStepValid(step)}
                  className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" disabled className="flex-1 gap-2 variant='outline'">
                  Done <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Preview follows same width to stay aligned */}
        {previewCard && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5">
            {previewCard}
          </div>
        )}
      </div>
    </div>
  );
}
