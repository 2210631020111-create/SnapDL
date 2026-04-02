'use client';

import { Link2, Sparkles, Users, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { parseSymbolList } from '@/lib/utils';
import type { RefObject } from 'react';
import type { AppMode, TickerResult } from '@/lib/types';

interface InputPanelProps {
    mode: AppMode;
    // Single mode
    yahooUrl: string; setYahooUrl: (v: string) => void;
    onParseUrl: () => void;
    tickerQuery: string;
    tickerResults: TickerResult[];
    tickerLoading: boolean;
    showTickerDropdown: boolean;
    onTickerQueryChange: (q: string) => void;
    onTickerSelect: (sym: string) => void;
    tickerDropdownRef: RefObject<HTMLDivElement>;
    // Bulk mode
    bulkSymbolsInput: string; setBulkSymbolsInput: (v: string) => void;
    bulkTickerQuery: string;
    bulkTickerResults: TickerResult[];
    bulkTickerLoading: boolean;
    showBulkTickerDropdown: boolean;
    onBulkTickerQueryChange: (q: string) => void;
    onBulkTickerSelect: (sym: string) => void;
    bulkTickerDropdownRef: RefObject<HTMLDivElement>;
    setShowBulkTickerDropdown: (v: boolean) => void;
    setShowTickerDropdown: (v: boolean) => void;
}

const dropdownClass = cn(
    'absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-border/80',
    'bg-popover text-popover-foreground',
    'shadow-[0_8px_32px_oklch(0_0_0_/_0.12)] dark:shadow-[0_8px_32px_oklch(0_0_0_/_0.4)]',
    'overflow-hidden animate-scale-in',
);

export function InputPanel({
    mode, yahooUrl, setYahooUrl, onParseUrl,
    tickerQuery, tickerResults, tickerLoading, showTickerDropdown,
    onTickerQueryChange, onTickerSelect, tickerDropdownRef,
    bulkSymbolsInput, setBulkSymbolsInput,
    bulkTickerQuery, bulkTickerResults, bulkTickerLoading,
    showBulkTickerDropdown, onBulkTickerQueryChange, onBulkTickerSelect,
    bulkTickerDropdownRef, setShowBulkTickerDropdown, setShowTickerDropdown,
}: InputPanelProps) {

    const symbolList = parseSymbolList(bulkSymbolsInput);
    const symbolCount = symbolList.length;

    const removeBulkSymbol = (symToRemove: string) => {
        const newList = parseSymbolList(bulkSymbolsInput).filter(sym => sym !== symToRemove);
        setBulkSymbolsInput(newList.join('\n'));
    };

    const ASEAN_SUFFIXES = [
        { suffix: '.JK', name: 'Indonesia' },
        { suffix: '.KL', name: 'Malaysia' },
        { suffix: '.SI', name: 'Singapore' },
        { suffix: '.BK', name: 'Thailand' },
        { suffix: '.VN', name: 'Vietnam' },
    ];

    return (
        <div className="space-y-4">
            {mode === 'single' ? (
                <Card className="panel-surface border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-slate-900/50 shadow-md animate-fade-in-left card-hover-scale">
                    <CardHeader className="pb-2.5 border-b border-slate-200 dark:border-purple-500/20">
                        <CardTitle className="flex items-center gap-2 text-sm text-foreground animate-fade-in-down">
                            <Sparkles className="h-4 w-4" />
                            Input Sumber Data
                        </CardTitle>
                        <CardDescription className="text-xs animate-fade-in">Dari mana data akan diambil</CardDescription>
                    </CardHeader>
                    <CardContent className="relative overflow-visible pt-3 space-y-3">
                        {/* URL Paste */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">URL Yahoo Finance</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    <Input
                                        placeholder="https://finance.yahoo.com/quote..."
                                        value={yahooUrl} onChange={(e) => setYahooUrl(e.target.value)}
                                        className="pl-9 h-9 text-xs border-slate-200 dark:border-purple-500/30 bg-white dark:bg-slate-900/50 focus-visible:ring-primary/30"
                                    />
                                </div>
                                <Button onClick={onParseUrl} variant="secondary" className="h-9 px-4 shrink-0 shadow-sm text-xs font-semibold">
                                    Parse
                                </Button>
                            </div>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60" /></div>
                            <div className="relative flex justify-center text-[10px] font-bold uppercase"><span className="bg-card px-2 text-muted-foreground/60">atau</span></div>
                        </div>

                        {/* Search + Suffix */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Search Ticker</label>
                            <div className="relative" ref={tickerDropdownRef}>
                                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Cari emiten (e.g. BBCA, AAPL)..."
                                    value={tickerQuery}
                                    onChange={(e) => onTickerQueryChange(e.target.value)}
                                    onFocus={() => { if (tickerResults.length > 0) setShowTickerDropdown(true); }}
                                    className="pl-9 h-9 text-xs border-primary/20 bg-background focus-visible:ring-primary/30"
                                    autoComplete="off"
                                />
                                {tickerLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                )}
                                {showTickerDropdown && tickerResults.length > 0 && (
                                    <div className={dropdownClass}>
                                        <div className="max-h-56 overflow-y-auto py-1">
                                            {tickerResults.map((r) => (
                                                <button
                                                    key={r.symbol} type="button"
                                                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors"
                                                    onMouseDown={(e) => { e.preventDefault(); onTickerSelect(r.symbol); }}
                                                >
                                                    <span className="font-mono text-sm font-semibold text-primary min-w-[70px]">{r.symbol}</span>
                                                    <span className="flex-1 truncate text-xs text-foreground/80">{r.name}</span>
                                                    <Badge variant="outline" className="text-[9px] px-1 shrink-0">{r.exchange}</Badge>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-1">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase flex gap-1 items-center mb-1.5">
                                    Asean Suffix Presets
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {ASEAN_SUFFIXES.map(s => (
                                        <button
                                            key={s.suffix}
                                            onClick={() => onTickerQueryChange(tickerQuery ? tickerQuery + s.suffix : s.suffix)}
                                            className="group flex flex-col items-center justify-center rounded-md border border-border/50 bg-background px-2 py-1 hover:border-primary/40 hover:bg-primary/5 cursor-pointer active:scale-95 transition-all w-[52px]"
                                            title={s.name}
                                        >
                                            <span className="font-mono text-[10px] font-bold text-foreground/80 group-hover:text-primary">{s.suffix}</span>
                                            <span className="text-[8px] text-muted-foreground leading-none mt-0.5">{s.name.slice(0, 3).toUpperCase()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="panel-surface border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-slate-900/50 shadow-md animate-fade-in-right card-hover-scale">
                    <CardHeader className="pb-2.5 border-b border-slate-200 dark:border-purple-500/20">
                        <CardTitle className="flex items-center justify-between text-sm text-foreground animate-fade-in-down">
                            <div className="flex gap-2 items-center">
                                <Users className="h-4 w-4" />
                                Bulk Symbols
                            </div>
                            {symbolCount > 0 && (
                                <div className="flex items-center gap-1.5 bg-primary/10 rounded-full pl-1.5 pr-2.5 py-0.5 animate-in fade-in zoom-in duration-200">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
                                    <span className="text-[10px] font-bold text-primary">
                                        {symbolCount} Tickers
                                    </span>
                                </div>
                            )}
                        </CardTitle>
                        <CardDescription className="text-xs animate-fade-in">Visual input untuk list symbol jamak</CardDescription>
                    </CardHeader>
                    <CardContent className="relative overflow-visible pt-3 space-y-3">
                        {/* Search Box Bulk */}
                        <div className="relative" ref={bulkTickerDropdownRef}>
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Cari ticker & klik untuk menambah..."
                                value={bulkTickerQuery}
                                onChange={(e) => onBulkTickerQueryChange(e.target.value)}
                                onFocus={() => { if (bulkTickerResults.length > 0) setShowBulkTickerDropdown(true); }}
                                className="pl-9 h-9 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus-visible:ring-primary/20"
                                autoComplete="off"
                            />
                            {bulkTickerLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            )}
                            {showBulkTickerDropdown && bulkTickerResults.length > 0 && (
                                <div className={dropdownClass}>
                                    <div className="max-h-56 overflow-y-auto py-1">
                                        {bulkTickerResults.map((r) => (
                                            <button
                                                key={r.symbol}
                                                type="button"
                                                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors"
                                                onMouseDown={(e) => { e.preventDefault(); onBulkTickerSelect(r.symbol); }}
                                            >
                                                <span className="font-mono text-sm font-semibold text-primary min-w-[70px]">{r.symbol}</span>
                                                <span className="flex-1 truncate text-xs text-foreground/80">{r.name}</span>
                                                <Badge variant="outline" className="text-[9px] px-1 shrink-0">{r.exchange}</Badge>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Visual Chips + Invisible Textarea Layering */}
                        <div className="relative rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all min-h-[140px] flex flex-col">

                            {/* Visual Chips Layer */}
                            <div className="p-2 gap-1.5 flex flex-wrap content-start">
                                {symbolList.map(sym => (
                                    <div key={sym} className="flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 pl-2 pr-1 py-1 group animate-scale-in">
                                        <span className="font-mono text-[10px] font-bold text-primary">{sym}</span>
                                        <button
                                            onClick={() => removeBulkSymbol(sym)}
                                            className="rounded-full p-0.5 hover:bg-destructive text-muted-foreground hover:text-white transition-colors ml-0.5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* User Input Layer (Invisible text area that stretches to fill remaining space) */}
                            <Textarea
                                value={bulkSymbolsInput}
                                onChange={(e) => setBulkSymbolsInput(e.target.value)}
                                className="flex-1 w-full bg-transparent border-none rounded-none focus-visible:ring-0 resize-none font-mono text-xs px-3 py-2 text-muted-foreground leading-relaxed min-h-[60px]"
                                placeholder={symbolList.length === 0 ? "Atau paste list symbol / data Excel ke sini...\nBBCA.JK\nAAPL\nMSFT" : "Paste lebih banyak disini..."}
                            />
                        </div>

                        {/* Quick Suffixes Block for Bulk */}
                        <div className="pt-0.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase flex gap-1 items-center mb-1.5">
                                Append Suffix to selected
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {ASEAN_SUFFIXES.map(s => (
                                    <button
                                        key={s.suffix}
                                        onClick={() => {
                                            // Adds suffix to the currently typed line, or just appends
                                            const curr = bulkSymbolsInput;
                                            setBulkSymbolsInput(curr ? curr.trim() + s.suffix + '\n' : s.suffix + '\n');
                                        }}
                                        className="rounded px-1.5 py-0.5 border border-border/50 text-[9px] font-mono text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors bg-background"
                                        title={s.name}
                                    >
                                        +{s.suffix}
                                    </button>
                                ))}
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-5 px-1.5 text-[9px] text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                                    onClick={() => setBulkSymbolsInput('')}
                                >
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
