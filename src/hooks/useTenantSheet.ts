'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { addMonths, parseISO } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export type SheetMode = 'view' | 'sewa' | 'renew';
export type TenantInputMode = 'new' | 'existing';

interface SewaFormData {
  Nama: string;
  No_HP: string;
  Bawa_Mobil: string;
  Kontak_Darurat: string;
  Tgl_Masuk: string;
  Tgl_DP: string;
  Periode_Sewa: string;
  Nominal_Deposit: string;
}

const defaultSewaForm: SewaFormData = {
  Nama: '',
  No_HP: '',
  Bawa_Mobil: 'Tidak',
  Kontak_Darurat: '',
  Tgl_Masuk: new Date().toISOString().split('T')[0],
  Tgl_DP: new Date().toISOString().split('T')[0],
  Periode_Sewa: '1',
  Nominal_Deposit: '0',
};

const formatPhone = (phone: string) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '62' + cleaned.substring(1);
  return cleaned;
};

export function useTenantSheet(
  room: any,
  tenant: any,
  rental: any,
  isOpen: boolean,
  onClose: () => void
) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<SheetMode>('view');
  const [tenantInputMode, setTenantInputMode] = useState<TenantInputMode>('new');
  const [selectedExistingTenantId, setSelectedExistingTenantId] = useState('');
  const [renewMonths, setRenewMonths] = useState('1');
  const [sewaForm, setSewaForm] = useState<SewaFormData>(defaultSewaForm);

  const { data: tenantsData } = useSWR(isOpen ? '/api/data/Master_Penghuni' : null, fetcher);
  const allTenants: any[] = tenantsData?.data || [];

  useEffect(() => {
    if (!isOpen) return;
    if (tenant) {
      setMode('view');
      setSewaForm({
        Nama: tenant.Nama || '',
        No_HP: tenant.No_HP || '',
        Bawa_Mobil: tenant.Bawa_Mobil || 'Tidak',
        Kontak_Darurat: tenant.Kontak_Darurat || '',
        Tgl_Masuk: rental?.Tgl_Masuk || '',
        Tgl_DP: rental?.Tgl_DP || '',
        Periode_Sewa: rental?.Periode_Sewa || '1',
        Nominal_Deposit: rental?.Nominal_Deposit || '0',
      });
    } else {
      setMode('sewa');
      setTenantInputMode('new');
      setSelectedExistingTenantId('');
      setSewaForm(defaultSewaForm);
    }
  }, [tenant, rental, isOpen]);

  const invalidateCache = () =>
    mutate((key) => typeof key === 'string' && key.startsWith('/api/data'));

  // FIX #1 — Sewa: bisa pilih penghuni lama atau buat baru
  const handleSewa = async () => {
    if (!sewaForm.Tgl_Masuk) {
      toast.error('Tanggal Masuk wajib diisi');
      return;
    }

    setLoading(true);
    try {
      let tenantId: string;

      if (tenantInputMode === 'existing') {
        if (!selectedExistingTenantId) {
          toast.error('Pilih penghuni terlebih dahulu');
          setLoading(false);
          return;
        }
        tenantId = selectedExistingTenantId;
      } else {
        if (!sewaForm.Nama || !sewaForm.No_HP) {
          toast.error('Nama dan No. HP wajib diisi');
          setLoading(false);
          return;
        }
        tenantId = `P${Date.now()}`;
        const tenantRes = await fetch('/api/data/Master_Penghuni', {
          method: 'POST',
          body: JSON.stringify({
            ID_Penghuni: tenantId,
            Nama: sewaForm.Nama,
            No_HP: formatPhone(sewaForm.No_HP),
            Bawa_Mobil: sewaForm.Bawa_Mobil,
            Kontak_Darurat: formatPhone(sewaForm.Kontak_Darurat),
          }),
        });
        if (!tenantRes.ok) throw new Error((await tenantRes.json()).message || 'Gagal simpan penghuni');
      }

      const rentalRes = await fetch('/api/data/Transaksi_Sewa', {
        method: 'POST',
        body: JSON.stringify({
          ID_Sewa: `S${Date.now()}`,
          ID_Kamar: room.ID_Kamar,
          ID_Penghuni: tenantId,
          Tgl_Masuk: sewaForm.Tgl_Masuk,
          Tgl_DP: sewaForm.Tgl_DP,
          Nominal_Deposit: sewaForm.Nominal_Deposit,
          Periode_Sewa: sewaForm.Periode_Sewa,
          Status_Aktif: 'TRUE',
        }),
      });
      if (!rentalRes.ok) throw new Error((await rentalRes.json()).message || 'Gagal simpan sewa');

      const tenantName = tenantInputMode === 'existing'
        ? allTenants.find(t => t.ID_Penghuni === tenantId)?.Nama
        : sewaForm.Nama;

      toast.success(`${tenantName} berhasil menyewa Kamar ${room?.No_Kamar}`);
      invalidateCache();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!confirm(`Yakin selesaikan sewa ${tenant?.Nama} di Kamar ${room?.No_Kamar}?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/data/Transaksi_Sewa', {
        method: 'PUT',
        body: JSON.stringify({
          idField: 'ID_Sewa',
          idValue: rental.ID_Sewa,
          Status_Aktif: 'FALSE',
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal checkout');
      toast.success(`Sewa ${tenant?.Nama} di Kamar ${room?.No_Kamar} telah selesai`);
      invalidateCache();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyelesaikan sewa');
    } finally {
      setLoading(false);
    }
  };

  // FIX #2 — Perpanjang sewa: tambah bulan ke periode yang ada
  const handleRenew = async () => {
    const additionalMonths = parseInt(renewMonths) || 1;
    const currentPeriod = parseInt(rental?.Periode_Sewa) || 1;
    const newTotalPeriod = currentPeriod + additionalMonths;

    setLoading(true);
    try {
      const res = await fetch('/api/data/Transaksi_Sewa', {
        method: 'PUT',
        body: JSON.stringify({
          idField: 'ID_Sewa',
          idValue: rental.ID_Sewa,
          Periode_Sewa: String(newTotalPeriod),
          Status_Aktif: 'TRUE',
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal perpanjang sewa');

      const newExpiry = addMonths(parseISO(rental.Tgl_Masuk), newTotalPeriod);
      toast.success(`Sewa diperpanjang ${additionalMonths} bulan — jatuh tempo baru: ${newExpiry.toLocaleDateString('id-ID')}`);
      invalidateCache();
      setMode('view');
    } catch (error: any) {
      toast.error(error.message || 'Gagal perpanjang sewa');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    mode,
    setMode,
    tenantInputMode,
    setTenantInputMode,
    selectedExistingTenantId,
    setSelectedExistingTenantId,
    renewMonths,
    setRenewMonths,
    sewaForm,
    setSewaForm,
    allTenants,
    handleSewa,
    handleCheckout,
    handleRenew,
  };
}
