import ExcelJS from 'exceljs';

const CORS_ORIGIN = process.env.CORS_ALLOWED_ORIGINS || 'https://snapdl.appwrite.network';

const headers = {
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com'
};

function getQueryValue(query, key) {
  if (!query) return undefined;
  const value = query[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseJsonBody(req) {
  if (req.body === undefined || req.body === null || req.body === '') {
    return { ok: true, data: {} };
  }

  if (Buffer.isBuffer(req.body)) {
    try {
      return { ok: true, data: JSON.parse(req.body.toString('utf8')) };
    } catch {
      return { ok: false, error: 'Invalid JSON body' };
    }
  }

  if (typeof req.body === 'string') {
    try {
      return { ok: true, data: JSON.parse(req.body) };
    } catch {
      return { ok: false, error: 'Invalid JSON body' };
    }
  }

  if (typeof req.body === 'object') {
    return { ok: true, data: req.body };
  }

  return { ok: false, error: 'Invalid JSON body' };
}

function formatError(err) {
  if (!err) return 'Unknown error';
  if (err instanceof Error && err.stack) return err.stack;
  return String(err);
}

function normalizeQuotes(rawQuotes) {
  return (rawQuotes || [])
    .filter((q) => q && q.symbol)
    .slice(0, 10)
    .map((q) => ({
      symbol: q.symbol,
      name: q.longname || q.shortname || q.symbol,
      exchange: q.exchange || q.fullExchangeName || '',
      type: q.quoteType || ''
    }));
}

async function handleHealth(req, res) {
  return res.json(
    {
      ok: true,
      service: 'snapdl-api',
      timestamp: new Date().toISOString()
    },
    200,
    headers
  );
}

async function handleTickerSearch(req, res, log, error) {
  const query = getQueryValue(req.query, 'q');

  if (!query || query.trim().length < 1) {
    return res.json({ quotes: [] }, 200, headers);
  }

  try {
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10&newsCount=0&enableFuzzyQuery=false&enableCb=false`;

    const response = await fetch(searchUrl, { headers: YAHOO_HEADERS });

    if (!response.ok) {
      const backupUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10&newsCount=0&enableFuzzyQuery=false`;
      const backup = await fetch(backupUrl, {
        headers: {
          'User-Agent': YAHOO_HEADERS['User-Agent'],
          'Accept': 'application/json',
          'Referer': 'https://finance.yahoo.com/'
        }
      });

      if (!backup.ok) {
        return res.json({ quotes: [] }, 200, headers);
      }

      const backupData = await backup.json();
      const quotes = normalizeQuotes(backupData.finance?.result?.[0]?.quotes || backupData.quotes || []);
      return res.json({ quotes }, 200, headers);
    }

    const data = await response.json();
    const quotes = normalizeQuotes(data.finance?.result?.[0]?.quotes || data.quotes || []);

    return res.json({ quotes }, 200, headers);
  } catch (err) {
    error(`Ticker search error: ${formatError(err)}`);
    return res.json({ quotes: [] }, 200, headers);
  }
}

async function handleParseUrl(req, res, log, error) {
  try {
    const bodyResult = parseJsonBody(req);
    if (!bodyResult.ok) {
      return res.json({ error: bodyResult.error }, 400, headers);
    }

    const { url } = bodyResult.data || {};

    if (!url || typeof url !== 'string') {
      return res.json({ error: 'URL is required' }, 400, headers);
    }

    const urlPattern = /finance\.yahoo\.com\/quote\/([^\/]+)\/history/;
    const match = url.match(urlPattern);

    if (!match) {
      return res.json({ error: 'Invalid Yahoo Finance history URL' }, 400, headers);
    }

    const symbol = decodeURIComponent(match[1]);

    const urlObj = new URL(url);
    const period1 = urlObj.searchParams.get('period1');
    const period2 = urlObj.searchParams.get('period2');

    let startDate = '';
    let endDate = '';

    if (period1) {
      const date = new Date(parseInt(period1, 10) * 1000);
      startDate = date.toISOString().split('T')[0];
    }

    if (period2) {
      const date = new Date(parseInt(period2, 10) * 1000);
      endDate = date.toISOString().split('T')[0];
    }

    return res.json({ symbol, startDate, endDate }, 200, headers);
  } catch (err) {
    error(`Parse URL error: ${formatError(err)}`);
    return res.json({ error: 'Failed to parse URL' }, 500, headers);
  }
}

async function handleFetchHistory(req, res, log, error) {
  try {
    const bodyResult = parseJsonBody(req);
    if (!bodyResult.ok) {
      return res.json({ error: bodyResult.error }, 400, headers);
    }

    const { symbol, startDate, endDate, interval = '1d' } = bodyResult.data || {};

    if (!symbol || !startDate || !endDate) {
      return res.json({ error: 'Symbol, start date, and end date are required' }, 400, headers);
    }

    const period1 = Math.floor(new Date(startDate).getTime() / 1000);
    const period2 = Math.floor(new Date(endDate).getTime() / 1000);

    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&events=div%7Csplit`;

    const response = await fetch(yahooUrl, { headers: YAHOO_HEADERS });

    if (!response.ok) {
      return res.json({ error: 'Failed to fetch data from Yahoo Finance' }, response.status, headers);
    }

    const data = await response.json();

    if (data.chart?.error) {
      return res.json({ error: data.chart.error.description }, 400, headers);
    }

    const result = data.chart?.result?.[0];
    if (!result) {
      return res.json({ error: 'No data returned from Yahoo Finance' }, 404, headers);
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote[0];
    const adjCloseData = result.indicators.adjclose?.[0]?.adjclose || [];

    const rows = timestamps.map((timestamp, index) => {
      const date = new Date(timestamp * 1000).toISOString().split('T')[0];
      return {
        date,
        open: quotes.open[index] ? Number(quotes.open[index]?.toFixed(2)) : null,
        high: quotes.high[index] ? Number(quotes.high[index]?.toFixed(2)) : null,
        low: quotes.low[index] ? Number(quotes.low[index]?.toFixed(2)) : null,
        close: quotes.close[index] ? Number(quotes.close[index]?.toFixed(2)) : null,
        adjClose: adjCloseData[index] ? Number(adjCloseData[index]?.toFixed(2)) : null,
        volume: quotes.volume[index] ? Math.round(quotes.volume[index]) : null
      };
    });

    const corporateActions = [];

    if (result.events?.dividends) {
      Object.values(result.events.dividends).forEach((div) => {
        const date = new Date(div.date * 1000).toISOString().split('T')[0];
        corporateActions.push({
          symbol,
          date,
          type: 'DIVIDEND',
          value: div.amount.toFixed(4)
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
          value: `${split.numerator}:${split.denominator}`
        });
      });
    }

    corporateActions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json(
      {
        meta: { symbol, startDate, endDate, interval },
        rows,
        corporateActions
      },
      200,
      headers
    );
  } catch (err) {
    error(`Fetch history error: ${formatError(err)}`);
    return res.json({ error: 'Failed to fetch historical data' }, 500, headers);
  }
}

async function fetchSingleSymbol(symbol, startDate, endDate, interval) {
  const period1 = Math.floor(new Date(startDate).getTime() / 1000);
  const period2 = Math.floor(new Date(endDate).getTime() / 1000);

  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&events=div%7Csplit`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&events=div%7Csplit`
  ];

  let lastError = null;

  for (const yahooUrl of urls) {
    try {
      const response = await fetch(yahooUrl, { headers: YAHOO_HEADERS });

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.chart?.error) {
        throw new Error(data.chart.error.description);
      }

      if (!data.chart?.result || data.chart.result.length === 0) {
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
          open: quotes.open[index] != null ? Number(quotes.open[index].toFixed(2)) : null,
          high: quotes.high[index] != null ? Number(quotes.high[index].toFixed(2)) : null,
          low: quotes.low[index] != null ? Number(quotes.low[index].toFixed(2)) : null,
          close: quotes.close[index] != null ? Number(quotes.close[index].toFixed(2)) : null,
          adjClose: adjCloseData[index] != null ? Number(adjCloseData[index].toFixed(2)) : null,
          volume: quotes.volume[index] != null ? Math.round(quotes.volume[index]) : null
        };
      });

      const corporateActions = [];

      if (result.events?.dividends) {
        Object.values(result.events.dividends).forEach((div) => {
          const date = new Date(div.date * 1000).toISOString().split('T')[0];
          corporateActions.push({
            symbol,
            date,
            type: 'DIVIDEND',
            value: div.amount.toFixed(4)
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
            value: `${split.numerator}:${split.denominator}`
          });
        });
      }

      corporateActions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        symbol,
        rows,
        corporateActions,
        outstandingShares: null
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes('HTTP')) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  if (lastError && lastError.message.includes('HTTP')) {
    const statusMatch = lastError.message.match(/HTTP (\d+)/);
    const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 500;

    if (statusCode === 404) {
      throw new Error('HTTP 404: Ticker Not Found');
    }
    if (statusCode === 429) {
      throw new Error('HTTP 429: Rate Limited');
    }
    if (statusCode >= 500) {
      throw new Error(`HTTP ${statusCode}: Yahoo Server Error`);
    }
  }

  throw lastError || new Error(`Failed to fetch ${symbol}`);
}

async function handleBulkFetchHistory(req, res, log, error) {
  try {
    const bodyResult = parseJsonBody(req);
    if (!bodyResult.ok) {
      return res.json({ error: bodyResult.error }, 400, headers);
    }

    const { symbols, startDate, endDate, interval = '1d' } = bodyResult.data || {};

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.json({ error: 'Symbols array is required' }, 400, headers);
    }

    if (!startDate || !endDate) {
      return res.json({ error: 'Start date and end date are required' }, 400, headers);
    }

    const success = [];
    const failed = [];

    const results = await Promise.allSettled(
      symbols.map((symbol) => fetchSingleSymbol(symbol.trim(), startDate, endDate, interval))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        const reason = result.reason instanceof Error ? result.reason.message : String(result.reason || 'Unknown error');
        failed.push({
          symbol: symbols[index].trim(),
          error: reason
        });
      }
    });

    return res.json({ success, failed }, 200, headers);
  } catch (err) {
    error(`Bulk fetch error: ${formatError(err)}`);
    return res.json({ error: 'Failed to fetch bulk data' }, 500, headers);
  }
}

async function handleExportCsv(req, res, log, error) {
  try {
    const bodyResult = parseJsonBody(req);
    if (!bodyResult.ok) {
      return res.json({ error: bodyResult.error }, 400, headers);
    }

    const { rows, selectedColumns, sortOrder, includeHeaders, filename } = bodyResult.data || {};

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.json({ error: 'No data to export' }, 400, headers);
    }

    if (!selectedColumns || selectedColumns.length === 0) {
      return res.json({ error: 'No columns selected' }, 400, headers);
    }

    const sortedRows = [...rows].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const columnMap = {
      date: 'Date',
      open: 'Open',
      high: 'High',
      low: 'Low',
      close: 'Close',
      adjClose: 'Adj Close',
      volume: 'Volume'
    };

    let csv = '';

    if (includeHeaders) {
      csv += selectedColumns.map((col) => columnMap[col] || col).join(',') + '\n';
    }

    sortedRows.forEach((row) => {
      const values = selectedColumns.map((col) => {
        const value = row[col];
        return value !== null && value !== undefined ? value : '';
      });
      csv += values.join(',') + '\n';
    });

    const fileHeaders = {
      ...headers,
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename || 'export.csv'}"`
    };

    return res.send(Buffer.from(csv, 'utf8'), 200, fileHeaders);
  } catch (err) {
    error(`Export CSV error: ${formatError(err)}`);
    return res.json({ error: 'Failed to export CSV' }, 500, headers);
  }
}

async function handleExportJson(req, res, log, error) {
  try {
    const bodyResult = parseJsonBody(req);
    if (!bodyResult.ok) {
      return res.json({ error: bodyResult.error }, 400, headers);
    }

    const { rows, selectedColumns, sortOrder, filename } = bodyResult.data || {};

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.json({ error: 'No data to export' }, 400, headers);
    }

    const sorted = [...rows].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === 'asc' ? da - db : db - da;
    });

    const filtered = sorted.map((row) => {
      const obj = {};
      const recordRow = row;
      selectedColumns.forEach((col) => {
        obj[col] = recordRow[col] ?? null;
      });
      return obj;
    });

    const json = JSON.stringify(filtered, null, 2);

    const fileHeaders = {
      ...headers,
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename || 'export.json'}"`
    };

    return res.send(Buffer.from(json, 'utf8'), 200, fileHeaders);
  } catch (err) {
    error(`Export JSON error: ${formatError(err)}`);
    return res.json({ error: 'Failed to export JSON' }, 500, headers);
  }
}

async function handleExportXlsx(req, res, log, error) {
  try {
    const bodyResult = parseJsonBody(req);
    if (!bodyResult.ok) {
      return res.json({ error: bodyResult.error }, 400, headers);
    }

    const { rows, selectedColumns, sortOrder, filename } = bodyResult.data || {};

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.json({ error: 'No data to export' }, 400, headers);
    }

    if (!selectedColumns || !Array.isArray(selectedColumns) || selectedColumns.length === 0) {
      return res.json({ error: 'No columns selected' }, 400, headers);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SnapDl';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('DATA');

    const columnMap = {
      symbol: 'Symbol',
      date: 'Date',
      open: 'Open',
      high: 'High',
      low: 'Low',
      close: 'Close',
      adjClose: 'Adj Close',
      volume: 'Volume'
    };

    sheet.columns = selectedColumns.map((col) => ({
      header: columnMap[col] || col,
      key: col,
      width: col === 'date' ? 14 : col === 'symbol' ? 12 : 16
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    const sortedRows = [...rows].sort((a, b) => {
      const da = new Date(String(a.date)).getTime();
      const db = new Date(String(b.date)).getTime();
      return sortOrder === 'asc' ? da - db : db - da;
    });

    sortedRows.forEach((row) => {
      const rowData = {};
      selectedColumns.forEach((col) => {
        rowData[col] = row[col] ?? null;
      });
      sheet.addRow(rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const fileHeaders = {
      ...headers,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename || 'export.xlsx'}"`
    };

    return res.send(Buffer.from(buffer), 200, fileHeaders);
  } catch (err) {
    error(`Export XLSX error: ${formatError(err)}`);
    return res.json({ error: 'Failed to export XLSX' }, 500, headers);
  }
}

async function handleBulkExportCsv(req, res, log, error) {
  try {
    const bodyResult = parseJsonBody(req);
    if (!bodyResult.ok) {
      return res.json({ error: bodyResult.error }, 400, headers);
    }

    const { bulkRows, selectedColumns, sortOrder, includeHeaders, startDate, endDate, interval } = bodyResult.data || {};

    if (!bulkRows || !Array.isArray(bulkRows) || bulkRows.length === 0) {
      return res.json({ error: 'No data to export' }, 400, headers);
    }

    if (!selectedColumns || selectedColumns.length === 0) {
      return res.json({ error: 'No columns selected' }, 400, headers);
    }

    const sortedRows = [...bulkRows].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (sortOrder === 'asc') {
        if (dateA !== dateB) return dateA - dateB;
        return a.symbol.localeCompare(b.symbol);
      }

      if (dateA !== dateB) return dateB - dateA;
      return a.symbol.localeCompare(b.symbol);
    });

    const columnMap = {
      symbol: 'Symbol',
      date: 'Date',
      open: 'Open',
      high: 'High',
      low: 'Low',
      close: 'Close',
      adjClose: 'Adj Close',
      volume: 'Volume'
    };

    let csv = '';

    if (includeHeaders) {
      const headerCols = ['symbol', ...selectedColumns].map((col) => columnMap[col] || col);
      csv += headerCols.join(',') + '\n';
    }

    sortedRows.forEach((row) => {
      const values = ['symbol', ...selectedColumns].map((col) => {
        const value = row[col];
        return value !== null && value !== undefined ? value : '';
      });
      csv += values.join(',') + '\n';
    });

    const fileHeaders = {
      ...headers,
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="BULK_${startDate}_${endDate}_${interval}_${sortOrder}.csv"`
    };

    return res.send(Buffer.from(csv, 'utf8'), 200, fileHeaders);
  } catch (err) {
    error(`Bulk export CSV error: ${formatError(err)}`);
    return res.json({ error: 'Failed to export CSV' }, 500, headers);
  }
}

function sanitizeSheetName(name) {
  let sheetName = String(name).replace(/[\\/*?[\]:]/g, '_');
  if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);
  return sheetName;
}

async function handleBulkExportXlsx(req, res, log, error) {
  try {
    const bodyResult = parseJsonBody(req);
    if (!bodyResult.ok) {
      return res.json({ error: bodyResult.error }, 400, headers);
    }

    const { bulkData, selectedColumns, sortOrder, includeHeaders, startDate, endDate, interval } = bodyResult.data || {};

    if (!bulkData || !Array.isArray(bulkData) || bulkData.length === 0) {
      return res.json({ error: 'No data to export' }, 400, headers);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Yahoo Finance Historical Downloader';
    workbook.created = new Date();

    const columnMap = {
      date: 'Date',
      open: 'Open',
      high: 'High',
      low: 'Low',
      close: 'Close',
      adjClose: 'Adj Close',
      volume: 'Volume'
    };

    const summarySheet = workbook.addWorksheet('_SUMMARY');
    summarySheet.columns = [
      { header: 'Symbol', key: 'symbol', width: 15 },
      { header: 'Rows', key: 'rows', width: 10 },
      { header: 'Outstanding Shares', key: 'outstandingShares', width: 20 },
      { header: 'Corporate Actions', key: 'corporateActions', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    bulkData.forEach((item) => {
      summarySheet.addRow({
        symbol: item.symbol,
        rows: item.rows.length,
        outstandingShares: item.outstandingShares || 'N/A',
        corporateActions: item.corporateActions.length,
        status: 'Success'
      });
    });

    const actionsSheet = workbook.addWorksheet('_CORPORATE_ACTIONS');
    actionsSheet.columns = [
      { header: 'Symbol', key: 'symbol', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Value', key: 'value', width: 15 }
    ];

    actionsSheet.getRow(1).font = { bold: true };
    actionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    bulkData.forEach((item) => {
      item.corporateActions.forEach((action) => {
        actionsSheet.addRow({
          symbol: item.symbol,
          date: action.date,
          type: action.type,
          value: action.value
        });
      });
    });

    const actionsData = actionsSheet.getRows(2, actionsSheet.rowCount - 1) || [];
    actionsData.sort((a, b) => {
      const dateA = new Date(a.getCell(2).value).getTime();
      const dateB = new Date(b.getCell(2).value).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return String(a.getCell(1).value).localeCompare(String(b.getCell(1).value));
    });

    bulkData.forEach((item) => {
      const sheet = workbook.addWorksheet(sanitizeSheetName(item.symbol));

      sheet.columns = selectedColumns.map((col) => ({
        header: columnMap[col] || col,
        key: col,
        width: col === 'date' ? 12 : 15
      }));

      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };

      const sortedRows = [...item.rows].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });

      sortedRows.forEach((row) => {
        const rowData = {};
        selectedColumns.forEach((col) => {
          rowData[col] = row[col] !== null && row[col] !== undefined ? row[col] : '';
        });
        sheet.addRow(rowData);
      });

      if (item.outstandingShares) {
        const noteRow = sheet.rowCount + 2;
        sheet.getCell(`A${noteRow}`).value = 'Outstanding Shares:';
        sheet.getCell(`A${noteRow}`).font = { bold: true };
        sheet.getCell(`B${noteRow}`).value = item.outstandingShares;
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const fileHeaders = {
      ...headers,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="BULK_${startDate}_${endDate}_${interval}_${sortOrder}.xlsx"`
    };

    return res.send(Buffer.from(buffer), 200, fileHeaders);
  } catch (err) {
    error(`Bulk export Excel error: ${formatError(err)}`);
    return res.json({ error: 'Failed to export Excel' }, 500, headers);
  }
}

export default async ({ req, res, log, error }) => {
  const method = (req.method || 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    return res.send('', 204, headers);
  }

  const path = (req.path || '').replace(/\/$/, '') || '/';

  try {
    switch (path) {
      case '/':
      case '/api/health':
      case '/health':
        if (method !== 'GET') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleHealth(req, res, log, error);

      case '/api/ticker-search':
      case '/ticker-search':
        if (method !== 'GET') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleTickerSearch(req, res, log, error);

      case '/api/parse-url':
      case '/parse-url':
        if (method !== 'POST') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleParseUrl(req, res, log, error);

      case '/api/fetch-history':
      case '/fetch-history':
        if (method !== 'POST') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleFetchHistory(req, res, log, error);

      case '/api/bulk-fetch-history':
      case '/bulk-fetch-history':
        if (method !== 'POST') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleBulkFetchHistory(req, res, log, error);

      case '/api/export-csv':
      case '/export-csv':
        if (method !== 'POST') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleExportCsv(req, res, log, error);

      case '/api/export-json':
      case '/export-json':
        if (method !== 'POST') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleExportJson(req, res, log, error);

      case '/api/export-xlsx':
      case '/export-xlsx':
        if (method !== 'POST') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleExportXlsx(req, res, log, error);

      case '/api/bulk-export-csv':
      case '/bulk-export-csv':
        if (method !== 'POST') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleBulkExportCsv(req, res, log, error);

      case '/api/bulk-export-xlsx':
      case '/bulk-export-xlsx':
        if (method !== 'POST') {
          return res.json({ error: 'Method Not Allowed' }, 405, headers);
        }
        return handleBulkExportXlsx(req, res, log, error);

      default:
        return res.json({ error: 'Not Found' }, 404, headers);
    }
  } catch (err) {
    error(`Unhandled error (${method} ${path}): ${formatError(err)}`);
    return res.json({ error: 'Internal Server Error' }, 500, headers);
  }
};
