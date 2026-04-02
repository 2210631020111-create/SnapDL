export interface HistoricalRow {
    date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    adjClose: number | null;
    volume: number | null;
}

export interface BulkHistoricalRow extends HistoricalRow {
    symbol: string;
}

export interface TickerResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

export interface CorporateAction {
    symbol: string;
    date: string;
    type: 'DIVIDEND' | 'SPLIT';
    value: string;
}

export interface FetchHistoryResponse {
    meta: {
        symbol: string;
        startDate: string;
        endDate: string;
        interval: string;
    };
    rows: HistoricalRow[];
    corporateActions: CorporateAction[];
}

export interface BulkFetchSuccessItem {
    symbol: string;
    rows: HistoricalRow[];
    corporateActions: CorporateAction[];
    outstandingShares: number | null;
}

export interface BulkFetchFailedItem {
    symbol: string;
    error: string;
}

export interface BulkFetchResponse {
    success: BulkFetchSuccessItem[];
    failed: BulkFetchFailedItem[];
}

export interface EventWindowConfig {
    eventDate: string;
    windowPre: number;
    windowPost: number;
    alignmentMode?: 'nearest_trading_day' | 'previous_trading_day' | 'next_trading_day';
}

export interface EventWindowResult {
    status: 'AMAN' | 'TIDAK_COCOK';
    eventTradingDate: string;
    windowStart: string;
    windowEnd: string;
    windowSize: number;
    actionsInWindow: CorporateAction[];
    warning?: string;
}

export interface OutstandingSharesData {
    symbol: string;
    outstandingShares: number | null;
    source: string | null;
}

export type ColumnKey = 'date' | 'open' | 'high' | 'low' | 'close' | 'adjClose' | 'volume';

export interface ColumnDefinition {
    key: ColumnKey;
    label: string;
    required: boolean;
}

export interface ColumnPreset {
    name: string;
    columns: ColumnKey[];
}

export type AppMode = 'single' | 'bulk' | 'guide' | 'lite' | 'advanced';
