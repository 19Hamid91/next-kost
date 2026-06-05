'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { User, Car, Clock, AlertTriangle, DoorOpen, CalendarClock, Phone } from 'lucide-react';
import { isAfter, differenceInDays, parseISO, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { calculateDueDate, parseDurasiUnit, resolveStatusSewa } from '@/lib/dateUtils';

interface RoomProps {
  room: any;
  tenant?: any;
  rental?: any;
  onClick: (room: any, tenant?: any, rental?: any) => void;
}

export default function RoomCard({ room, tenant, rental, onClick }: RoomProps) {
  const statusSewa = resolveStatusSewa(rental);
  const isBooked = statusSewa === 'BOOKING';
  const isActive = statusSewa === 'AKTIF';

  // Due date calc (only for AKTIF)
  let isOverdue = false;
  let isUrgent = false;
  let sisaHari = 0;
  let tglJatuhTempo: Date | null = null;

  if (isActive && rental?.Tgl_Masuk) {
    const tglMasuk = parseISO(rental.Tgl_Masuk);
    const periode = parseInt(rental.Periode_Sewa) || 1;
    const unit = parseDurasiUnit(rental.Unit_Durasi);
    tglJatuhTempo = calculateDueDate(tglMasuk, periode, unit);
    sisaHari = differenceInDays(tglJatuhTempo, new Date());
    isOverdue = isAfter(new Date(), tglJatuhTempo);
    isUrgent = !isOverdue && sisaHari <= 3;
  }

  // ── Status config ────────────────────────────────────────────────
  type StatusCfg = {
    bg: string;
    border: string;
    accent: string;
    text: string;
    icon: React.ElementType;
    label: string;
  };

  const statusConfig: StatusCfg = (() => {
    if (isBooked) {
      return {
        bg: 'bg-amber-50/60',
        border: 'border-amber-200',
        accent: 'bg-amber-500',
        text: 'text-amber-700',
        icon: CalendarClock,
        label: rental?.Tgl_Masuk ? `Masuk: ${format(parseISO(rental.Tgl_Masuk), 'dd/MM', { locale: localeId })}` : 'Booking',
      };
    }
    if (isActive) {
      if (isOverdue) {
        return {
          bg: 'bg-rose-50/60',
          border: 'border-rose-200',
          accent: 'bg-rose-500',
          text: 'text-rose-700',
          icon: AlertTriangle,
          label: tenant?.Nama?.split(' ')[0] || 'Jatuh Tempo',
        };
      }
      return {
        bg: 'bg-blue-50/40',
        border: 'border-blue-200',
        accent: 'bg-blue-500',
        text: 'text-blue-700',
        icon: User,
        label: tenant?.Nama?.split(' ')[0] || 'Aktif',
      };
    }
    // Vacant
    return {
      bg: 'bg-white',
      border: 'border-emerald-100',
      accent: 'bg-emerald-500',
      text: 'text-emerald-600',
      icon: DoorOpen,
      label: 'Kosong',
    };
  })();

  // ── Duration badge label ─────────────────────────────────────────
  const durationLabel = (() => {
    if (!rental) return null;
    const unit = rental.Unit_Durasi || 'Bulan';
    return `${rental.Periode_Sewa} ${unit}`;
  })();

  // ── Remaining time badge ─────────────────────────────────────────
  const timeRemainingEl = (() => {
    if (!isActive || tglJatuhTempo === null) return null;
    const urgentStyle = isOverdue || isUrgent;
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold',
        urgentStyle
          ? 'bg-rose-100 text-rose-700 animate-pulse'
          : 'bg-blue-100 text-blue-700'
      )}>
        <Clock className="w-2 h-2" />
        {isOverdue ? `${Math.abs(sisaHari)}H lewat` : `Sisa ${sisaHari}H`}
      </span>
    );
  })();

  return (
    <HoverCard openDelay={100} closeDelay={50}>
      <HoverCardTrigger asChild>
        <div
          id={`room-${room.No_Kamar}`}
          onClick={() => onClick(room, tenant, rental)}
          className={cn(
            'group relative cursor-pointer transition-all duration-300 select-none rounded-[1.75rem] border shadow-soft hover:shadow-premium hover:-translate-y-1 active:scale-95 overflow-hidden min-h-[130px] flex flex-col',
            statusConfig.bg,
            statusConfig.border
          )}
        >
          {/* Car icon — top right */}
          {tenant?.Bawa_Mobil === 'Ya' && (
            <div className="absolute top-3 right-3 z-10">
              <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Car className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </div>
          )}

          {/* Ghost icon */}
          <div className="absolute -right-2 -bottom-2 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
            <statusConfig.icon className="w-20 h-20 rotate-12" />
          </div>

          <div className="flex-1 p-4 flex flex-col items-center justify-center gap-1.5 relative z-10">
            {/* Room number */}
            <span className="text-3xl font-bold text-foreground tracking-tighter leading-none">
              {room.No_Kamar}
            </span>

            {/* Status label */}
            <span className={cn('text-[9px] font-black uppercase tracking-[0.2em]', statusConfig.text)}>
              {statusConfig.label}
            </span>

            {/* Mini-badges row — shown when active */}
            {isActive && (
              <div className="flex flex-col items-center gap-1 mt-0.5">
                {durationLabel && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[8px] font-bold">
                    {durationLabel}
                  </span>
                )}
                {timeRemainingEl}
              </div>
            )}

            {/* Urgent overdue badge */}
            {isActive && isOverdue && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20 mt-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span className="text-[8px] font-bold uppercase tracking-tighter">Urgent</span>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className={cn('h-1.5 w-full transition-colors duration-300 mt-auto', statusConfig.accent)} />
        </div>
      </HoverCardTrigger>

      {/* HoverCard — shown for occupied (AKTIF) and booked rooms */}
      {(isActive || isBooked) && (
        <HoverCardContent
          className="w-72 p-0 bg-white border-border shadow-premium rounded-[1.75rem] overflow-hidden animate-in zoom-in-95 duration-200"
          align="center"
          sideOffset={10}
        >
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-sm font-bold text-primary border border-border shrink-0">
                {tenant?.Nama?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-tight">{tenant?.Nama}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground font-medium">{tenant?.No_HP}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'rounded-xl border-0 font-bold text-[8px] uppercase tracking-widest shrink-0',
                  isBooked ? 'bg-amber-50 text-amber-700'
                    : isOverdue ? 'bg-rose-50 text-rose-700'
                    : isUrgent ? 'bg-orange-50 text-orange-700'
                    : 'bg-blue-50 text-blue-700'
                )}
              >
                {isBooked ? 'Booking' : isOverdue ? 'Tempo' : isUrgent ? 'Mendekat' : 'Lancar'}
              </Badge>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted/30 rounded-xl border border-border space-y-0.5">
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Kendaraan</p>
                <div className="flex items-center gap-1.5 text-[10px] text-foreground font-bold">
                  <Car className="w-3 h-3 text-muted-foreground" />
                  {tenant?.Bawa_Mobil === 'Ya' ? 'Mobil' : '—'}
                </div>
              </div>

              {isActive ? (
                <div className={cn('p-3 rounded-xl border space-y-0.5', isOverdue ? 'bg-rose-50/50 border-rose-100' : 'bg-blue-50/30 border-blue-100')}>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Sisa</p>
                  <div className={cn('flex items-center gap-1.5 text-[10px] font-bold', isOverdue ? 'text-rose-700' : 'text-blue-700')}>
                    {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isOverdue ? `${Math.abs(sisaHari)} Hari Lewat` : `${sisaHari} Hari`}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 space-y-0.5">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Check-in</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700">
                    <CalendarClock className="w-3 h-3" />
                    {rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), 'd MMM', { locale: localeId }) : '—'}
                  </div>
                </div>
              )}
            </div>

            {/* Deposit */}
            {rental?.Nominal_Deposit && (
              <div className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-xl border border-border">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Deposit</span>
                <span className="text-[10px] font-bold text-foreground">
                  Rp {parseInt(rental.Nominal_Deposit || '0').toLocaleString('id-ID')}
                </span>
              </div>
            )}

            {/* Due date bar */}
            {tglJatuhTempo && isActive && (
              <div className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl',
                isOverdue ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-primary text-primary-foreground shadow-lg shadow-orange-500/20'
              )}>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-80">Jatuh Tempo</span>
                <span className="text-[10px] font-bold">{format(tglJatuhTempo, 'd MMM yyyy', { locale: localeId })}</span>
              </div>
            )}

            {/* Emergency contact */}
            {tenant?.Kontak_Darurat && (
              <div className="flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/10 rounded-xl">
                <Phone className="w-3 h-3 text-destructive shrink-0" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Darurat:</span>
                <span className="text-[10px] font-bold text-foreground">{tenant.Kontak_Darurat}</span>
              </div>
            )}

            <p className="text-[9px] text-muted-foreground text-center font-bold uppercase tracking-[0.3em]">
              Klik untuk kelola
            </p>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
