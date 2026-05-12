'use client';

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose
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
  UserPlus, RotateCcw, Loader2, CheckCircle, X
} from 'lucide-react';
import { addMonths, isAfter, differenceInDays, format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTenantSheet } from '@/hooks/useTenantSheet';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useState } from 'react';

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
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border hover:border-orange-200 hover:shadow-soft transition-all duration-300 overflow-hidden">
      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
        <Icon className={cn('w-4 h-4', iconClass)} />
      </div>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0 leading-tight">{label}</p>
        <p className="text-xs font-bold text-foreground truncate break-all mb-0 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function ContractCard({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={cn('p-4 rounded-xl flex flex-col gap-0.5 overflow-hidden', dark ? 'bg-primary text-primary-foreground shadow-lg shadow-orange-500/10' : 'bg-muted/30 border border-border')}>
      <p className={cn('text-[9px] font-bold uppercase tracking-wider mb-0 leading-tight', dark ? 'text-white/70' : 'text-muted-foreground')}>{label}</p>
      <p className={cn('text-xs font-bold truncate break-all mb-0 leading-tight', dark ? 'text-white' : 'text-foreground')}>{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">{children}</h3>;
}

// ─── Main Component ─────────────────────────────────────────────────

export default function TenantSheet({ room, tenant, rental, isOpen, onClose }: TenantSheetProps) {
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
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
      <SheetContent className="bg-white/80 backdrop-blur-[32px] border-l border-white/20 text-foreground w-full sm:w-[540px] p-0 flex flex-col h-full shadow-2xl">

        {/* ── Header ── */}
        <div className="p-10 bg-muted/30 border-b border-border relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />

          <SheetHeader className="relative z-10 text-left">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary shadow-xl shadow-orange-500/10 flex items-center justify-center">
                <DoorOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-foreground text-3xl font-bold tracking-tight">Unit {room?.No_Kamar}</SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", tenant ? "bg-emerald-500" : "bg-orange-500")} />
                  {mode === 'renew' ? 'Perpanjang Kontrak'
                    : tenant ? 'Penghuni Aktif'
                      : 'Kamar Kosong'}
                </SheetDescription>
              </div>
            </div>

            {/* Status banner — hanya di mode view */}
            {tenant && rentalStatus && mode === 'view' && (
              <div className={cn(
                'mt-8 p-5 rounded-2xl flex items-center justify-between border transition-all',
                rentalStatus.isOverdue
                  ? 'bg-destructive border-destructive/20 text-destructive-foreground shadow-lg shadow-destructive/10'
                  : 'bg-white border-border text-foreground shadow-soft'
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', rentalStatus.isOverdue ? 'bg-white/20' : 'bg-muted/50')}>
                    {rentalStatus.isOverdue ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className={cn('text-[9px] font-bold uppercase tracking-widest mb-0 leading-tight', rentalStatus.isOverdue ? 'text-white/70' : 'text-muted-foreground')}>Status Kontrak</p>
                    <p className="text-sm font-bold mb-0 leading-tight">{rentalStatus.isOverdue ? 'Melewati Jatuh Tempo' : 'Pembayaran Lancar'}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col gap-0.5">
                  <p className={cn('text-[9px] font-bold uppercase tracking-widest mb-0 leading-tight', rentalStatus.isOverdue ? 'text-white/70' : 'text-muted-foreground')}>
                    {rentalStatus.isOverdue ? 'Terlambat' : 'Sisa Hari'}
                  </p>
                  <p className="text-sm font-bold mb-0 leading-tight">{Math.abs(rentalStatus.sisaHari)} Hari</p>
                </div>
              </div>
            )}
          </SheetHeader>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10">

          {/* ── VIEW MODE: Info penghuni & kontrak ── */}
          {tenant && mode === 'view' && (
            <>
              <section className="space-y-4">
                <SectionTitle>Data Penghuni</SectionTitle>
                <div className="grid gap-3">
                  <InfoRow icon={User} label="Nama Lengkap" value={tenant.Nama} />
                  <InfoRow icon={Phone} label="Nomor WhatsApp" value={tenant.No_HP} />
                  <InfoRow icon={Car} label="Kendaraan" value={tenant.Bawa_Mobil === 'Ya' ? 'Mobil' : '-'} />
                  {tenant.Kontak_Darurat && (
                    <InfoRow icon={Phone} label="Kontak Darurat" value={tenant.Kontak_Darurat} iconClass="text-destructive" />
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>Detail Kontrak</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <ContractCard label="Mulai Sewa" value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '-'} />
                  <ContractCard label="Jatuh Tempo" value={rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '-'} dark />
                  <ContractCard label="Periode" value={getPeriodeLabel(rental?.Periode_Sewa)} />
                  <ContractCard label="Tgl. Bayar DP" value={rental?.Tgl_DP ? format(parseISO(rental.Tgl_DP), 'd MMM yyyy', { locale: localeId }) : '-'} />
                  <div className="col-span-2">
                    <ContractCard label="Nominal Deposit" value={`Rp ${parseInt(rental?.Nominal_Deposit || '0').toLocaleString('id-ID')}`} />
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ── SEWA MODE: Form sewa kamar baru ── */}
          {mode === 'sewa' && (
            <>
              <section className="space-y-5">
                <SectionTitle>Penghuni</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTenantInputMode('existing')}
                    className={cn(
                      'flex items-center gap-3 p-5 rounded-2xl border transition-all text-left',
                      tenantInputMode === 'existing'
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-orange-500/10'
                        : 'bg-white text-muted-foreground border-border hover:border-orange-200'
                    )}
                  >
                    <Search className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Penghuni Lama</p>
                      <p className="text-[11px] opacity-70">Cari database</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setTenantInputMode('new')}
                    className={cn(
                      'flex items-center gap-3 p-5 rounded-2xl border transition-all text-left',
                      tenantInputMode === 'new'
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-orange-500/10'
                        : 'bg-white text-muted-foreground border-border hover:border-orange-200'
                    )}
                  >
                    <UserPlus className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Penghuni Baru</p>
                      <p className="text-[11px] opacity-70">Input data baru</p>
                    </div>
                  </button>
                </div>

                {/* Pilih penghuni lama */}
                {tenantInputMode === 'existing' && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs ml-1">Pilih Penghuni</Label>
                    <Select value={selectedExistingTenantId} onValueChange={setSelectedExistingTenantId}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Cari penghuni..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allTenants.map((t: any) => (
                          <SelectItem key={t.ID_Penghuni} value={t.ID_Penghuni}>
                            <div className="flex flex-col">
                              <span className="font-bold">{t.Nama}</span>
                              <span className="text-xs text-muted-foreground">{t.No_HP}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Form penghuni baru */}
                {tenantInputMode === 'new' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs ml-1">Nama Lengkap</Label>
                      <Input value={sewaForm.Nama} onChange={e => setSewaForm({ ...sewaForm, Nama: e.target.value })} placeholder="Nama penghuni" className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs ml-1">WhatsApp</Label>
                        <Input value={sewaForm.No_HP} onChange={e => setSewaForm({ ...sewaForm, No_HP: e.target.value })} placeholder="08xx / 62xx" className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs ml-1">Kontak Darurat</Label>
                        <Input value={sewaForm.Kontak_Darurat} onChange={e => setSewaForm({ ...sewaForm, Kontak_Darurat: e.target.value })} placeholder="Opsional" className="h-12 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs ml-1">Bawa Kendaraan?</Label>
                      <Select value={sewaForm.Bawa_Mobil} onValueChange={v => setSewaForm({ ...sewaForm, Bawa_Mobil: v })}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tidak">Tidak</SelectItem>
                          <SelectItem value="Ya">Ya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-5">
                <SectionTitle>Detail Kontrak</SectionTitle>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs ml-1">Mulai Sewa</Label>
                      <Input type="date" value={sewaForm.Tgl_Masuk} onChange={e => setSewaForm({ ...sewaForm, Tgl_Masuk: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs ml-1">Tanggal DP</Label>
                      <Input type="date" value={sewaForm.Tgl_DP} onChange={e => setSewaForm({ ...sewaForm, Tgl_DP: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs ml-1">Periode</Label>
                      <Select value={sewaForm.Periode_Sewa} onValueChange={v => setSewaForm({ ...sewaForm, Periode_Sewa: v })}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bulan</SelectItem>
                          <SelectItem value="2">2 Bulan</SelectItem>
                          <SelectItem value="3">3 Bulan</SelectItem>
                          <SelectItem value="6">6 Bulan</SelectItem>
                          <SelectItem value="12">12 Bulan (Tahunan)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs ml-1">Deposit (Rp)</Label>
                      <Input type="number" value={sewaForm.Nominal_Deposit} onChange={e => setSewaForm({ ...sewaForm, Nominal_Deposit: e.target.value })} placeholder="0" className="h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* FIX #2 — RENEW MODE: Perpanjang sewa ── */}
          {mode === 'renew' && (
            <section className="space-y-8">
              <div className="p-6 bg-muted/30 rounded-[1.5rem] border border-border space-y-4">
                <SectionTitle>Kontrak Saat Ini</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <ContractCard label="Mulai Sewa" value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '-'} />
                  <ContractCard label="Jatuh Tempo" value={rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '-'} dark />
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle>Perpanjang Masa Sewa</SectionTitle>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs ml-1">Tambah berapa bulan?</Label>
                  <Select value={renewMonths} onValueChange={setRenewMonths}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
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
                  <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Estimasi Jatuh Tempo Baru</p>
                      <p className="text-base font-bold text-foreground">
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
        <div className="p-8 bg-white border-t border-border">
          <SheetFooter>
            {mode === 'sewa' && (
              <Button
                id="btn-sewa-kamar"
                onClick={handleSewa}
                disabled={loading}
                className="w-full h-14 font-bold rounded-2xl shadow-xl shadow-orange-500/10"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {loading ? 'Menyimpan...' : `Konfirmasi Sewa Kamar ${room?.No_Kamar}`}
              </Button>
            )}

            {mode === 'view' && (
              <div className="flex gap-3 w-full">
                <Button
                  id="btn-perpanjang-sewa"
                  onClick={() => setMode('renew')}
                  variant="outline"
                  className="flex-1 h-14 font-bold rounded-2xl flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Perpanjang
                </Button>
                <Button
                  id="btn-selesai-sewa"
                  onClick={() => setShowCheckoutConfirm(true)}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1 h-14 font-bold rounded-2xl shadow-xl shadow-destructive/10"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {loading ? 'Memproses...' : 'Selesaikan Sewa'}
                </Button>
              </div>
            )}

            {mode === 'renew' && (
              <div className="flex gap-3 w-full">
                <Button variant="ghost" onClick={() => setMode('view')} className="flex-1 h-14 font-bold rounded-2xl text-muted-foreground">
                  Batal
                </Button>
                <Button
                  id="btn-konfirmasi-perpanjang"
                  onClick={handleRenew}
                  disabled={loading}
                  className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/10"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                  {loading ? 'Menyimpan...' : 'Konfirmasi'}
                </Button>
              </div>
            )}
          </SheetFooter>
        </div>

      </SheetContent>

      <ConfirmModal
        isOpen={showCheckoutConfirm}
        onClose={() => setShowCheckoutConfirm(false)}
        onConfirm={async () => {
          await handleCheckout();
          setShowCheckoutConfirm(false);
        }}
        loading={loading}
        title="Selesaikan Sewa?"
        description={`Apakah Anda yakin ingin menyelesaikan masa sewa ${tenant?.Nama} di Kamar ${room?.No_Kamar}? Tindakan ini akan mengosongkan unit.`}
      />
    </Sheet>
  );
}
