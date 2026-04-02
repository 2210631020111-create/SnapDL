"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, FETCH_ERROR_GUIDE } from "@/lib/utils";
import { BookOpenText, CheckCircle2, Layers, MousePointerClick, Sparkles, FileText, Zap } from "lucide-react";

interface GuidePanelProps {
  onSelectMode?: (mode: "single" | "bulk" | "lite") => void;
}

interface TutorialShotProps {
  title: string;
  subtitle: string;
  highlights: { label: string; description: string }[];
  accent?: "single" | "bulk" | "lite";
}

function TutorialShot({ title, subtitle, highlights, accent = "single" }: TutorialShotProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.1),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.1),transparent_40%)]" />
      <div className="relative p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              accent === "single" ? "bg-blue-500" : accent === "bulk" ? "bg-amber-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
            )}
          />
          <span>{title}</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{subtitle}</p>
        <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 flex-1 rounded-md bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
            <div className="h-8 w-16 rounded-md bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
            <div className="h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
            <div className="h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2">
            <span className="text-[11px] font-medium text-muted-foreground">Preview table</span>
            <span className="text-[11px] font-semibold text-primary">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
            >
              <p className="text-[12px] font-semibold text-foreground">{item.label}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const singleSteps = [
  "Pilih tab Single (atas).", 
  "Masukkan simbol atau paste URL Yahoo Finance, lalu klik Parse URL untuk otomatis membaca ticker & tanggal.",
  "Atur rentang tanggal, interval, dan urutan sort." ,
  "Pilih kolom yang ingin diunduh (Columns).", 
  "Klik Fetch Preview untuk melihat data sebelum diunduh.",
  "Gunakan Export untuk simpan sebagai CSV/JSON/XLSX." 
];

const bulkSteps = [
  "Pilih tab Bulk.",
  "Tempel daftar ticker (satu per baris) atau cari via pencarian ticker bulk.",
  "Atur rentang tanggal & interval, lalu klik Fetch Preview.",
  "Gunakan filter Symbol untuk melihat hasil per ticker.",
  "Cek Event Window & Corporate Actions jika perlu.",
  "Download dengan Export CSV/JSON/XLSX (header opsional)."
];

const liteSteps = [
  "Pilih tab Lite Mode untuk pengalaman cepat dan intuitif.",
  "Ikuti wizard 5 langkah: pilih Single/Bulk → ticker → tanggal → event window (opsional) → preview & download.",
  "Pada step 1, pilih antara Single (1 ticker) atau Multiple (banyak ticker) companies.",
  "Step 2: Cari dan pilih ticker dari dropdown yang auto-verified.",
  "Step 3: Tentukan rentang tanggal start dan end untuk data historis.",
  "Step 4: Tambahkan Event Window (opsional) untuk analisa aksi korporasi.",
  "Step 5: Review summary data dan klik 'Fetch now' untuk mendapatkan hasil.",
  "Format & download: Pilih CSV/JSON/XLSX lalu klik Download button."
];

export function GuidePanel({ onSelectMode }: GuidePanelProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <Badge variant="outline" className="w-fit gap-2 text-[11px]">
            <BookOpenText className="h-3.5 w-3.5" />
            Panduan Lengkap
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Cara Pakai YFinance Pro</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Pilih mode yang sesuai kebutuhan Anda untuk mengunduh data historis saham dengan mudah dan cepat.
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-3">
            <Button size="sm" onClick={() => onSelectMode?.("lite")} className="gap-2">
              <Zap className="h-4 w-4" /> Mulai dengan Lite Mode
            </Button>
            <Button size="sm" onClick={() => onSelectMode?.("single")} variant="outline">
              Single Mode
            </Button>
            <Button size="sm" onClick={() => onSelectMode?.("bulk")} variant="outline">
              Bulk Mode
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LITE MODE CARD */}
        <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md lg:col-span-1">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="gap-1 text-[11px] bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Zap className="h-3.5 w-3.5" />
                Lite Mode (Baru!)
              </Badge>
            </div>
            <CardTitle className="text-lg">Cara tercepat & termudah</CardTitle>
            <CardDescription>Wizard 5 langkah untuk fetch data dalam hitungan detik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <TutorialShot
              title="Lite workflow"
              subtitle="Pilih mode → ticker → tanggal → event window → download. Selesai!"
              accent="lite"
              highlights={[
                { label: "Guided wizard", description: "5 langkah intuitif dari A sampai Z." },
                { label: "Auto verification", description: "Ticker auto-verified dari database." },
                { label: "Event window", description: "Cek aksi korporasi di sekitar tanggal." },
                { label: "Instant export", description: "Download langsung tanpa konfigurasi kompleks." },
              ]}
            />
            <Separator className="my-2" />
            <ol className="space-y-1.5 text-xs text-foreground/90 list-decimal list-inside">
              {liteSteps.map((s) => (
                <li key={s} className="leading-relaxed">{s}</li>
              ))}
            </ol>
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" onClick={() => onSelectMode?.("lite")}>
                <Zap className="h-4 w-4" /> Coba Lite Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:col-span-2 gap-4">
          {/* SINGLE MODE CARD */}
          <Card className="border-blue-200 dark:border-blue-800/50">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 text-[11px]">
                  <FileText className="h-3.5 w-3.5" />
                  Single Mode
                </Badge>
              </div>
              <CardTitle className="text-lg">Download satu ticker</CardTitle>
              <CardDescription>Ambil data historis dengan kontrol penuh atas kolom dan format.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <TutorialShot
                title="Single workflow"
                subtitle="Paste URL atau ketik simbol, atur kolom & tanggal, preview & export."
                accent="single"
                highlights={[
                  { label: "URL parsing", description: "Parse Yahoo Finance URL otomatis." },
                  { label: "Custom columns", description: "Pilih kolom sesuai kebutuhan." },
                  { label: "Preview live", description: "Lihat data sebelum diunduh." },
                  { label: "Multiple format", description: "Export CSV / JSON / XLSX." },
                ]}
              />
              <Separator className="my-2" />
              <ol className="space-y-1.5 text-xs text-foreground/90 list-decimal list-inside">
                {singleSteps.map((s) => (
                  <li key={s} className="leading-relaxed">{s}</li>
                ))}
              </ol>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold" onClick={() => onSelectMode?.("single")}>
                  <MousePointerClick className="h-4 w-4" /> Coba Single Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* BULK MODE CARD */}
          <Card className="border-amber-200 dark:border-amber-800/50">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="gap-1 text-[11px] bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-100">
                  <Layers className="h-3.5 w-3.5" />
                  Bulk Mode
                </Badge>
              </div>
              <CardTitle className="text-lg">Ambil banyak ticker</CardTitle>
              <CardDescription>Tempel list ticker dan export semua data dalam satu file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <TutorialShot
                title="Bulk workflow"
                subtitle="Tempel list → fetch → filter per simbol → export massal."
                accent="bulk"
                highlights={[
                  { label: "Batch input", description: "Satu per baris atau via search." },
                  { label: "Filter simbol", description: "Lihat hasil per ticker." },
                  { label: "Corporate actions", description: "Tracking dividend & split." },
                  { label: "Export massal", description: "Semua data dalam satu file." },
                ]}
              />
              <Separator className="my-2" />
              <ol className="space-y-1.5 text-xs text-foreground/90 list-decimal list-inside">
                {bulkSteps.map((s) => (
                  <li key={s} className="leading-relaxed">{s}</li>
                ))}
              </ol>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold" onClick={() => onSelectMode?.("bulk")}>
                  <Sparkles className="h-4 w-4" /> Coba Bulk Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit text-[11px]">Tipsnya</Badge>
          <CardTitle className="text-lg">Pro tips untuk hasil maksimal</CardTitle>
          <CardDescription className="text-sm">Gunakan tips ini agar fetch data selalu sukses tanpa error.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm text-foreground/90">
          {[ 
            { title: "Format ticker valid", desc: "Gunakan ticker standar: AAPL, BBCA.JK, ^JKSE. Hindari spasi atau karakter khusus." },
            { title: "Rentang tanggal logis", desc: "Tanggal mulai harus SEBELUM tanggal akhir. Cek tahun dengan tepat." },
            { title: "Columns pilihan", desc: "Minimal gunakan date + close. Hapus kolom tidak perlu agar file lebih ringan." },
            { title: "Bulk error handling", desc: "Jika ada ticker gagal, lihat daftar error lalu cek format ticker di list." },
            { title: "Event window expert", desc: "Isi Event Date untuk analisa impact dividend/split dalam window ± hari." },
            { title: "Header optional", desc: "Matikan Include Headers jika perlu raw data. Sangat berguna untuk machine learning." },
          ].map((tip) => (
            <div key={tip.title} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
              <p className="font-semibold text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />{tip.title}</p>
              <p className="text-[12px] text-muted-foreground mt-2 leading-snug">{tip.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/30 dark:border-destructive/20">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit text-[11px] text-destructive">Error handling</Badge>
          <CardTitle className="text-lg">Kategori error & solusinya</CardTitle>
          <CardDescription className="text-sm">Kenali error yang mungkin terjadi dan cara mengatasinya dengan cepat.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {FETCH_ERROR_GUIDE.map((error) => (
            <div key={error.category} className="rounded-lg border border-destructive/30 dark:border-destructive/20 bg-destructive/5 dark:bg-destructive/10 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-destructive">{error.category}</p>
              <p className="text-sm font-semibold text-foreground mt-1.5">{error.summary}</p>
              <p className="text-[11px] text-foreground/70 mt-2 leading-snug">{error.suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
