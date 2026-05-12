'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useManagement } from '@/hooks/useManagement';
import RoomManagement from '@/components/management/RoomManagement';
import TenantManagement from '@/components/management/TenantManagement';
import RentalManagement from '@/components/management/RentalManagement';

const TabContentWrapper = ({ children, value }: { children: React.ReactNode, value: string }) => (
  <TabsContent value={value} className="mt-0 outline-none">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  </TabsContent>
);

export default function ManagementPage() {
  const params = useParams();
  const kostId = params.kostId as string;

  const {
    rooms,
    tenants,
    rentals,
    allRooms,
    allTenants,
    isLoading,
    editingId,
    editFormData,
    isAdding,
    actionLoading,
    setEditFormData,
    handleEdit,
    cancelEdit,
    startAdding,
    handleSave,
    handleDelete
  } = useManagement(kostId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Inisialisasi Sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="p-6 md:p-12 max-w-[1400px] mx-auto w-full space-y-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Sistem Manajemen</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Pusat Kendali Data Properti
          </p>
        </div>

        <Tabs defaultValue="rooms" className="w-full space-y-10">
          <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 border border-slate-200">
            <TabsTrigger value="rooms" className="rounded-xl px-10 h-full text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all">Kamar</TabsTrigger>
            <TabsTrigger value="tenants" className="rounded-xl px-10 h-full text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all">Penghuni</TabsTrigger>
            <TabsTrigger value="rentals" className="rounded-xl px-10 h-full text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all">Sewa</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabContentWrapper value="rooms">
              <RoomManagement 
                rooms={rooms}
                editingId={editingId}
                editFormData={editFormData}
                isAdding={isAdding}
                actionLoading={actionLoading}
                onEdit={(room) => handleEdit(room, 'ID_Kamar')}
                onSave={() => handleSave('Master_Kamar', 'ID_Kamar')}
                onDelete={(id) => handleDelete('Master_Kamar', 'ID_Kamar', id)}
                onCancel={cancelEdit}
                onStartAdding={() => startAdding({ Lantai: '1' })}
                setEditFormData={setEditFormData}
              />
            </TabContentWrapper>

            <TabContentWrapper value="tenants">
              <TenantManagement 
                tenants={tenants}
                editingId={editingId}
                editFormData={editFormData}
                isAdding={isAdding}
                actionLoading={actionLoading}
                onEdit={(tenant) => handleEdit(tenant, 'ID_Penghuni')}
                onSave={() => handleSave('Master_Penghuni', 'ID_Penghuni')}
                onDelete={(id) => handleDelete('Master_Penghuni', 'ID_Penghuni', id)}
                onCancel={cancelEdit}
                onStartAdding={() => startAdding({ Bawa_Mobil: 'Tidak' })}
                setEditFormData={setEditFormData}
              />
            </TabContentWrapper>

            <TabContentWrapper value="rentals">
              <RentalManagement 
                rentals={rentals}
                rooms={allRooms}
                tenants={allTenants}
                editingId={editingId}
                editFormData={editFormData}
                isAdding={isAdding}
                actionLoading={actionLoading}
                onEdit={(rental) => handleEdit(rental, 'ID_Sewa')}
                onSave={() => handleSave('Transaksi_Sewa', 'ID_Sewa')}
                onDelete={(id) => handleDelete('Transaksi_Sewa', 'ID_Sewa', id)}
                onCancel={cancelEdit}
                onStartAdding={(data) => startAdding(data)}
                setEditFormData={setEditFormData}
              />
            </TabContentWrapper>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
}
