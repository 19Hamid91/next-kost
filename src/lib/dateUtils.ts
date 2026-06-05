import { addDays, addWeeks } from 'date-fns';

export type DurasiUnit = 'Hari' | 'Minggu' | 'Bulan';

/**
 * Calculate rental due date based on PRD spec:
 * - Hari  → addDays(startDate, periode)
 * - Minggu → addWeeks(startDate, periode)
 * - Bulan  → addDays(startDate, periode × 30)  [fixed 30-day month]
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
      return addDays(startDate, periode * 30);
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
 * Falls back to Status_Aktif for legacy rows that haven't been migrated yet.
 */
export function resolveStatusSewa(rental: any): 'AKTIF' | 'SELESAI' | 'BOOKING' | null {
  if (!rental) return null;
  if (rental.Status_Sewa === 'AKTIF' || rental.Status_Sewa === 'SELESAI' || rental.Status_Sewa === 'BOOKING') {
    return rental.Status_Sewa;
  }
  // Legacy fallback
  if (rental.Status_Aktif === 'TRUE') return 'AKTIF';
  if (rental.Status_Aktif === 'FALSE') return 'SELESAI';
  return null;
}
