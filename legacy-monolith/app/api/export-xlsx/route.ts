import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';

interface Row {
  date: string;
  [key: string]: string | number | null | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { rows, selectedColumns, sortOrder, filename } = await request.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 });
    }

    if (!selectedColumns || !Array.isArray(selectedColumns) || selectedColumns.length === 0) {
      return NextResponse.json({ error: 'No columns selected' }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SnapDl';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('DATA');

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

    sheet.columns = selectedColumns.map((col: string) => ({
      header: columnMap[col] || col,
      key: col,
      width: col === 'date' ? 14 : col === 'symbol' ? 12 : 16,
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    const sortedRows = [...rows].sort((a: Row, b: Row) => {
      const da = new Date(String(a.date)).getTime();
      const db = new Date(String(b.date)).getTime();
      return sortOrder === 'asc' ? da - db : db - da;
    });

    sortedRows.forEach((row: Row) => {
      const rowData: Record<string, string | number | null> = {};
      selectedColumns.forEach((col: string) => {
        rowData[col] = row[col] ?? null;
      });
      sheet.addRow(rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename || 'export.xlsx'}"`,
      },
    });
  } catch (error) {
    console.error('Export XLSX error:', error);
    return NextResponse.json({ error: 'Failed to export XLSX' }, { status: 500 });
  }
}
