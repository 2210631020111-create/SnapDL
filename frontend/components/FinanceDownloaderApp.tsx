'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';
import { InputPanel } from '@/components/InputPanel';
import { SettingsPanel } from '@/components/SettingsPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { BottomPanels } from '@/components/BottomPanels';
import { GuidePanel } from '@/components/GuidePanel';
import { LiteModePanelV2 } from '@/components/LiteModePanelV2';
import { COLUMNS } from '@/lib/constants';
import { apiFetch } from '@/lib/client/api';
import { validateEventWindow, parseSymbolList, cn } from '@/lib/utils';
import type {
  HistoricalRow, BulkHistoricalRow, CorporateAction,
  ColumnKey, AppMode, BulkFetchSuccessItem, BulkFetchFailedItem,
} from '@/lib/types';

interface TickerResult { symbol: string; name: string; exchange: string; type: string; }

type ExportFormat = 'csv' | 'json' | 'xlsx';
type FetchResult = { success: boolean; error?: string };
type DownloadOptions = { format?: ExportFormat; targetMode?: 'single' | 'bulk' };

function getPathForMode(mode: AppMode): string {
  switch (mode) {
    case 'single':
      return '/finance/single';
    case 'bulk':
      return '/finance/bulk';
    case 'lite':
      return '/finance/lite';
    case 'guide':
      return '/finance/panduan';
    default:
      return '/finance/single';
  }
}

function getModeFromPath(pathname: string): AppMode {
  const normalized = pathname.toLowerCase();
  if (normalized === '/finance/lite') return 'lite';
  if (normalized === '/finance/bulk' || normalized === '/financebulk') return 'bulk';
  if (normalized === '/finance/panduan') return 'guide';
  return 'single';
}

export default function FinanceDownloaderApp() {
  const pathname = usePathname();
  const router = useRouter();

  const [mode, setMode] = useState<AppMode>(() => getModeFromPath(pathname ?? '/'));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interval, setInterval] = useState('1d');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedColumns, setSelectedColumns] = useState<ColumnKey[]>(['date', 'open', 'high', 'low', 'close', 'volume']);
  const toggleColumn = (key: ColumnKey) => {
    setSelectedColumns((prev) => (prev.includes(key) ? prev.filter((column) => column !== key) : [...prev, key]));
  };
  const [loading, setLoading] = useState(false);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [yahooUrl, setYahooUrl] = useState('');
  const [symbol, setSymbol] = useState('');
  const [data, setData] = useState<HistoricalRow[]>([]);
  const [corporateActions, setCorporateActions] = useState<CorporateAction[]>([]);
  const [customFilename, setCustomFilename] = useState('');

  const [bulkSymbolsInput, setBulkSymbolsInput] = useState('');
  const [bulkData, setBulkData] = useState<BulkHistoricalRow[]>([]);
  const [bulkCorporateActions, setBulkCorporateActions] = useState<CorporateAction[]>([]);
  const [bulkSuccessCount, setBulkSuccessCount] = useState(0);
  const [bulkFailedCount, setBulkFailedCount] = useState(0);
  const [bulkFailedList, setBulkFailedList] = useState<BulkFetchFailedItem[]>([]);
  const [selectedSymbolFilter, setSelectedSymbolFilter] = useState<string>('all');
  const [bulkSuccessData, setBulkSuccessData] = useState<BulkFetchSuccessItem[]>([]);

  const [eventDate, setEventDate] = useState('');
  const [windowPre, setWindowPre] = useState(5);
  const [windowPost, setWindowPost] = useState(5);
  const [alignmentMode, setAlignmentMode] = useState<'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day'>('nearest_trading_day');

  const [tickerQuery, setTickerQuery] = useState('');
  const [tickerResults, setTickerResults] = useState<TickerResult[]>([]);
  const [tickerLoading, setTickerLoading] = useState(false);
  const [showTickerDropdown, setShowTickerDropdown] = useState(false);
  const tickerDropdownRef = useRef<HTMLDivElement>(null!);
  const tickerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bulkTickerQuery, setBulkTickerQuery] = useState('');
  const [bulkTickerResults, setBulkTickerResults] = useState<TickerResult[]>([]);
  const [bulkTickerLoading, setBulkTickerLoading] = useState(false);
  const [showBulkTickerDropdown, setShowBulkTickerDropdown] = useState(false);
  const bulkTickerDropdownRef = useRef<HTMLDivElement>(null!);
  const bulkTickerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bulkTickerSearchRequestRef = useRef(0);
  const modeSwitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isModeSwitching, setIsModeSwitching] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tickerDropdownRef.current && !tickerDropdownRef.current.contains(event.target as Node)) setShowTickerDropdown(false);
      if (bulkTickerDropdownRef.current && !bulkTickerDropdownRef.current.contains(event.target as Node)) setShowBulkTickerDropdown(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const nextMode = getModeFromPath(pathname ?? '/');
    setMode((prev) => (prev === nextMode ? prev : nextMode));
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (modeSwitchTimeoutRef.current) {
        clearTimeout(modeSwitchTimeoutRef.current);
      }
    };
  }, []);

  const handleModeChange = useCallback((nextMode: AppMode) => {
    setIsModeSwitching(true);
    if (modeSwitchTimeoutRef.current) clearTimeout(modeSwitchTimeoutRef.current);
    modeSwitchTimeoutRef.current = setTimeout(() => setIsModeSwitching(false), 240);

    setMode(nextMode);
    const nextPath = getPathForMode(nextMode);
    if ((pathname ?? '') !== nextPath) {
      router.push(nextPath);
    }
  }, [pathname, router]);

  useEffect(() => {
    setData([]);
    setBulkData([]);
    setCorporateActions([]);
    setBulkCorporateActions([]);
    setBulkSuccessCount(0);
    setBulkFailedCount(0);
    setBulkFailedList([]);
    setBulkSuccessData([]);
  }, [mode]);

  const [appStatus, setAppStatus] = useState<'ready' | 'fetching' | 'market_open'>('ready');
  useEffect(() => {
    if (loading) {
      setAppStatus('fetching');
      return;
    }

    const now = new Date();
    const hour = now.getUTCHours();
    const day = now.getUTCDay();
    if (day >= 1 && day <= 5 && hour >= 13 && hour <= 20) {
      setAppStatus('market_open');
    } else {
      setAppStatus('ready');
    }
  }, [loading]);

  const handleTickerQueryChange = useCallback((query: string) => {
    setTickerQuery(query);
    setSymbol(query);

    if (tickerDebounceRef.current) clearTimeout(tickerDebounceRef.current);
    if (query.trim().length < 1) {
      setTickerResults([]);
      setShowTickerDropdown(false);
      return;
    }

    tickerDebounceRef.current = setTimeout(async () => {
      setTickerLoading(true);
      try {
        const res = await apiFetch(`/api/ticker-search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setTickerResults(data.quotes || []);
        setShowTickerDropdown(true);
      } catch {
        setTickerResults([]);
      } finally {
        setTickerLoading(false);
      }
    }, 300);
  }, []);

  const handleBulkTickerQueryChange = useCallback((query: string) => {
    setBulkTickerQuery(query);
    bulkTickerSearchRequestRef.current += 1;
    const requestId = bulkTickerSearchRequestRef.current;

    if (bulkTickerDebounceRef.current) clearTimeout(bulkTickerDebounceRef.current);
    if (query.trim().length < 1) {
      setBulkTickerResults([]);
      setShowBulkTickerDropdown(false);
      setBulkTickerLoading(false);
      return;
    }

    bulkTickerDebounceRef.current = setTimeout(async () => {
      setBulkTickerLoading(true);
      try {
        const res = await apiFetch(`/api/ticker-search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (requestId !== bulkTickerSearchRequestRef.current) return;

        const quotes = data.quotes || [];
        setBulkTickerResults(quotes);
        setShowBulkTickerDropdown(quotes.length > 0);
      } catch {
        if (requestId !== bulkTickerSearchRequestRef.current) return;
        setBulkTickerResults([]);
        setShowBulkTickerDropdown(false);
      } finally {
        if (requestId === bulkTickerSearchRequestRef.current) {
          setBulkTickerLoading(false);
        }
      }
    }, 300);
  }, []);

  const appendBulkTicker = useCallback((ticker: string) => {
    setBulkSymbolsInput((previous) => {
      const normalizedTicker = ticker.trim().toUpperCase();
      const existing = parseSymbolList(previous);
      if (existing.includes(normalizedTicker)) {
        toast.info(`${normalizedTicker} sudah ada di daftar`);
        return previous;
      }

      const trimmed = previous.trim();
      return trimmed ? `${trimmed}\n${normalizedTicker}` : normalizedTicker;
    });
    setBulkTickerQuery('');
    setBulkTickerResults([]);
    setShowBulkTickerDropdown(false);
  }, []);

  const handleTickerSelect = (ticker: string) => {
    setSymbol(ticker);
    setTickerQuery(ticker);
    setShowTickerDropdown(false);
    setTickerResults([]);
  };

  const handleParseUrl = async () => {
    if (!yahooUrl.trim()) return toast.error('Silakan masukkan URL Yahoo Finance');

    try {
      const res = await apiFetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: yahooUrl }),
      });

      const result = await res.json();
      if (!res.ok) return toast.error(result.error || 'Gagal parse URL');

      setSymbol(result.symbol);
      setTickerQuery(result.symbol);
      if (result.startDate) setStartDate(result.startDate);
      if (result.endDate) setEndDate(result.endDate);
      toast.success('URL berhasil diparsing!');
    } catch {
      toast.error('Terjadi kesalahan saat parsing URL');
    }
  };

  const handleFetchPreview = async (): Promise<FetchResult> => {
    if (!symbol.trim()) {
      const message = 'Symbol wajib diisi';
      toast.error(message);
      return { success: false, error: message };
    }

    if (!startDate || !endDate) {
      const message = 'Tanggal mulai dan akhir wajib diisi';
      toast.error(message);
      return { success: false, error: message };
    }

    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      const message = 'Tanggal mulai harus lebih awal';
      toast.error(message);
      return { success: false, error: message };
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/fetch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, startDate, endDate, interval }),
      });

      const result = await res.json();
      if (!res.ok) {
        const message = result.error || 'Gagal fetch data';
        toast.error(message);
        return { success: false, error: message };
      }

      setData(result.rows);
      setCorporateActions(result.corporateActions);
      setCurrentPage(1);
      toast.success(`Berhasil fetch ${result.rows.length} rows`);
      return { success: true };
    } catch {
      const message = 'Terjadi kesalahan saat fetch data';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleBulkFetchPreview = async (): Promise<FetchResult> => {
    const rawSymbols = parseSymbolList(bulkSymbolsInput);
    if (rawSymbols.length === 0) {
      const message = 'Masukkan minimal 1 symbol';
      toast.error(message);
      return { success: false, error: message };
    }

    const invalidSymbols = rawSymbols.filter((ticker) => !/^[A-Za-z0-9.\-^=]+$/.test(ticker));
    if (invalidSymbols.length > 0) {
      const message = `Karakter ilegal/spasi berlebih terdeteksi pada ticker: ${invalidSymbols.slice(0, 3).join(', ')}${invalidSymbols.length > 3 ? '...' : ''}. Harap perbaiki.`;
      toast.error(message);
      return { success: false, error: message };
    }

    if (!startDate || !endDate) {
      const message = 'Tanggal wajib diisi';
      toast.error(message);
      return { success: false, error: message };
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/bulk-fetch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: rawSymbols, startDate, endDate, interval }),
      });

      const result = await res.json();
      if (!res.ok) {
        const message = result.error || 'Gagal fetch data';
        toast.error(message);
        return { success: false, error: message };
      }

      setBulkSuccessData(result.success);
      const combinedRows: BulkHistoricalRow[] = [];
      const allCorporateActions: CorporateAction[] = [];

      result.success.forEach((item: BulkFetchSuccessItem) => {
        item.rows.forEach((row) => combinedRows.push({ symbol: item.symbol, ...row }));
        allCorporateActions.push(...item.corporateActions);
      });

      setBulkData(combinedRows);
      setBulkCorporateActions(allCorporateActions);
      setBulkSuccessCount(result.success.length);
      setBulkFailedCount(result.failed.length);
      setBulkFailedList(result.failed);
      setCurrentPage(1);
      setSelectedSymbolFilter('all');

      if (result.failed.length > 0) {
        toast.warning(`Berhasil: ${result.success.length}, Gagal: ${result.failed.length}`);
      } else {
        toast.success(`Berhasil fetch ${result.success.length} symbols`);
      }
      return { success: true };
    } catch {
      const message = 'Terjadi kesalahan saat fetch data';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async ({ format = 'csv', targetMode }: DownloadOptions = {}) => {
    const effectiveMode = targetMode ?? (mode === 'lite' ? 'single' : mode);
    const hasRows = effectiveMode === 'single' ? data.length > 0 : bulkSuccessData.length > 0;
    if (!hasRows) return toast.error('Tidak ada data');

    const ext = format;
    const symbolLabel = effectiveMode === 'single' ? symbol || 'data' : 'BULK';
    const filename = customFilename || `SnapDl_${symbolLabel}_${startDate || 'start'}.${ext}`;

    try {
      let response;
      if (effectiveMode === 'single') {
        const endpoint = format === 'xlsx'
          ? '/api/export-xlsx'
          : format === 'json'
            ? '/api/export-json'
            : '/api/export-csv';
        response = await apiFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: data, selectedColumns, sortOrder, includeHeaders, filename }),
        });
      } else if (format === 'xlsx') {
        response = await apiFetch('/api/bulk-export-xlsx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bulkData: bulkSuccessData, selectedColumns, sortOrder, includeHeaders, startDate, endDate, interval }),
        });
      } else {
        const endpoint = format === 'json' ? '/api/export-json' : '/api/export-csv';
        response = await apiFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: bulkData, selectedColumns: ['symbol', ...selectedColumns], sortOrder, includeHeaders, filename }),
        });
      }

      if (!response.ok) throw new Error('Gagal export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success(`${format.toUpperCase()} berhasil didownload!`);
    } catch {
      toast.error('Terjadi kesalahan saat download');
    }
  };

  const getFilteredData = () => {
    if (mode === 'single') {
      let filtered = [...data];
      if (searchQuery.trim()) filtered = filtered.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())));
      filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      return filtered;
    }

    let filtered = [...bulkData];
    if (selectedSymbolFilter !== 'all') filtered = filtered.filter((row) => row.symbol === selectedSymbolFilter);
    if (searchQuery.trim()) filtered = filtered.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())));
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (sortOrder === 'asc') return dateA !== dateB ? dateA - dateB : a.symbol.localeCompare(b.symbol);
      return dateA !== dateB ? dateB - dateA : a.symbol.localeCompare(b.symbol);
    });
    return filtered;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalRows = mode === 'single' ? data.length : bulkData.length;

  let dateRangeStr = '—';
  if (totalRows > 0) {
    if (mode === 'single') {
      const sortedRows = [...data].sort((a, b) => a.date.localeCompare(b.date));
      dateRangeStr = `${sortedRows[0]?.date} — ${sortedRows[sortedRows.length - 1]?.date}`;
    } else {
      dateRangeStr = `${startDate} — ${endDate}`;
    }
  }

  const missingValues = mode === 'single'
    ? data.reduce((accumulator, row) => accumulator + Object.values(row).filter((value) => value === null).length, 0)
    : bulkData.reduce((accumulator, row) => accumulator + Object.values(row).filter((value) => value === null).length, 0);
  const currentCorporateActions = mode === 'single' ? corporateActions : bulkCorporateActions;
  const tradingDates = mode === 'single'
    ? data.map((row) => row.date).sort()
    : Array.from(new Set(bulkData.map((row) => row.date))).sort();
  const eventWindowResult = eventDate && windowPre >= 0 && windowPost >= 0 && tradingDates.length > 0
    ? validateEventWindow({ eventDate, windowPre, windowPost, alignmentMode }, currentCorporateActions, tradingDates)
    : null;
  const uniqueSymbols = mode === 'bulk'
    ? Array.from(new Set(bulkData.map((row) => row.symbol))).sort()
    : [];
  const modeLabel = mode === 'bulk' ? 'Bulk Workspace' : 'Single Workspace';
  const modeDescription = mode === 'bulk'
    ? 'Kelola banyak ticker sekaligus dengan panel kontrol yang lebih luas.'
    : 'Fokus pada satu ticker dengan alur input, preview, dan export yang presisi.';

  return (
    <div className="min-h-screen pb-12 bg-[radial-gradient(circle_at_20%_20%,#9ee5ff_0%,transparent_35%),radial-gradient(circle_at_80%_0%,#dcb6ff_0%,transparent_30%),radial-gradient(circle_at_50%_80%,#c6b6ff_0%,transparent_30%),linear-gradient(135deg,#e9f6ff_0%,#e6dcff_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,#0f0a2e_0%,transparent_35%),radial-gradient(circle_at_80%_0%,#4a1f5f_0%,transparent_30%),radial-gradient(circle_at_50%_80%,#c1366b_0%,transparent_30%),linear-gradient(135deg,#0a0605_0%,#3d1f3f_100%)] finance-motion-stable" suppressHydrationWarning>
      <AppHeader mode={mode} onModeChange={handleModeChange} status={appStatus} />

      <main className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6">
        {mode === 'guide' ? (
          <div>
            <GuidePanel onSelectMode={handleModeChange} />
          </div>
        ) : mode === 'lite' ? (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <LiteModePanelV2
              symbol={symbol}
              bulkSymbolsInput={bulkSymbolsInput}
              setBulkSymbolsInput={setBulkSymbolsInput}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              eventDate={eventDate}
              setEventDate={setEventDate}
              windowPre={windowPre}
              setWindowPre={setWindowPre}
              windowPost={windowPost}
              setWindowPost={setWindowPost}
              alignmentMode={alignmentMode}
              setAlignmentMode={setAlignmentMode}
              data={data}
              bulkRows={bulkData}
              bulkSuccessCount={bulkSuccessCount}
              loading={loading}
              onFetchSingle={handleFetchPreview}
              onFetchBulk={handleBulkFetchPreview}
              selectedColumns={selectedColumns}
              onColumnToggle={toggleColumn}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onDownload={handleDownload}
              tickerQuery={tickerQuery}
              tickerResults={tickerResults}
              tickerLoading={tickerLoading}
              showTickerDropdown={showTickerDropdown}
              setShowTickerDropdown={setShowTickerDropdown}
              onTickerQueryChange={handleTickerQueryChange}
              onTickerSelect={handleTickerSelect}
              tickerDropdownRef={tickerDropdownRef}
              bulkTickerQuery={bulkTickerQuery}
              bulkTickerResults={bulkTickerResults}
              bulkTickerLoading={bulkTickerLoading}
              showBulkTickerDropdown={showBulkTickerDropdown}
              setShowBulkTickerDropdown={setShowBulkTickerDropdown}
              onBulkTickerQueryChange={handleBulkTickerQueryChange}
              onBulkTickerSelect={appendBulkTicker}
              bulkTickerDropdownRef={bulkTickerDropdownRef}
            />
          </div>
        ) : (
          <div className={cn(
            'space-y-4',
            mode === 'single' && 'finance-mode-group-single',
            mode === 'bulk' && 'finance-mode-group-bulk',
            isModeSwitching && 'finance-mode-freeze',
          )}>
            <section className="rounded-xl border border-white/70 bg-white/75 px-4 py-2.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-950/45">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{modeLabel}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{modeDescription}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 font-semibold text-foreground">
                    Rows: {totalRows.toLocaleString()}
                  </span>
                  {mode === 'bulk' && (
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 font-semibold text-foreground">
                      Symbols: {uniqueSymbols.length}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <div className={cn(
              'grid grid-cols-1 items-start gap-4',
              mode === 'bulk'
                ? 'xl:grid-cols-[minmax(370px,430px)_minmax(0,1fr)]'
                : 'xl:grid-cols-[minmax(330px,390px)_minmax(0,1fr)]',
            )}>
              <aside className="flex flex-col gap-4">
                <div className="px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Control Center</p>
                </div>

                <InputPanel
                  mode={mode}
                  yahooUrl={yahooUrl} setYahooUrl={setYahooUrl}
                  onParseUrl={handleParseUrl}
                  tickerQuery={tickerQuery} tickerResults={tickerResults}
                  tickerLoading={tickerLoading} showTickerDropdown={showTickerDropdown}
                  onTickerQueryChange={handleTickerQueryChange}
                  onTickerSelect={(ticker) => { setSymbol(ticker); setTickerQuery(ticker); setShowTickerDropdown(false); }}
                  tickerDropdownRef={tickerDropdownRef}
                  bulkSymbolsInput={bulkSymbolsInput} setBulkSymbolsInput={setBulkSymbolsInput}
                  bulkTickerQuery={bulkTickerQuery} bulkTickerResults={bulkTickerResults}
                  bulkTickerLoading={bulkTickerLoading} showBulkTickerDropdown={showBulkTickerDropdown}
                  onBulkTickerQueryChange={handleBulkTickerQueryChange}
                  onBulkTickerSelect={appendBulkTicker}
                  bulkTickerDropdownRef={bulkTickerDropdownRef}
                  setShowBulkTickerDropdown={setShowBulkTickerDropdown}
                  setShowTickerDropdown={setShowTickerDropdown}
                />

                <SettingsPanel
                  mode={mode}
                  tickerQuery={tickerQuery} symbol={symbol}
                  tickerResults={tickerResults} tickerLoading={tickerLoading}
                  showTickerDropdown={showTickerDropdown}
                  onTickerQueryChange={handleTickerQueryChange}
                  onTickerSelect={(ticker) => { setSymbol(ticker); setTickerQuery(ticker); setShowTickerDropdown(false); }}
                  tickerDropdownRef={tickerDropdownRef}
                  setShowTickerDropdown={setShowTickerDropdown}
                  startDate={startDate} setStartDate={setStartDate}
                  endDate={endDate} setEndDate={setEndDate}
                  interval={interval} setInterval={setInterval}
                  sortOrder={sortOrder} setSortOrder={setSortOrder}
                  selectedColumns={selectedColumns}
                  onColumnToggle={toggleColumn}
                  onPresetSelect={(name) => {
                    const preset = import('@/lib/constants').then((module) => module.PRESETS.find((entry) => entry.name === name));
                    preset.then((result) => { if (result) { setSelectedColumns(result.columns); toast.success('Preset applied'); } });
                  }}
                  onSelectAll={() => setSelectedColumns(COLUMNS.map((column) => column.key))}
                  onClearAll={() => setSelectedColumns(['date'])}
                />
              </aside>

              <section className="flex min-w-0 flex-col gap-4">
                <div className="px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Workspace</p>
                </div>

                <PreviewPanel
                  mode={mode} loading={loading}
                  onFetch={mode === 'single' ? handleFetchPreview : handleBulkFetchPreview}
                  totalRows={totalRows}
                  filteredData={filteredData}
                  paginatedData={paginatedData}
                  selectedColumns={selectedColumns}
                  dateRange={dateRangeStr} missingValues={missingValues}
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  currentPage={currentPage} totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                  bulkSuccessCount={bulkSuccessCount}
                  bulkFailedCount={bulkFailedCount}
                  bulkFailedList={bulkFailedList}
                  uniqueSymbols={uniqueSymbols}
                  selectedSymbolFilter={selectedSymbolFilter}
                  setSelectedSymbolFilter={setSelectedSymbolFilter}
                />

                <div className={cn(
                  'grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-12',
                  '[&>div:nth-child(1)]:xl:col-span-4',
                  '[&>div:nth-child(2)]:xl:col-span-4',
                  '[&>div:nth-child(3)]:xl:col-span-4',
                )}>
                  <BottomPanels
                    mode={mode} symbol={symbol}
                    bulkSuccessCount={bulkSuccessCount}
                    corporateActions={currentCorporateActions}
                    eventDate={eventDate} setEventDate={setEventDate}
                    windowPre={windowPre} setWindowPre={setWindowPre}
                    windowPost={windowPost} setWindowPost={setWindowPost}
                    alignmentMode={alignmentMode} setAlignmentMode={setAlignmentMode}
                    eventWindowResult={eventWindowResult}
                    customFilename={customFilename} setCustomFilename={setCustomFilename}
                    startDate={startDate} endDate={endDate}
                    interval={interval} sortOrder={sortOrder}
                    includeHeaders={includeHeaders} setIncludeHeaders={setIncludeHeaders}
                    onDownload={handleDownload}
                    bulkSuccessData={bulkSuccessData}
                    totalRows={totalRows}
                    singleData={data}
                  />
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}