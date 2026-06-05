"use client";

import { useParams } from "next/navigation";
import Header from "@/components/dashboard/Header";
import RoomGrid from "@/components/dashboard/RoomGrid";
import TenantSheet from "@/components/dashboard/TenantSheet";
import StatCard from "@/components/dashboard/StatCard";
import { BedDouble, Users, AlertTriangle, DoorOpen, Loader2 } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const params = useParams();
    const kostId = params.kostId as string;

    const { isLoading, stats, currentKost, filteredRooms, allTenants, allRentals, selectedRoom, selectedTenant, selectedRental, isSheetOpen, handleRoomClick, closeSheet } = useDashboard(kostId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.2em] animate-pulse">Syncing Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-orange-100">
            <Header />

            <main className="p-6 md:p-12 max-w-[1440px] mx-auto w-full space-y-12 flex-1">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Denah Kamar</h1>
                        <p className="text-muted-foreground text-sm font-medium flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                            {currentKost?.Nama_Kost || "Kost"}
                            <span className="text-border mx-1">•</span>
                            Klik unit untuk detail penyewa
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                >
                    <StatCard
                        icon={BedDouble}
                        label="Total Unit"
                        value={stats.totalRooms}
                        color="bg-primary/10 text-primary"
                        description="Kapasitas Kost"
                    />
                    <StatCard
                        icon={Users}
                        label="Terisi"
                        value={stats.occupied}
                        color="bg-emerald-500/10 text-emerald-600"
                        description="Penyewa Aktif"
                    />
                    <StatCard
                        icon={DoorOpen}
                        label="Tersedia"
                        value={stats.vacant}
                        color="bg-orange-500/10 text-orange-600"
                        description="Unit Kosong"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Tempo"
                        value={stats.overdue}
                        color="bg-destructive/10 text-destructive"
                        description="Perlu Penagihan"
                    />
                </motion.div>

                {/* Room Mapping Section */}
                <section className="space-y-8">
                    {filteredRooms.length === 0 ? (
                        <div className="bg-white border border-border rounded-[2rem] p-24 text-center flex flex-col items-center gap-6 shadow-soft">
                            <div className="w-24 h-24 rounded-3xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                                <BedDouble className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-foreground font-bold text-2xl">Belum ada unit terdaftar</p>
                                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Tambahkan unit di menu manajemen</p>
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

            <footer className="p-12 text-center opacity-40 select-none">
                <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground">NextKost Dashboard Core</p>
            </footer>
        </div>
    );
}
