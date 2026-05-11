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

  const cardStyle = isOccupied
    ? isOverdue
      ? 'bg-red-500/10 border-red-500/40 text-red-300 hover:border-red-500/70'
      : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:border-emerald-500/70'
    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-500';

  return (
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Card 
          id={`room-${room.No_Kamar}`}
          onClick={() => onClick(room, tenant, rental)}
          className={cn(
            'cursor-pointer transition-all duration-200 border-2 select-none',
            'hover:scale-[1.03] active:scale-95',
            cardStyle
          )}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center gap-1.5 min-h-[90px]">
            <span className="text-xl font-bold tracking-tight">{room.No_Kamar}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60 text-center leading-tight">
              {isOccupied ? (tenant?.Nama?.split(' ')[0] || 'Terisi') : 'Kosong'}
            </span>
            {isOccupied && isOverdue && (
              <Badge variant="destructive" className="text-[9px] px-1.5 py-0 mt-0.5 animate-pulse">
                OVERDUE
              </Badge>
            )}
          </CardContent>
        </Card>
      </HoverCardTrigger>
      
      {isOccupied && (
        <HoverCardContent 
          className="w-72 bg-zinc-900/95 border-zinc-800 text-white backdrop-blur-xl shadow-2xl"
          align="center"
          sideOffset={8}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                  {tenant?.Nama?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold">{tenant?.Nama}</p>
                  <p className="text-[10px] text-zinc-500">{tenant?.No_HP}</p>
                </div>
              </div>
              <Badge className={isOverdue ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}>
                {isOverdue ? 'Overdue' : 'Aman'}
              </Badge>
            </div>

            {/* Info pills */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Car className="w-3.5 h-3.5 text-zinc-500" />
                <span>{tenant?.Bawa_Mobil === 'Ya' ? 'Bawa Mobil' : 'Tanpa Mobil'}</span>
              </div>
              <div className={cn('flex items-center gap-1.5 text-xs', isOverdue ? 'text-red-400' : 'text-zinc-400')}>
                {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                <span>
                  {isOverdue
                    ? `${Math.abs(sisaHari)} hari lewat`
                    : `${sisaHari} hari lagi`}
                </span>
              </div>
            </div>

            {tglJatuhTempo && (
              <p className="text-[10px] text-zinc-600">
                Jatuh tempo: {format(tglJatuhTempo, 'd MMM yyyy', { locale: localeId })}
              </p>
            )}

            {/* Click hint */}
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 pt-1 border-t border-zinc-800/50">
              <DoorOpen className="w-3 h-3" />
              <span>Klik untuk kelola kamar</span>
            </div>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
