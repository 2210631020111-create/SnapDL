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
        const { rows, selectedColumns, sortOrder, filename } = await request.json();

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'No data to export' }, { status: 400 });
        }

        // Sort
        const sorted = [...rows].sort((a: Row, b: Row) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            return sortOrder === 'asc' ? da - db : db - da;
        });

        // Select only requested columns
        const filtered = sorted.map((row: Row) => {
            const obj: Record<string, unknown> = {};
            const recordRow = row as unknown as Record<string, unknown>;
            selectedColumns.forEach((col: string) => {
                obj[col] = recordRow[col] ?? null;
            });
            return obj;
        });

        const json = JSON.stringify(filtered, null, 2);

        return new NextResponse(json, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename || 'export.json'}"`,
            },
        });
    } catch (error) {
        console.error('Export JSON error:', error);
        return NextResponse.json({ error: 'Failed to export JSON' }, { status: 500 });
    }
}
