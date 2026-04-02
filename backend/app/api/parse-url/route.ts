import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Parse Yahoo Finance history URL
    // Example: https://finance.yahoo.com/quote/%5EKLSE/history/?period1=1729641600&period2=1744329600
    const urlPattern = /finance\.yahoo\.com\/quote\/([^\/]+)\/history/;
    const match = url.match(urlPattern);

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid Yahoo Finance history URL' },
        { status: 400 }
      );
    }

    const symbol = decodeURIComponent(match[1]);
    
    // Parse period1 and period2 from URL
    const urlObj = new URL(url);
    const period1 = urlObj.searchParams.get('period1');
    const period2 = urlObj.searchParams.get('period2');

    let startDate = '';
    let endDate = '';

    if (period1) {
      const date = new Date(parseInt(period1) * 1000);
      startDate = date.toISOString().split('T')[0];
    }

    if (period2) {
      const date = new Date(parseInt(period2) * 1000);
      endDate = date.toISOString().split('T')[0];
    }

    return NextResponse.json({
      symbol,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error('Parse URL error:', error);
    return NextResponse.json(
      { error: 'Failed to parse URL' },
      { status: 500 }
    );
  }
}
