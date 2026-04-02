'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  Settings2,
  Code2,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
} from 'lucide-react';

interface AdvancedPanelProps {
  onSelectMode?: (mode: 'single' | 'bulk') => void;
}

export function AdvancedPanel({ onSelectMode }: AdvancedPanelProps) {
  const features = [
    {
      icon: Code2,
      title: 'API Integration',
      description: 'Integrasikan YFinance Pro dengan aplikasi Anda menggunakan REST API dengan authentication.',
      code: 'curl -X GET "http://api.yfinance.local/v1/quote?symbol=AAPL" -H "Authorization: Bearer TOKEN"',
    },
    {
      icon: Database,
      title: 'Custom Data Export',
      description: 'Export ke format custom dengan field mapping, formula, atau aggregation real-time.',
      code: 'POST /api/export\n{\n  "symbols": ["AAPL", "GOOGL"],\n  "format": "parquet",\n  "aggregation": "daily"\n}',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Streaming',
      description: 'Stream data harga real-time dengan WebSocket untuk monitoring live.',
      code: 'ws://api.yfinance.local/v1/stream?symbols=AAPL,GOOGL&interval=1s',
    },
    {
      icon: Settings2,
      title: 'Automated Scheduling',
      description: 'Schedule fetch otomatis daily, weekly, atau custom cron expression.',
      code: 'FREQ=DAILY;BYHOUR=09,15;BYMINUTE=00',
    },
  ];

  const advancedTips = [
    {
      title: 'Batch Processing',
      desc: '10,000+ ticker dalam satu fetch menggunakan distributed processing.',
    },
    {
      title: 'Data Caching',
      desc: 'Cache layer untuk response cepat dan reduce API calls ke Yahoo Finance.',
    },
    {
      title: 'Error Recovery',
      desc: 'Retry logic otomatis dengan exponential backoff untuk network resilience.',
    },
    {
      title: 'Performance Tuning',
      desc: 'Fine-tune memory, CPU allocation per worker untuk optimal throughput.',
    },
    {
      title: 'Custom Indicators',
      desc: 'Build SMA, EMA, RSI, MACD, Bollinger Bands di API layer langsung.',
    },
    {
      title: 'Webhook Notifications',
      desc: 'Trigger webhook saat fetch selesai atau ketika kondisi tertentu terpenuhi.',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <Card className="border-primary/15 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <Badge variant="outline" className="w-fit gap-2 text-[11px]">
            <Zap className="h-3.5 w-3.5" />
            Advanced Mode
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl">Fitur Lanjutan</CardTitle>
          <CardDescription className="text-sm leading-relaxed max-w-2xl">
            Buka kemampuan penuh YFinance Pro dengan API integration, custom export, real-time streaming, dan automation workflow.
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-3">
            <Button size="sm" onClick={() => onSelectMode?.('single')}>
              Kembali ke Single
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSelectMode?.('bulk')}>
              Kembali ke Bulk
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="border-border/60 overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{feature.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 text-[11px] p-3 rounded-lg overflow-x-auto border border-slate-700">
                    {feature.code}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-7 w-7 p-0"
                    onClick={() => navigator.clipboard.writeText(feature.code)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Advanced Tips */}
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit text-[11px]">
            Advanced Tips
          </Badge>
          <CardTitle className="text-lg">Optimasi performa & skalabilitas</CardTitle>
          <CardDescription className="text-sm">
            Gunakan tips ini untuk mendapatkan performa maksimal saat processing data skala besar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm text-foreground/90">
          {advancedTips.map((tip) => (
            <div key={tip.title} className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {tip.title}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{tip.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit text-[11px]">
            Documentation
          </Badge>
          <CardTitle className="text-lg">Setup & Deploy</CardTitle>
          <CardDescription className="text-sm">
            Follow dokumentasi lengkap untuk setup advanced features di lingkungan lokal atau cloud.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2 justify-start">
              <Code2 className="h-4 w-4" />
              API Documentation
            </Button>
            <Button variant="outline" className="gap-2 justify-start">
              <Download className="h-4 w-4" />
              Download SDK
            </Button>
            <Button variant="outline" className="gap-2 justify-start">
              <Database className="h-4 w-4" />
              Database Setup
            </Button>
            <Button variant="outline" className="gap-2 justify-start">
              <Settings2 className="h-4 w-4" />
              Configuration Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-amber-200/40 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <Badge variant="outline" className="w-fit text-[11px] text-amber-800 dark:text-amber-100">
            Requirements
          </Badge>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Prerequisites untuk Advanced Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-900 dark:text-amber-100 space-y-2">
          <p>
            ✓ Node.js 18.0+ atau Python 3.10+<br />
            ✓ Docker (untuk containerized setup)<br />
            ✓ PostgreSQL atau MongoDB (untuk data persistence)<br />
            ✓ Redis (untuk caching & session management)<br />
            ✓ Basic knowledge REST API & message queue
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
