'use client';

import { useState, useMemo } from 'react';
import {
    AlertTriangle, CheckCircle2, ChevronDown,
    Download, FileJson, FileSpreadsheet, FileText, TrendingUp as TrendIcon, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AppMode, BulkFetchSuccessItem, CorporateAction, EventWindowResult, HistoricalRow } from '@/lib/types';

type ExportFormat = 'csv' | 'json' | 'xlsx';

interface BottomPanelsProps {
    mode: AppMode; symbol: string; bulkSuccessCount: number;
    corporateActions: CorporateAction[];
    eventDate: string; setEventDate: (v: string) => void;
    windowPre: number; setWindowPre: (v: number) => void;
    windowPost: number; setWindowPost: (v: number) => void;
    alignmentMode: 'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day';
    setAlignmentMode: (v: 'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day') => void;
    eventWindowResult: EventWindowResult | null;
    customFilename: string; setCustomFilename: (v: string) => void;
    startDate: string; endDate: string; interval: string; sortOrder: string;
    includeHeaders: boolean; setIncludeHeaders: (v: boolean) => void;
    onDownload: (options?: { format?: ExportFormat; targetMode?: 'single' | 'bulk' }) => void;
    bulkSuccessData: BulkFetchSuccessItem[]; totalRows: number;
    // For abnormal return
    singleData?: HistoricalRow[];
}

// Mini chart for event window price movement
function MiniSparkline({ data, eventIdx }: { data: number[]; eventIdx: number }) {
    if (data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 280; const h = 60;
    const step = w / (data.length - 1);

    const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 8) - 4}`).join(' ');
    const eventX = eventIdx * step;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 mt-2">
            <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 270)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="oklch(0.55 0.22 270)" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Fill */}
            <polygon
                points={`0,${h} ${points} ${w},${h}`}
                fill="url(#sparkGrad)"
            />
            {/* Line */}
            <polyline points={points} fill="none" stroke="oklch(0.55 0.22 270)" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Event marker */}
            {eventIdx >= 0 && eventIdx < data.length && (
                <>
                    <line x1={eventX} y1="0" x2={eventX} y2={h} stroke="oklch(0.65 0.22 25)" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx={eventX} cy={parseFloat(points.split(' ')[eventIdx]?.split(',')[1] || '30')} r="3" fill="oklch(0.65 0.22 25)" />
                </>
            )}
        </svg>
    );
}

export function BottomPanels({
    mode, symbol, bulkSuccessCount, corporateActions,
    eventDate, setEventDate, windowPre, setWindowPre, windowPost, setWindowPost,
    alignmentMode, setAlignmentMode, eventWindowResult,
    customFilename, setCustomFilename, startDate, endDate, interval, sortOrder,
    includeHeaders, setIncludeHeaders, onDownload, bulkSuccessData, totalRows,
    singleData,
}: BottomPanelsProps) {

    const [exportFormat, setExportFormat] = useState<ExportFormat>(mode === 'bulk' ? 'xlsx' : 'csv');
    const [exporting, setExporting] = useState(false);

    // Compute abnormal return when event window is active
    const abnormalReturn = useMemo(() => {
        if (!eventWindowResult || !singleData || singleData.length === 0 || mode !== 'single') return null;

        const sorted = [...singleData].sort((a, b) => a.date.localeCompare(b.date));
        const eventIdx = sorted.findIndex(r => r.date === eventWindowResult.eventTradingDate);
        if (eventIdx < 0) return null;

        const startIdx = sorted.findIndex(r => r.date === eventWindowResult.windowStart);
        const endIdx = sorted.findIndex(r => r.date === eventWindowResult.windowEnd);
        if (startIdx < 0 || endIdx < 0) return null;

        const windowSlice = sorted.slice(startIdx, endIdx + 1);
        const prices = windowSlice.map(r => r.close).filter((v): v is number => v !== null);
        if (prices.length < 2) return null;

        // Simple actual return = (end - start) / start
        const actualReturn = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;

        // Expected return = average daily return in pre-event window
        const preSlice = sorted.slice(Math.max(0, startIdx - 20), startIdx);
        const preReturns: number[] = [];
        for (let i = 1; i < preSlice.length; i++) {
            if (preSlice[i].close != null && preSlice[i - 1].close != null && preSlice[i - 1].close !== 0) {
                preReturns.push(((preSlice[i].close! - preSlice[i - 1].close!) / preSlice[i - 1].close!) * 100);
            }
        }
        const avgDailyReturn = preReturns.length > 0
            ? preReturns.reduce((a, b) => a + b, 0) / preReturns.length
            : 0;
        const expectedReturn = avgDailyReturn * windowSlice.length;
        const ar = actualReturn - expectedReturn;

        return {
            actualReturn,
            expectedReturn,
            abnormalReturn: ar,
            prices,
            eventRelativeIdx: eventIdx - startIdx,
        };
    }, [eventWindowResult, singleData, mode]);

            const handleExport = async () => {
                setExporting(true);
                try {
                    onDownload({ format: exportFormat });
                } finally {
                    setTimeout(() => setExporting(false), 1000);
                }
            };

    const generateFilename = () => {
        if (customFilename) return customFilename;
        const sym = mode === 'single' ? symbol || 'data' : 'BULK';
        const ext = exportFormat;
        return `YFinancePro_${sym}_${startDate || 'start'}.${ext}`;
    };

    const formatOptions: { value: ExportFormat; label: string; icon: React.ReactNode; desc: string }[] = mode === 'single'
        ? [
            { value: 'csv', label: 'CSV', icon: <FileText className="h-3.5 w-3.5" />, desc: 'Comma-separated' },
            { value: 'json', label: 'JSON', icon: <FileJson className="h-3.5 w-3.5" />, desc: 'Structured data' },
            { value: 'xlsx', label: 'Excel', icon: <FileSpreadsheet className="h-3.5 w-3.5" />, desc: 'Native workbook' },
        ]
        : [
            { value: 'xlsx', label: 'Excel', icon: <FileSpreadsheet className="h-3.5 w-3.5" />, desc: 'Multi-sheet workbook' },
            { value: 'csv', label: 'CSV', icon: <FileText className="h-3.5 w-3.5" />, desc: 'Merged flat file' },
            { value: 'json', label: 'JSON', icon: <FileJson className="h-3.5 w-3.5" />, desc: 'Structured data' },
        ];

    return (
        <>
            {/* Corporate Actions */}
            <Card className="panel-surface dark:bg-slate-950/40 dark:border-purple-500/30 dark:backdrop-blur-md animate-fade-in-left card-hover-scale">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm animate-fade-in-down">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Corporate Actions
                        {corporateActions.length > 0 && (
                            <Badge variant="warning" className="text-[9px] ml-auto animate-scale-in">{corporateActions.length}</Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2.5 stagger-children">
                    {corporateActions.length === 0 ? (
                        <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/10">
                            <p className="text-xs text-muted-foreground">Tidak ada corporate actions</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {corporateActions.slice(0, 6).map((a, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/50 p-2 hover:bg-accent/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                                    <Badge variant="outline" className="font-mono text-[9px] h-5">{a.symbol}</Badge>
                                    <Badge variant={a.type === 'DIVIDEND' ? 'success' : 'warning'} className="text-[9px] h-5">{a.type}</Badge>
                                    <span className="text-xs font-medium flex-1 min-w-0">{a.date}</span>
                                    <span className="text-[10px] text-muted-foreground break-words">{a.value}</span>
                                </div>
                            ))}
                            {corporateActions.length > 6 && (
                                <p className="text-center text-[10px] text-muted-foreground">+{corporateActions.length - 6} more</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Event Window + Abnormal Return */}
            <Card className="panel-surface dark:bg-slate-950/40 dark:border-purple-500/30 dark:backdrop-blur-md animate-fade-in card-hover-scale">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm animate-fade-in-down">
                        <Activity className="h-4 w-4 text-primary" />
                        Event Window
                        {eventWindowResult && (
                            <Badge variant={eventWindowResult.status === 'AMAN' ? 'success' : 'destructive'} className="text-[9px] ml-auto animate-scale-in">
                                {eventWindowResult.status}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <label className="micro-label">Event Date</label>
                            <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="micro-label">t−</label>
                            <Input type="number" min="0" max="60" value={windowPre} onChange={(e) => setWindowPre(parseInt(e.target.value) || 0)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="micro-label">t+</label>
                            <Input type="number" min="0" max="60" value={windowPost} onChange={(e) => setWindowPost(parseInt(e.target.value) || 0)} className="h-8 text-xs" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="micro-label">Alignment</label>
                        <select
                            value={alignmentMode} onChange={(e) => setAlignmentMode(e.target.value as 'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day')}
                            className="h-8 w-full rounded-lg border border-input px-2 text-xs bg-background dark:bg-input/20 dark:[color-scheme:dark] focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="nearest_trading_day">Nearest</option>
                            <option value="previous_trading_day">Previous</option>
                            <option value="next_trading_day">Next</option>
                        </select>
                        <p className="text-[10px] text-muted-foreground">Window: <strong>{windowPre + windowPost + 1}</strong> trading days</p>
                    </div>

                    {eventWindowResult && (
                        <div className="space-y-2 animate-fade-in-up">
                            <Separator />
                            {eventWindowResult.eventTradingDate !== eventDate && (
                                <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5">
                                    <div className="text-[9px] font-bold uppercase text-primary/60">Aligned</div>
                                    <div className="text-xs font-semibold">{eventDate} → {eventWindowResult.eventTradingDate}</div>
                                </div>
                            )}
                            <div className="rounded-lg border border-border/50 p-2.5">
                                <div className="text-[9px] font-bold uppercase text-muted-foreground">Range</div>
                                <div className="text-xs font-semibold">{eventWindowResult.windowStart} — {eventWindowResult.windowEnd}</div>
                                <div className="text-[10px] text-muted-foreground">{eventWindowResult.windowSize} trading days</div>
                            </div>

                            {eventWindowResult.warning && (
                                <div className="rounded-lg bg-amber-500/8 border border-amber-500/20 p-2.5 flex gap-2">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-amber-700 dark:text-amber-300">{eventWindowResult.warning}</p>
                                </div>
                            )}

                            {/* Abnormal Return Analysis */}
                            {abnormalReturn && (
                                <div className="rounded-lg border border-primary/20 bg-primary/3 p-3 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                        <TrendIcon className="h-3.5 w-3.5" />
                                        Abnormal Return Analysis
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div className="text-center">
                                            <div className="text-[9px] font-bold uppercase text-muted-foreground">Actual</div>
                                            <div className={cn('text-sm font-bold tabular-nums', abnormalReturn.actualReturn >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                                                {abnormalReturn.actualReturn >= 0 ? '+' : ''}{abnormalReturn.actualReturn.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[9px] font-bold uppercase text-muted-foreground">Expected</div>
                                            <div className="text-sm font-bold tabular-nums text-foreground/70">
                                                {abnormalReturn.expectedReturn >= 0 ? '+' : ''}{abnormalReturn.expectedReturn.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[9px] font-bold uppercase text-muted-foreground">Abnormal</div>
                                            <div className={cn('text-sm font-bold tabular-nums', abnormalReturn.abnormalReturn >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                                                {abnormalReturn.abnormalReturn >= 0 ? '+' : ''}{abnormalReturn.abnormalReturn.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                    <MiniSparkline data={abnormalReturn.prices} eventIdx={abnormalReturn.eventRelativeIdx} />
                                    <p className="text-[9px] text-muted-foreground text-center">
                                        Garis putus-putus = tanggal event | Dihitung dari 20 hari pre-event baseline
                                    </p>
                                </div>
                            )}

                            {/* Actions in Window */}
                            {eventWindowResult.actionsInWindow.length > 0 ? (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-destructive uppercase">Actions dalam Window:</p>
                                    {eventWindowResult.actionsInWindow.map((a, i) => (
                                        <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2">
                                            <Badge variant="outline" className="font-mono text-[9px] h-5">{a.symbol}</Badge>
                                            <Badge variant="destructive" className="text-[9px] h-5">{a.type}</Badge>
                                            <span className="text-xs font-semibold text-destructive min-w-0">{a.date}</span>
                                            <span className="text-[10px] text-destructive/70 break-words">{a.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                                    <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-1" />
                                    <p className="text-xs font-semibold">Window aman</p>
                                    <p className="text-[10px] text-muted-foreground">No corporate actions detected</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Multi-Format Export ─────────────────── */}
            <Card className="panel-surface border-primary/15 dark:bg-slate-950/40 dark:border-purple-500/30 dark:backdrop-blur-md animate-fade-in-right card-hover-scale">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm animate-fade-in-down">
                        <Download className="h-4 w-4 text-primary" />
                        Export Data
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-2.5 stagger-children">

                    {/* Format selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {formatOptions.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setExportFormat(f.value)}
                                className={cn(
                                    'flex flex-col items-center gap-1 rounded-lg border p-2 transition-all duration-100',
                                    exportFormat === f.value
                                        ? 'border-primary bg-primary/5 text-primary shadow-[0_0_12px_oklch(0.55_0.22_270_/_0.15)]'
                                        : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground',
                                )}
                            >
                                {f.icon}
                                <span className="text-[10px] font-bold">{f.label}</span>
                                <span className="text-[8px]">{f.desc}</span>
                            </button>
                        ))}
                    </div>

                    {/* Filename */}
                    <div className="rounded-lg bg-muted/30 border border-border/50 p-2.5">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Output File</div>
                        <div className="font-mono text-[11px] font-medium text-foreground break-all">{generateFilename()}</div>
                    </div>

                    {mode === 'single' && (
                        <Input
                            placeholder="Custom filename (optional)"
                            value={customFilename}
                            onChange={(e) => setCustomFilename(e.target.value)}
                            className="h-8 text-xs font-mono"
                        />
                    )}

                    {mode === 'bulk' && exportFormat === 'xlsx' && (
                        <div className="space-y-1">
                            {['Sheet terpisah per perusahaan', 'Sheet _SUMMARY + Outstanding Shares', 'Sheet _CORPORATE_ACTIONS'].map((f, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Include headers */}
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-2">
                        <input type="checkbox" id="hdr" checked={includeHeaders} onChange={(e) => setIncludeHeaders(e.target.checked)} className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" />
                        <label htmlFor="hdr" className="text-xs cursor-pointer">Include Headers</label>
                    </div>

                    {/* Export button with progress */}
                    <button
                        onClick={handleExport}
                        disabled={totalRows === 0 || exporting}
                        className={cn(
                            'relative w-full h-10 rounded-xl font-semibold text-sm text-white overflow-hidden',
                            'flex items-center justify-center gap-2',
                            'bg-gradient-to-r from-indigo-500 via-primary to-blue-600',
                            'shadow-[0_2px_16px_oklch(0.55_0.22_270_/_0.35)]',
                            'hover:shadow-[0_4px_24px_oklch(0.55_0.22_270_/_0.5)] hover:brightness-110',
                            'active:scale-[0.97] transition-all duration-150',
                            'disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none',
                        )}
                    >
                        {exporting && (
                            <div className="absolute inset-0 bg-white/20">
                                <div className="h-full bg-white/30 animate-[shimmer_1s_ease-in-out_infinite]" style={{ width: '60%' }} />
                            </div>
                        )}
                        <Download className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">
                            {exporting ? 'Exporting...' : `Download ${exportFormat.toUpperCase()}`}
                            {mode === 'bulk' && !exporting && ` (${bulkSuccessData.length} sym)`}
                        </span>
                    </button>
                </CardContent>
            </Card>
        </>
    );
}
