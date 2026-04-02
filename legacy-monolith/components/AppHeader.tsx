'use client';

import { FileText, Layers, Moon, Sun, Loader2, BookOpenText, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useLayoutEffect } from 'react';
import type { AppMode } from '@/lib/types';
import { SnapDlLogo } from '@/components/SnapDlLogo';

type AppStatus = 'ready' | 'fetching' | 'market_open';

interface AppHeaderProps {
    mode: AppMode;
    onModeChange: (mode: AppMode) => void;
    status?: AppStatus;
}

export function AppHeader({ mode, onModeChange, status = 'ready' }: AppHeaderProps) {
    const [isDark, setIsDark] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
        setIsDark(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
    }, []);

    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    const statusConfig = {
        ready: { label: 'Ready', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
        fetching: { label: 'Fetching...', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
        market_open: { label: 'Market Open', color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    };

    const sc = statusConfig[status];

    return (
        <header className={cn('sticky top-2 z-40 px-4 sm:px-6')}>
            <div className={cn(
                'mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/92 p-2 shadow-[0_16px_50px_rgba(15,23,42,0.12)]',
                'dark:border-white/10 dark:bg-slate-950/60',
            )}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="hidden md:flex items-center rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <SnapDlLogo size="sm" withTagline={false} className="scale-90 origin-left" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <Tabs value={mode} onValueChange={(v) => onModeChange(v as AppMode)}>
                            <TabsList className="h-10 w-full justify-start gap-1 rounded-xl bg-slate-100/90 p-1 dark:bg-white/5 overflow-x-auto">
                                <TabsTrigger value="single" className="gap-1.5 h-8 px-3 text-xs font-semibold whitespace-nowrap">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>Single</span>
                                </TabsTrigger>
                                <TabsTrigger value="bulk" className="gap-1.5 h-8 px-3 text-xs font-semibold whitespace-nowrap">
                                    <Layers className="h-3.5 w-3.5" />
                                    <span>Bulk</span>
                                </TabsTrigger>
                                <TabsTrigger value="lite" className="gap-1.5 h-8 px-3 text-xs font-semibold whitespace-nowrap">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Lite</span>
                                </TabsTrigger>
                                <TabsTrigger value="guide" className="gap-1.5 h-8 px-3 text-xs font-semibold whitespace-nowrap">
                                    <BookOpenText className="h-3.5 w-3.5" />
                                    <span>Panduan</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <div className={cn(
                            'hidden lg:flex items-center gap-1.5 rounded-full px-2.5 py-1',
                            'bg-muted/50 border border-border/50',
                        )}>
                            <div className="relative flex h-2 w-2">
                                <span className={cn(
                                    'absolute inline-flex h-full w-full rounded-full opacity-75',
                                    sc.color,
                                    status === 'fetching' ? 'animate-ping' : '',
                                )} />
                                <span className={cn('relative inline-flex rounded-full h-2 w-2', sc.color)} />
                            </div>
                            <span className={cn('text-[11px] font-medium', sc.textColor)}>
                                {status === 'fetching' && <Loader2 className="inline h-2.5 w-2.5 animate-spin mr-1" />}
                                {sc.label}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={toggleTheme}
                            className="shrink-0 rounded-lg btn-hover-lift transition-all duration-300"
                            aria-label="Toggle theme"
                        >
                            {isDark
                                ? <Sun className="h-3.5 w-3.5 text-muted-foreground hover:text-yellow-500 transition-colors duration-300" />
                                : <Moon className="h-3.5 w-3.5 text-muted-foreground hover:text-blue-500 transition-colors duration-300" />
                            }
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
