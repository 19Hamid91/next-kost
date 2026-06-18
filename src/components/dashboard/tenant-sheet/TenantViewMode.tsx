import React from 'react';
import { User, Phone, Car, MessageCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { InfoRow, ContractCard, SectionTitle } from './shared';
import { Button } from '@/components/ui/button';
import { Room, Tenant, Rental } from '@/types';

interface TenantViewModeProps {
  room: Room | null;
  tenant: Tenant | null;
  rental: Rental | null;
  isBooked: boolean;
  rentalStatus: {
    tglJatuhTempo: Date;
    isOverdue: boolean;
    sisaHari: number;
  } | null;
  getPeriodeLabel: (periode: string, unit?: string) => string;
  waReminderUrl: string | null;
}

export default function TenantViewMode({
  room,
  tenant,
  rental,
  isBooked,
  rentalStatus,
  getPeriodeLabel,
  waReminderUrl,
}: TenantViewModeProps) {
  if (isBooked) {
    return (
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
            <ContractCard label="Periode" value={getPeriodeLabel(rental?.Periode_Sewa || '1', rental?.Unit_Durasi)} />
            <ContractCard label="Deposit" value={`Rp ${parseInt(rental?.Nominal_Deposit || '0').toLocaleString('id-ID')}`} />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {tenant && (
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
      )}

      <section className="space-y-4">
        <SectionTitle>Detail Kontrak</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <ContractCard label="Mulai Sewa" value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM yyyy', { locale: localeId }) : '—'} />
          <ContractCard label="Jatuh Tempo" value={rentalStatus ? format(rentalStatus.tglJatuhTempo, 'd MMM yyyy', { locale: localeId }) : '—'} dark />
          <ContractCard label="Periode" value={getPeriodeLabel(rental?.Periode_Sewa || '1', rental?.Unit_Durasi)} />
          <ContractCard label="Tgl. Bayar DP" value={rental?.Tgl_DP ? format(parseISO(rental.Tgl_DP), 'd MMM yyyy', { locale: localeId }) : '—'} />
          <div className="col-span-2">
            <ContractCard label="Nominal Deposit" value={`Rp ${parseInt(rental?.Nominal_Deposit || '0').toLocaleString('id-ID')}`} />
          </div>
        </div>
      </section>

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
  );
}
