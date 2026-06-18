import React from 'react';
import { CalendarClock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { SectionTitle } from './shared';
import { Tenant, Rental } from '@/types';

interface UpcomingBookingsTimelineProps {
  upcomingBookings: Array<{ rental: Rental; tenant: Tenant | null }>;
  getPeriodeLabel: (periode: string, unit?: string) => string;
}

export default function UpcomingBookingsTimeline({
  upcomingBookings,
  getPeriodeLabel,
}: UpcomingBookingsTimelineProps) {
  if (upcomingBookings.length === 0) return null;

  return (
    <section className="space-y-5">
      <SectionTitle>Antrean Booking Berikutnya</SectionTitle>
      <div className="relative border-l border-amber-200/80 ml-3 pl-6 space-y-6 py-2">
        {upcomingBookings.map(({ rental: upRental, tenant: upTenant }, idx) => {
          const startStr = upRental?.Tgl_Masuk
            ? format(parseISO(upRental.Tgl_Masuk), 'd MMMM yyyy', { locale: localeId })
            : '—';
          const durasi = getPeriodeLabel(upRental?.Periode_Sewa || '1', upRental?.Unit_Durasi);
          return (
            <div key={upRental.ID_Sewa} className="relative group text-left">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-amber-500 shadow-sm transition-all duration-300 group-hover:scale-125" />
              
              <div className="bg-amber-50/40 border border-amber-200/40 rounded-2xl p-4 flex flex-col gap-2 hover:border-amber-300/60 hover:shadow-soft transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black uppercase text-amber-700 tracking-wider m-0 leading-tight">Antrean #{idx + 1}</p>
                    <p className="text-xs font-bold text-foreground mt-1 mb-0 leading-tight">{upTenant?.Nama || 'Penyewa'}</p>
                  </div>
                  <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100/60 px-2.5 py-0.5 rounded-full leading-tight">
                    {durasi}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-semibold mt-1">
                  <CalendarClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Masuk: {startStr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
