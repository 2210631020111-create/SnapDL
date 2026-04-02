import { ColumnDefinition, ColumnPreset, ColumnKey } from './types';

export const COLUMNS: ColumnDefinition[] = [
    { key: 'date', label: 'Date', required: true },
    { key: 'open', label: 'Open', required: false },
    { key: 'high', label: 'High', required: false },
    { key: 'low', label: 'Low', required: false },
    { key: 'close', label: 'Close', required: false },
    { key: 'adjClose', label: 'Adj Close', required: false },
    { key: 'volume', label: 'Volume', required: false },
];

export const PRESETS: ColumnPreset[] = [
    {
        name: 'Minimal',
        columns: ['date', 'close', 'volume'],
    },
    {
        name: 'Standard',
        columns: ['date', 'open', 'high', 'low', 'close', 'volume'],
    },
    {
        name: 'Full',
        columns: ['date', 'open', 'high', 'low', 'close', 'adjClose', 'volume'],
    },
];

export const INTERVALS = [
    { label: 'Daily', value: '1d' },
    { label: 'Weekly', value: '1wk' },
    { label: 'Monthly', value: '1mo' },
] as const;

export const SORT_OPTIONS = [
    { label: 'Terlama → Terbaru', value: 'asc' },
    { label: 'Terbaru → Terlama', value: 'desc' },
] as const;
