'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SnapDlLogo } from '@/components/SnapDlLogo';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/finance', label: 'Finance' },
];

export function SiteTopbar() {
  const pathname = usePathname();
  const normalizedPath = pathname?.replace(/\/+$/, '') || '/';
  const shouldShowTopbar = normalizedPath === '/' || normalizedPath === '/finance';

  if (!shouldShowTopbar) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
          <SnapDlLogo size="sm" withTagline className="scale-[0.75] origin-left" />
        </Link>

        <nav className="flex flex-1 items-center gap-2 overflow-x-auto rounded-full border border-slate-200/70 bg-white/70 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
          {navItems.map((item) => {
            const active = item.href === '/' ? normalizedPath === '/' : normalizedPath === '/finance';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

      </div>
    </header>
  );
}