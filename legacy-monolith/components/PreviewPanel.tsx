'use client';

import {
    TrendingUp, Search, ChevronLeft, ChevronRight,
    Database, BarChart2, AlertCircle, Loader2,
    AlertTriangle, Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn, describeFetchError } from '@/lib/utils';
import { COLUMNS } from '@/lib/constants';
import type { AppMode, HistoricalRow, BulkHistoricalRow, ColumnKey } from '@/lib/types';

interface PreviewPanelProps {
    mode: AppMode;
    loading: boolean;
    onFetch: () => void;
    totalRows: number;
    filteredData: (HistoricalRow | BulkHistoricalRow)[];
    paginatedData: (HistoricalRow | BulkHistoricalRow)[];
    selectedColumns: ColumnKey[];
    dateRange: string; missingValues: number;
    searchQuery: string; setSearchQuery: (v: string) => void;
    currentPage: number; totalPages: number;
    setCurrentPage: (fn: (p: number) => number) => void;
    rowsPerPage: number;
    setRowsPerPage?: (v: number) => void;
    bulkSuccessCount: number; bulkFailedCount: number;
    bulkFailedList: { symbol: string; error: string }[];
    uniqueSymbols: string[];
    selectedSymbolFilter: string; setSelectedSymbolFilter: (v: string) => void;
}


// Skeleton row
function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr className="border-b border-border/30">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-3 py-2.5">
                    <div className={cn('h-3.5 rounded-md shimmer', i === 0 ? 'w-20' : 'w-14')} />
                </td>
            ))}
        </tr>
    );
}

export function PreviewPanel({
    mode, loading, onFetch,
    totalRows, filteredData, paginatedData, selectedColumns,
    dateRange, missingValues,
    searchQuery, setSearchQuery,
    currentPage, totalPages, setCurrentPage, rowsPerPage, setRowsPerPage,
    bulkSuccessCount, bulkFailedCount, bulkFailedList,
    uniqueSymbols, selectedSymbolFilter, setSelectedSymbolFilter,
}: PreviewPanelProps) {

    const startItem = (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(currentPage * rowsPerPage, filteredData.length);

    return (
        <>
            <Card className="panel-surface border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-slate-900/50 animate-fade-in-left card-hover-scale">
                <CardHeader className="pb-2.5 border-b border-slate-200 dark:border-purple-500/25">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-sm text-foreground dark:text-white/95 animate-fade-in-down">
                                <BarChart2 className="h-4 w-4 text-primary" />
                                Preview Data
                                {mode === 'bulk' && bulkSuccessCount > 0 && (
                                    <Badge variant="default" className="text-[9px] dark:bg-purple-600 dark:text-white animate-scale-in">{bulkSuccessCount} sym</Badge>
                                )}
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5 text-slate-600 dark:text-white/60 animate-fade-in">Preview data sebelum download</CardDescription>
                        </div>
                        <Button
                            id="fetch-btn"
                            onClick={onFetch}
                            disabled={loading}
                            size="sm"
                            className={cn(
                                'shrink-0 h-8 px-4 btn-hover-lift',
                                'bg-gradient-to-r from-indigo-500 via-primary to-blue-600 text-white',
                                'shadow-[0_2px_12px_oklch(0.55_0.22_270_/_0.35)]',
                                'hover:shadow-[0_4px_20px_oklch(0.55_0.22_270_/_0.5)] hover:brightness-110',
                                'active:scale-95 transition-all duration-150',
                                'dark:from-purple-600 dark:via-purple-500 dark:to-pink-500',
                                loading && 'animate-pulse',
                            )}
                        >
                            {loading
                                ? <><Loader2 className="h-3 w-3 animate-spin-smooth" />Fetching...</>
                                : <><Database className="h-3 w-3" />{mode === 'single' ? 'Fetch Data' : 'Bulk Fetch'}</>
                            }
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-3 stagger-children">

                    {/* Bulk summary */}
                    {mode === 'bulk' && bulkSuccessCount > 0 && (
                        <div className="flex items-center gap-4 rounded-lg p-2.5 bg-primary/5 border border-primary/15 text-xs animate-fade-in-up">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Sukses: <strong>{bulkSuccessCount}</strong>
                            </div>
                            {bulkFailedCount > 0 && (
                                <div className="flex items-center gap-1.5 text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    Gagal: <strong>{bulkFailedCount}</strong>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats row */}
                    {totalRows > 0 && (
                        <div className="grid grid-cols-3 gap-1.5 animate-fade-in-up">
                            <div className="rounded-lg p-2.5 border border-border/50 bg-card stat-card-blue">
                                <div className="micro-label">Total Rows</div>
                                <div className="text-lg font-bold text-foreground tabular-nums">{totalRows.toLocaleString()}</div>
                            </div>
                            <div className="rounded-lg p-2.5 border border-border/50 bg-card stat-card-green">
                                <div className="micro-label">Date Range</div>
                                <div className="text-[10px] font-semibold text-foreground">{dateRange}</div>
                            </div>
                            <div className="rounded-lg p-2.5 border border-border/50 bg-card stat-card-amber">
                                <div className="micro-label">Missing</div>
                                <div className="text-lg font-bold text-foreground tabular-nums">{missingValues}</div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    {totalRows > 0 && (
                        <div className="flex gap-1.5">
                            {mode === 'bulk' && uniqueSymbols.length > 0 && (
                                <select
                                    value={selectedSymbolFilter}
                                    onChange={(e) => setSelectedSymbolFilter(e.target.value)}
                                    className="h-8 rounded-lg border border-input px-2 text-xs bg-background shrink-0 dark:bg-input/20 dark:[color-scheme:dark] transition-all focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">All ({uniqueSymbols.length})</option>
                                    {uniqueSymbols.map(sym => <option key={sym} value={sym}>{sym}</option>)}
                                </select>
                            )}
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-7 h-8 text-xs" />
                            </div>
                            {setRowsPerPage && (
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                    className="h-8 rounded-lg border border-input px-2 text-xs bg-background shrink-0 dark:bg-input/20 dark:[color-scheme:dark] w-16"
                                >
                                    {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            )}
                        </div>
                    )}

                    {/* TABLE with Skeleton & Conditional Formatting */}
                    {loading && totalRows === 0 ? (
                        /* Skeleton Loading State */
                        <div className="overflow-hidden rounded-lg border border-border/60 animate-fade-in-up">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-border/60 bg-muted/40">
                                        {selectedColumns.map(col => (
                                            <th key={col} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                {COLUMNS.find(c => c.key === col)?.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <SkeletonRow key={i} cols={selectedColumns.length} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : totalRows === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-border/50 bg-muted/10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 mb-2">
                                <TrendingUp className="h-6 w-6 text-primary/50" />
                            </div>
                            <p className="text-sm font-medium text-foreground/50">Belum ada data</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Klik &quot;{mode === 'single' ? 'Fetch Data' : 'Bulk Fetch'}&quot; untuk memuat
                            </p>
                        </div>
                    ) : (
                        /* Data Table */
                        <div className="space-y-2">
                            <div className="max-h-[44vh] overflow-auto overscroll-contain rounded-lg border border-border/60 md:max-h-[48vh] xl:max-h-[52vh]">
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0 z-20">
                                        <tr className="border-b border-border/60 bg-muted/70 backdrop-blur-sm">
                                            {mode === 'bulk' && (
                                                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground sticky left-0 bg-muted/70 z-30">Sym</th>
                                            )}
                                            {selectedColumns.map(col => (
                                                <th key={col} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{COLUMNS.find(c => c.key === col)?.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((row, idx) => {
                                            // Calculate daily change for conditional formatting
                                            const closeVal = (row as unknown as Record<string, unknown>)['close'] as number | null;
                                            const openVal = (row as unknown as Record<string, unknown>)['open'] as number | null;
                                            const dayChange = closeVal != null && openVal != null && openVal !== 0
                                                ? ((closeVal - openVal) / openVal) * 100
                                                : null;

                                            return (
                                                <tr
                                                    key={idx}
                                                    className={cn(
                                                        'border-b border-border/30 table-row-hover animate-fade-in-up',
                                                        'hover:bg-accent/40',
                                                        idx % 2 === 0 ? 'bg-background' : 'bg-muted/5',
                                                    )}
                                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                                >
                                                    {mode === 'bulk' && (
                                                        <td className="px-3 py-2 sticky left-0 bg-inherit z-10">
                                                            <span className="font-mono text-[10px] font-bold text-primary">
                                                                {(row as BulkHistoricalRow).symbol}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {selectedColumns.map(col => {
                                                        const value = (row as unknown as Record<string, unknown>)[col];
                                                        let displayValue = '—';
                                                        let colorClass = 'text-foreground/80';

                                                        if (value !== null && value !== undefined) {
                                                            if (col === 'volume') {
                                                                displayValue = Math.round(value as number).toLocaleString();
                                                            } else if (col === 'date') {
                                                                displayValue = String(value);
                                                            } else {
                                                                const numVal = value as number;
                                                                displayValue = numVal.toFixed(2);
                                                                // Conditional formatting for close (vs open)
                                                                if (col === 'close' && dayChange !== null) {
                                                                    colorClass = dayChange > 0
                                                                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                                                        : dayChange < 0
                                                                            ? 'text-red-500 dark:text-red-400 font-semibold'
                                                                            : 'text-foreground/80';
                                                                }
                                                            }
                                                        }

                                                        return (
                                                            <td key={col} className={cn('px-3 py-2 tabular-nums', colorClass)}>
                                                                {displayValue}
                                                                {col === 'close' && dayChange !== null && (
                                                                    <span className={cn(
                                                                        'ml-1 text-[9px]',
                                                                        dayChange > 0 ? 'text-emerald-500' : dayChange < 0 ? 'text-red-400' : 'text-muted-foreground',
                                                                    )}>
                                                                        {dayChange > 0 ? '+' : ''}{dayChange.toFixed(2)}%
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground tabular-nums">
                                    {startItem}–{endItem} dari {filteredData.length.toLocaleString()}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="icon-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 w-7 rounded-md">
                                        <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    <span className="px-2 text-[10px] text-foreground/70 tabular-nums">{currentPage}/{totalPages || 1}</span>
                                    <Button variant="outline" size="icon-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="h-7 w-7 rounded-md">
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Error Dashboard ──────────────────────── */}
            {mode === 'bulk' && bulkFailedList.length > 0 && (
                <Card className="border-destructive/20 dark:border-destructive/15 animate-fade-in-up">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            Error Dashboard
                            <Badge variant="destructive" className="text-[9px] ml-auto">{bulkFailedList.length} gagal</Badge>
                        </CardTitle>
                        <CardDescription className="text-xs">Detail kegagalan fetch dan saran perbaikan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-lg border border-destructive/15">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-destructive/10 bg-destructive/5">
                                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-destructive/80">Symbol</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-destructive/80">Category</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-destructive/80">Error</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                            <Lightbulb className="h-3 w-3 inline mr-0.5" />Saran
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bulkFailedList.map((f, idx) => {
                                        const errorInfo = describeFetchError(f.error);
                                        return (
                                            <tr key={idx} className="border-b border-destructive/10 hover:bg-destructive/3">
                                                <td className="px-3 py-2 font-mono font-bold text-destructive">{f.symbol}</td>
                                                <td className="px-3 py-2">
                                                    <Badge variant="destructive" className="text-[9px]">{errorInfo.category}</Badge>
                                                </td>
                                                <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{f.error}</td>
                                                <td className="px-3 py-2 text-amber-700 dark:text-amber-300">{errorInfo.suggestion}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
