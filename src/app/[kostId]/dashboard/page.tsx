'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import RoomGrid from '@/components/dashboard/RoomGrid';
import TenantSheet from '@/components/dashboard/TenantSheet';
import StatCard from '@/components/dashboard/StatCard';
import { BedDouble, Users, AlertTriangle, DoorOpen, Loader2 } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const params = useParams();
  const kostId = params.kostId as string;
  
  const {
    isLoading,
    stats,
    currentKost,
    filteredRooms,
    allTenants,
    allRentals,
    selectedRoom,
    selectedTenant,
    selectedRental,
    isSheetOpen,
    handleRoomClick,
    closeSheet
  } = useDashboard(kostId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Syncing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      <Header />
      
      <main className="p-6 md:p-12 max-w-[1440px] mx-auto w-full space-y-12 flex-1">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Denah Kamar</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {currentKost?.Nama_Kost || 'Kost Properti'}
              <span className="text-slate-200">•</span>
              Klik unit untuk detail
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          <StatCard icon={BedDouble} label="Total Unit" value={stats.totalRooms} color="bg-slate-900 text-white" description="Kapasitas Properti" />
          <StatCard icon={Users} label="Terisi" value={stats.occupied} color="bg-emerald-500 text-white" description="Penyewa Aktif" />
          <StatCard icon={DoorOpen} label="Tersedia" value={stats.vacant} color="bg-blue-500 text-white" description="Unit Kosong" />
          <StatCard icon={AlertTriangle} label="Tempo" value={stats.overdue} color="bg-rose-500 text-white" description="Perlu Penagihan" />
        </motion.div>

        {/* Room Mapping Section */}
        <section className="space-y-6">
          {filteredRooms.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[32px] p-20 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                <BedDouble className="w-10 h-10" />
              </div>
              <div>
                <p className="text-slate-900 font-black text-xl">Belum ada unit terdaftar</p>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Tambahkan unit di menu manajemen</p>
              </div>
            </div>
          ) : (
            <RoomGrid 
              rooms={filteredRooms}
              tenants={allTenants}
              rentals={allRentals}
              onRoomClick={handleRoomClick}
            />
          )}
        </section>
      </main>

      <TenantSheet 
        room={selectedRoom}
        tenant={selectedTenant}
        rental={selectedRental}
        isOpen={isSheetOpen}
        onClose={closeSheet}
      />

      <footer className="p-10 text-center opacity-20 select-none">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">NextKost Dashboard Core v2.0</p>
      </footer>
    </div>
  );
}
