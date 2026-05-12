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
          bg: 'bg-card', 
          border: 'border-destructive/30', 
          accent: 'bg-destructive', 
          text: 'text-destructive',
          label: 'Jatuh Tempo'
        }
      : { 
          bg: 'bg-card', 
          border: 'border-emerald-200', 
          accent: 'bg-emerald-500', 
          text: 'text-emerald-600',
          label: tenant?.Nama?.split(' ')[0] || 'Terisi'
        }
    : { 
        bg: 'bg-card', 
        border: 'border-border', 
        accent: 'bg-slate-200', 
        text: 'text-muted-foreground',
        label: 'Kosong'
      };

  return (
    <HoverCard openDelay={100} closeDelay={50}>
      <HoverCardTrigger asChild>
        <div 
          id={`room-${room.No_Kamar}`}
          onClick={() => onClick(room, tenant, rental)}
          className={cn(
            'group relative cursor-pointer transition-all duration-500 select-none rounded-2xl border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1.5 active:scale-95 overflow-hidden',
            statusConfig.border
          )}
        >
          {/* Status bar top */}
          <div className={cn('h-2 w-full transition-colors duration-500', statusConfig.accent)} />
          
          <div className="p-5 flex flex-col items-center justify-center gap-1 min-h-[100px]">
            <span className="text-3xl font-black text-primary tracking-tighter">{room.No_Kamar}</span>
            <div className="flex flex-col items-center gap-1">
              <span className={cn('text-[10px] font-black uppercase tracking-widest', statusConfig.text)}>
                {statusConfig.label}
              </span>
              {isOccupied && isOverdue && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive animate-pulse">
                   <AlertTriangle className="w-2.5 h-2.5" />
                   <span className="text-[8px] font-black uppercase tracking-tighter">Urgent</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      
      {isOccupied && (
        <HoverCardContent 
          className="w-80 p-0 bg-card border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          align="center"
          sideOffset={12}
        >
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-sm font-black text-primary shadow-sm border border-border">
                {tenant?.Nama?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-primary truncate">{tenant?.Nama}</p>
                <p className="text-[11px] text-muted-foreground font-bold tracking-tight">{tenant?.No_HP}</p>
              </div>
              <Badge variant="outline" className={cn('rounded-xl border-0 font-black text-[9px] uppercase tracking-widest', isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 text-emerald-600')}>
                {isOverdue ? 'Jatuh Tempo' : 'Lancar'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-2xl border border-border space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Fasilitas</p>
                <div className="flex items-center gap-2 text-[11px] text-primary font-black">
                  <Car className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{tenant?.Bawa_Mobil === 'Ya' ? 'Mobil' : 'Motor'}</span>
                </div>
              </div>
              <div className={cn('p-3 rounded-2xl border space-y-1', isOverdue ? 'bg-destructive/5 border-destructive/10' : 'bg-emerald-50/50 border-emerald-100')}>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status Sewa</p>
                <div className={cn('flex items-center gap-2 text-[11px] font-black', isOverdue ? 'text-destructive' : 'text-emerald-600')}>
                  {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>
                    {isOverdue ? `${Math.abs(sisaHari)} Hari Lewat` : `${sisaHari} Hari Lagi`}
                  </span>
                </div>
              </div>
            </div>

            {tglJatuhTempo && (
              <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-slate-200">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Jatuh Tempo</span>
                <span className="text-xs font-black">{format(tglJatuhTempo, 'd MMM yyyy', { locale: localeId })}</span>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center font-black uppercase tracking-[0.3em] pt-1 animate-pulse">
              Kelola Manajemen
            </p>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
