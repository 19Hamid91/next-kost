'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useManagement(kostId: string) {
  const { data: roomsData, isLoading: roomsLoading } = useSWR('/api/data/Master_Kamar', fetcher);
  const { data: tenantsData, isLoading: tenantsLoading } = useSWR('/api/data/Master_Penghuni', fetcher);
  const { data: rentalsData, isLoading: rentalsLoading } = useSWR('/api/data/Transaksi_Sewa', fetcher);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const allRooms = roomsData?.data || [];
  const allTenants = tenantsData?.data || [];
  const allRentals = rentalsData?.data || [];

  const rooms = allRooms.filter((r: any) => r.ID_Kost === kostId);
  const tenants = allTenants.filter((t: any) => t.ID_Kost === kostId || !t.ID_Kost);
  const rentals = allRentals.filter((r: any) => {
    const room = allRooms.find((rm: any) => rm.ID_Kamar === r.ID_Kamar);
    return room?.ID_Kost === kostId || r.ID_Kost === kostId;
  });

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.startsWith('0')) return '62' + cleaned.substring(1);
    return cleaned;
  };

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

      if (isAdding && !payload[idField]) {
        payload[idField] = `${sheetName[0]}${Date.now()}`;
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
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus data');
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
    setEditFormData,
    handleEdit,
    cancelEdit,
    startAdding,
    handleSave,
    handleDelete
  };
}
