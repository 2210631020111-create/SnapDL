import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('q');

    if (!query || query.trim().length < 1) {
        return NextResponse.json({ quotes: [] });
    }

    try {
        const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10&newsCount=0&enableFuzzyQuery=false&enableCb=false`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://finance.yahoo.com/',
                'Origin': 'https://finance.yahoo.com',
            },
        });

        if (!response.ok) {
            // Try backup URL
            const backupUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10&newsCount=0&enableFuzzyQuery=false`;
            const backup = await fetch(backupUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://finance.yahoo.com/',
                },
            });
            if (!backup.ok) {
                return NextResponse.json({ quotes: [] });
            }
            const backupData = await backup.json();
            const quotes = (backupData.finance?.result?.[0]?.quotes || backupData.quotes || [])
                .filter((q: any) => q.symbol)
                .slice(0, 10)
                .map((q: any) => ({
                    symbol: q.symbol,
                    name: q.longname || q.shortname || q.symbol,
                    exchange: q.exchange || q.fullExchangeName || '',
                    type: q.quoteType || '',
                }));
            return NextResponse.json({ quotes });
        }

        const data = await response.json();
        const rawQuotes = data.finance?.result?.[0]?.quotes || data.quotes || [];

        const quotes = rawQuotes
            .filter((q: any) => q.symbol)
            .slice(0, 10)
            .map((q: any) => ({
                symbol: q.symbol,
                name: q.longname || q.shortname || q.symbol,
                exchange: q.exchange || q.fullExchangeName || '',
                type: q.quoteType || '',
            }));

        return NextResponse.json({ quotes });
    } catch (error) {
        console.error('Ticker search error:', error);
        return NextResponse.json({ quotes: [] });
    }
}
