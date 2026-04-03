'use client';

import { Calendar, Search, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { COLUMNS, PRESETS, INTERVALS, SORT_OPTIONS } from '@/lib/constants';
import type { AppMode, ColumnKey } from '@/lib/types';

interface TickerResult { symbol: string; name: string; exchange: string; type: string; }

interface SettingsPanelProps {
    mode: AppMode;
    tickerQuery: string; symbol: string;
    tickerResults: TickerResult[]; tickerLoading: boolean;
    showTickerDropdown: boolean;
    onTickerQueryChange: (q: string) => void;
    onTickerSelect: (sym: string) => void;
    tickerDropdownRef: React.RefObject<HTMLDivElement>;
    setShowTickerDropdown: (v: boolean) => void;
    startDate: string; setStartDate: (v: string) => void;
    endDate: string; setEndDate: (v: string) => void;
    interval: string; setInterval: (v: string) => void;
    sortOrder: 'asc' | 'desc'; setSortOrder: (v: 'asc' | 'desc') => void;
    selectedColumns: ColumnKey[];
    onColumnToggle: (key: ColumnKey) => void;
    onPresetSelect: (name: string) => void;
    onSelectAll: () => void; onClearAll: () => void;
}

// Quick date presets
function getDatePreset(preset: string): { start: string; end: string } {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const end = fmt(today);

    switch (preset) {
        case '1M': { const s = new Date(today); s.setMonth(s.getMonth() - 1); return { start: fmt(s), end }; }
        case '3M': { const s = new Date(today); s.setMonth(s.getMonth() - 3); return { start: fmt(s), end }; }
        case '6M': { const s = new Date(today); s.setMonth(s.getMonth() - 6); return { start: fmt(s), end }; }
        case '1Y': { const s = new Date(today); s.setFullYear(s.getFullYear() - 1); return { start: fmt(s), end }; }
        case '2Y': { const s = new Date(today); s.setFullYear(s.getFullYear() - 2); return { start: fmt(s), end }; }
        case '5Y': { const s = new Date(today); s.setFullYear(s.getFullYear() - 5); return { start: fmt(s), end }; }
        case 'YTD': return { start: `${today.getFullYear()}-01-01`, end };
        case 'MAX': return { start: '2000-01-01', end };
        default: return { start: '', end: '' };
    }
}

const DATE_PRESETS = ['1M', '3M', '6M', 'YTD', '1Y', '2Y', '5Y', 'MAX'] as const;

export function SettingsPanel(props: SettingsPanelProps) {
    const {
        mode, tickerQuery, symbol, tickerResults, tickerLoading,
        showTickerDropdown, onTickerQueryChange, onTickerSelect,
        tickerDropdownRef, setShowTickerDropdown,
        startDate, setStartDate, endDate, setEndDate,
        interval, setInterval, sortOrder, setSortOrder,
        selectedColumns, onColumnToggle, onPresetSelect, onSelectAll, onClearAll,
    } = props;

    const applyPreset = (p: string) => {
        const { start, end } = getDatePreset(p);
        setStartDate(start);
        setEndDate(end);
    };

    return (
        <>
            <Card className="panel-surface border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-slate-900/50 animate-fade-in-down card-hover-scale">
                <CardHeader className="pb-2.5 border-b border-slate-200 dark:border-purple-500/25">
                    <CardTitle className="flex items-center gap-2 text-sm text-foreground dark:text-white/95 animate-fade-in">
                        <Calendar className="h-4 w-4 text-primary" />
                        Pengaturan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-3 stagger-children">

                    {/* Date Quick Presets */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <label className="micro-label">Quick Range</label>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {DATE_PRESETS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => applyPreset(p)}
                                    className={cn(
                                        'rounded-md px-2 py-1 text-[10px] font-semibold',
                                        'border border-border/60 bg-background text-muted-foreground',
                                        'hover:border-primary/50 hover:text-primary hover:bg-primary/5',
                                        'active:scale-95 transition-all duration-100',
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="micro-label">Start</label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="micro-label">End</label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 text-xs" />
                        </div>
                    </div>

                    {/* Interval + Sort — compact 2-col */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="micro-label">Interval</label>
                            <Tabs value={interval} onValueChange={setInterval} className="w-full">
                                <TabsList className="w-full h-7">
                                    {INTERVALS.map(int => (
                                        <TabsTrigger key={int.value} value={int.value} className="flex-1 text-[10px] h-6 px-1">
                                            {int.label.slice(0, 1)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="space-y-1">
                            <label className="micro-label">Sort</label>
                            <Tabs value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')} className="w-full">
                                <TabsList className="w-full h-7">
                                    <TabsTrigger value="asc" className="flex-1 text-[10px] h-6 px-1">↑ Old</TabsTrigger>
                                    <TabsTrigger value="desc" className="flex-1 text-[10px] h-6 px-1">↓ New</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Output Columns — compact */}
            <Card className="panel-surface border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-slate-900/50 animate-fade-in-left card-hover-scale">
                <CardHeader className="pb-2 border-b border-slate-200 dark:border-purple-500/25 animate-fade-in-down">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-foreground dark:text-white/95 animate-fade-in">Columns</CardTitle>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-6 text-[10px] px-2 btn-hover-lift dark:text-white/70 dark:hover:text-white">All</Button>
                            <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 text-[10px] px-2 btn-hover-lift dark:text-white/70 dark:hover:text-white">Clear</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 stagger-children">
                    <div className="flex gap-1 flex-wrap">
                        {PRESETS.map(p => (
                            <button
                                key={p.name}
                                onClick={() => onPresetSelect(p.name)}
                                className={cn(
                                    'rounded-md border border-border/60 px-2 py-0.5 text-[10px] font-medium',
                                    'text-muted-foreground bg-background',
                                    'hover:border-primary/40 hover:text-primary hover:bg-primary/5',
                                    'transition-all duration-100',
                                )}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-2">
                        {COLUMNS.map(col => (
                            <div key={col.key} className="flex items-center gap-1.5">
                                <Checkbox
                                    id={`col-${col.key}`}
                                    checked={selectedColumns.includes(col.key)}
                                    onCheckedChange={() => onColumnToggle(col.key)}
                                    disabled={col.required}
                                    className="h-3.5 w-3.5 rounded"
                                />
                                <label htmlFor={`col-${col.key}`} className="text-xs cursor-pointer select-none leading-none">
                                    {col.label}
                                    {col.required && <span className="ml-0.5 text-[8px] text-muted-foreground">*</span>}
                                </label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
