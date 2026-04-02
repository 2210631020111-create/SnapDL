import { NextRequest, NextResponse } from 'next/server';

interface BulkRow {
    symbol: string;
    date: string;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;
    adjClose?: number | null;
    volume?: number | null;
}

export async function POST(request: NextRequest) {
    try {
        const { bulkRows, selectedColumns, sortOrder, includeHeaders, startDate, endDate, interval } = await request.json();

        if (!bulkRows || !Array.isArray(bulkRows) || bulkRows.length === 0) {
            return NextResponse.json(
                { error: 'No data to export' },
                { status: 400 }
            );
        }

        if (!selectedColumns || selectedColumns.length === 0) {
            return NextResponse.json(
                { error: 'No columns selected' },
                { status: 400 }
            );
        }

        // Sort rows: by date first, then by symbol
        const sortedRows = [...bulkRows].sort((a: BulkRow, b: BulkRow) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (sortOrder === 'asc') {
                if (dateA !== dateB) return dateA - dateB;
                return a.symbol.localeCompare(b.symbol);
            } else {
                if (dateA !== dateB) return dateB - dateA;
                return a.symbol.localeCompare(b.symbol);
            }
        });

        // Column mapping - symbol is always first
        const columnMap: Record<string, string> = {
            symbol: 'Symbol',
            date: 'Date',
            open: 'Open',
            high: 'High',
            low: 'Low',
            close: 'Close',
            adjClose: 'Adj Close',
            volume: 'Volume',
        };

        // Build CSV with symbol column always included
        let csv = '';

        // Add headers if requested
        if (includeHeaders) {
            const headers = ['symbol', ...selectedColumns].map((col: string) => columnMap[col] || col);
            csv += headers.join(',') + '\n';
        }

        // Add data rows
        sortedRows.forEach((row: BulkRow) => {
            const values = ['symbol', ...selectedColumns].map((col: string) => {
                const value = row[col as keyof BulkRow];
                return value !== null && value !== undefined ? value : '';
            });
            csv += values.join(',') + '\n';
        });

        // Generate filename
        const filename = `BULK_${startDate}_${endDate}_${interval}_${sortOrder}.csv`;

        // Return CSV as downloadable file
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Bulk export CSV error:', error);
        return NextResponse.json(
            { error: 'Failed to export CSV' },
            { status: 500 }
        );
    }
}
