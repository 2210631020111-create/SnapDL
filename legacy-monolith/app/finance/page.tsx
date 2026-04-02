import Link from 'next/link';
import { ArrowRight, BookOpenText, FileText, Layers, Sparkles } from 'lucide-react';
import { SnapDlLogo } from '@/components/SnapDlLogo';

const modeCards = [
  {
    title: 'Single Mode',
    description: 'Download historical data untuk satu ticker dengan kontrol detail kolom.',
    href: '/finance/single',
    icon: FileText,
    accent: 'from-blue-500 to-indigo-500',
    badge: 'Akurat & detail',
  },
  {
    title: 'Bulk Mode',
    description: 'Proses banyak ticker sekaligus untuk workflow data dalam skala besar.',
    href: '/finance/bulk',
    icon: Layers,
    accent: 'from-violet-500 to-fuchsia-500',
    badge: 'Skala besar',
  },
  {
    title: 'Lite Mode',
    description: 'Flow step-by-step untuk eksekusi cepat tanpa konfigurasi yang rumit.',
    href: '/finance/lite',
    icon: Sparkles,
    accent: 'from-cyan-500 to-blue-500',
    badge: 'Paling cepat',
  },
  {
    title: 'Panduan',
    description: 'Referensi lengkap untuk memahami seluruh mode dan best-practice penggunaannya.',
    href: '/finance/panduan',
    icon: BookOpenText,
    accent: 'from-amber-500 to-orange-500',
    badge: 'Belajar cepat',
  },
];

const pillars = [
  { title: 'Input', text: 'Ticker valid, rentang tanggal jelas, dan parameter yang konsisten.' },
  { title: 'Preview', text: 'Cek data sebelum download untuk menghindari kesalahan analisis.' },
  { title: 'Export', text: 'Unduh hasil ke format yang paling cocok untuk kebutuhan kerja.' },
];

export default function FinanceIndexPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-slate-950 transition-colors dark:text-slate-50 sm:px-6 bg-[radial-gradient(circle_at_12%_18%,rgba(112,176,255,0.30),transparent_26%),radial-gradient(circle_at_88%_10%,rgba(159,108,255,0.28),transparent_22%),radial-gradient(circle_at_52%_86%,rgba(250,153,87,0.14),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef3ff_48%,#e7ecff_100%)] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(35,93,173,0.42),transparent_26%),radial-gradient(circle_at_88%_10%,rgba(104,53,165,0.34),transparent_22%),radial-gradient(circle_at_52%_86%,rgba(200,88,37,0.14),transparent_24%),linear-gradient(180deg,#08111f_0%,#0c1121_44%,#120a1a_100%)]">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] border border-white/70 bg-white/74 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/44 md:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Finance Workspace</p>
            <SnapDlLogo size="lg" withTagline className="max-w-[740px]" />
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Pilih mode sesuai kebutuhan data kamu. Semua mode dirancang untuk alur profesional dari input, preview, sampai export.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/finance/single" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25">
              Mulai Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200/80 bg-white/84 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
        {modeCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-3xl border border-white/70 bg-white/74 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-slate-950/42"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`inline-flex rounded-2xl bg-gradient-to-r p-3 text-white shadow-lg ${card.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  {card.badge}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>

              <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Buka mode
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}