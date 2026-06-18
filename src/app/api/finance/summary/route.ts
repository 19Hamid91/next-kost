import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSheetData } from '@/lib/google-sheets';
import { calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const targetMonth = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1));
    const targetYear = parseInt(searchParams.get('year') ?? String(now.getFullYear()));

    const periodStart = new Date(targetYear, targetMonth - 1, 1);
    const periodEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59); // last day of month

    const isInPeriod = (dateStr: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date >= periodStart && date <= periodEnd;
    };

    const [rentals, expenses, rooms] = await Promise.all([
      getSheetData('Transaksi_Sewa'),
      getSheetData('Expenses'),
      getSheetData('Master_Kamar'),
    ]);

    // Total rent income: AKTIF rentals whose period overlaps this month
    let totalRentIncome = 0;
    for (const rental of rentals) {
      const status = rental.Status_Sewa;
      if (status !== 'AKTIF' && status !== 'SELESAI') continue;

      const startDate = rental.Tgl_Masuk ? new Date(rental.Tgl_Masuk) : null;
      if (!startDate) continue;

      const periode = parseInt(rental.Periode_Sewa) || 1;
      const unit = parseDurasiUnit(rental.Unit_Durasi);
      const endDate = calculateDueDate(startDate, periode, unit);

      // Rental overlaps the month if it started before period end and ended after period start
      const overlaps = startDate <= periodEnd && endDate >= periodStart;
      if (!overlaps) continue;

      // Monthly rent: use tenant-specific Monthly_Rent, fallback to room's Harga_Sewa
      const room = rooms.find((r: any) => r.ID_Kamar === rental.ID_Kamar);
      const monthlyRent = parseInt(rental.Monthly_Rent || room?.Harga_Sewa || '0');
      totalRentIncome += monthlyRent;
    }

    // DP received: DP_Status = 'paid', Tgl_Masuk (booking date) in period
    let totalDpReceived = 0;
    for (const rental of rentals) {
      if (rental.DP_Status === 'paid' && isInPeriod(rental.Tgl_Masuk)) {
        totalDpReceived += parseInt(rental.DP_Amount || '0');
      }
    }

    // DP forfeited: DP_Status = 'forfeited', updated in period (use Deposit_Refunded_At as proxy, else Tgl_Masuk)
    let totalDpForfeited = 0;
    for (const rental of rentals) {
      if (rental.DP_Status === 'forfeited' && isInPeriod(rental.Tgl_Masuk)) {
        totalDpForfeited += parseInt(rental.DP_Amount || '0');
      }
    }

    // Expenses in period
    let totalExpenses = 0;
    for (const expense of expenses) {
      if (isInPeriod(expense.Date)) {
        totalExpenses += parseInt(expense.Amount || '0');
      }
    }

    // Deposit refunded in period
    let totalDepositRefunded = 0;
    for (const rental of rentals) {
      if (rental.Deposit_Status === 'refunded' && isInPeriod(rental.Deposit_Refunded_At)) {
        totalDepositRefunded += parseInt(rental.Nominal_Deposit || '0');
      }
    }

    const netCashflow = totalRentIncome + totalDpReceived + totalDpForfeited - totalExpenses - totalDepositRefunded;

    const summaryData = {
      totalRentIncome,
      totalDpReceived,
      totalDpForfeited,
      totalExpenses,
      totalDepositRefunded,
      netCashflow,
      month: targetMonth,
      year: targetYear,
    };

    return NextResponse.json({ success: true, message: 'OK', RecordCount: 1, data: summaryData });
  } catch (error: any) {
    console.error('[GET /api/finance/summary]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
