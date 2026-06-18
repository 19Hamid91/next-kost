'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { calculateDueDate, parseDurasiUnit, resolveStatusSewa } from '@/lib/dateUtils';
import { CalendarClock, DoorOpen } from 'lucide-react';

interface RoomCardProps {
  room: any;
  tenant?: any;
  rental?: any;
  nextRental?: any;   // soonest future confirmed booking
  nextTenant?: any;
  upcomingCount?: number;
  compact?: boolean;  // when true, room number shown externally — hide it inside card
  onClick: (room: any, tenant?: any, rental?: any) => void;
}

export default function RoomCard({ room, tenant, rental, nextRental, nextTenant, upcomingCount = 0, compact = false, onClick }: RoomCardProps) {
  const statusSewa = resolveStatusSewa(rental);
  const isActive = statusSewa === 'AKTIF';
  const isBooked = statusSewa === 'BOOKING';
  const isOccupied = isActive || isBooked;

  // Compute due date for AKTIF rentals
  const dueDate = (() => {
    if (!isActive || !rental?.Tgl_Masuk) return null;
    const startDate = parseISO(rental.Tgl_Masuk);
    return calculateDueDate(startDate, parseInt(rental.Periode_Sewa) || 1, parseDurasiUnit(rental.Unit_Durasi));
  })();

  const sisaHari = dueDate ? differenceInDays(dueDate, new Date()) : null;
  const isOverdue = sisaHari !== null && sisaHari < 0;

  // ── State config ─────────────────────────────────────────────────────
  type CardState = 'active' | 'overdue' | 'booking' | 'vacant';
  const cardState: CardState = (() => {
    if (isActive && isOverdue) return 'overdue';
    if (isActive) return 'active';
    if (isBooked) return 'booking';
    return 'vacant';
  })();

  const stateStyles: Record<CardState, { wrapper: string; accent: string; numberColor: string; labelColor: string }> = {
    active: {
      wrapper: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
      accent: 'bg-emerald-500',
      numberColor: 'text-foreground',
      labelColor: 'text-emerald-700',
    },
    overdue: {
      wrapper: 'bg-rose-50 border-rose-300 hover:border-rose-400',
      accent: 'bg-rose-500',
      numberColor: 'text-foreground',
      labelColor: 'text-rose-700',
    },
    booking: {
      wrapper: 'bg-amber-50 border-amber-200 hover:border-amber-400',
      accent: 'bg-amber-500',
      numberColor: 'text-foreground',
      labelColor: 'text-amber-700',
    },
    vacant: {
      wrapper: 'bg-white border-border hover:border-orange-200',
      accent: 'bg-slate-200',
      numberColor: 'text-foreground',
      labelColor: 'text-muted-foreground',
    },
  };

  const { wrapper, accent, numberColor, labelColor } = stateStyles[cardState];

  // Date range string for card body
  const dateRangeLabel = (() => {
    if (!rental?.Tgl_Masuk) return null;
    const start = format(parseISO(rental.Tgl_Masuk), 'd MMM', { locale: localeId });
    if (isActive && dueDate) {
      const end = format(dueDate, 'd MMM yy', { locale: localeId });
      return `${start} – ${end}`;
    }
    if (isBooked) return `Masuk ${start}`;
    return null;
  })();

  // Next tenant strip — show whenever a future booking exists (not just when currently active)
  const showNextTenant = !!(nextRental && nextTenant);
  const nextMoveIn = nextRental?.Tgl_Masuk
    ? format(parseISO(nextRental.Tgl_Masuk), 'MMM yy', { locale: localeId })
    : null;

  return (
    <div
      id={`room-${room.No_Kamar}`}
      onClick={() => onClick(room, tenant, rental)}
      className={cn(
        'relative cursor-pointer select-none rounded-2xl border transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]',
        'flex flex-col overflow-hidden',
        compact ? 'min-h-[72px]' : 'min-h-[120px]',
        wrapper
      )}
    >
      {/* Upcoming booking badge */}
      {upcomingCount > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100/90 border border-amber-200/60 px-1.5 py-0.5 rounded-full select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[8px] font-black tracking-wider text-amber-800 uppercase leading-none">
            +{upcomingCount} Booking
          </span>
        </div>
      )}

      {/* Main body */}
      <div className="flex-1 p-3 flex flex-col gap-1">
      {/* Room number — hidden in compact mode (displayed externally in grid) */}
        {!compact && (
          <span className={cn('text-2xl font-extrabold tracking-tight leading-none', numberColor)}>
            {room.No_Kamar}
          </span>
        )}

        {/* Tenant name or vacant icon */}
        {isOccupied && tenant ? (
          <span className={cn('text-[10px] font-black uppercase tracking-wide leading-tight truncate', labelColor)}>
            {tenant.Nama}
          </span>
        ) : !isOccupied ? (
          <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <DoorOpen className="w-3 h-3" /> Kosong
          </span>
        ) : null}

        {/* Date range */}
        {dateRangeLabel && (
          <span className="text-[9px] font-semibold text-muted-foreground leading-tight">
            {dateRangeLabel}
          </span>
        )}

        {/* Overdue indicator */}
        {isOverdue && (
          <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wide">
            {Math.abs(sisaHari!)}h lewat
          </span>
        )}
      </div>

      {/* Next-tenant indicator — only when AKTIF + has future booking */}
      {showNextTenant && (
        <div className="px-3 py-1.5 bg-amber-100/80 border-t border-amber-200 flex items-center gap-1.5">
          <CalendarClock className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wide truncate">
            {nextTenant.Nama.split(' ')[0]}
          </span>
          {nextMoveIn && (
            <span className="ml-auto text-[9px] font-semibold text-amber-600 shrink-0">
              {nextMoveIn}
            </span>
          )}
        </div>
      )}

      {/* Bottom accent bar */}
      <div className={cn('h-1 w-full', accent)} />
    </div>
  );
}
