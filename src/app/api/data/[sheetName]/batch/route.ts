import { NextRequest, NextResponse } from 'next/server';
import { getSheetData, batchAppendSheetData, batchUpdateSheetData } from '@/lib/google-sheets';
import { requireSession, errorResponse, logError } from '@/lib/apiUtils';

type RouteContext = { params: Promise<{ sheetName: string }> };

/**
 * POST /api/data/[sheetName]/batch
 * Body: { rows: any[] }
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { sheetName } = await context.params;
    const body = await req.json();
    const objectRows: any[] = body.rows;

    if (!Array.isArray(objectRows) || objectRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'rows must be a non-empty array',
      }, { status: 400 });
    }

    const sheetData = await getSheetData<any>(sheetName);
    const headers = sheetData.length > 0
      ? Object.keys(sheetData[0])
      : Object.keys(objectRows[0]);

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

    const arrayRows = objectRows.map(row =>
      headers.map(header => row[header] ?? '')
    );

    const { insertedCount } = await batchAppendSheetData(sheetName, arrayRows);
    return NextResponse.json({
      success: true,
      message: 'Created',
      data: { count: insertedCount },
      RecordCount: insertedCount,
      count: insertedCount,
    }, { status: 201 });
  } catch (error: any) {
    logError('api.data.batch', 'POST', error);
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
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { sheetName } = await context.params;
    const body = await req.json();
    const updates: { idField: string; idValue: string; fields: Record<string, string> }[] = body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'updates must be a non-empty array',
      }, { status: 400 });
    }

    const { updatedCount } = await batchUpdateSheetData(sheetName, updates);
    return NextResponse.json({
      success: true,
      message: 'Updated',
      data: { count: updatedCount },
      RecordCount: updatedCount,
      count: updatedCount,
    }, { status: 200 });
  } catch (error: any) {
    logError('api.data.batch', 'PUT', error);
    return NextResponse.json({
      success: false,
      error: 'SHEETS_ERROR',
      message: error.message || 'Google Sheets error',
    }, { status: 502 });
  }
}
