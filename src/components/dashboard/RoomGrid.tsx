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
    <Tabs defaultValue={floors[0]} className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
          {floors.map((floor) => (
            <TabsTrigger 
              key={floor} 
              value={floor}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6"
            >
              Lantai {floor}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" /> Aman
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" /> Overdue
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700" /> Kosong
          </div>
        </div>
      </div>

      {floors.map((floor) => (
        <TabsContent key={floor} value={floor}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
