import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { CorporateAction, EventWindowConfig, EventWindowResult } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseSymbolList(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[\s,;]+/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toUpperCase())
    )
  );
}

function findAlignedTradingDateIndex(
  eventDate: string,
  tradingDates: string[],
  alignmentMode: NonNullable<EventWindowConfig["alignmentMode"]>
): number {
  // tradingDates expected to be sorted ascending (YYYY-MM-DD).
  const exactIndex = tradingDates.indexOf(eventDate);
  if (exactIndex !== -1) return exactIndex;

  const eventTs = new Date(eventDate).getTime();
  if (!Number.isFinite(eventTs)) return -1;

  // Find insertion point (first trading date >= eventDate)
  let right = 0;
  while (right < tradingDates.length) {
    const ts = new Date(tradingDates[right]).getTime();
    if (ts >= eventTs) break;
    right++;
  }

  const left = right - 1;

  if (alignmentMode === "previous_trading_day") {
    return left >= 0 ? left : 0;
  }
  if (alignmentMode === "next_trading_day") {
    return right < tradingDates.length ? right : tradingDates.length - 1;
  }

  // nearest_trading_day
  if (left < 0) return 0;
  if (right >= tradingDates.length) return tradingDates.length - 1;

  const leftTs = new Date(tradingDates[left]).getTime();
  const rightTs = new Date(tradingDates[right]).getTime();

  return Math.abs(eventTs - leftTs) <= Math.abs(rightTs - eventTs) ? left : right;
}

export function validateEventWindow(
  config: EventWindowConfig,
  corporateActions: CorporateAction[],
  tradingDates: string[]
): EventWindowResult {
  const { eventDate, windowPre, windowPost } = config;
  const alignmentMode = config.alignmentMode ?? "nearest_trading_day";

  if (tradingDates.length === 0) {
    return {
      status: "TIDAK_COCOK",
      eventTradingDate: eventDate,
      windowStart: eventDate,
      windowEnd: eventDate,
      windowSize: 0,
      actionsInWindow: [],
      warning: "Trading dates kosong",
    };
  }

  const sortedTradingDates = [...tradingDates].sort();
  const eventIndex = findAlignedTradingDateIndex(eventDate, sortedTradingDates, alignmentMode);

  if (eventIndex < 0 || eventIndex >= sortedTradingDates.length) {
    return {
      status: "TIDAK_COCOK",
      eventTradingDate: eventDate,
      windowStart: sortedTradingDates[0],
      windowEnd: sortedTradingDates[sortedTradingDates.length - 1],
      windowSize: sortedTradingDates.length,
      actionsInWindow: [],
      warning: "Event date tidak valid",
    };
  }

  const desiredStart = eventIndex - windowPre;
  const desiredEnd = eventIndex + windowPost;

  const actualStart = Math.max(0, desiredStart);
  const actualEnd = Math.min(sortedTradingDates.length - 1, desiredEnd);

  const windowStart = sortedTradingDates[actualStart];
  const windowEnd = sortedTradingDates[actualEnd];
  const eventTradingDate = sortedTradingDates[eventIndex];

  const actionsInWindow = corporateActions.filter((a) => a.date >= windowStart && a.date <= windowEnd);

  let warning: string | undefined;
  if (desiredStart < 0 || desiredEnd > sortedTradingDates.length - 1) {
    warning = "Window tidak lengkap: data trading tidak cukup untuk memenuhi t- dan/atau t+";
  }

  return {
    status: actionsInWindow.length > 0 ? "TIDAK_COCOK" : "AMAN",
    eventTradingDate,
    windowStart,
    windowEnd,
    windowSize: actualEnd - actualStart + 1,
    actionsInWindow,
    warning,
  };
}

const FETCH_ERROR_RULES = [
  {
    category: "Ticker Not Found",
    pattern: /(404|not found|no data returned|symbol not found)/i,
    summary: "Tidak ada data untuk ticker yang dimasukkan.",
    suggestion: "Periksa format ticker & tambahkan suffix bursa (misal BBCA.JK / AAPL) atau coba ticker alias lain.",
  },
  {
    category: "Rate Limited",
    pattern: /(429|rate limit)/i,
    summary: "Terlalu banyak permintaan dalam waktu singkat.",
    suggestion: "Tunggu 60 detik sebelum mengirim ulang request atau kurangi batch size.",
  },
  {
    category: "API Timeout",
    pattern: /(timeout|econnrefused|connection refused)/i,
    summary: "Permintaan timeout atau koneksi terputus.",
    suggestion: "Periksa koneksi internet & coba ulang beberapa detik kemudian.",
  },
  {
    category: "Format Error",
    pattern: /(invalid|illegal|format error|karakter ilegal)/i,
    summary: "Ticker mengandung karakter tidak valid.",
    suggestion: "Gunakan alfanumerik, titik (.), dash (-), atau caret (^). Hindari spasi di akhir.",
  },
  {
    category: "No Data in Range",
    pattern: /(no data|empty|tidak ada data)/i,
    summary: "Tidak ada data untuk rentang tanggal yang dipilih.",
    suggestion: "Perluas rentang tanggal atau pilih interval lain.",
  },
  {
    category: "Yahoo Server Down",
    pattern: /(server error|5\d{2}|yahoo server)/i,
    summary: "Yahoo Finance sedang bermasalah.",
    suggestion: "Tunggu beberapa menit lalu coba ulang; bisa jadi maintenance server.",
  },
  {
    category: "Client Error",
    pattern: /(http 4|client error)/i,
    summary: "Request Anda ditolak oleh endpoint.",
    suggestion: "Pastikan request diterjemahkan dengan benar dan tidak ada parameter salah.",
  },
];

export function describeFetchError(message: string) {
  const lower = message.toLowerCase();
  const rule = FETCH_ERROR_RULES.find((r) => r.pattern.test(lower));
  if (rule) {
    return { category: rule.category, suggestion: rule.suggestion, summary: rule.summary };
  }
  return {
    category: "Unknown Error",
    suggestion: "Periksa kembali ticker, tanggal, atau coba ulang nanti.",
    summary: "Terjadi error yang belum dikenali.",
  };
}

export const FETCH_ERROR_GUIDE = FETCH_ERROR_RULES.map((rule) => ({
  category: rule.category,
  summary: rule.summary,
  suggestion: rule.suggestion,
}));
