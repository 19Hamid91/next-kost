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
import { cn } from '@/lib/utils';

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
      <SheetContent className="bg-white border-l border-slate-200 text-slate-900 w-full sm:w-[540px] p-0 flex flex-col h-full shadow-2xl overflow-hidden">
        <div className="p-8 bg-slate-50 border-b border-slate-200/60 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

          <SheetHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200 flex items-center justify-center">
                <DoorOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <SheetTitle className="text-slate-900 text-2xl font-black tracking-tight">Kamar {room?.No_Kamar}</SheetTitle>
                <SheetDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                  {tenant ? `Penghuni Aktif` : 'Siap Huni — Kosong'}
                </SheetDescription>
              </div>
            </div>

            {/* Status banner */}
            {tenant && rentalStatus && (
              <div className={cn(
                "mt-6 p-4 rounded-2xl flex items-center justify-between shadow-sm border transition-all duration-500",
                rentalStatus.isOverdue
                  ? 'bg-rose-500 border-rose-400 text-white shadow-rose-100'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", rentalStatus.isOverdue ? 'bg-white/20' : 'bg-slate-100')}>
                    {rentalStatus.isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div>
                    <p className={cn("text-[10px] font-black uppercase tracking-wider", rentalStatus.isOverdue ? 'text-white/80' : 'text-slate-400')}>Status Sewa</p>
                    <p className="text-sm font-black">{rentalStatus.isOverdue ? 'Melewati Jatuh Tempo' : 'Sewa Berjalan Lancar'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-[10px] font-black uppercase tracking-wider", rentalStatus.isOverdue ? 'text-white/80' : 'text-slate-400')}>
                    {rentalStatus.isOverdue ? 'Keterlambatan' : 'Sisa Waktu'}
                  </p>
                  <p className="text-sm font-black">
                    {rentalStatus.isOverdue
                      ? `${Math.abs(rentalStatus.sisaHari)} Hari`
                      : `${rentalStatus.sisaHari} Hari`}
                  </p>
                </div>
              </div>
            )}
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* OCCUPIED VIEW */}
          {tenant && mode === 'view' && (
            <>
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Data Penghuni</h3>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</p>
                      <p className="text-sm font-black text-slate-900">{tenant.Nama}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor WhatsApp</p>
                      <p className="text-sm font-black text-slate-900">{tenant.No_HP}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobil</p>
                        <p className="text-xs font-black text-slate-900">{tenant.Bawa_Mobil}</p>
                      </div>
                    </div>
                    {tenant.Kontak_Darurat && (
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                          <Phone className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Darurat</p>
                          <p className="text-xs font-black text-slate-900">{tenant.Kontak_Darurat}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Detail Kontrak</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mulai Sewa</p>
                    <p className="text-sm font-black text-slate-900">
                      {rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '-'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jatuh Tempo</p>
                    <p className={cn('text-sm font-black', rentalStatus?.isOverdue ? 'text-rose-400' : 'text-white')}>
                      {rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '-'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Periode</p>
                    <p className="text-sm font-black text-slate-900">{getPeriodeLabel(rental?.Periode_Sewa)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deposit</p>
                    <p className="text-sm font-black text-slate-900">
                      Rp {parseInt(rental?.Nominal_Deposit || '0').toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* CHECK-IN FORM */}
          {mode === 'checkin' && (
            <>
              <section className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Data Penghuni Baru</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Nama Lengkap <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.Nama}
                      onChange={(e) => setFormData({ ...formData, Nama: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="Nama penghuni"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">No. HP <span className="text-red-500">*</span></Label>
                      <Input
                        value={formData.No_HP}
                        onChange={(e) => setFormData({ ...formData, No_HP: e.target.value })}
                        className="bg-background border-border text-foreground"
                        placeholder="62"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Kontak Darurat</Label>
                      <Input
                        value={formData.Kontak_Darurat}
                        onChange={(e) => setFormData({ ...formData, Kontak_Darurat: e.target.value })}
                        className="bg-background border-border text-foreground"
                        placeholder="62 (ortu/keluarga)"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Bawa Mobil?</Label>
                    <Select
                      value={formData.Bawa_Mobil}
                      onValueChange={(v) => setFormData({ ...formData, Bawa_Mobil: v })}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="Tidak">Tidak</SelectItem>
                        <SelectItem value="Ya">Ya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Detail Sewa</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Tanggal Masuk <span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        value={formData.Tgl_Masuk}
                        onChange={(e) => setFormData({ ...formData, Tgl_Masuk: e.target.value })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Tanggal DP</Label>
                      <Input
                        type="date"
                        value={formData.Tgl_DP}
                        onChange={(e) => setFormData({ ...formData, Tgl_DP: e.target.value })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Periode Sewa</Label>
                      <Select
                        value={formData.Periode_Sewa}
                        onValueChange={(v) => setFormData({ ...formData, Periode_Sewa: v })}
                      >
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="1">Bulanan</SelectItem>
                          <SelectItem value="3">3 Bulan</SelectItem>
                          <SelectItem value="6">6 Bulan</SelectItem>
                          <SelectItem value="12">Tahunan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Nominal Deposit (Rp)</Label>
                      <Input
                        type="number"
                        value={formData.Nominal_Deposit}
                        onChange={(e) => setFormData({ ...formData, Nominal_Deposit: e.target.value })}
                        className="bg-background border-border text-foreground"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        <div className="p-4 bg-background border-t border-border">
          <SheetFooter>
            {mode === 'checkin' ? (
              <Button
                id="btn-checkin-submit"
                onClick={handleCheckin}
                disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl transition-all active:scale-95"
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
                  className="flex-1 h-11 border-border text-muted-foreground rounded-xl"
                >
                  Perpanjang Sewa
                </Button>
              </div>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
