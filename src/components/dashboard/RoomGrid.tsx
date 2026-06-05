'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoomCard from './RoomCard';
import { resolveStatusSewa } from '@/lib/dateUtils';

interface RoomGridProps {
  rooms: any[];
  tenants: any[];
  rentals: any[];
  onRoomClick: (room: any, tenant?: any, rental?: any) => void;
}

export default function RoomGrid({ rooms, tenants, rentals, onRoomClick }: RoomGridProps) {
  const floors = Array.from(new Set(rooms.map(room => room.Lantai))).sort();

  const getLegendDot = (color: string, pulse = false) => (
    <div className={`w-3 h-3 rounded-full ${color} ${pulse ? 'animate-pulse' : ''}`} />
  );

  return (
    <Tabs defaultValue={String(floors[0])} className="w-full space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Floor tabs */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/50 border border-border p-1 rounded-2xl h-auto">
            {floors.map((floor) => (
              <TabsTrigger
                key={floor}
                value={String(floor)}
                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Lantai {floor}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-white border border-border rounded-2xl shadow-soft">
          <div className="flex items-center gap-2">
            {getLegendDot('bg-emerald-500')}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Kosong</span>
          </div>
          <div className="flex items-center gap-2">
            {getLegendDot('bg-blue-500')}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            {getLegendDot('bg-amber-500')}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Booking</span>
          </div>
          <div className="flex items-center gap-2">
            {getLegendDot('bg-rose-500', true)}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tempo</span>
          </div>
        </div>
      </div>

      {floors.map((floor) => (
        <TabsContent key={floor} value={String(floor)}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {rooms
              .filter((room) => String(room.Lantai) === String(floor))
              .map((room) => {
                // Find the active or booking rental for this room
                const activeRental = rentals.find((rental) => {
                  const status = resolveStatusSewa(rental);
                  return rental.ID_Kamar === room.ID_Kamar && (status === 'AKTIF' || status === 'BOOKING');
                });
                const activeTenant = activeRental
                  ? tenants.find((tenant) => tenant.ID_Penghuni === activeRental.ID_Penghuni)
                  : null;

                return (
                  <RoomCard
                    key={room.ID_Kamar}
                    room={room}
                    tenant={activeTenant}
                    rental={activeRental}
                    onClick={onRoomClick}
                  />
                );
              })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
