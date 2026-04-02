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
        result: [{
            timestamp: number[];
            indicators: {
                quote: [YahooQuote];
                adjclose: [{ adjclose: (number | null)[] }];
            };
            events?: {
                dividends?: Record<string, { amount: number; date: number }>;
                splits?: Record<string, { numerator: number; denominator: number; date: number }>;
            };
        }];
        error: null | { code: string; description: string };
    };
}

export async function POST(request: NextRequest) {
    try {
        const { symbol, startDate, endDate, interval = '1d' } = await request.json();

        if (!symbol || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Symbol, start date, and end date are required' },
                { status: 400 }
            );
        }

        // Convert dates to Unix timestamps
        const period1 = Math.floor(new Date(startDate).getTime() / 1000);
        const period2 = Math.floor(new Date(endDate).getTime() / 1000);

        // Fetch from Yahoo Finance chart endpoint
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&events=div%7Csplit`;

        const response = await fetch(yahooUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://finance.yahoo.com/',
                'Origin': 'https://finance.yahoo.com',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch data from Yahoo Finance' },
                { status: response.status }
            );
        }

        const data: YahooResponse = await response.json();

        if (data.chart.error) {
            return NextResponse.json(
                { error: data.chart.error.description },
                { status: 400 }
            );
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp || [];
        const quotes = result.indicators.quote[0];
        const adjCloseData = result.indicators.adjclose?.[0]?.adjclose || [];

        // Transform data into rows
        const rows = timestamps.map((timestamp, index) => {
            const date = new Date(timestamp * 1000).toISOString().split('T')[0];
            return {
                date,
                open: quotes.open[index] ? Number(quotes.open[index]?.toFixed(2)) : null,
                high: quotes.high[index] ? Number(quotes.high[index]?.toFixed(2)) : null,
                low: quotes.low[index] ? Number(quotes.low[index]?.toFixed(2)) : null,
                close: quotes.close[index] ? Number(quotes.close[index]?.toFixed(2)) : null,
                adjClose: adjCloseData[index] ? Number(adjCloseData[index]?.toFixed(2)) : null,
                volume: quotes.volume[index] ? Math.round(quotes.volume[index]!) : null,
            };
        });

        // Extract corporate actions
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

        // Sort corporate actions by date
        corporateActions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            meta: {
                symbol,
                startDate,
                endDate,
                interval,
            },
            rows,
            corporateActions,
        });
    } catch (error) {
        console.error('Fetch history error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch historical data' },
            { status: 500 }
        );
    }
}
