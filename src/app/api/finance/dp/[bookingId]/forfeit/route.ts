import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSheetData, updateSheetData } from '@/lib/google-sheets';

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
    if (rental.DP_Status === 'forfeited') {
      return NextResponse.json({ success: false, message: 'DP already marked as forfeited' }, { status: 400 });
    }
    if (rental.Status_Sewa !== 'SELESAI') {
      return NextResponse.json({
        success: false,
        message: 'Can only forfeit DP on a completed/cancelled booking (Status_Sewa must be SELESAI)',
      }, { status: 400 });
    }

    await updateSheetData('Transaksi_Sewa', 'ID_Sewa', bookingId, {
      DP_Status: 'forfeited',
    });

    return NextResponse.json({
      success: true,
      message: 'DP marked as forfeited',
      RecordCount: 1,
      data: { bookingId, DP_Status: 'forfeited' },
    });
  } catch (error: any) {
    console.error('[PATCH /api/finance/dp/[bookingId]/forfeit]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
