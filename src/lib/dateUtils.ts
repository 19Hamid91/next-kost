import { addDays, addWeeks, addMonths } from 'date-fns';
import { Rental } from '@/types';

export type DurasiUnit = 'Hari' | 'Minggu' | 'Bulan';

/**
 * Calculate rental due date based on PRD spec:
 * - Hari  → addDays(startDate, periode)
 * - Minggu → addWeeks(startDate, periode)
 * - Bulan  → addMonths(startDate, periode)  [calendar-month, handles overflow]
 */
export function calculateDueDate(
  startDate: Date,
  periode: number,
  unit: DurasiUnit = 'Bulan'
): Date {
  switch (unit) {
    case 'Hari':
      return addDays(startDate, periode);
    case 'Minggu':
      return addWeeks(startDate, periode);
    case 'Bulan':
    default:
      return addMonths(startDate, periode);
  }
}

/**
 * Parse a rental's Unit_Durasi, falling back to 'Bulan' for legacy rows.
 */
export function parseDurasiUnit(raw?: string): DurasiUnit {
  if (raw === 'Hari' || raw === 'Minggu' || raw === 'Bulan') return raw;
  return 'Bulan';
}

/**
 * Resolve Status_Sewa from a rental row.
 */
export function resolveStatusSewa(rental: Rental | null | undefined): 'AKTIF' | 'SELESAI' | 'BOOKING' | null {
  if (!rental) return null;
  if (rental.Status_Sewa === 'AKTIF' || rental.Status_Sewa === 'SELESAI' || rental.Status_Sewa === 'BOOKING') {
    return rental.Status_Sewa;
  }
  return null;
}
