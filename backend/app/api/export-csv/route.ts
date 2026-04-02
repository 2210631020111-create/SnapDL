import { NextRequest, NextResponse } from 'next/server';

interface Row {
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
        const { rows, selectedColumns, sortOrder, includeHeaders, filename } = await request.json();

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
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

        // Sort rows
        const sortedRows = [...rows].sort((a: Row, b: Row) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Column mapping
        const columnMap: Record<string, string> = {
            date: 'Date',
            open: 'Open',
            high: 'High',
            low: 'Low',
            close: 'Close',
            adjClose: 'Adj Close',
            volume: 'Volume',
        };

        // Build CSV
        let csv = '';

        // Add headers if requested
        if (includeHeaders) {
            csv += selectedColumns.map((col: string) => columnMap[col] || col).join(',') + '\n';
        }

        // Add data rows
        sortedRows.forEach((row: Row) => {
            const values = selectedColumns.map((col: string) => {
                const value = row[col as keyof Row];
                return value !== null && value !== undefined ? value : '';
            });
            csv += values.join(',') + '\n';
        });

        // Return CSV as downloadable file
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename || 'export.csv'}"`,
            },
        });
    } catch (error) {
        console.error('Export CSV error:', error);
        return NextResponse.json(
            { error: 'Failed to export CSV' },
            { status: 500 }
        );
    }
}
