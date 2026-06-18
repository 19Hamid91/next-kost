import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSheetData, updateSheetData } from '@/lib/google-sheets';
import { calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { bookingId } = await context.params;

    const rentals = await getSheetData('Transaksi_Sewa');
    const rental = rentals.find((r: any) => r.ID_Sewa === bookingId);

    if (!rental) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }
    if (rental.Deposit_Status === 'refunded') {
      return NextResponse.json({ success: false, message: 'Deposit already refunded' }, { status: 400 });
    }

    // Block if booking is still active (end date > today)
    if (rental.Tgl_Masuk) {
      const startDate = new Date(rental.Tgl_Masuk);
      const periode = parseInt(rental.Periode_Sewa) || 1;
      const unit = parseDurasiUnit(rental.Unit_Durasi);
      const endDate = calculateDueDate(startDate, periode, unit);
      if (endDate > new Date()) {
        return NextResponse.json({
          success: false,
          message: 'Cannot refund deposit for an active booking. Tenant must have moved out first.',
        }, { status: 400 });
      }
    }

    const refundedAt = new Date().toISOString().split('T')[0];
    await updateSheetData('Transaksi_Sewa', 'ID_Sewa', bookingId, {
      Deposit_Status: 'refunded',
      Deposit_Refunded_At: refundedAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit marked as refunded',
      RecordCount: 1,
      data: { bookingId, Deposit_Status: 'refunded', Deposit_Refunded_At: refundedAt },
    });
  } catch (error: any) {
    console.error('[PATCH /api/finance/deposit/[bookingId]/refund]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
