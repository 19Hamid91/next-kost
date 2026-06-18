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
