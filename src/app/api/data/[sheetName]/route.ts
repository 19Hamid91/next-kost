import { NextRequest } from 'next/server';
import { getSheetData, appendSheetData, updateSheetData, deleteSheetData } from '@/lib/google-sheets';
import { requireSession, successResponse, errorResponse, logError } from '@/lib/apiUtils';

type RouteContext = { params: Promise<{ sheetName: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { sheetName } = await context.params;
    const data = await getSheetData(sheetName);
    return successResponse(data, data.length);
  } catch (error: any) {
    logError('api.data.[sheetName]', 'GET', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { sheetName } = await context.params;
    const body = await req.json();
    await appendSheetData(sheetName, body);
    return successResponse(body, 1, 201);
  } catch (error: any) {
    logError('api.data.[sheetName]', 'POST', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { sheetName } = await context.params;
    const body = await req.json();
    const { idField, idValue, ...data } = body;

    if (!idField || !idValue) {
      return errorResponse('Missing idField or idValue', 400);
    }

    await updateSheetData(sheetName, idField, idValue, data);
    return successResponse(body, 1);
  } catch (error: any) {
    logError('api.data.[sheetName]', 'PUT', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { sheetName } = await context.params;
    const { searchParams } = new URL(req.url);
    const idField = searchParams.get('idField');
    const idValue = searchParams.get('idValue');

    if (!idField || !idValue) {
      return errorResponse('Missing idField or idValue', 400);
    }

    await deleteSheetData(sheetName, idField, idValue);
    return successResponse({ idField, idValue }, 1);
  } catch (error: any) {
    logError('api.data.[sheetName]', 'DELETE', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
