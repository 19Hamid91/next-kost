'use client';

import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/dashboard/Header';
import KostCard from '@/components/kost/KostCard';
import KostForm from '@/components/kost/KostForm';
import { useKosts } from '@/hooks/useKosts';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Syncing Properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="p-6 md:p-12 w-full max-w-[1200px] mx-auto mt-6 flex-1 space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Pilih Kost</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Kelola properti aktif Anda
            </p>
          </div>
          <Button 
            onClick={startAdding} 
            className="bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200"
          >
            <Plus className="w-5 h-5 mr-3" /> Tambah Kost Baru
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
                onDelete={() => handleDelete(kost.ID_Kost)}
                isDeleting={actionLoading === `delete-${kost.ID_Kost}`}
              />
            )
          ))}
        </div>
      </main>
      
      {/* Footer Branding */}
      <footer className="p-10 text-center opacity-20 select-none">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">NextKost Management System v2.0</p>
      </footer>
    </div>
  );
}
