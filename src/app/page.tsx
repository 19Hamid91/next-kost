'use client';

import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/dashboard/Header';
import KostCard from '@/components/kost/KostCard';
import KostForm from '@/components/kost/KostForm';
import { useKosts } from '@/hooks/useKosts';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useState } from 'react';

export default function Home() {
  const {
    kosts,
    isLoading,
    editingId,
    editFormData,
    actionLoading,
    setEditFormData,
    startAdding,
    startEditing,
    cancelEdit,
    handleSave,
    handleDelete
  } = useKosts();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.2em] animate-pulse">Syncing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-orange-100">
      <Header />

      <main className="p-6 md:p-12 max-w-[1440px] mx-auto w-full space-y-12 flex-1">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Pilih Kost</h1>
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
              Kelola kost aktif Anda di sini
            </p>
          </div>
          <Button
            onClick={startAdding}
            size="lg"
            className="rounded-2xl shadow-xl shadow-orange-500/10 h-14 px-8 text-sm font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Kost
          </Button>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {editingId === 'new' && (
            <KostForm
              formData={editFormData}
              onChange={setEditFormData}
              onSave={handleSave}
              onCancel={cancelEdit}
              loading={actionLoading === 'save'}
            />
          )}

          {kosts.map((kost: any) => (
            editingId === kost.ID_Kost ? (
              <KostForm
                key={kost.ID_Kost}
                formData={editFormData}
                onChange={setEditFormData}
                onSave={handleSave}
                onCancel={cancelEdit}
                loading={actionLoading === 'save'}
              />
            ) : (
              <KostCard
                key={kost.ID_Kost}
                kost={kost}
                onEdit={() => startEditing(kost)}
                onDelete={() => setConfirmDeleteId(kost.ID_Kost)}
                isDeleting={actionLoading === `delete-${kost.ID_Kost}`}
              />
            )
          ))}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="p-10 text-center opacity-40 select-none">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground">NextKost Management System v2.0</p>
      </footer>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (confirmDeleteId) {
            await handleDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        loading={actionLoading?.startsWith('delete-')}
        title="Hapus Kost?"
        description="Seluruh data kamar, penghuni, dan riwayat sewa di kost ini akan terpengaruh. Tindakan ini permanen."
      />
    </div>
  );
}
