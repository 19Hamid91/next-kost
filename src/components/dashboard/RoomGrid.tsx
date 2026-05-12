'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoomCard from './RoomCard';

interface RoomGridProps {
  rooms: any[];
  tenants: any[];
  rentals: any[];
  onRoomClick: (room: any, tenant?: any, rental?: any) => void;
}

export default function RoomGrid({ rooms, tenants, rentals, onRoomClick }: RoomGridProps) {
  const floors = Array.from(new Set(rooms.map(r => r.Lantai))).sort();

  return (
    <Tabs defaultValue={floors[0]} className="w-full space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/50 border border-border p-1.5 rounded-2xl h-auto">
            {floors.map((floor) => (
              <TabsTrigger 
                key={floor} 
                value={floor}
                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Lantai {floor}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <div className="flex items-center gap-6 px-6 py-4 bg-white border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]" /> 
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Aman</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-destructive shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse" /> 
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tempo</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-slate-200" /> 
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Kosong</span>
          </div>
        </div>
      </div>

      {floors.map((floor) => (
        <TabsContent key={floor} value={floor}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {rooms
              .filter((r) => r.Lantai === floor)
              .map((room) => {
                const rental = rentals.find(rent => rent.ID_Kamar === room.ID_Kamar && rent.Status_Aktif === 'TRUE');
                const tenant = rental ? tenants.find(t => t.ID_Penghuni === rental.ID_Penghuni) : null;
                
                return (
                  <RoomCard 
                    key={room.ID_Kamar} 
                    room={room} 
                    tenant={tenant}
                    rental={rental}
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
