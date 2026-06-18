import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSheetData, appendSheetData, deleteSheetData } from '@/lib/google-sheets';

const VALID_CATEGORIES = ['electricity', 'water', 'internet', 'repair', 'other'];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const targetMonth = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1));
    const targetYear = parseInt(searchParams.get('year') ?? String(now.getFullYear()));
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '50');

    const periodStart = new Date(targetYear, targetMonth - 1, 1);
    const periodEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const allExpenses = await getSheetData('Expenses');

    const filtered = allExpenses.filter((expense: any) => {
      if (!expense.Date) return false;
      const date = new Date(expense.Date);
      return date >= periodStart && date <= periodEnd;
    });

    // Sort newest first
    filtered.sort((expenseA: any, expenseB: any) =>
      new Date(expenseB.Date).getTime() - new Date(expenseA.Date).getTime()
    );

    const totalCount = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      message: 'OK',
      RecordCount: totalCount,
      data: paginated,
      pagination: { page, limit, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (error: any) {
    console.error('[GET /api/finance/expenses]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { date, category, amount, notes } = body;

    if (!date || isNaN(new Date(date).getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date' }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
    }
    if (!amount || !Number.isInteger(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ success: false, message: 'Amount must be a positive integer' }, { status: 400 });
    }

    const newExpense = {
      ID_Expense: `EXP-${Date.now()}`,
      Date: date,
      Category: category,
      Amount: String(amount),
      Notes: notes ?? '',
      Created_At: new Date().toISOString(),
    };

    await appendSheetData('Expenses', newExpense);

    return NextResponse.json({ success: true, message: 'Created', RecordCount: 1, data: newExpense });
  } catch (error: any) {
    console.error('[POST /api/finance/expenses]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
