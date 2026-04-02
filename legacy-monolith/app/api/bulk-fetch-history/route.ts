import { NextRequest, NextResponse } from 'next/server';

interface YahooQuote {
    date: number[];
    open: (number | null)[];
    high: (number | null)[];
    low: (number | null)[];
    close: (number | null)[];
    adjclose: (number | null)[];
    volume: (number | null)[];
}

interface YahooResponse {
    chart: {
        result: Array<{
            timestamp: number[];
            indicators: {
                quote: Array<YahooQuote>;
                adjclose: Array<{ adjclose: (number | null)[] }>;
            };
            events?: {
                dividends?: Record<string, { amount: number; date: number }>;
                splits?: Record<string, { numerator: number; denominator: number; date: number }>;
            };
        }> | null;
        error: null | { code: string; description: string };
    };
}

const YAHOO_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com/',
    'Origin': 'https://finance.yahoo.com',
};

async function fetchSingleSymbol(
    symbol: string,
    startDate: string,
    endDate: string,
    interval: string
) {
    const period1 = Math.floor(new Date(startDate).getTime() / 1000);
    const period2 = Math.floor(new Date(endDate).getTime() / 1000);

    // Try query1 first, then fallback to query2
    const urls = [
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&events=div%7Csplit`,
        `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&events=div%7Csplit`,
    ];

    let lastError: Error | null = null;

    for (const yahooUrl of urls) {
        try {
            const response = await fetch(yahooUrl, { headers: YAHOO_HEADERS });

            if (!response.ok) {
                lastError = new Error(`HTTP ${response.status}`);
                continue;
            }

            const data: YahooResponse = await response.json();

            if (data.chart.error) {
                throw new Error(data.chart.error.description);
            }

            if (!data.chart.result || data.chart.result.length === 0) {
                throw new Error(`No data returned for symbol: ${symbol}`);
            }

            const result = data.chart.result[0];

            if (!result) {
                throw new Error(`Empty result for symbol: ${symbol}`);
            }

            const timestamps = result.timestamp || [];
            const quotes = result.indicators.quote[0];
            const adjCloseData = result.indicators.adjclose?.[0]?.adjclose || [];

            const rows = timestamps.map((timestamp, index) => {
                const date = new Date(timestamp * 1000).toISOString().split('T')[0];
                return {
                    date,
                    open: quotes.open[index] != null ? Number(quotes.open[index]!.toFixed(2)) : null,
                    high: quotes.high[index] != null ? Number(quotes.high[index]!.toFixed(2)) : null,
                    low: quotes.low[index] != null ? Number(quotes.low[index]!.toFixed(2)) : null,
                    close: quotes.close[index] != null ? Number(quotes.close[index]!.toFixed(2)) : null,
                    adjClose: adjCloseData[index] != null ? Number(adjCloseData[index]!.toFixed(2)) : null,
                    volume: quotes.volume[index] != null ? Math.round(quotes.volume[index]!) : null,
                };
            });

            const corporateActions: Array<{ symbol: string; date: string; type: 'DIVIDEND' | 'SPLIT'; value: string }> = [];

            if (result.events?.dividends) {
                Object.values(result.events.dividends).forEach((div) => {
                    const date = new Date(div.date * 1000).toISOString().split('T')[0];
                    corporateActions.push({
                        symbol,
                        date,
                        type: 'DIVIDEND',
                        value: div.amount.toFixed(4),
                    });
                });
            }

            if (result.events?.splits) {
                Object.values(result.events.splits).forEach((split) => {
                    const date = new Date(split.date * 1000).toISOString().split('T')[0];
                    corporateActions.push({
                        symbol,
                        date,
                        type: 'SPLIT',
                        value: `${split.numerator}:${split.denominator}`,
                    });
                });
            }

            corporateActions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return {
                symbol,
                rows,
                corporateActions,
                outstandingShares: null as number | null,
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('HTTP')) {
                lastError = error;
                // If it's a 429 Rate Limit or 404 Not Found from query1, we should still try query2 just in case,
                // but if both fail, we want to preserve the specific status code.
                continue;
            }
            throw error;
        }
    }

    // After exhausting URLs, throw a structured error if it's an HTTP issue
    if (lastError && lastError.message.includes('HTTP')) {
        const statusMatch = lastError.message.match(/HTTP (\d+)/);
        const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500;

        if (statusCode === 404) {
            throw new Error('HTTP 404: Ticker Not Found');
        } else if (statusCode === 429) {
            throw new Error('HTTP 429: Rate Limited');
        } else if (statusCode >= 500) {
            throw new Error(`HTTP ${statusCode}: Yahoo Server Error`);
        }
    }

    throw lastError || new Error(`Failed to fetch ${symbol}`);
}

export async function POST(request: NextRequest) {
    try {
        const { symbols, startDate, endDate, interval = '1d' } = await request.json();

        if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
            return NextResponse.json(
                { error: 'Symbols array is required' },
                { status: 400 }
            );
        }

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'Start date and end date are required' },
                { status: 400 }
            );
        }

        const success: Array<{
            symbol: string;
            rows: any[];
            corporateActions: any[];
            outstandingShares: number | null;
        }> = [];
        const failed: Array<{ symbol: string; error: string }> = [];

        // Fetch all symbols in parallel
        const results = await Promise.allSettled(
            symbols.map((symbol: string) =>
                fetchSingleSymbol(symbol.trim(), startDate, endDate, interval)
            )
        );

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                success.push(result.value);
            } else {
                failed.push({
                    symbol: symbols[index].trim(),
                    error: result.reason?.message || 'Unknown error',
                });
            }
        });

        return NextResponse.json({
            success,
            failed,
        });
    } catch (error) {
        console.error('Bulk fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bulk data' },
            { status: 500 }
        );
    }
}
