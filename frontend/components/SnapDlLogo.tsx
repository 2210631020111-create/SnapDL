import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

interface SnapDlLogoProps {
  size?: LogoSize;
  withTagline?: boolean;
  className?: string;
}

const wordmarkSizeMap: Record<LogoSize, string> = {
  sm: 'text-2xl sm:text-3xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-5xl sm:text-6xl',
};

const taglineSizeMap: Record<LogoSize, string> = {
  sm: 'text-[10px] sm:text-[11px]',
  md: 'text-xs sm:text-sm',
  lg: 'text-sm sm:text-xl',
};

export function SnapDlLogo({ size = 'md', withTagline = true, className }: SnapDlLogoProps) {
  return (
    <div className={cn('leading-none', className)}>
      <p
        className={cn(
          'select-none font-black italic tracking-[-0.04em]',
          wordmarkSizeMap[size],
        )}
        aria-label="SnapDL"
      >
        <span className="text-[#0b4ea2]">Snap</span>
        <span className="text-[#ff9f1c]">DL</span>
      </p>

      {withTagline ? (
        <p className={cn('mt-1 font-semibold tracking-tight text-[#0b4ea2] dark:text-blue-300', taglineSizeMap[size])}>
          Your Universal Multi-Platform Downloader
        </p>
      ) : null}
    </div>
  );
}