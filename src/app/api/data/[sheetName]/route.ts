import { NextRequest, NextResponse } from 'next/server';
import { getSheetData, appendSheetData, updateSheetData, deleteSheetData } from '@/lib/google-sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type RouteContext = { params: Promise<{ sheetName: string }> };

async function requireSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { sheetName } = await context.params;
    const data = await getSheetData(sheetName);
    return NextResponse.json({ success: true, message: 'OK', data, RecordCount: data.length });
  } catch (error: any) {
    console.error(`[GET] Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { sheetName } = await context.params;
    const body = await req.json();
    await appendSheetData(sheetName, body);
    return NextResponse.json({ success: true, message: 'Created', data: body, RecordCount: 1 });
  } catch (error: any) {
    console.error(`[POST] Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { sheetName } = await context.params;
    const body = await req.json();
    const { idField, idValue, ...data } = body;

    if (!idField || !idValue) {
      return NextResponse.json({ success: false, message: 'Missing idField or idValue' }, { status: 400 });
    }

    await updateSheetData(sheetName, idField, idValue, data);
    return NextResponse.json({ success: true, message: 'Updated', data: body, RecordCount: 1 });
  } catch (error: any) {
    console.error(`[PUT] Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { sheetName } = await context.params;
    const { searchParams } = new URL(req.url);
    const idField = searchParams.get('idField');
    const idValue = searchParams.get('idValue');

    if (!idField || !idValue) {
      return NextResponse.json({ success: false, message: 'Missing idField or idValue' }, { status: 400 });
    }

    await deleteSheetData(sheetName, idField, idValue);
    return NextResponse.json({ success: true, message: 'Deleted', RecordCount: 1 });
  } catch (error: any) {
    console.error(`[DELETE] Error:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
