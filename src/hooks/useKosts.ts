'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useKosts() {
  const { data: kostsData, isLoading } = useSWR('/api/data/Master_Kost', fetcher);
  const kosts = kostsData?.data || [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const startAdding = () => {
    setEditingId('new');
    setEditFormData({});
  };

  const startEditing = (kost: any) => {
    setEditingId(kost.ID_Kost);
    setEditFormData(kost);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSave = async () => {
    const isAdding = editingId === 'new';
    setActionLoading('save');
    try {
      const method = isAdding ? 'POST' : 'PUT';
      let payload = { ...editFormData };

      if (isAdding && !payload.ID_Kost) {
        const slug = payload.Nama_Kost?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        payload.ID_Kost = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
      }

      const body = isAdding ? payload : { idField: 'ID_Kost', idValue: editingId, ...payload };

      const res = await fetch('/api/data/Master_Kost', {
        method,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Kost berhasil disimpan');
        mutate('/api/data/Master_Kost');
        cancelEdit();
      } else {
        toast.error('Gagal menyimpan Kost');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus Kost ini? Semua data terkait mungkin perlu dihapus manual.')) return;
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/data/Master_Kost?idField=ID_Kost&idValue=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Kost berhasil dihapus');
        mutate('/api/data/Master_Kost');
      }
    } finally {
      setActionLoading(null);
    }
  };

  return {
    kosts,
    isLoading,
    editingId,
    editFormData,
    actionLoading,
    setEditFormData,
    startAdding,
    startEditing,
    cancelEdit,
    handleSave,
    handleDelete
  };
}
