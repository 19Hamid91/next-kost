import { google } from 'googleapis';
import { logError } from './apiUtils';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSheetsClient() {
  try {
    let jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}';
    if ((jsonStr.startsWith("'") && jsonStr.endsWith("'")) || (jsonStr.startsWith('"') && jsonStr.endsWith('"'))) {
      jsonStr = jsonStr.slice(1, -1);
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(jsonStr),
      scopes: SCOPES,
    });
    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    logError('GoogleSheets', 'getSheetsClient', error);
    throw error;
  }
}

export async function getSheetData<T>(sheetName: string): Promise<T[]> {
  try {
    const sheets = await getSheetsClient();
    const range = `${sheetName}!A:Z`;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj = {} as any;
      headers.forEach((header, index) => {
        obj[header] = row[index] ?? '';
      });
      return obj as T;
    });
  } catch (error) {
    logError('GoogleSheets', 'getSheetData', error);
    throw error;
  }
}

export async function appendSheetData(sheetName: string, data: Record<string, unknown>): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });

    const headers = headersResponse.data.values?.[0] || [];
    
    const normalizedData: Record<string, unknown> = {};
    Object.keys(data).forEach(key => {
      normalizedData[key.trim().toLowerCase().replace(/[\s_]/g, '')] = data[key];
    });

    const row = headers.map((header) => {
      const normalizedHeader = header.trim().toLowerCase().replace(/[\s_]/g, '');
      return data[header] ?? normalizedData[normalizedHeader] ?? '';
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    logError('GoogleSheets', 'appendSheetData', error);
    throw error;
  }
}

export async function updateSheetData(
  sheetName: string,
  idField: string,
  idValue: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    const range = `${sheetName}!A:Z`;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });

    const rows = response.data.values;
    if (!rows) throw new Error('Sheet is empty');

    const headers = rows[0];
    const idIndex = headers.indexOf(idField);
    if (idIndex === -1) throw new Error(`ID field "${idField}" not found`);

    const rowIndex = rows.findIndex((row) => row[idIndex] === idValue);
    if (rowIndex === -1) throw new Error('Row not found');

    const normalizedData: Record<string, unknown> = {};
    Object.keys(data).forEach(key => {
      normalizedData[key.trim().toLowerCase().replace(/[\s_]/g, '')] = data[key];
    });

    const updatedRow = headers.map((header, index) => {
      const normalizedHeader = header.trim().toLowerCase().replace(/[\s_]/g, '');
      if (data[header] !== undefined) return data[header];
      if (normalizedData[normalizedHeader] !== undefined) return normalizedData[normalizedHeader];
      return rows[rowIndex][index] ?? '';
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });
  } catch (error) {
    logError('GoogleSheets', 'updateSheetData', error);
    throw error;
  }
}

export async function deleteSheetData(sheetName: string, idField: string, idValue: string): Promise<void> {
  try {
    const sheets = await getSheetsClient();
    const range = `${sheetName}!A:Z`;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });

    const rows = response.data.values;
    if (!rows) throw new Error('Sheet is empty');

    const headers = rows[0];
    const idIndex = headers.indexOf(idField);
    if (idIndex === -1) throw new Error(`ID field "${idField}" not found`);

    const rowIndex = rows.findIndex((row) => row[idIndex] === idValue);
    if (rowIndex === -1) throw new Error('Row not found');

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });
    
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
    if (!sheet) throw new Error('Sheet not found');
    const sheetId = sheet.properties?.sheetId;
    if (sheetId === undefined || sheetId === null) throw new Error('Sheet ID not found');

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    logError('GoogleSheets', 'deleteSheetData', error);
    throw error;
  }
}

// ─── Batch Operations ────────────────────────────────────────────────────────

export async function batchAppendSheetData(sheetName: string, rows: unknown[][]): Promise<{ insertedCount: number }> {
  const sheets = await getSheetsClient();

  const beforeResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A1:A`,
  });
  const existingRowCount = beforeResponse.data.values?.length ?? 1;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });
    return { insertedCount: rows.length };
  } catch (error) {
    logError('GoogleSheets', 'batchAppendSheetData', error);
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
      });
      const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
      if (sheet && sheet.properties?.sheetId !== undefined) {
        const afterResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `${sheetName}!A1:A`,
        });
        const afterCount = afterResponse.data.values?.length ?? existingRowCount;
        const insertedRows = afterCount - existingRowCount;
        if (insertedRows > 0) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            requestBody: {
              requests: [{
                deleteDimension: {
                  range: {
                    sheetId: sheet.properties.sheetId,
                    dimension: 'ROWS',
                    startIndex: existingRowCount,
                    endIndex: existingRowCount + insertedRows,
                  },
                },
              }],
            },
          });
        }
      }
    } catch (rollbackError) {
      logError('GoogleSheets', 'batchAppendSheetData.rollback', rollbackError);
    }
    throw error;
  }
}

export async function batchUpdateSheetData(
  sheetName: string,
  updates: { idField: string; idValue: string; fields: Record<string, string> }[]
): Promise<{ updatedCount: number }> {
  try {
    const sheets = await getSheetsClient();
    const range = `${sheetName}!A:Z`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });

    const allRows = response.data.values;
    if (!allRows) throw new Error('Sheet is empty');

    const headers = allRows[0];
    const valueRanges: any[] = [];

    for (const update of updates) {
      const idIndex = headers.indexOf(update.idField);
      if (idIndex === -1) throw new Error(`idField "${update.idField}" not found in headers`);

      const rowIndex = allRows.findIndex((row, idx) => idx > 0 && row[idIndex] === update.idValue);
      if (rowIndex === -1) throw new Error(`Row with ${update.idField}=${update.idValue} not found`);

      const updatedRow = headers.map((header: string, colIdx: number) => {
        if (update.fields[header] !== undefined) return update.fields[header];
        return allRows[rowIndex][colIdx] ?? '';
      });

      valueRanges.push({
        range: `${sheetName}!A${rowIndex + 1}`,
        values: [updatedRow],
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: valueRanges,
      },
    });

    return { updatedCount: updates.length };
  } catch (error) {
    logError('GoogleSheets', 'batchUpdateSheetData', error);
    throw error;
  }
}
