import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSheetsClient() {
  let jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}';
  // Strip potential single/double quotes at the start and end
  if ((jsonStr.startsWith("'") && jsonStr.endsWith("'")) || (jsonStr.startsWith('"') && jsonStr.endsWith('"'))) {
    jsonStr = jsonStr.slice(1, -1);
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(jsonStr),
    scopes: SCOPES,
  });
  return google.sheets({ version: 'v4', auth });
}

export async function getSheetData(sheetName: string) {
  const sheets = await getSheetsClient();
  const range = `${sheetName}!A1:Z1000`;
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
  });

  const rows = response.data.values;
  console.log(`Google Sheets - Fetched ${rows?.length || 0} rows from ${sheetName}`);
  if (!rows || rows.length === 0) return [];

  const headers = rows[0];
  console.log(`Google Sheets - Headers for ${sheetName}:`, headers);
  return rows.slice(1).map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

export async function appendSheetData(sheetName: string, data: any) {
  const sheets = await getSheetsClient();
  const headersResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A1:Z1`,
  });

  const headers = headersResponse.data.values?.[0] || [];
  
  // Normalize data keys for case-insensitive lookup
  const normalizedData: any = {};
  Object.keys(data).forEach(key => {
    normalizedData[key.trim().toLowerCase().replace(/[\s_]/g, '')] = data[key];
  });

  const row = headers.map((header) => {
    const normalizedHeader = header.trim().toLowerCase().replace(/[\s_]/g, '');
    // Try exact match first, then normalized match
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
}

export async function updateSheetData(sheetName: string, idField: string, idValue: string, data: any) {
  const sheets = await getSheetsClient();
  const range = `${sheetName}!A1:Z1000`;
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
  });

  const rows = response.data.values;
  if (!rows) return;

  const headers = rows[0];
  const idIndex = headers.indexOf(idField);
  const rowIndex = rows.findIndex((row) => row[idIndex] === idValue);

  if (rowIndex === -1) throw new Error('Row not found');

  // Normalize data keys for case-insensitive lookup
  const normalizedData: any = {};
  Object.keys(data).forEach(key => {
    normalizedData[key.trim().toLowerCase().replace(/[\s_]/g, '')] = data[key];
  });

  const updatedRow = headers.map((header, index) => {
    const normalizedHeader = header.trim().toLowerCase().replace(/[\s_]/g, '');
    // Prioritize exact match, then normalized match, then fall back to existing value
    if (data[header] !== undefined) return data[header];
    if (normalizedData[normalizedHeader] !== undefined) return normalizedData[normalizedHeader];
    return rows[rowIndex][index];
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [updatedRow],
    },
  });
}

export async function deleteSheetData(sheetName: string, idField: string, idValue: string) {
  const sheets = await getSheetsClient();
  const range = `${sheetName}!A1:Z1000`;
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
  });

  const rows = response.data.values;
  if (!rows) return;

  const headers = rows[0];
  const idIndex = headers.indexOf(idField);
  const rowIndex = rows.findIndex((row) => row[idIndex] === idValue);

  if (rowIndex === -1) throw new Error('Row not found');

  // To delete a row in Google Sheets API v4, we use batchUpdate with deleteDimension
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
  });
  
  const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
  if (!sheet) throw new Error('Sheet not found');
  const sheetId = sheet.properties?.sheetId;

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
}
