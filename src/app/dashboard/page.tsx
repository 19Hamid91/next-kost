'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import RoomGrid from '@/components/dashboard/RoomGrid';
import TenantSheet from '@/components/dashboard/TenantSheet';
import { Loader2, BedDouble, Users, AlertTriangle, DoorOpen } from 'lucide-react';
import { addMonths, isAfter, parseISO } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { data: kostsData } = useSWR('/api/data/Master_Kost', fetcher);
  const { data: roomsData } = useSWR('/api/data/Master_Kamar', fetcher);
  const { data: tenantsData } = useSWR('/api/data/Master_Penghuni', fetcher);
  const { data: rentalsData } = useSWR('/api/data/Transaksi_Sewa', fetcher);

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isInitialLoading = !kostsData || !roomsData || !tenantsData || !rentalsData;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  const kosts = kostsData.data || [];
  const allRooms = roomsData.data || [];
  const allTenants = tenantsData.data || [];
  const allRentals = rentalsData.data || [];

  const currentKostId = searchParams.get('kostId') || kosts[0]?.ID_Kost;

  const filteredRooms = allRooms.filter((r: any) => r.ID_Kost === currentKostId);
  const activeRentals = allRentals.filter((r: any) => r.Status_Aktif === 'TRUE');

  // Calculate stats for current kost
  const kostRoomIds = new Set(filteredRooms.map((r: any) => r.ID_Kamar));
  const kostActiveRentals = activeRentals.filter((r: any) => kostRoomIds.has(r.ID_Kamar));
  const overdueRentals = kostActiveRentals.filter((rental: any) => {
    if (!rental.Tgl_Masuk) return false;
    const tglMasuk = parseISO(rental.Tgl_Masuk);
    const periode = parseInt(rental.Periode_Sewa) || 1;
    return isAfter(new Date(), addMonths(tglMasuk, periode));
  });

  const stats = {
    totalRooms: filteredRooms.length,
    occupied: kostActiveRentals.length,
    vacant: filteredRooms.length - kostActiveRentals.length,
    overdue: overdueRentals.length,
  };

  const handleRoomClick = (room: any, tenant?: any, rental?: any) => {
    setSelectedRoom(room);
    setSelectedTenant(tenant || null);
    setSelectedRental(rental || null);
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header kosts={kosts} />
      
      <main className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Denah Kamar</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {kosts.find((k: any) => k.ID_Kost === currentKostId)?.Nama_Kost || 'Pilih kost di atas'}
            {' — '}klik kamar untuk kelola penghuni
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={BedDouble} label="Total Kamar" value={stats.totalRooms} color="bg-blue-500/10 text-blue-400" />
          <StatCard icon={Users} label="Terisi" value={stats.occupied} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard icon={DoorOpen} label="Kosong" value={stats.vacant} color="bg-zinc-500/10 text-zinc-400" />
          <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="bg-red-500/10 text-red-400" />
        </div>

        {/* Room Grid */}
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BedDouble className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium">Belum ada kamar di kost ini</p>
            <p className="text-zinc-600 text-sm mt-1">Tambahkan kamar di halaman <span className="text-blue-400">Management → Rooms</span></p>
          </div>
        ) : (
          <RoomGrid 
            rooms={filteredRooms}
            tenants={allTenants}
            rentals={allRentals}
            onRoomClick={handleRoomClick}
          />
        )}
      </main>

      <TenantSheet 
        room={selectedRoom}
        tenant={selectedTenant}
        rental={selectedRental}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
