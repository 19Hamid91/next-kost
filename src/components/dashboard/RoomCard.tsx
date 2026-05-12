'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { User, Car, Clock, AlertTriangle, DoorOpen } from 'lucide-react';
import { addMonths, isAfter, differenceInDays, parseISO, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface RoomProps {
  room: any;
  tenant?: any;
  rental?: any;
  onClick: (room: any, tenant?: any, rental?: any) => void;
}

export default function RoomCard({ room, tenant, rental, onClick }: RoomProps) {
  const isOccupied = rental && rental.Status_Aktif === 'TRUE';

  let isOverdue = false;
  let sisaHari = 0;
  let tglJatuhTempo: Date | null = null;

  if (isOccupied && rental?.Tgl_Masuk) {
    const tglMasuk = parseISO(rental.Tgl_Masuk);
    const periode = parseInt(rental.Periode_Sewa) || 1;
    tglJatuhTempo = addMonths(tglMasuk, periode);
    isOverdue = isAfter(new Date(), tglJatuhTempo);
    sisaHari = differenceInDays(tglJatuhTempo, new Date());
  }

  const statusConfig = isOccupied
    ? isOverdue
      ? {
        bg: 'bg-destructive/5',
        border: 'border-destructive/20',
        accent: 'bg-destructive',
        text: 'text-destructive',
        icon: AlertTriangle,
        label: 'Jatuh Tempo'
      }
      : {
        bg: 'bg-white',
        border: 'border-emerald-100',
        accent: 'bg-emerald-500',
        text: 'text-emerald-600',
        icon: User,
        label: tenant?.Nama?.split(' ')[0] || 'Terisi'
      }
    : {
      bg: 'bg-orange-50/50',
      border: 'border-orange-100',
      accent: 'bg-orange-500',
      text: 'text-orange-600',
      icon: DoorOpen,
      label: 'Kosong'
    };

  return (
    <HoverCard openDelay={100} closeDelay={50}>
      <HoverCardTrigger asChild>
        <div
          id={`room-${room.No_Kamar}`}
          onClick={() => onClick(room, tenant, rental)}
          className={cn(
            'group relative cursor-pointer transition-all duration-500 select-none rounded-[2rem] border shadow-soft hover:shadow-premium hover:-translate-y-1 active:scale-95 overflow-hidden min-h-[130px] flex flex-col',
            statusConfig.bg,
            statusConfig.border
          )}
        >
          {/* Status Icon Background (Large & Subtle) */}
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <statusConfig.icon className="w-24 h-24 rotate-12" />
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center gap-1 relative z-10">
            <span className="text-3xl font-bold text-foreground tracking-tighter">{room.No_Kamar}</span>
            <div className="flex flex-col items-center gap-1">
              <span className={cn('text-[10px] font-bold uppercase tracking-[0.2em]', statusConfig.text)}>
                {statusConfig.label}
              </span>
              {isOccupied && isOverdue && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-white animate-pulse shadow-lg shadow-destructive/20">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Urgent</span>
                </div>
              )}
            </div>
          </div>

          {/* Status bar bottom (Thicker) */}
          <div className={cn('h-2 w-full transition-colors duration-500 mt-auto', statusConfig.accent)} />
        </div>
      </HoverCardTrigger>

      {isOccupied && (
        <HoverCardContent
          className="w-80 p-0 bg-white border-border shadow-premium rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200"
          align="center"
          sideOffset={12}
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-sm font-bold text-primary shadow-sm border border-border">
                {tenant?.Nama?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <p className="text-sm font-bold text-foreground truncate mb-0 leading-tight">{tenant?.Nama}</p>
                <p className="text-[11px] text-muted-foreground font-medium tracking-tight mb-0 leading-tight">{tenant?.No_HP}</p>
              </div>
              <Badge variant="outline" className={cn('rounded-xl border-0 font-bold text-[9px] uppercase tracking-widest', isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 text-emerald-600')}>
                {isOverdue ? 'Jatuh Tempo' : 'Lancar'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-2xl border border-border space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Kendaraan</p>
                <div className="flex items-center gap-2 text-[11px] text-foreground font-bold">
                  <Car className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{tenant?.Bawa_Mobil === 'Ya' ? 'Mobil' : '-'}</span>
                </div>
              </div>
              <div className={cn('p-4 rounded-2xl border space-y-1', isOverdue ? 'bg-destructive/5 border-destructive/10' : 'bg-emerald-50/30 border-emerald-100')}>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status Sewa</p>
                <div className={cn('flex items-center gap-2 text-[11px] font-bold', isOverdue ? 'text-destructive' : 'text-emerald-600')}>
                  {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>
                    {isOverdue ? `${Math.abs(sisaHari)} Hari Lewat` : `${sisaHari} Hari Lagi`}
                  </span>
                </div>
              </div>
            </div>

            {tglJatuhTempo && (
              <div className="flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-orange-500/20">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Jatuh Tempo</span>
                <span className="text-xs font-bold">{format(tglJatuhTempo, 'd MMM yyyy', { locale: localeId })}</span>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-[0.3em] pt-1">
              Click to manage
            </p>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
