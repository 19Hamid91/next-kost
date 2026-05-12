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
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useState } from 'react';

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

  const [confirmDelete, setConfirmDelete] = useState<{
    sheetName: string;
    idField: string;
    idValue: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Inisialisasi Sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex flex-col font-sans">
      <Header />

      <main className="p-6 md:p-12 max-w-[1440px] mx-auto w-full space-y-12 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Sistem Manajemen</h1>
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
              Pusat Kendali Data Kost
            </p>
          </div>
        </div>

        <Tabs defaultValue="rooms" className="w-full space-y-10">
          <div className="flex justify-center w-full">
            <TabsList className="bg-white/50 backdrop-blur-md p-1.5 md:p-2 md:px-4 rounded-[1.25rem] md:rounded-[1.5rem] h-13 md:h-16 border border-border shadow-soft w-full md:w-auto flex overflow-x-auto no-scrollbar justify-around md:justify-center">
              <TabsTrigger value="rooms" className="shrink-0 rounded-xl px-6 md:px-12 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap">Kamar</TabsTrigger>
              <TabsTrigger value="tenants" className="shrink-0 rounded-xl px-6 md:px-12 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap">Penghuni</TabsTrigger>
              <TabsTrigger value="rentals" className="shrink-0 rounded-xl px-6 md:px-12 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap">Sewa</TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <TabContentWrapper key="rooms-tab" value="rooms">
              <RoomManagement
                rooms={rooms}
                editingId={editingId}
                editFormData={editFormData}
                isAdding={isAdding}
                actionLoading={actionLoading}
                onEdit={(room) => handleEdit(room, 'ID_Kamar')}
                onSave={() => handleSave('Master_Kamar', 'ID_Kamar')}
                onDelete={(id) => setConfirmDelete({ sheetName: 'Master_Kamar', idField: 'ID_Kamar', idValue: id })}
                onCancel={cancelEdit}
                onStartAdding={() => startAdding({ Lantai: '1' })}
                setEditFormData={setEditFormData}
              />
            </TabContentWrapper>

            <TabContentWrapper key="tenants-tab" value="tenants">
              <TenantManagement
                tenants={tenants}
                editingId={editingId}
                editFormData={editFormData}
                isAdding={isAdding}
                actionLoading={actionLoading}
                onEdit={(tenant) => handleEdit(tenant, 'ID_Penghuni')}
                onSave={() => handleSave('Master_Penghuni', 'ID_Penghuni')}
                onDelete={(id) => setConfirmDelete({ sheetName: 'Master_Penghuni', idField: 'ID_Penghuni', idValue: id })}
                onCancel={cancelEdit}
                onStartAdding={() => startAdding({ Bawa_Mobil: 'Tidak' })}
                setEditFormData={setEditFormData}
              />
            </TabContentWrapper>

            <TabContentWrapper key="rentals-tab" value="rentals">
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
                onDelete={(id) => setConfirmDelete({ sheetName: 'Transaksi_Sewa', idField: 'ID_Sewa', idValue: id })}
                onCancel={cancelEdit}
                onStartAdding={(data) => startAdding(data)}
                setEditFormData={setEditFormData}
              />
            </TabContentWrapper>
          </AnimatePresence>
        </Tabs>
      </main>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) {
            await handleDelete(confirmDelete.sheetName, confirmDelete.idField, confirmDelete.idValue);
            setConfirmDelete(null);
          }
        }}
        loading={actionLoading?.startsWith('delete-')}
        title="Hapus Data?"
        description="Data yang dihapus tidak dapat dipulihkan. Pastikan Anda sudah memeriksa kembali data tersebut."
      />
    </div>
  );
}
