import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSheetData } from '@/lib/google-sheets';
import { calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const [rentals, rooms, tenants] = await Promise.all([
      getSheetData('Transaksi_Sewa'),
      getSheetData('Master_Kamar'),
      getSheetData('Master_Penghuni'),
    ]);

    const reminders = rentals
      .filter((rental: any) => {
        if (rental.Deposit_Status === 'refunded') return false;
        if (!rental.Tgl_Masuk) return false;

        const startDate = new Date(rental.Tgl_Masuk);
        const periode = parseInt(rental.Periode_Sewa) || 1;
        const unit = parseDurasiUnit(rental.Unit_Durasi);
        const endDate = calculateDueDate(startDate, periode, unit);

        // End date within the next 7 days
        return endDate >= today && endDate <= sevenDaysLater;
      })
      .filter((rental: any) => {
        // No active/upcoming renewal for this tenant+room after current endDate
        const startDate = new Date(rental.Tgl_Masuk);
        const periode = parseInt(rental.Periode_Sewa) || 1;
        const unit = parseDurasiUnit(rental.Unit_Durasi);
        const endDate = calculateDueDate(startDate, periode, unit);

        const hasRenewal = rentals.some((otherRental: any) => {
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
      .map((rental: any) => {
        const room = rooms.find((r: any) => r.ID_Kamar === rental.ID_Kamar);
        const tenant = tenants.find((t: any) => t.ID_Penghuni === rental.ID_Penghuni);

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
      .sort((reminderA: any, reminderB: any) => reminderA.daysUntilEnd - reminderB.daysUntilEnd);

    return NextResponse.json({ success: true, message: 'OK', RecordCount: reminders.length, data: reminders });
  } catch (error: any) {
    console.error('[GET /api/finance/deposit/reminders]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
