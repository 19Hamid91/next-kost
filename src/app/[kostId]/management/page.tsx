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
import BulkAddModal, { BulkAddEntityType } from '@/components/management/BulkAddModal';
import FloatingActionBar, { makeStatusAction } from '@/components/management/FloatingActionBar';
import { useState } from 'react';

const TabContentWrapper = ({ children, value }: { children: React.ReactNode; value: string }) => (
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
    rooms, tenants, rentals, allRooms, allTenants,
    isLoading, editingId, editFormData, isAdding, actionLoading,
    selectedIds, setEditFormData,
    handleEdit, cancelEdit, startAdding,
    handleSave, handleDelete,
    toggleSelect, clearSelection, handleBulkUpdate,
  } = useManagement(kostId);

  // Single-delete confirm
  const [confirmDelete, setConfirmDelete] = useState<{
    sheetName: string; idField: string; idValue: string;
  } | null>(null);

  // Bulk Add modal state
  const [bulkAddEntity, setBulkAddEntity] = useState<BulkAddEntityType | null>(null);

  // Active tab (to build correct FAB actions)
  const [activeTab, setActiveTab] = useState('rooms');

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

  // ── FAB actions per tab ─────────────────────────────────────────
  const fabActions = (() => {
    if (activeTab === 'rentals') {
      return [
        makeStatusAction(
          '→ AKTIF',
          'AKTIF',
          selectedIds.length,
          () => handleBulkUpdate('Transaksi_Sewa', 'ID_Sewa', { Status_Sewa: 'AKTIF' })
        ),
        makeStatusAction(
          '→ SELESAI',
          'SELESAI',
          selectedIds.length,
          () => handleBulkUpdate('Transaksi_Sewa', 'ID_Sewa', { Status_Sewa: 'SELESAI' })
        ),
      ];
    }
    return [];
  })();

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

        <Tabs defaultValue="rooms" className="w-full space-y-10" onValueChange={(val) => { setActiveTab(val); clearSelection(); }}>
          <div className="flex justify-center w-full">
            <TabsList className="bg-white/50 backdrop-blur-md p-1.5 md:p-2 md:px-4 rounded-[1.25rem] md:rounded-[1.5rem] h-14 md:h-16 border border-border shadow-soft w-full flex">
              <TabsTrigger value="rooms" className="flex-1 rounded-xl h-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap">Kamar</TabsTrigger>
              <TabsTrigger value="tenants" className="flex-1 rounded-xl h-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap">Penghuni</TabsTrigger>
              <TabsTrigger value="rentals" className="flex-1 rounded-xl h-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap">Sewa</TabsTrigger>
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
                selectedIds={selectedIds}
                onEdit={(room) => handleEdit(room, 'ID_Kamar')}
                onSave={() => handleSave('Master_Kamar', 'ID_Kamar')}
                onDelete={(id) => setConfirmDelete({ sheetName: 'Master_Kamar', idField: 'ID_Kamar', idValue: id })}
                onCancel={cancelEdit}
                onStartAdding={() => startAdding({ Lantai: '1' })}
                onBulkAdd={() => setBulkAddEntity('rooms')}
                onToggleSelect={toggleSelect}
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
                selectedIds={selectedIds}
                onEdit={(tenant) => handleEdit(tenant, 'ID_Penghuni')}
                onSave={() => handleSave('Master_Penghuni', 'ID_Penghuni')}
                onDelete={(id) => setConfirmDelete({ sheetName: 'Master_Penghuni', idField: 'ID_Penghuni', idValue: id })}
                onCancel={cancelEdit}
                onStartAdding={() => startAdding({ Bawa_Mobil: 'Tidak' })}
                onBulkAdd={() => setBulkAddEntity('tenants')}
                onToggleSelect={toggleSelect}
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
                selectedIds={selectedIds}
                onEdit={(rental) => handleEdit(rental, 'ID_Sewa')}
                onSave={() => handleSave('Transaksi_Sewa', 'ID_Sewa')}
                onDelete={(id) => setConfirmDelete({ sheetName: 'Transaksi_Sewa', idField: 'ID_Sewa', idValue: id })}
                onCancel={cancelEdit}
                onStartAdding={(data) => startAdding(data)}
                onToggleSelect={toggleSelect}
                setEditFormData={setEditFormData}
              />
            </TabContentWrapper>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Single delete confirm */}
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
        description="Data yang dihapus tidak dapat dipulihkan."
      />

      {/* Bulk Add Modal */}
      {bulkAddEntity && (
        <BulkAddModal
          isOpen={!!bulkAddEntity}
          onClose={() => setBulkAddEntity(null)}
          entityType={bulkAddEntity}
          kostId={kostId}
        />
      )}

      {/* Floating Action Bar — only when items selected */}
      <FloatingActionBar
        selectedCount={selectedIds.length}
        actions={fabActions}
        onClearSelection={clearSelection}
        loading={actionLoading === 'bulk'}
      />
    </div>
  );
}
