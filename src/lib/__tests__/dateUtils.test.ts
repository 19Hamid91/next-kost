import { describe, it } from 'vitest';

describe('calculateDueDate', () => {
  it.todo('should add days correctly for Hari unit');
  it.todo('should add weeks correctly for Minggu unit');
  it.todo('should add months correctly for Bulan unit');
  it.todo('should handle year boundary crossover');
});

describe('resolveStatusSewa', () => {
  it.todo('should return AKTIF for Status_Sewa = AKTIF');
  it.todo('should fall back to Status_Aktif for legacy rows');
  it.todo('should return null for empty rental');
});
