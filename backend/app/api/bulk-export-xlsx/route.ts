import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

// Force Node.js runtime — ExcelJS uses native Node.js stream/zlib APIs
// that are not available in the Vercel Edge Runtime.
export const runtime = 'nodejs';

interface BulkDataItem {
    symbol: string;
    rows: any[];
    corporateActions: any[];
    outstandingShares: number | null;
}

export async function POST(request: NextRequest) {
    try {
        const { bulkData, selectedColumns, sortOrder, includeHeaders, startDate, endDate, interval } = await request.json();

        if (!bulkData || !Array.isArray(bulkData) || bulkData.length === 0) {
            return NextResponse.json(
                { error: 'No data to export' },
                { status: 400 }
            );
        }

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Yahoo Finance Historical Downloader';
        workbook.created = new Date();

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

        // 1. Create SUMMARY sheet
        const summarySheet = workbook.addWorksheet('_SUMMARY');
        summarySheet.columns = [
            { header: 'Symbol', key: 'symbol', width: 15 },
            { header: 'Rows', key: 'rows', width: 10 },
            { header: 'Outstanding Shares', key: 'outstandingShares', width: 20 },
            { header: 'Corporate Actions', key: 'corporateActions', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        // Style header row
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };

        bulkData.forEach((item: BulkDataItem) => {
            summarySheet.addRow({
                symbol: item.symbol,
                rows: item.rows.length,
                outstandingShares: item.outstandingShares || 'N/A',
                corporateActions: item.corporateActions.length,
                status: 'Success',
            });
        });

        // 2. Create CORPORATE_ACTIONS sheet
        const actionsSheet = workbook.addWorksheet('_CORPORATE_ACTIONS');
        actionsSheet.columns = [
            { header: 'Symbol', key: 'symbol', width: 15 },
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Type', key: 'type', width: 12 },
            { header: 'Value', key: 'value', width: 15 },
        ];

        // Style header row
        actionsSheet.getRow(1).font = { bold: true };
        actionsSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };

        // Add all corporate actions
        bulkData.forEach((item: BulkDataItem) => {
            item.corporateActions.forEach((action: any) => {
                actionsSheet.addRow({
                    symbol: item.symbol,
                    date: action.date,
                    type: action.type,
                    value: action.value,
                });
            });
        });

        // Sort corporate actions by date (desc) then symbol
        const actionsData = actionsSheet.getRows(2, actionsSheet.rowCount - 1) || [];
        actionsData.sort((a, b) => {
            const dateA = new Date(a.getCell(2).value as string).getTime();
            const dateB = new Date(b.getCell(2).value as string).getTime();
            if (dateA !== dateB) return dateB - dateA;
            return String(a.getCell(1).value).localeCompare(String(b.getCell(1).value));
        });

        // 3. Create individual sheets for each symbol
        bulkData.forEach((item: BulkDataItem) => {
            // Sanitize sheet name (Excel has restrictions)
            let sheetName = item.symbol.replace(/[\\/*?[\]:]/g, '_');
            if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);

            const sheet = workbook.addWorksheet(sheetName);

            // Set up columns
            const columns = selectedColumns.map((col: string) => ({
                header: columnMap[col] || col,
                key: col,
                width: col === 'date' ? 12 : 15,
            }));

            sheet.columns = columns;

            // Style header row
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' },
            };
            sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            // Sort rows
            const sortedRows = [...item.rows].sort((a: any, b: any) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });

            // Add data rows
            sortedRows.forEach((row: any) => {
                const rowData: any = {};
                selectedColumns.forEach((col: string) => {
                    rowData[col] = row[col] !== null && row[col] !== undefined ? row[col] : '';
                });
                sheet.addRow(rowData);
            });

            // Add outstanding shares as note if available
            if (item.outstandingShares) {
                const noteRow = sheet.rowCount + 2;
                sheet.getCell(`A${noteRow}`).value = 'Outstanding Shares:';
                sheet.getCell(`A${noteRow}`).font = { bold: true };
                sheet.getCell(`B${noteRow}`).value = item.outstandingShares;
            }
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Generate filename
        const filename = `BULK_${startDate}_${endDate}_${interval}_${sortOrder}.xlsx`;

        // Return Excel file
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Bulk export Excel error:', error);
        return NextResponse.json(
            { error: 'Failed to export Excel' },
            { status: 500 }
        );
    }
}
