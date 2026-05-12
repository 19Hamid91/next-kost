'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Loader2, Pencil, Trash2, Save, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: kostsData, isLoading } = useSWR('/api/data/Master_Kost', fetcher);
  const kosts = kostsData?.data || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSave = async () => {
    setActionLoading('save');
    try {
      const method = isAdding ? 'POST' : 'PUT';
      let payload = { ...editFormData };

      if (isAdding && !payload.ID_Kost) {
        const slug = payload.Nama_Kost?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        payload.ID_Kost = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
      }

      const body = isAdding ? payload : { idField: 'ID_Kost', idValue: editingId, ...payload };

      const res = await fetch('/api/data/Master_Kost', {
        method,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Kost berhasil disimpan');
        mutate('/api/data/Master_Kost');
        setEditingId(null);
        setIsAdding(false);
        setEditFormData({});
      } else {
        toast.error('Gagal menyimpan Kost');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus Kost ini? Semua data terkait mungkin perlu dihapus manual.')) return;
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/data/Master_Kost?idField=ID_Kost&idValue=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Kost berhasil dihapus');
        mutate('/api/data/Master_Kost');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="h-16 border-b border-white/5 bg-black/70 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-sm">NextKost</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 rounded-full border border-zinc-800">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="text-xs font-medium text-white hidden sm:block">
              {session?.user?.name || session?.user?.email}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => signOut()} className="h-9 w-9 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-zinc-500">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="p-6 max-w-[1000px] mx-auto mt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Pilih Kost</h1>
            <p className="text-zinc-500 text-sm mt-1">Pilih kost yang ingin Anda kelola</p>
          </div>
          <Button onClick={() => { setIsAdding(true); setEditFormData({}); setEditingId('new'); }} className="bg-blue-600 hover:bg-blue-700 transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> Tambah Kost
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAdding && editingId === 'new' && (
            <Card className="bg-blue-500/5 border-blue-500/20 backdrop-blur-xl">
              <CardContent className="p-5 flex flex-col gap-3">
                <Input autoFocus placeholder="Nama Kost" value={editFormData.Nama_Kost || ''} onChange={e => setEditFormData({...editFormData, Nama_Kost: e.target.value})} className="bg-zinc-900 border-zinc-800" />
                <Input placeholder="Alamat" value={editFormData.Alamat || ''} onChange={e => setEditFormData({...editFormData, Alamat: e.target.value})} className="bg-zinc-900 border-zinc-800" />
                <div className="flex gap-2 mt-2">
                  <Button disabled={actionLoading === 'save'} onClick={handleSave} className="bg-green-600 flex-1">
                    {actionLoading === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAdding(false)} className="border-zinc-800 text-zinc-400 hover:text-white bg-transparent">Batal</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {kosts.map((kost: any) => (
            <Card key={kost.ID_Kost} className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all group overflow-hidden relative">
              <CardContent className="p-0">
                {editingId === kost.ID_Kost ? (
                  <div className="p-5 flex flex-col gap-3 bg-white/5">
                    <Input placeholder="Nama Kost" value={editFormData.Nama_Kost || ''} onChange={e => setEditFormData({...editFormData, Nama_Kost: e.target.value})} className="bg-zinc-900 border-zinc-800" />
                    <Input placeholder="Alamat" value={editFormData.Alamat || ''} onChange={e => setEditFormData({...editFormData, Alamat: e.target.value})} className="bg-zinc-900 border-zinc-800" />
                    <div className="flex gap-2 mt-2">
                      <Button disabled={actionLoading === 'save'} onClick={handleSave} className="bg-green-600 flex-1">Simpan</Button>
                      <Button variant="outline" onClick={() => setEditingId(null)} className="border-zinc-800 text-zinc-400 hover:text-white bg-transparent">Batal</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="p-5 flex-1 cursor-pointer" onClick={() => router.push(`/${kost.ID_Kost}/dashboard`)}>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{kost.Nama_Kost}</h3>
                      <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{kost.Alamat || 'Tidak ada alamat'}</p>
                    </div>
                    
                    <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                      <Button variant="ghost" className="h-8 px-3 text-xs text-zinc-400 hover:text-white hover:bg-white/10" onClick={() => router.push(`/${kost.ID_Kost}/dashboard`)}>
                        <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> Buka
                      </Button>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-blue-400" onClick={(e) => { e.stopPropagation(); setEditingId(kost.ID_Kost); setEditFormData(kost); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); handleDelete(kost.ID_Kost); }}>
                          {actionLoading === `delete-${kost.ID_Kost}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
