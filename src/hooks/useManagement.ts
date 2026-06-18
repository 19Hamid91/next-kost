'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { resolveStatusSewa, calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useManagement(kostId: string) {
  const { data: roomsData, isLoading: roomsLoading } = useSWR('/api/data/Master_Kamar', fetcher);
  const { data: tenantsData, isLoading: tenantsLoading } = useSWR('/api/data/Master_Penghuni', fetcher);
  const { data: rentalsData, isLoading: rentalsLoading } = useSWR('/api/data/Transaksi_Sewa', fetcher);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allRooms = roomsData?.data || [];
  const allTenants = tenantsData?.data || [];
  const allRentals = rentalsData?.data || [];

  const rooms = allRooms.filter((room: any) => room.ID_Kost === kostId);
  const tenants = allTenants.filter((tenant: any) => tenant.ID_Kost === kostId || !tenant.ID_Kost);
  const rentals = allRentals.filter((rental: any) => {
    const room = allRooms.find((rm: any) => rm.ID_Kamar === rental.ID_Kamar);
    return room?.ID_Kost === kostId || rental.ID_Kost === kostId;
  });

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.startsWith('0')) return '62' + cleaned.substring(1);
    return cleaned;
  };

  // ── Single item CRUD ────────────────────────────────────────────────

  const handleEdit = (item: any, idField: string) => {
    setEditingId(item[idField]);
    setEditFormData(item);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditFormData({});
  };

  const startAdding = (initialData: any = {}) => {
    setIsAdding(true);
    setEditingId('new');
    setEditFormData(initialData);
  };

  const handleSave = async (sheetName: string, idField: string) => {
    setActionLoading('save');
    try {
      const method = isAdding ? 'POST' : 'PUT';
      let payload = { ...editFormData };
      payload.ID_Kost = kostId;

      if (sheetName === 'Transaksi_Sewa') {
        if (!payload.ID_Kamar || !payload.ID_Kamar.trim()) {
          toast.error('Pilih kamar terlebih dahulu');
          setActionLoading(null);
          return;
        }
        if (!payload.ID_Penghuni || !payload.ID_Penghuni.trim()) {
          toast.error('Pilih penghuni terlebih dahulu');
          setActionLoading(null);
          return;
        }

        // Check for date-range overlap: new booking must not overlap existing AKTIF/BOOKING rentals
        const newStatus = payload.Status_Sewa || (payload.Status_Aktif === 'TRUE' ? 'AKTIF' : 'SELESAI');
        if (newStatus === 'AKTIF' || newStatus === 'BOOKING') {
          const newStartDate = payload.Tgl_Masuk ? new Date(payload.Tgl_Masuk) : new Date();
          const newPeriode = parseInt(payload.Periode_Sewa) || 1;
          const newUnit = parseDurasiUnit(payload.Unit_Durasi);
          const newEndDate = calculateDueDate(newStartDate, newPeriode, newUnit);

          const roomConflict = allRentals.find((rental: any) => {
            if (!isAdding && rental.ID_Sewa === editingId) return false;
            if (rental.ID_Kamar !== payload.ID_Kamar) return false;

            const status = resolveStatusSewa(rental);
            if (status !== 'AKTIF' && status !== 'BOOKING') return false;

            const existingStart = rental.Tgl_Masuk ? new Date(rental.Tgl_Masuk) : null;
            if (!existingStart) return true; // no date data — block to be safe

            const existingPeriode = parseInt(rental.Periode_Sewa) || 1;
            const existingUnit = parseDurasiUnit(rental.Unit_Durasi);
            const existingEnd = calculateDueDate(existingStart, existingPeriode, existingUnit);

            // Overlap: newStart <= existingEnd AND newEnd > existingStart
            // <= because the room is occupied through the end date (next tenant can start day after)
            return newStartDate <= existingEnd && newEndDate > existingStart;
          });

          if (roomConflict) {
            const existingStart = roomConflict.Tgl_Masuk ? new Date(roomConflict.Tgl_Masuk) : new Date();
            const existingEnd = calculateDueDate(
              existingStart,
              parseInt(roomConflict.Periode_Sewa) || 1,
              parseDurasiUnit(roomConflict.Unit_Durasi)
            );
            const availableDate = new Date(existingEnd);
            availableDate.setDate(availableDate.getDate() + 1);
            const availableDateStr = availableDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const endDateStr = existingEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            toast.error(`Kamar sudah terisi hingga ${endDateStr}. Booking dapat dilakukan mulai ${availableDateStr}.`);
            setActionLoading(null);
            return;
          }

          const tenantConflict = allRentals.find((rental: any) => {
            if (!isAdding && rental.ID_Sewa === editingId) return false;
            if (rental.ID_Penghuni !== payload.ID_Penghuni) return false;

            const status = resolveStatusSewa(rental);
            if (status !== 'AKTIF' && status !== 'BOOKING') return false;

            const existingStart = rental.Tgl_Masuk ? new Date(rental.Tgl_Masuk) : null;
            if (!existingStart) return true;

            const existingPeriode = parseInt(rental.Periode_Sewa) || 1;
            const existingUnit = parseDurasiUnit(rental.Unit_Durasi);
            const existingEnd = calculateDueDate(existingStart, existingPeriode, existingUnit);

            return newStartDate <= existingEnd && newEndDate > existingStart;
          });

          if (tenantConflict) {
            const tenantStatus = resolveStatusSewa(tenantConflict);
            toast.error(`Penghuni sudah menyewa kamar lain dengan status ${tenantStatus} pada periode yang sama.`);
            setActionLoading(null);
            return;
          }
        }
      }

      if (isAdding && !payload[idField]) {
        payload[idField] = `${sheetName[0]}${Date.now()}`;
      }

      // Migrate Status_Aktif → Status_Sewa on save
      if (sheetName === 'Transaksi_Sewa' && payload.Status_Aktif !== undefined) {
        payload.Status_Sewa = payload.Status_Aktif === 'TRUE' ? 'AKTIF' : 'SELESAI';
        delete payload.Status_Aktif;
      }

      if (payload.No_HP) payload.No_HP = formatPhone(payload.No_HP);
      if (payload.Kontak_Darurat) payload.Kontak_Darurat = formatPhone(payload.Kontak_Darurat);

      const body = isAdding ? payload : { idField, idValue: editingId, ...payload };

      const res = await fetch(`/api/data/${sheetName}`, {
        method,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Data berhasil disimpan');
        mutate(`/api/data/${sheetName}`);
        cancelEdit();
      } else {
        const result = await res.json();
        toast.error(result.message || 'Gagal menyimpan data');
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (sheetName: string, idField: string, idValue: string) => {
    setActionLoading(`delete-${idValue}`);
    try {
      const res = await fetch(`/api/data/${sheetName}?idField=${idField}&idValue=${idValue}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Data berhasil dihapus');
        mutate(`/api/data/${sheetName}`);
      } else {
        toast.error('Gagal menghapus data');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus data');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Bulk selection ──────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(existingId => existingId !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const selectAll = (ids: string[]) => setSelectedIds(ids);

  // ── Bulk update via batch API ───────────────────────────────────────

  const handleBulkUpdate = async (
    sheetName: string,
    idField: string,
    fields: Record<string, string>,
    previousData?: any[]
  ): Promise<boolean> => {
    setActionLoading('bulk');

    // Optimistic update
    const updates = selectedIds.map(idValue => ({ idField, idValue, fields }));

    try {
      const res = await fetch(`/api/data/${sheetName}/batch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`${result.count} data berhasil diperbarui`);
        mutate(`/api/data/${sheetName}`);
        clearSelection();
        return true;
      } else {
        toast.error(result.message || 'Gagal memperbarui data');
        mutate(`/api/data/${sheetName}`); // revalidate to revert
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
      mutate(`/api/data/${sheetName}`);
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  return {
    rooms,
    tenants,
    rentals,
    allRooms,
    allTenants,
    isLoading: !roomsData || !tenantsData || !rentalsData,
    editingId,
    editFormData,
    isAdding,
    actionLoading,
    selectedIds,
    setEditFormData,
    handleEdit,
    cancelEdit,
    startAdding,
    handleSave,
    handleDelete,
    toggleSelect,
    clearSelection,
    selectAll,
    handleBulkUpdate,
    resolveStatusSewa,
  };
}
