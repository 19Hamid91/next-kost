import { NextRequest } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';
import { calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';
import { requireSession, successResponse, errorResponse, logError } from '@/lib/apiUtils';
import { Room, Rental, Expense } from '@/types';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const targetMonth = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1));
    const targetYear = parseInt(searchParams.get('year') ?? String(now.getFullYear()));
    const kostId = searchParams.get('kostId');

    if (!kostId) {
      return errorResponse('Missing kostId parameter', 400);
    }

    const periodStart = new Date(targetYear, targetMonth - 1, 1);
    const periodEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const isInPeriod = (dateStr: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date >= periodStart && date <= periodEnd;
    };

    const [rentals, expenses, rooms] = await Promise.all([
      getSheetData<Rental>('Transaksi_Sewa'),
      getSheetData<Expense>('Expenses'),
      getSheetData<Room>('Master_Kamar'),
    ]);

    // Map rooms for kostId
    const filteredRooms = rooms.filter((r) => r.ID_Kost === kostId);
    const kostRoomIds = filteredRooms.map((r) => r.ID_Kamar);

    // Filter rentals belonging to this kost
    const filteredRentals = rentals.filter((rental) => kostRoomIds.includes(rental.ID_Kamar));

    // Total rent income: AKTIF rentals whose period overlaps this month
    let totalRentIncome = 0;
    for (const rental of filteredRentals) {
      const status = rental.Status_Sewa;
      if (status !== 'AKTIF' && status !== 'SELESAI') continue;

      const startDate = rental.Tgl_Masuk ? new Date(rental.Tgl_Masuk) : null;
      if (!startDate) continue;

      const periode = parseInt(rental.Periode_Sewa) || 1;
      const unit = parseDurasiUnit(rental.Unit_Durasi);
      const endDate = calculateDueDate(startDate, periode, unit);

      const overlaps = startDate <= periodEnd && endDate >= periodStart;
      if (!overlaps) continue;

      const room = filteredRooms.find((r) => r.ID_Kamar === rental.ID_Kamar);
      const monthlyRent = parseInt(rental.Monthly_Rent || room?.Harga_Sewa || '0');
      totalRentIncome += monthlyRent;
    }

    // DP received: DP_Status = 'paid', Tgl_Masuk (booking date) in period
    let totalDpReceived = 0;
    for (const rental of filteredRentals) {
      if (rental.DP_Status === 'paid' && isInPeriod(rental.Tgl_Masuk)) {
        totalDpReceived += parseInt(rental.DP_Amount || '0');
      }
    }

    // DP forfeited: DP_Status = 'forfeited', updated in period
    let totalDpForfeited = 0;
    for (const rental of filteredRentals) {
      if (rental.DP_Status === 'forfeited' && isInPeriod(rental.Tgl_Masuk)) {
        totalDpForfeited += parseInt(rental.DP_Amount || '0');
      }
    }

    // Expenses in period (expenses are global since they don't have ID_Kost)
    let totalExpenses = 0;
    for (const expense of expenses) {
      if (isInPeriod(expense.Date)) {
        totalExpenses += parseInt(expense.Amount || '0');
      }
    }

    // Deposit refunded in period
    let totalDepositRefunded = 0;
    for (const rental of filteredRentals) {
      if (rental.Deposit_Status === 'refunded' && isInPeriod(rental.Deposit_Refunded_At || '')) {
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

    return successResponse(summaryData, 1);
  } catch (error: any) {
    logError('api.finance.summary', 'GET', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
