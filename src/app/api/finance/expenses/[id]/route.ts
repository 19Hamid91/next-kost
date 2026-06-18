import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteSheetData } from '@/lib/google-sheets';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ success: false, message: 'Missing expense ID' }, { status: 400 });

    await deleteSheetData('Expenses', 'ID_Expense', id);

    return NextResponse.json({ success: true, message: 'Deleted', RecordCount: 1 });
  } catch (error: any) {
    console.error('[DELETE /api/finance/expenses/[id]]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
