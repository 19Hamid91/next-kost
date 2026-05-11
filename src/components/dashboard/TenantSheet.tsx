'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { User, Phone, Car, Calendar, Clock, AlertTriangle, DoorOpen } from 'lucide-react';
import { addMonths, isAfter, differenceInDays, format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface TenantSheetProps {
  room: any;
  tenant: any;
  rental: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantSheet({ room, tenant, rental, isOpen, onClose }: TenantSheetProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'view' | 'checkin'>('view');

  const [formData, setFormData] = useState({
    Nama: '',
    No_HP: '',
    Bawa_Mobil: 'Tidak',
    Kontak_Darurat: '',
    Tgl_Masuk: new Date().toISOString().split('T')[0],
    Tgl_DP: new Date().toISOString().split('T')[0],
    Periode_Sewa: '1',
    Nominal_Deposit: '0',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (tenant) {
      setMode('view');
      setFormData({
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
      setMode('checkin');
      setFormData({
        Nama: '',
        No_HP: '',
        Bawa_Mobil: 'Tidak',
        Kontak_Darurat: '',
        Tgl_Masuk: new Date().toISOString().split('T')[0],
        Tgl_DP: new Date().toISOString().split('T')[0],
        Periode_Sewa: '1',
        Nominal_Deposit: '0',
      });
    }
  }, [tenant, rental, isOpen]);

  // Calculate rental status
  const getRentalStatus = () => {
    if (!rental?.Tgl_Masuk) return null;
    const tglMasuk = parseISO(rental.Tgl_Masuk);
    const periode = parseInt(rental.Periode_Sewa) || 1;
    const tglJatuhTempo = addMonths(tglMasuk, periode);
    const isOverdue = isAfter(new Date(), tglJatuhTempo);
    const sisaHari = differenceInDays(tglJatuhTempo, new Date());
    return { tglJatuhTempo, isOverdue, sisaHari };
  };
  const rentalStatus = getRentalStatus();

  const getPeriodeLabel = (periode: string) => {
    const map: Record<string, string> = { '1': 'Bulanan', '3': '3 Bulan', '6': '6 Bulan', '12': 'Tahunan' };
    return map[periode] || `${periode} Bulan`;
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '62' + cleaned.substring(1);
    }
    if (cleaned.startsWith('62')) {
      return cleaned;
    }
    return cleaned;
  };

  const handleCheckin = async () => {
    if (!formData.Nama || !formData.No_HP || !formData.Tgl_Masuk) {
      toast.error('Nama, No. HP, dan Tanggal Masuk wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const tenantId = `P${Date.now()}`;
      const cleanPhone = formatPhone(formData.No_HP);
      const cleanEmergency = formatPhone(formData.Kontak_Darurat);

      const tenantRes = await fetch('/api/data/Master_Penghuni', {
        method: 'POST',
        body: JSON.stringify({
          ID_Penghuni: tenantId,
          Nama: formData.Nama,
          No_HP: cleanPhone,
          Bawa_Mobil: formData.Bawa_Mobil,
          Kontak_Darurat: cleanEmergency,
        }),
      });
      if (!tenantRes.ok) {
        const err = await tenantRes.json();
        throw new Error(err.message || 'Gagal simpan data penghuni');
      }

      const rentalRes = await fetch('/api/data/Transaksi_Sewa', {
        method: 'POST',
        body: JSON.stringify({
          ID_Sewa: `S${Date.now()}`,
          ID_Kamar: room.ID_Kamar,
          ID_Penghuni: tenantId,
          Tgl_Masuk: formData.Tgl_Masuk,
          Tgl_DP: formData.Tgl_DP,
          Nominal_Deposit: formData.Nominal_Deposit,
          Periode_Sewa: formData.Periode_Sewa,
          Status_Aktif: 'TRUE',
        }),
      });
      if (!rentalRes.ok) {
        const err = await rentalRes.json();
        throw new Error(err.message || 'Gagal simpan data sewa');
      }

      toast.success(`${formData.Nama} berhasil check-in ke Kamar ${room?.No_Kamar}`);
      mutate((key) => typeof key === 'string' && key.startsWith('/api/data'));
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!confirm(`Yakin ingin menyelesaikan sewa ${tenant?.Nama} di Kamar ${room?.No_Kamar}?`)) return;
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal checkout');
      }
      toast.success(`${tenant?.Nama} telah check-out dari Kamar ${room?.No_Kamar}`);
      mutate((key) => typeof key === 'string' && key.startsWith('/api/data'));
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-zinc-950 border-zinc-800 text-white w-[420px] sm:w-[520px] overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-white text-xl">Kamar {room?.No_Kamar}</SheetTitle>
              <SheetDescription className="text-zinc-500 text-xs">
                {tenant ? `Penghuni aktif sejak ${rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '-'}` : 'Kamar kosong — siap check-in'}
              </SheetDescription>
            </div>
          </div>

          {/* Status banner */}
          {tenant && rentalStatus && (
            <div className={`mt-4 p-3 rounded-xl flex items-center justify-between text-sm ${rentalStatus.isOverdue
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              }`}>
              <div className="flex items-center gap-2">
                {rentalStatus.isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>{rentalStatus.isOverdue ? 'Melewati jatuh tempo!' : 'Sewa berjalan'}</span>
              </div>
              <span className="font-bold">
                {rentalStatus.isOverdue
                  ? `${Math.abs(rentalStatus.sisaHari)} hari lewat`
                  : `${rentalStatus.sisaHari} hari lagi`}
              </span>
            </div>
          )}
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* OCCUPIED VIEW */}
          {tenant && mode === 'view' && (
            <>
              <section className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Data Penghuni</h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <User className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-500">Nama</p>
                      <p className="text-sm font-medium text-white">{tenant.Nama}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-500">No. HP</p>
                      <p className="text-sm font-medium text-white">{tenant.No_HP}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                      <Car className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500">Bawa Mobil</p>
                        <Badge variant={tenant.Bawa_Mobil === 'Ya' ? 'default' : 'secondary'} className="text-xs mt-0.5">
                          {tenant.Bawa_Mobil}
                        </Badge>
                      </div>
                    </div>
                    {tenant.Kontak_Darurat && (
                      <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                        <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-500">Kontak Darurat</p>
                          <p className="text-sm font-medium text-white">{tenant.Kontak_Darurat}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Detail Sewa</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500">Tgl Masuk</p>
                    <p className="text-sm font-medium text-white">
                      {rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500">Jatuh Tempo</p>
                    <p className={`text-sm font-medium ${rentalStatus?.isOverdue ? 'text-red-400' : 'text-white'}`}>
                      {rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500">Periode</p>
                    <p className="text-sm font-medium text-white">{getPeriodeLabel(rental?.Periode_Sewa)}</p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500">Deposit</p>
                    <p className="text-sm font-medium text-white">
                      Rp {parseInt(rental?.Nominal_Deposit || '0').toLocaleString('id-ID')}
                    </p>
                  </div>
                  {rental?.Tgl_DP && (
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 col-span-2">
                      <p className="text-xs text-zinc-500">Tanggal DP</p>
                      <p className="text-sm font-medium text-white">
                        {format(parseISO(rental.Tgl_DP), 'd MMM yyyy', { locale: localeId })}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* CHECK-IN FORM */}
          {mode === 'checkin' && (
            <>
              <section className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Data Penghuni Baru</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs">Nama Lengkap <span className="text-red-400">*</span></Label>
                    <Input
                      value={formData.Nama}
                      onChange={(e) => setFormData({ ...formData, Nama: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-white"
                      placeholder="Nama penghuni"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">No. HP <span className="text-red-400">*</span></Label>
                      <Input
                        value={formData.No_HP}
                        onChange={(e) => setFormData({ ...formData, No_HP: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                        placeholder="62"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">Kontak Darurat</Label>
                      <Input
                        value={formData.Kontak_Darurat}
                        onChange={(e) => setFormData({ ...formData, Kontak_Darurat: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                        placeholder="62 (ortu/keluarga)"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs">Bawa Mobil?</Label>
                    <Select
                      value={formData.Bawa_Mobil}
                      onValueChange={(v) => setFormData({ ...formData, Bawa_Mobil: v })}
                    >
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="Tidak">Tidak</SelectItem>
                        <SelectItem value="Ya">Ya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Detail Sewa</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">Tanggal Masuk <span className="text-red-400">*</span></Label>
                      <Input
                        type="date"
                        value={formData.Tgl_Masuk}
                        onChange={(e) => setFormData({ ...formData, Tgl_Masuk: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">Tanggal DP</Label>
                      <Input
                        type="date"
                        value={formData.Tgl_DP}
                        onChange={(e) => setFormData({ ...formData, Tgl_DP: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">Periode Sewa</Label>
                      <Select
                        value={formData.Periode_Sewa}
                        onValueChange={(v) => setFormData({ ...formData, Periode_Sewa: v })}
                      >
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          <SelectItem value="1">Bulanan</SelectItem>
                          <SelectItem value="3">3 Bulan</SelectItem>
                          <SelectItem value="6">6 Bulan</SelectItem>
                          <SelectItem value="12">Tahunan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">Nominal Deposit (Rp)</Label>
                      <Input
                        type="number"
                        value={formData.Nominal_Deposit}
                        onChange={(e) => setFormData({ ...formData, Nominal_Deposit: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800">
          {mode === 'checkin' ? (
            <Button
              id="btn-checkin-submit"
              onClick={handleCheckin}
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Menyimpan...' : `Check-in ke Kamar ${room?.No_Kamar}`}
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                id="btn-checkout"
                onClick={handleCheckout}
                variant="destructive"
                disabled={loading}
                className="flex-1 h-11 rounded-xl transition-all active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? 'Memproses...' : 'Selesaikan Sewa'}
              </Button>
              <Button
                id="btn-perpanjang"
                disabled
                variant="outline"
                className="flex-1 h-11 border-zinc-800 text-zinc-500 rounded-xl"
              >
                Perpanjang Sewa
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
