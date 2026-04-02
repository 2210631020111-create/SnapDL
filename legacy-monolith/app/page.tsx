import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building2, ShieldCheck, Workflow } from 'lucide-react';
import { SnapDlLogo } from '@/components/SnapDlLogo';

const highlights = [
  {
    title: 'Data workflow yang rapi',
    description: 'Dari input ticker sampai export file, semua langkah dibuat jelas dan konsisten.',
    icon: Workflow,
  },
  {
    title: 'Siap untuk riset',
    description: 'Cocok untuk analisis historis, event window, dan kebutuhan data market harian.',
    icon: Building2,
  },
  {
    title: 'Hasil yang bisa dipercaya',
    description: 'Output terstruktur untuk CSV, JSON, dan XLSX tanpa proses manual berulang.',
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 text-slate-950 transition-colors dark:text-slate-50 sm:px-6 bg-[radial-gradient(circle_at_10%_14%,rgba(116,175,255,0.30),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(164,120,255,0.26),transparent_24%),radial-gradient(circle_at_50%_88%,rgba(255,157,111,0.16),transparent_28%),linear-gradient(180deg,#f9fbff_0%,#edf2ff_44%,#e8edff_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(42,99,179,0.42),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(103,58,170,0.34),transparent_24%),radial-gradient(circle_at_50%_88%,rgba(185,88,49,0.16),transparent_28%),linear-gradient(180deg,#091224_0%,#0d1223_44%,#140d1d_100%)]">
      <section className="mx-auto grid max-w-6xl gap-6 rounded-[2rem] border border-white/70 bg-white/74 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/44 md:grid-cols-[1.2fr_0.8fr] md:p-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            Brand Identity
          </div>

          <SnapDlLogo size="lg" withTagline className="max-w-[680px]" />

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Beranda profesional untuk akses data Yahoo Finance</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Beranda ini sengaja dibuat fokus: satu pintu masuk ke halaman finance agar alur kerja tetap cepat, bersih, dan konsisten.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/finance"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25"
            >
              Masuk ke Finance
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Satu arah: /finance
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Kenapa layout ini dipakai</p>
          <div className="mt-4 space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/70">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 p-2 text-white shadow-md shadow-blue-500/20">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}