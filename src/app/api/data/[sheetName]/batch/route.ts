import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSheetData, batchAppendSheetData, batchUpdateSheetData } from '@/lib/google-sheets';

type RouteContext = { params: Promise<{ sheetName: string }> };

async function requireSession() {
  return getServerSession(authOptions);
}

/**
 * POST /api/data/[sheetName]/batch
 * Body: { rows: any[] }  — each row is a plain object matching the sheet schema
 * Atomically appends all rows. Returns { success, count } or { success, error, message, failedRows? }
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { sheetName } = await context.params;
    const body = await req.json();
    const objectRows: any[] = body.rows;

    if (!Array.isArray(objectRows) || objectRows.length === 0) {
      return NextResponse.json({ success: false, error: 'VALIDATION_ERROR', message: 'rows must be a non-empty array' }, { status: 400 });
    }

    // Resolve headers from the sheet to maintain column order
    const sheetData = await getSheetData(sheetName);
    const headers = sheetData.length > 0
      ? Object.keys(sheetData[0])
      : Object.keys(objectRows[0]);

    // Validate rows — find empty required entries
    const failedRows: number[] = [];
    objectRows.forEach((row, idx) => {
      const hasData = Object.values(row).some(val => val !== '' && val !== null && val !== undefined);
      if (!hasData) failedRows.push(idx);
    });

    if (failedRows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Some rows are empty',
        failedRows,
      }, { status: 400 });
    }

    // Convert object rows → array rows matching header order
    const arrayRows = objectRows.map(row =>
      headers.map(header => row[header] ?? '')
    );

    const { insertedCount } = await batchAppendSheetData(sheetName, arrayRows);
    return NextResponse.json({ success: true, count: insertedCount }, { status: 201 });
  } catch (error: any) {
    console.error('[BATCH POST] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'SHEETS_ERROR',
      message: error.message || 'Google Sheets error',
    }, { status: 502 });
  }
}

/**
 * PUT /api/data/[sheetName]/batch
 * Body: { updates: [{ idField, idValue, fields: {...} }] }
 * Atomically updates all rows in one batchUpdate call.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { sheetName } = await context.params;
    const body = await req.json();
    const updates: { idField: string; idValue: string; fields: Record<string, string> }[] = body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ success: false, error: 'VALIDATION_ERROR', message: 'updates must be a non-empty array' }, { status: 400 });
    }

    const { updatedCount } = await batchUpdateSheetData(sheetName, updates);
    return NextResponse.json({ success: true, count: updatedCount }, { status: 200 });
  } catch (error: any) {
    console.error('[BATCH PUT] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'SHEETS_ERROR',
      message: error.message || 'Google Sheets error',
    }, { status: 502 });
  }
}
