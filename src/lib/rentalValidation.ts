import { calculateDueDate, parseDurasiUnit, resolveStatusSewa } from './dateUtils';
import { Rental } from '@/types';

export interface OverlapResult {
  hasConflict: boolean;
  message?: string;
  availableDate?: Date;
}

export function checkRoomOverlap(params: {
  newRental: Partial<Rental>;
  allRentals: Rental[];
  editingId: string | null;
  isAdding: boolean;
}): OverlapResult {
  const { newRental, allRentals, editingId, isAdding } = params;
  if (!newRental.ID_Kamar) return { hasConflict: false };

  const newStartDate = newRental.Tgl_Masuk ? new Date(newRental.Tgl_Masuk) : new Date();
  const newPeriode = parseInt(newRental.Periode_Sewa || '1') || 1;
  const newUnit = parseDurasiUnit(newRental.Unit_Durasi);
  const newEndDate = calculateDueDate(newStartDate, newPeriode, newUnit);

  const roomConflict = allRentals.find((rental) => {
    if (!isAdding && rental.ID_Sewa === editingId) return false;
    if (rental.ID_Kamar !== newRental.ID_Kamar) return false;

    const status = resolveStatusSewa(rental);
    if (status !== 'AKTIF' && status !== 'BOOKING') return false;

    const existingStart = rental.Tgl_Masuk ? new Date(rental.Tgl_Masuk) : null;
    if (!existingStart) return true;

    const existingPeriode = parseInt(rental.Periode_Sewa || '1') || 1;
    const existingUnit = parseDurasiUnit(rental.Unit_Durasi);
    const existingEnd = calculateDueDate(existingStart, existingPeriode, existingUnit);

    return newStartDate <= existingEnd && newEndDate > existingStart;
  });

  if (roomConflict) {
    const existingStart = roomConflict.Tgl_Masuk ? new Date(roomConflict.Tgl_Masuk) : new Date();
    const existingEnd = calculateDueDate(
      existingStart,
      parseInt(roomConflict.Periode_Sewa || '1') || 1,
      parseDurasiUnit(roomConflict.Unit_Durasi)
    );
    const availableDate = new Date(existingEnd);
    availableDate.setDate(availableDate.getDate() + 1);
    
    const endDateStr = existingEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const availableDateStr = availableDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return {
      hasConflict: true,
      message: `Kamar sudah terisi hingga ${endDateStr}. Booking dapat dilakukan mulai ${availableDateStr}.`,
      availableDate,
    };
  }

  return { hasConflict: false };
}

export function checkTenantOverlap(params: {
  newRental: Partial<Rental>;
  allRentals: Rental[];
  editingId: string | null;
  isAdding: boolean;
}): OverlapResult {
  const { newRental, allRentals, editingId, isAdding } = params;
  if (!newRental.ID_Penghuni) return { hasConflict: false };

  const newStartDate = newRental.Tgl_Masuk ? new Date(newRental.Tgl_Masuk) : new Date();
  const newPeriode = parseInt(newRental.Periode_Sewa || '1') || 1;
  const newUnit = parseDurasiUnit(newRental.Unit_Durasi);
  const newEndDate = calculateDueDate(newStartDate, newPeriode, newUnit);

  const tenantConflict = allRentals.find((rental) => {
    if (!isAdding && rental.ID_Sewa === editingId) return false;
    if (rental.ID_Penghuni !== newRental.ID_Penghuni) return false;

    const status = resolveStatusSewa(rental);
    if (status !== 'AKTIF' && status !== 'BOOKING') return false;

    const existingStart = rental.Tgl_Masuk ? new Date(rental.Tgl_Masuk) : null;
    if (!existingStart) return true;

    const existingPeriode = parseInt(rental.Periode_Sewa || '1') || 1;
    const existingUnit = parseDurasiUnit(rental.Unit_Durasi);
    const existingEnd = calculateDueDate(existingStart, existingPeriode, existingUnit);

    return newStartDate <= existingEnd && newEndDate > existingStart;
  });

  if (tenantConflict) {
    const tenantStatus = resolveStatusSewa(tenantConflict);
    return {
      hasConflict: true,
      message: `Penghuni sudah menyewa kamar lain dengan status ${tenantStatus} pada periode yang sama.`,
    };
  }

  return { hasConflict: false };
}

export interface ActivationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether a rental record can be set to AKTIF status.
 * Guards ALL transitions to AKTIF (BOOKING → AKTIF and SELESAI → AKTIF),
 * preventing premature activation or duplicate active contracts on the same room.
 */
export function canActivateRental(params: {
  rental: Partial<Rental>;
  allRentals: Rental[];
  editingId: string | null;
}): ActivationResult {
  const { rental, allRentals, editingId } = params;

  // Guard 1: Check-in date must not be in the future
  if (rental.Tgl_Masuk) {
    const checkInDate = new Date(rental.Tgl_Masuk);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate > today) {
      const dateStr = checkInDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return {
        allowed: false,
        reason: `Check-in belum tiba (${dateStr}). Status hanya bisa BOOKING.`,
      };
    }
  }

  // Guard 2: Room must not have another AKTIF contract
  if (rental.ID_Kamar) {
    const conflictingActive = allRentals.find((existingRental) => {
      if (existingRental.ID_Sewa === editingId) return false; // exclude self
      if (existingRental.ID_Kamar !== rental.ID_Kamar) return false;
      return resolveStatusSewa(existingRental) === 'AKTIF';
    });

    if (conflictingActive) {
      const existingStart = conflictingActive.Tgl_Masuk
        ? new Date(conflictingActive.Tgl_Masuk)
        : new Date();
      const existingPeriode = parseInt(conflictingActive.Periode_Sewa || '1') || 1;
      const existingUnit = parseDurasiUnit(conflictingActive.Unit_Durasi);
      const existingEnd = calculateDueDate(existingStart, existingPeriode, existingUnit);
      const endDateStr = existingEnd.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return {
        allowed: false,
        reason: `Kamar masih ditempati penyewa aktif hingga ${endDateStr}.`,
      };
    }
  }

  return { allowed: true };
}
