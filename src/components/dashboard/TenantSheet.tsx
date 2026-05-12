'use client';

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  User, Phone, Car, Clock, AlertTriangle, DoorOpen, Search,
  UserPlus, RotateCcw, Loader2, CheckCircle
} from 'lucide-react';
import { addMonths, isAfter, differenceInDays, format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTenantSheet } from '@/hooks/useTenantSheet';

interface TenantSheetProps {
  room: any;
  tenant: any;
  rental: any;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Sub-components ────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, iconClass = '' }: { icon: any; label: string; value: string; iconClass?: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">
        <Icon className={cn('w-5 h-5', iconClass)} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ContractCard({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={cn('p-4 rounded-2xl space-y-1', dark ? 'bg-slate-900 shadow-lg' : 'bg-slate-50 border border-slate-100')}>
      <p className={cn('text-[10px] font-black uppercase tracking-widest', dark ? 'text-slate-400' : 'text-slate-400')}>{label}</p>
      <p className={cn('text-sm font-black', dark ? 'text-white' : 'text-slate-900')}>{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{children}</h3>;
}

// ─── Main Component ─────────────────────────────────────────────────

export default function TenantSheet({ room, tenant, rental, isOpen, onClose }: TenantSheetProps) {
  const {
    loading, mode, setMode,
    tenantInputMode, setTenantInputMode,
    selectedExistingTenantId, setSelectedExistingTenantId,
    renewMonths, setRenewMonths,
    sewaForm, setSewaForm,
    allTenants,
    handleSewa, handleCheckout, handleRenew,
  } = useTenantSheet(room, tenant, rental, isOpen, onClose);

  // ── Rental status calculation ──
  const rentalStatus = (() => {
    if (!rental?.Tgl_Masuk) return null;
    const tglMasuk = parseISO(rental.Tgl_Masuk);
    const periode = parseInt(rental.Periode_Sewa) || 1;
    const tglJatuhTempo = addMonths(tglMasuk, periode);
    return {
      tglJatuhTempo,
      isOverdue: isAfter(new Date(), tglJatuhTempo),
      sisaHari: differenceInDays(tglJatuhTempo, new Date()),
    };
  })();

  const getPeriodeLabel = (periode: string) => {
    const map: Record<string, string> = { '1': 'Bulanan', '3': '3 Bulan', '6': '6 Bulan', '12': 'Tahunan' };
    return map[periode] || `${periode} Bulan`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-white border-l border-slate-200 text-slate-900 w-full sm:w-[540px] p-0 flex flex-col h-full shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="p-8 bg-slate-50 border-b border-slate-200/60 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          <SheetHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 shadow-xl flex items-center justify-center">
                <DoorOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <SheetTitle className="text-slate-900 text-2xl font-black tracking-tight">Kamar {room?.No_Kamar}</SheetTitle>
                <SheetDescription className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                  {mode === 'renew' ? 'Perpanjang Kontrak Sewa'
                    : tenant ? 'Penghuni Aktif'
                    : 'Kosong — Siap Disewa'}
                </SheetDescription>
              </div>
            </div>

            {/* Status banner — hanya di mode view */}
            {tenant && rentalStatus && mode === 'view' && (
              <div className={cn(
                'mt-6 p-4 rounded-2xl flex items-center justify-between border transition-all',
                rentalStatus.isOverdue
                  ? 'bg-rose-500 border-rose-400 text-white shadow-rose-100 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-900'
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', rentalStatus.isOverdue ? 'bg-white/20' : 'bg-slate-100')}>
                    {rentalStatus.isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div>
                    <p className={cn('text-[10px] font-black uppercase tracking-widest', rentalStatus.isOverdue ? 'text-white/70' : 'text-slate-400')}>Status Sewa</p>
                    <p className="text-sm font-black">{rentalStatus.isOverdue ? 'Melewati Jatuh Tempo' : 'Berjalan Lancar'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('text-[10px] font-black uppercase tracking-widest', rentalStatus.isOverdue ? 'text-white/70' : 'text-slate-400')}>
                    {rentalStatus.isOverdue ? 'Keterlambatan' : 'Sisa Waktu'}
                  </p>
                  <p className="text-sm font-black">{Math.abs(rentalStatus.sisaHari)} Hari</p>
                </div>
              </div>
            )}
          </SheetHeader>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* ── VIEW MODE: Info penghuni & kontrak ── */}
          {tenant && mode === 'view' && (
            <>
              <section className="space-y-4">
                <SectionTitle>Data Penghuni</SectionTitle>
                <div className="grid gap-3">
                  <InfoRow icon={User} label="Nama Lengkap" value={tenant.Nama} />
                  <InfoRow icon={Phone} label="Nomor WhatsApp" value={tenant.No_HP} />
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow icon={Car} label="Kendaraan" value={tenant.Bawa_Mobil === 'Ya' ? 'Mobil' : 'Motor/Tidak'} />
                    {tenant.Kontak_Darurat && (
                      <InfoRow icon={Phone} label="Kontak Darurat" value={tenant.Kontak_Darurat} iconClass="text-rose-400" />
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>Detail Kontrak</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <ContractCard label="Mulai Sewa" value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '-'} />
                  <ContractCard label="Jatuh Tempo" value={rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '-'} dark />
                  <ContractCard label="Periode" value={getPeriodeLabel(rental?.Periode_Sewa)} />
                  <ContractCard label="Tgl. Bayar DP" value={rental?.Tgl_DP ? format(parseISO(rental.Tgl_DP), 'd MMM yyyy', { locale: localeId }) : '-'} />
                  <ContractCard label="Nominal Deposit" value={`Rp ${parseInt(rental?.Nominal_Deposit || '0').toLocaleString('id-ID')}`} />
                </div>
              </section>
            </>
          )}

          {/* ── SEWA MODE: Form sewa kamar baru ── */}
          {mode === 'sewa' && (
            <>
              {/* FIX #1 — Toggle: penghuni baru atau pilih yang lama */}
              <section className="space-y-4">
                <SectionTitle>Penghuni</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTenantInputMode('existing')}
                    className={cn(
                      'flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all text-left',
                      tenantInputMode === 'existing'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Penghuni Lama</p>
                      <p className="text-[11px] opacity-70">Cari dari database</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setTenantInputMode('new')}
                    className={cn(
                      'flex items-center gap-2.5 p-3.5 rounded-2xl border transition-all text-left',
                      tenantInputMode === 'new'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Penghuni Baru</p>
                      <p className="text-[11px] opacity-70">Input data baru</p>
                    </div>
                  </button>
                </div>

                {/* Pilih penghuni lama */}
                {tenantInputMode === 'existing' && (
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Pilih Penghuni *</Label>
                    <Select value={selectedExistingTenantId} onValueChange={setSelectedExistingTenantId}>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-11">
                        <SelectValue placeholder="Cari penghuni..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-900">
                        {allTenants.map((t: any) => (
                          <SelectItem key={t.ID_Penghuni} value={t.ID_Penghuni}>
                            <div className="flex flex-col">
                              <span className="font-black">{t.Nama}</span>
                              <span className="text-xs text-slate-400">{t.No_HP}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Form penghuni baru */}
                {tenantInputMode === 'new' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Nama Lengkap *</Label>
                      <Input value={sewaForm.Nama} onChange={e => setSewaForm({ ...sewaForm, Nama: e.target.value })} placeholder="Nama penghuni" className="bg-white border-slate-200 text-slate-900 h-11" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-xs">No. HP / WA *</Label>
                        <Input value={sewaForm.No_HP} onChange={e => setSewaForm({ ...sewaForm, No_HP: e.target.value })} placeholder="08xx / 62xx" className="bg-white border-slate-200 text-slate-900 h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-xs">Kontak Darurat</Label>
                        <Input value={sewaForm.Kontak_Darurat} onChange={e => setSewaForm({ ...sewaForm, Kontak_Darurat: e.target.value })} placeholder="08xx (keluarga)" className="bg-white border-slate-200 text-slate-900 h-11" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Bawa Mobil?</Label>
                      <Select value={sewaForm.Bawa_Mobil} onValueChange={v => setSewaForm({ ...sewaForm, Bawa_Mobil: v })}>
                        <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-11"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                          <SelectItem value="Tidak">Tidak</SelectItem>
                          <SelectItem value="Ya">Ya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <SectionTitle>Detail Sewa</SectionTitle>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Tanggal Masuk *</Label>
                      <Input type="date" value={sewaForm.Tgl_Masuk} onChange={e => setSewaForm({ ...sewaForm, Tgl_Masuk: e.target.value })} className="bg-white border-slate-200 text-slate-900 h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Tanggal DP</Label>
                      <Input type="date" value={sewaForm.Tgl_DP} onChange={e => setSewaForm({ ...sewaForm, Tgl_DP: e.target.value })} className="bg-white border-slate-200 text-slate-900 h-11" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Periode Sewa</Label>
                      <Select value={sewaForm.Periode_Sewa} onValueChange={v => setSewaForm({ ...sewaForm, Periode_Sewa: v })}>
                        <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-11"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                          <SelectItem value="1">1 Bulan</SelectItem>
                          <SelectItem value="2">2 Bulan</SelectItem>
                          <SelectItem value="3">3 Bulan</SelectItem>
                          <SelectItem value="6">6 Bulan</SelectItem>
                          <SelectItem value="12">Tahunan (12 Bln)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Nominal Deposit (Rp)</Label>
                      <Input type="number" value={sewaForm.Nominal_Deposit} onChange={e => setSewaForm({ ...sewaForm, Nominal_Deposit: e.target.value })} placeholder="0" className="bg-white border-slate-200 text-slate-900 h-11" />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* FIX #2 — RENEW MODE: Perpanjang sewa ── */}
          {mode === 'renew' && (
            <section className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <SectionTitle>Kontrak Saat Ini</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <ContractCard label="Mulai Sewa" value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '-'} />
                  <ContractCard label="Jatuh Tempo Lama" value={rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '-'} dark />
                </div>
              </div>

              <div className="space-y-4">
                <SectionTitle>Tambah Periode</SectionTitle>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Perpanjang berapa bulan?</Label>
                  <Select value={renewMonths} onValueChange={setRenewMonths}>
                    <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="1">+ 1 Bulan</SelectItem>
                      <SelectItem value="2">+ 2 Bulan</SelectItem>
                      <SelectItem value="3">+ 3 Bulan</SelectItem>
                      <SelectItem value="6">+ 6 Bulan</SelectItem>
                      <SelectItem value="12">+ 12 Bulan (Tahunan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview jatuh tempo baru */}
                {rentalStatus && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Jatuh Tempo Baru</p>
                      <p className="text-sm font-black text-slate-900">
                        {format(addMonths(rentalStatus.tglJatuhTempo, parseInt(renewMonths)), 'd MMMM yyyy', { locale: localeId })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* ── Footer / Actions ── */}
        <div className="p-5 bg-white border-t border-slate-200">
          <SheetFooter>
            {/* FIX #3 — tombol sesuai mode, tidak ada yang disabled tanpa alasan */}
            {mode === 'sewa' && (
              <Button
                id="btn-sewa-kamar"
                onClick={handleSewa}
                disabled={loading}
                className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-black rounded-xl transition-all active:scale-95 tracking-wide"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? 'Menyimpan...' : `Sewa Kamar ${room?.No_Kamar}`}
              </Button>
            )}

            {mode === 'view' && (
              <div className="flex gap-2 w-full">
                <Button
                  id="btn-perpanjang-sewa"
                  onClick={() => setMode('renew')}
                  variant="outline"
                  className="flex-1 h-12 border-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Perpanjang
                </Button>
                <Button
                  id="btn-selesai-sewa"
                  onClick={handleCheckout}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1 h-12 font-black rounded-xl transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? 'Memproses...' : 'Selesaikan Sewa'}
                </Button>
              </div>
            )}

            {mode === 'renew' && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={() => setMode('view')} className="flex-1 h-12 border-slate-200 font-black rounded-xl">
                  Batal
                </Button>
                <Button
                  id="btn-konfirmasi-perpanjang"
                  onClick={handleRenew}
                  disabled={loading}
                  className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {loading ? 'Menyimpan...' : 'Konfirmasi Perpanjang'}
                </Button>
              </div>
            )}
          </SheetFooter>
        </div>

      </SheetContent>
    </Sheet>
  );
}
