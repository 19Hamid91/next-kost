import { NextRequest } from 'next/server';
import { getSheetData, updateSheetData } from '@/lib/google-sheets';
import { calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';
import { requireSession, successResponse, errorResponse, logError } from '@/lib/apiUtils';
import { Rental } from '@/types';

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await requireSession();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { bookingId } = await context.params;

    const rentals = await getSheetData<Rental>('Transaksi_Sewa');
    const rental = rentals.find((r) => r.ID_Sewa === bookingId);

    if (!rental) {
      return errorResponse('Booking not found', 404);
    }
    if (rental.Deposit_Status === 'refunded') {
      return errorResponse('Deposit already refunded', 400);
    }

    if (rental.Tgl_Masuk) {
      const startDate = new Date(rental.Tgl_Masuk);
      const periode = parseInt(rental.Periode_Sewa) || 1;
      const unit = parseDurasiUnit(rental.Unit_Durasi);
      const endDate = calculateDueDate(startDate, periode, unit);
      if (endDate > new Date()) {
        return errorResponse(
          'Cannot refund deposit for an active booking. Tenant must have moved out first.',
          400
        );
      }
    }

    const refundedAt = new Date().toISOString().split('T')[0];
    await updateSheetData('Transaksi_Sewa', 'ID_Sewa', bookingId, {
      Deposit_Status: 'refunded',
      Deposit_Refunded_At: refundedAt,
    });

    const responseData = { bookingId, Deposit_Status: 'refunded', Deposit_Refunded_At: refundedAt };
    return successResponse(responseData, 1);
  } catch (error: any) {
    logError('api.finance.deposit.[bookingId].refund', 'PATCH', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
