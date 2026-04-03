"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FETCH_ERROR_GUIDE } from "@/lib/utils";
import { BookOpenText, FileText, Layers, MousePointerClick, Zap } from "lucide-react";

interface GuidePanelProps {
  onSelectMode?: (mode: "single" | "bulk" | "lite") => void;
}

const quickGuide = [
  {
    title: "Pilih Mode",
    desc: "Single untuk satu ticker, Bulk untuk banyak ticker, Lite untuk panduan langkah.",
  },
  {
    title: "Atur Data",
    desc: "Tentukan rentang tanggal, interval, dan kolom output.",
  },
  {
    title: "Pratinjau dan Ekspor",
    desc: "Tinjau hasil terlebih dahulu, lalu unduh sesuai format.",
  },
];

const singleSteps = [
  "Masukkan ticker atau tempel URL Yahoo Finance.",
  "Tentukan tanggal, interval, dan urutan sortir.",
  "Pilih kolom yang diperlukan.",
  "Lakukan pratinjau data, kemudian unduh.",
];

const bulkSteps = [
  "Tempel daftar ticker atau tambahkan melalui pencarian.",
  "Tentukan rentang tanggal dan interval.",
  "Lakukan pratinjau untuk meninjau hasil.",
  "Ekspor data ke format CSV/JSON/XLSX.",
];

const liteSteps = [
  "Ikuti panduan 5 langkah yang ringkas.",
  "Pilih satu atau banyak ticker.",
  "Isi tanggal dan event window (opsional).",
  "Lakukan pratinjau dan unduh langsung.",
];

export function GuidePanel({ onSelectMode }: GuidePanelProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="border-border/60 bg-white/90 dark:bg-slate-950/60 shadow-sm">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit gap-2 text-[11px]">
            <BookOpenText className="h-3.5 w-3.5" />
            Panduan Singkat
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl font-semibold">Panduan YFinance Pro</CardTitle>
          <CardDescription className="text-sm leading-relaxed max-w-2xl">
            Ringkasan alur untuk memilih mode, mengambil data, dan mengekspor hasil dengan rapi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {quickGuide.map((item) => (
              <div key={item.title} className="rounded-xl border border-border/60 bg-background/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.title}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onSelectMode?.("lite")} className="gap-2">
              <Zap className="h-4 w-4" /> Mode Lite
            </Button>
            <Button size="sm" onClick={() => onSelectMode?.("single")} variant="outline">
              Mode Single
            </Button>
            <Button size="sm" onClick={() => onSelectMode?.("bulk")} variant="outline">
              Mode Bulk
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-white/90 dark:bg-slate-950/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Mode Lite</CardTitle>
                <CardDescription className="text-xs">Panduan terstruktur untuk hasil instan.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2 text-xs text-foreground/80">
              {liteSteps.map((step, idx) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <Button size="sm" className="w-full gap-2" onClick={() => onSelectMode?.("lite")}>
              <Zap className="h-4 w-4" /> Buka Mode Lite
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/90 dark:bg-slate-950/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Mode Single</CardTitle>
                <CardDescription className="text-xs">Kendali penuh untuk satu ticker.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2 text-xs text-foreground/80">
              {singleSteps.map((step, idx) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => onSelectMode?.("single")}>
              <MousePointerClick className="h-4 w-4" /> Buka Mode Single
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/90 dark:bg-slate-950/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Mode Bulk</CardTitle>
                <CardDescription className="text-xs">Pemrosesan banyak ticker untuk hasil massal.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2 text-xs text-foreground/80">
              {bulkSteps.map((step, idx) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => onSelectMode?.("bulk")}>
              <Layers className="h-4 w-4" /> Buka Mode Bulk
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-white/90 dark:bg-slate-950/60">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit text-[11px]">Panduan Kode Error</Badge>
          <CardTitle className="text-lg font-semibold">Referensi Penanganan Error</CardTitle>
          <CardDescription className="text-sm leading-relaxed max-w-2xl">
            Ringkasan kategori error yang umum beserta saran tindakan perbaikan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {FETCH_ERROR_GUIDE.map((item) => (
              <div key={item.category} className="rounded-xl border border-border/60 bg-background/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Kategori</p>
                  <Badge variant="outline" className="text-[10px]">
                    {item.category}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{item.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
