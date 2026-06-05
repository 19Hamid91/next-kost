'use client';

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  User, Phone, Car, Clock, AlertTriangle, DoorOpen, Search,
  UserPlus, RotateCcw, Loader2, CheckCircle, MessageCircle, CalendarClock,
} from 'lucide-react';
import { isAfter, differenceInDays, format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTenantSheet } from '@/hooks/useTenantSheet';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useState } from 'react';
import { calculateDueDate, parseDurasiUnit, resolveStatusSewa } from '@/lib/dateUtils';

interface TenantSheetProps {
  room: any;
  tenant: any;
  rental: any;
  isOpen: boolean;
  onClose: () => void;
}

// ── Sub-components ─────────────────────────────────────────────────

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

// ── Main Component ──────────────────────────────────────────────────

export default function TenantSheet({ room, tenant, rental, isOpen, onClose }: TenantSheetProps) {
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const {
    loading, mode, setMode,
    tenantInputMode, setTenantInputMode,
    selectedExistingTenantId, setSelectedExistingTenantId,
    renewMonths, setRenewMonths,
    sewaForm, setSewaForm,
    allTenants,
    handleSewa, handleBooking, handleCheckout, handleActivateBooking, handleRenew,
  } = useTenantSheet(room, tenant, rental, isOpen, onClose);

  const statusSewa = resolveStatusSewa(rental);
  const isBooked = statusSewa === 'BOOKING';

  // Rental status calc
  const rentalStatus = (() => {
    if (!rental?.Tgl_Masuk || statusSewa !== 'AKTIF') return null;
    const tglMasuk = parseISO(rental.Tgl_Masuk);
    const periode = parseInt(rental.Periode_Sewa) || 1;
    const unit = parseDurasiUnit(rental.Unit_Durasi);
    const tglJatuhTempo = calculateDueDate(tglMasuk, periode, unit);
    return {
      tglJatuhTempo,
      isOverdue: isAfter(new Date(), tglJatuhTempo),
      sisaHari: differenceInDays(tglJatuhTempo, new Date()),
    };
  })();

  const getPeriodeLabel = (periode: string, unit?: string) => {
    const unitLabel = unit || 'Bulan';
    return `${periode} ${unitLabel}`;
  };

  // WhatsApp reminder URL
  const waReminderUrl = (() => {
    if (!tenant?.No_HP || !rentalStatus) return null;
    const namaEncoded = encodeURIComponent(tenant.Nama || '');
    const noKamar = encodeURIComponent(room?.No_Kamar || '');
    const tglTempo = rentalStatus.tglJatuhTempo
      ? encodeURIComponent(format(rentalStatus.tglJatuhTempo, 'd MMMM yyyy', { locale: localeId }))
      : '';
    const msg = `Halo%20${namaEncoded},%20mengingatkan%20sewa%20kamar%20${noKamar}%20akan%20berakhir%20pada%20${tglTempo}.%20Terima%20kasih!`;
    return `https://wa.me/${tenant.No_HP}?text=${msg}`;
  })();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-white/80 backdrop-blur-[32px] border-l border-white/20 text-foreground w-full sm:w-[540px] p-0 flex flex-col h-full shadow-2xl">

        {/* ── Header ── */}
        <div className="p-10 bg-muted/30 border-b border-border relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />

          <SheetHeader className="relative z-10 text-left">
            <div className="flex items-center gap-5">
              <div className={cn(
                'w-16 h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center',
                isBooked ? 'bg-amber-500 shadow-amber-500/10' : 'bg-primary shadow-orange-500/10'
              )}>
                {isBooked ? <CalendarClock className="w-8 h-8 text-white" /> : <DoorOpen className="w-8 h-8 text-primary-foreground" />}
              </div>
              <div>
                <SheetTitle className="text-foreground text-3xl font-bold tracking-tight">Unit {room?.No_Kamar}</SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    isBooked ? 'bg-amber-500' : tenant ? 'bg-blue-500' : 'bg-emerald-500'
                  )} />
                  {mode === 'renew' ? 'Perpanjang Kontrak'
                    : isBooked ? 'Kamar Ter-Booking'
                    : tenant ? 'Penghuni Aktif'
                    : 'Kamar Kosong'}
                </SheetDescription>
              </div>
            </div>

            {/* BOOKING status banner */}
            {isBooked && mode === 'view' && (
              <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <CalendarClock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-0 leading-tight">Status Booking</p>
                    <p className="text-sm font-bold text-foreground mb-0 leading-tight">DP Dibayar — Belum Masuk</p>
                  </div>
                </div>
                {rental?.Tgl_Masuk && (
                  <div className="text-right flex flex-col gap-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-0 leading-tight">Check-in</p>
                    <p className="text-sm font-bold text-foreground mb-0 leading-tight">
                      {format(parseISO(rental.Tgl_Masuk), 'd MMM', { locale: localeId })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AKTIF status banner */}
            {tenant && rentalStatus && mode === 'view' && !isBooked && (
              <div className={cn(
                'mt-8 p-5 rounded-2xl flex items-center justify-between border transition-all',
                rentalStatus.isOverdue
                  ? 'bg-rose-500 border-rose-200 text-white shadow-lg shadow-rose-500/10'
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

          {/* VIEW MODE — Booking */}
          {isBooked && mode === 'view' && (
            <>
              <section className="space-y-4">
                <SectionTitle>Data Calon Penghuni</SectionTitle>
                <div className="grid gap-3">
                  <InfoRow icon={User} label="Nama Lengkap" value={tenant?.Nama || '—'} />
                  <InfoRow icon={Phone} label="Nomor WhatsApp" value={tenant?.No_HP || '—'} />
                  <InfoRow icon={Car} label="Kendaraan" value={tenant?.Bawa_Mobil === 'Ya' ? 'Mobil' : '—'} />
                  {tenant?.Kontak_Darurat && (
                    <InfoRow icon={Phone} label="Kontak Darurat" value={tenant.Kontak_Darurat} iconClass="text-destructive" />
                  )}
                </div>
              </section>
              <section className="space-y-4">
                <SectionTitle>Detail Booking</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <ContractCard label="Check-in" value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '—'} />
                  <ContractCard label="Tgl. DP" value={rental?.Tgl_DP ? format(parseISO(rental.Tgl_DP), 'd MMM yyyy', { locale: localeId }) : '—'} />
                  <ContractCard label="Periode" value={getPeriodeLabel(rental?.Periode_Sewa, rental?.Unit_Durasi)} />
                  <ContractCard label="Deposit" value={`Rp ${parseInt(rental?.Nominal_Deposit || '0').toLocaleString('id-ID')}`} />
                </div>
              </section>
            </>
          )}

          {/* VIEW MODE — Active tenant */}
          {tenant && mode === 'view' && !isBooked && (
            <>
              <section className="space-y-4">
                <SectionTitle>Data Penghuni</SectionTitle>
                <div className="grid gap-3">
                  <InfoRow icon={User} label="Nama Lengkap" value={tenant.Nama} />
                  <InfoRow icon={Phone} label="Nomor WhatsApp" value={tenant.No_HP} />
                  <InfoRow icon={Car} label="Kendaraan" value={tenant.Bawa_Mobil === 'Ya' ? 'Mobil' : '—'} />
                  {tenant.Kontak_Darurat && (
                    <InfoRow icon={Phone} label="Kontak Darurat" value={tenant.Kontak_Darurat} iconClass="text-destructive" />
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>Detail Kontrak</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <ContractCard label="Mulai Sewa" value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '—'} />
                  <ContractCard label="Jatuh Tempo" value={rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '—'} dark />
                  <ContractCard label="Periode" value={getPeriodeLabel(rental?.Periode_Sewa, rental?.Unit_Durasi)} />
                  <ContractCard label="Tgl. Bayar DP" value={rental?.Tgl_DP ? format(parseISO(rental.Tgl_DP), 'd MMM yyyy', { locale: localeId }) : '—'} />
                  <div className="col-span-2">
                    <ContractCard label="Nominal Deposit" value={`Rp ${parseInt(rental?.Nominal_Deposit || '0').toLocaleString('id-ID')}`} />
                  </div>
                </div>
              </section>

              {/* WA Reminder button */}
              {rentalStatus && (rentalStatus.isOverdue || rentalStatus.sisaHari <= 7) && waReminderUrl && (
                <section>
                  <a href={waReminderUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      id="btn-wa-remind"
                      variant="outline"
                      className="w-full h-12 rounded-2xl border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 font-bold flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Ingatkan via WhatsApp
                    </Button>
                  </a>
                </section>
              )}
            </>
          )}

          {/* SEWA MODE */}
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

                {tenantInputMode === 'existing' && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs ml-1">Pilih Penghuni</Label>
                    <Select value={selectedExistingTenantId} onValueChange={setSelectedExistingTenantId}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Cari penghuni..." /></SelectTrigger>
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
                      <Select value={sewaForm.Bawa_Mobil} onValueChange={val => setSewaForm({ ...sewaForm, Bawa_Mobil: val })}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tidak">Tidak</SelectItem>
                          <SelectItem value="Ya">Ya (Mobil)</SelectItem>
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
                      <Label className="text-muted-foreground text-xs ml-1">Durasi</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={sewaForm.Periode_Sewa}
                          onChange={e => setSewaForm({ ...sewaForm, Periode_Sewa: e.target.value })}
                          className="h-12 rounded-xl w-20"
                        />
                        <Select value={sewaForm.Unit_Durasi} onValueChange={val => setSewaForm({ ...sewaForm, Unit_Durasi: val })}>
                          <SelectTrigger className="h-12 rounded-xl flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hari">Hari</SelectItem>
                            <SelectItem value="Minggu">Minggu</SelectItem>
                            <SelectItem value="Bulan">Bulan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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

          {/* RENEW MODE */}
          {mode === 'renew' && (
            <section className="space-y-8">
              <div className="p-6 bg-muted/30 rounded-[1.5rem] border border-border space-y-4">
                <SectionTitle>Kontrak Saat Ini</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <ContractCard label="Mulai Sewa" value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '—'} />
                  <ContractCard label="Jatuh Tempo" value={rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '—'} dark />
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle>Perpanjang Masa Sewa</SectionTitle>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs ml-1">Tambah berapa {rental?.Unit_Durasi || 'Bulan'}?</Label>
                  <Select value={renewMonths} onValueChange={setRenewMonths}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 6, 12].map(n => (
                        <SelectItem key={n} value={String(n)}>+ {n} {rental?.Unit_Durasi || 'Bulan'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {rentalStatus && (
                  <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Estimasi Jatuh Tempo Baru</p>
                      <p className="text-base font-bold text-foreground">
                        {format(
                          calculateDueDate(
                            rentalStatus.tglJatuhTempo,
                            parseInt(renewMonths),
                            parseDurasiUnit(rental?.Unit_Durasi)
                          ),
                          'd MMMM yyyy',
                          { locale: localeId }
                        )}
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
            {/* SEWA MODE: 2 buttons — Booking + Konfirmasi Aktif */}
            {mode === 'sewa' && (
              <div className="flex gap-3 w-full">
                <Button
                  id="btn-booking-kamar"
                  onClick={handleBooking}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 h-14 font-bold rounded-2xl border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CalendarClock className="w-4 h-4 mr-2" />}
                  Booking (DP)
                </Button>
                <Button
                  id="btn-sewa-kamar"
                  onClick={handleSewa}
                  disabled={loading}
                  className="flex-1 h-14 font-bold rounded-2xl shadow-xl shadow-orange-500/10"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Sewa Aktif
                </Button>
              </div>
            )}

            {/* VIEW MODE — BOOKING: activate or cancel */}
            {mode === 'view' && isBooked && (
              <div className="flex gap-3 w-full">
                <Button
                  id="btn-checkout-booking"
                  onClick={() => setShowCheckoutConfirm(true)}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 h-14 font-bold rounded-2xl text-muted-foreground"
                >
                  Batalkan Booking
                </Button>
                <Button
                  id="btn-activate-booking"
                  onClick={handleActivateBooking}
                  disabled={loading}
                  className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/10"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Aktifkan (Check-in)
                </Button>
              </div>
            )}

            {/* VIEW MODE — AKTIF */}
            {mode === 'view' && !isBooked && tenant && (
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

            {/* RENEW MODE */}
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
        title={isBooked ? 'Batalkan Booking?' : 'Selesaikan Sewa?'}
        description={
          isBooked
            ? `Apakah Anda yakin ingin membatalkan booking ${tenant?.Nama} di Kamar ${room?.No_Kamar}?`
            : `Apakah Anda yakin ingin menyelesaikan masa sewa ${tenant?.Nama} di Kamar ${room?.No_Kamar}?`
        }
      />
    </Sheet>
  );
}
