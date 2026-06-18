'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { resolveStatusSewa } from '@/lib/dateUtils';
import { fetcher } from '@/lib/fetcher';
import { formatPhone } from '@/lib/formatPhone';
import { checkRoomOverlap, checkTenantOverlap } from '@/lib/rentalValidation';
import { Room, Tenant, Rental, ApiResponse } from '@/types';

export function useManagement(kostId: string) {
  const { data: roomsData } = useSWR<ApiResponse<Room[]>>('/api/data/Master_Kamar', fetcher);
  const { data: tenantsData } = useSWR<ApiResponse<Tenant[]>>('/api/data/Master_Penghuni', fetcher);
  const { data: rentalsData } = useSWR<ApiResponse<Rental[]>>('/api/data/Transaksi_Sewa', fetcher);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allRooms = roomsData?.data || [];
  const allTenants = tenantsData?.data || [];
  const allRentals = rentalsData?.data || [];

  const rooms = allRooms.filter((room) => room.ID_Kost === kostId);
  const tenants = allTenants.filter((tenant) => tenant.ID_Kost === kostId || !tenant.ID_Kost);
  const rentals = allRentals.filter((rental) => {
    const room = allRooms.find((rm) => rm.ID_Kamar === rental.ID_Kamar);
    return room?.ID_Kost === kostId || rental.ID_Kost === kostId;
  });

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
      const payload = { ...editFormData };
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

        const newStatus = payload.Status_Sewa || (payload.Status_Aktif === 'TRUE' ? 'AKTIF' : 'SELESAI');
        if (newStatus === 'AKTIF' || newStatus === 'BOOKING') {
          const roomConflict = checkRoomOverlap({
            newRental: payload,
            allRentals,
            editingId,
            isAdding,
          });

          if (roomConflict.hasConflict) {
            toast.error(roomConflict.message);
            setActionLoading(null);
            return;
          }

          const tenantConflict = checkTenantOverlap({
            newRental: payload,
            allRentals,
            editingId,
            isAdding,
          });

          if (tenantConflict.hasConflict) {
            toast.error(tenantConflict.message);
            setActionLoading(null);
            return;
          }
        }
      }

      if (isAdding && !payload[idField]) {
        payload[idField] = `${sheetName[0]}${Date.now()}`;
      }

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const selectAll = (ids: string[]) => setSelectedIds(ids);

  const handleBulkUpdate = async (
    sheetName: string,
    idField: string,
    fields: Record<string, string>,
    previousData?: any[]
  ): Promise<boolean> => {
    setActionLoading('bulk');

    const updates = selectedIds.map((idValue) => ({ idField, idValue, fields }));

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
        mutate(`/api/data/${sheetName}`);
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
