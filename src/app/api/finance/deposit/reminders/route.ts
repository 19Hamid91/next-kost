import { NextRequest } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';
import { calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';
import { requireSession, successResponse, errorResponse, logError } from '@/lib/apiUtils';
import { Rental, Room, Tenant } from '@/types';
import { DepositReminder } from '@/types/finance';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const [rentals, rooms, tenants] = await Promise.all([
      getSheetData<Rental>('Transaksi_Sewa'),
      getSheetData<Room>('Master_Kamar'),
      getSheetData<Tenant>('Master_Penghuni'),
    ]);

    const reminders: DepositReminder[] = rentals
      .filter((rental) => {
        if (rental.Deposit_Status === 'refunded') return false;
        if (!rental.Tgl_Masuk) return false;

        const startDate = new Date(rental.Tgl_Masuk);
        const periode = parseInt(rental.Periode_Sewa) || 1;
        const unit = parseDurasiUnit(rental.Unit_Durasi);
        const endDate = calculateDueDate(startDate, periode, unit);

        return endDate >= today && endDate <= sevenDaysLater;
      })
      .filter((rental) => {
        const startDate = new Date(rental.Tgl_Masuk);
        const periode = parseInt(rental.Periode_Sewa) || 1;
        const unit = parseDurasiUnit(rental.Unit_Durasi);
        const endDate = calculateDueDate(startDate, periode, unit);

        const hasRenewal = rentals.some((otherRental) => {
          if (otherRental.ID_Sewa === rental.ID_Sewa) return false;
          if (otherRental.ID_Kamar !== rental.ID_Kamar) return false;
          if (otherRental.ID_Penghuni !== rental.ID_Penghuni) return false;
          const otherStatus = otherRental.Status_Sewa;
          if (otherStatus !== 'AKTIF' && otherStatus !== 'BOOKING') return false;
          if (!otherRental.Tgl_Masuk) return false;
          return new Date(otherRental.Tgl_Masuk) > endDate;
        });

        return !hasRenewal;
      })
      .map((rental) => {
        const room = rooms.find((r) => r.ID_Kamar === rental.ID_Kamar);
        const tenant = tenants.find((t) => t.ID_Penghuni === rental.ID_Penghuni);

        const startDate = new Date(rental.Tgl_Masuk);
        const periode = parseInt(rental.Periode_Sewa) || 1;
        const unit = parseDurasiUnit(rental.Unit_Durasi);
        const endDate = calculateDueDate(startDate, periode, unit);

        const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          bookingId: rental.ID_Sewa,
          tenantName: tenant?.Nama ?? rental.ID_Penghuni,
          roomNumber: room?.No_Kamar ?? rental.ID_Kamar,
          endDate: endDate.toISOString().split('T')[0],
          depositAmount: parseInt(rental.Nominal_Deposit || '0'),
          daysUntilEnd,
        };
      })
      .sort((reminderA, reminderB) => reminderA.daysUntilEnd - reminderB.daysUntilEnd);

    return successResponse(reminders, reminders.length);
  } catch (error: any) {
    logError('api.finance.deposit.reminders', 'GET', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
