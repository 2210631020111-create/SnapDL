import { notFound } from 'next/navigation';
import FinanceDownloaderApp from '@/components/FinanceDownloaderApp';

const VALID_MODES = new Set(['single', 'bulk', 'lite', 'panduan']);

interface FinanceModePageProps {
  params: Promise<{ mode: string }>;
}

export default async function FinanceModePage({ params }: FinanceModePageProps) {
  const { mode } = await params;

  if (!VALID_MODES.has(mode)) {
    notFound();
  }

  return <FinanceDownloaderApp />;
}
