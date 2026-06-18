import { NextRequest } from 'next/server';
import { getSheetData, updateSheetData } from '@/lib/google-sheets';
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
    if (rental.DP_Status === 'forfeited') {
      return errorResponse('DP already marked as forfeited', 400);
    }
    if (rental.Status_Sewa !== 'SELESAI') {
      return errorResponse(
        'Can only forfeit DP on a completed/cancelled booking (Status_Sewa must be SELESAI)',
        400
      );
    }

    await updateSheetData('Transaksi_Sewa', 'ID_Sewa', bookingId, {
      DP_Status: 'forfeited',
    });

    const responseData = { bookingId, DP_Status: 'forfeited' };
    return successResponse(responseData, 1);
  } catch (error: any) {
    logError('api.finance.dp.[bookingId].forfeit', 'PATCH', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
