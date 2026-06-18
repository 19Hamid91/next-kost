import { describe, it, expect } from 'vitest';
import { canActivateRental } from '../rentalValidation';
import { Rental } from '@/types';

describe('checkRoomOverlap', () => {
  it.todo('should detect overlap when new rental starts before existing ends');
  it.todo('should allow booking on the day after existing rental ends');
  it.todo('should skip the current rental when editing');
});

describe('checkTenantOverlap', () => {
  it.todo('should block tenant from having two active rentals simultaneously');
});

// Helper: build a minimal Rental for tests
function makeRental(overrides: Partial<Rental>): Rental {
  return {
    ID_Sewa: 'SEWA-001',
    ID_Kamar: 'KAMAR-001',
    ID_Penghuni: 'PGH-001',
    Tgl_Masuk: '2025-01-01',
    Periode_Sewa: '1',
    Unit_Durasi: 'Bulan',
    Status_Sewa: 'AKTIF',
    ...overrides,
  };
}

describe('canActivateRental', () => {
  it('should block activation when Tgl_Masuk is in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const result = canActivateRental({
      rental: { ID_Kamar: 'KAMAR-001', Tgl_Masuk: futureDateStr },
      allRentals: [],
      editingId: null,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Check-in belum tiba');
  });

  it('should allow activation when Tgl_Masuk is today', () => {
    const today = new Date().toISOString().split('T')[0];

    const result = canActivateRental({
      rental: { ID_Kamar: 'KAMAR-001', Tgl_Masuk: today },
      allRentals: [],
      editingId: null,
    });

    expect(result.allowed).toBe(true);
  });

  it('should block activation when room already has an AKTIF rental', () => {
    const existingRental = makeRental({
      ID_Sewa: 'SEWA-EXISTING',
      ID_Kamar: 'KAMAR-001',
      Status_Sewa: 'AKTIF',
      Tgl_Masuk: '2025-01-01',
      Periode_Sewa: '3',
      Unit_Durasi: 'Bulan',
    });

    const result = canActivateRental({
      rental: { ID_Kamar: 'KAMAR-001', Tgl_Masuk: '2025-02-01' },
      allRentals: [existingRental],
      editingId: null,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Kamar masih ditempati');
  });

  it('should allow activation when the only AKTIF record is itself (self-exclusion)', () => {
    const selfRental = makeRental({
      ID_Sewa: 'SEWA-SELF',
      ID_Kamar: 'KAMAR-001',
      Status_Sewa: 'AKTIF',
      Tgl_Masuk: '2025-01-01',
    });

    const pastDate = '2025-01-01';
    const result = canActivateRental({
      rental: { ID_Kamar: 'KAMAR-001', Tgl_Masuk: pastDate },
      allRentals: [selfRental],
      editingId: 'SEWA-SELF',
    });

    expect(result.allowed).toBe(true);
  });

  it('should allow activation when room has no conflicts and date is past', () => {
    const result = canActivateRental({
      rental: { ID_Kamar: 'KAMAR-002', Tgl_Masuk: '2025-03-01' },
      allRentals: [],
      editingId: null,
    });

    expect(result.allowed).toBe(true);
  });
});
