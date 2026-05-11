
'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Header from '@/components/dashboard/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TabContentWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

export default function ManagementPage() {
  const { data: kostsData, isLoading: kostsLoading } = useSWR('/api/data/Master_Kost', fetcher);
  const { data: roomsData, isLoading: roomsLoading } = useSWR('/api/data/Master_Kamar', fetcher);
  const { data: tenantsData, isLoading: tenantsLoading } = useSWR('/api/data/Master_Penghuni', fetcher);
  const { data: rentalsData, isLoading: rentalsLoading } = useSWR('/api/data/Transaksi_Sewa', fetcher);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isInitialLoading = !kostsData || !roomsData || !tenantsData || !rentalsData;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Inisialisasi Data...</p>
        </div>
      </div>
    );
  }

  const kosts = kostsData?.data || [];
  const rooms = roomsData?.data || [];
  const tenants = tenantsData?.data || [];
  const rentals = rentalsData?.data || [];

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.startsWith('0')) return '62' + cleaned.substring(1);
    return cleaned;
  };

  const handleEdit = (item: any, idField: string) => {
    setEditingId(item[idField]);
    setEditFormData(item);
    setIsAdding(false);
  };

  const handleSave = async (sheetName: string, idField: string) => {
    setActionLoading('save');
    try {
      const method = isAdding ? 'POST' : 'PUT';
      let payload = { ...editFormData };

      if (isAdding && sheetName === 'Master_Kost' && !payload.ID_Kost) {
        const slug = payload.Nama_Kost?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        payload.ID_Kost = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
      }

      if (isAdding && !payload[idField]) {
        payload[idField] = `${sheetName[0]}${Date.now()}`;
      }

      // Auto-format phone numbers if present
      if (payload.No_HP) payload.No_HP = formatPhone(payload.No_HP);
      if (payload.Kontak_Darurat) payload.Kontak_Darurat = formatPhone(payload.Kontak_Darurat);

      const body = isAdding ? payload : { idField, idValue: editingId, ...payload };

      const res = await fetch(`/api/data/${sheetName}`, {
        method,
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Data saved successfully');
        mutate(`/api/data/${sheetName}`);
        setEditingId(null);
        setIsAdding(false);
        setEditFormData({});
      } else {
        toast.error(result.message || 'Failed to save');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error saving data');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (sheetName: string, idField: string, idValue: string) => {
    if (!confirm('Hapus data ini?')) return;
    setActionLoading(`delete-${idValue}`);
    try {
      const res = await fetch(`/api/data/${sheetName}?idField=${idField}&idValue=${idValue}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Data deleted');
        mutate(`/api/data/${sheetName}`);
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting data');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header kosts={kosts} />

      <main className="p-6 max-w-[1400px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Management System</h1>
          <p className="text-zinc-500 text-sm">Kelola data master dan transaksi kos Anda secara terpusat.</p>
        </div>

        <Tabs defaultValue="kost" className="w-full space-y-6">
          <TabsList className="bg-zinc-900/50 border-zinc-800 p-1">
            <TabsTrigger value="kost" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-8 transition-all">Kost</TabsTrigger>
            <TabsTrigger value="rooms" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-8 transition-all">Rooms</TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-8 transition-all">Tenants</TabsTrigger>
            <TabsTrigger value="rentals" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-8 transition-all">Rentals</TabsTrigger>
          </TabsList>

          <TabsContent value="kost">
            <TabContentWrapper>
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                  <CardTitle className="text-lg font-semibold text-white">Master Kost</CardTitle>
                  <Button size="sm" onClick={() => { setIsAdding(true); setEditFormData({}); setEditingId('new'); }} className="bg-blue-600 hover:bg-blue-700 transition-all active:scale-95">
                    <Plus className="w-4 h-4 mr-2" /> Add Kost
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-zinc-400 font-medium">ID Kost</TableHead>
                        <TableHead className="text-zinc-400 font-medium">Nama Kost</TableHead>
                        <TableHead className="text-zinc-400 font-medium">Alamat</TableHead>
                        <TableHead className="text-zinc-400 font-medium text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isAdding && editingId === 'new' && (
                        <TableRow className="border-white/10 bg-blue-500/5">
                          <TableCell className="text-zinc-500 italic text-xs">Auto-slug</TableCell>
                          <TableCell><Input value={editFormData.Nama_Kost || ''} onChange={e => setEditFormData({ ...editFormData, Nama_Kost: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" placeholder="Nama Kost" /></TableCell>
                          <TableCell><Input value={editFormData.Alamat || ''} onChange={e => setEditFormData({ ...editFormData, Alamat: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" placeholder="Alamat" /></TableCell>
                          <TableCell className="flex justify-end gap-2 pr-6">
                            <Button size="sm" disabled={actionLoading === 'save'} onClick={() => handleSave('Master_Kost', 'ID_Kost')} className="bg-green-600 h-8 px-3 transition-all active:scale-95">
                              {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }} className="h-8 w-8 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      )}
                      {kosts.map((kost: any) => (
                        <TableRow key={kost.ID_Kost} className="border-white/10 hover:bg-white/5 transition-colors">
                          <TableCell className="text-zinc-500 font-mono text-xs">{kost.ID_Kost}</TableCell>
                          <TableCell className="text-white font-medium">
                            {editingId === kost.ID_Kost ? (
                              <Input value={editFormData.Nama_Kost || ''} onChange={e => setEditFormData({ ...editFormData, Nama_Kost: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" />
                            ) : kost.Nama_Kost}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {editingId === kost.ID_Kost ? (
                              <Input value={editFormData.Alamat || ''} onChange={e => setEditFormData({ ...editFormData, Alamat: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" />
                            ) : kost.Alamat}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              {editingId === kost.ID_Kost ? (
                                <>
                                  <Button size="sm" disabled={actionLoading === 'save'} onClick={() => handleSave('Master_Kost', 'ID_Kost')} className="bg-green-600 h-8 px-3">
                                    {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                                </>
                              ) : (
                                <>
                                  <Button size="icon" variant="ghost" onClick={() => handleEdit(kost, 'ID_Kost')} className="h-8 w-8 text-zinc-400 hover:text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></Button>
                                  <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${kost.ID_Kost}`} onClick={() => handleDelete('Master_Kost', 'ID_Kost', kost.ID_Kost)} className="h-8 w-8 text-zinc-400 hover:text-red-400 transition-colors">
                                    {actionLoading === `delete-${kost.ID_Kost}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabContentWrapper>
          </TabsContent>

          <TabsContent value="rooms">
            <TabContentWrapper>
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                  <CardTitle className="text-lg font-semibold text-white">Master Kamar</CardTitle>
                  <Button size="sm" onClick={() => { setIsAdding(true); setEditFormData({ Lantai: '1' }); setEditingId('new'); }} className="bg-blue-600 hover:bg-blue-700 transition-all active:scale-95">
                    <Plus className="w-4 h-4 mr-2" /> Add Kamar
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/10">
                        <TableHead className="text-zinc-400">Kost</TableHead>
                        <TableHead className="text-zinc-400">No. Kamar</TableHead>
                        <TableHead className="text-zinc-400">Lantai</TableHead>
                        <TableHead className="text-zinc-400">Harga Sewa</TableHead>
                        <TableHead className="text-zinc-400 text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isAdding && editingId === 'new' && (
                        <TableRow className="border-white/10 bg-blue-500/5">
                          <TableCell>
                            <select
                              value={editFormData.ID_Kost || ''}
                              onChange={e => setEditFormData({ ...editFormData, ID_Kost: e.target.value })}
                              className="w-full bg-zinc-900 border-zinc-800 text-white p-2 rounded-md h-9 text-sm"
                            >
                              <option value="">Pilih Kost</option>
                              {kosts.map((k: any) => <option key={k.ID_Kost} value={k.ID_Kost}>{k.Nama_Kost}</option>)}
                            </select>
                          </TableCell>
                          <TableCell><Input value={editFormData.No_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, No_Kamar: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" placeholder="A1" /></TableCell>
                          <TableCell><Input type="number" value={editFormData.Lantai || '1'} onChange={e => setEditFormData({ ...editFormData, Lantai: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" /></TableCell>
                          <TableCell><Input type="number" value={editFormData.Harga_Sewa || ''} onChange={e => setEditFormData({ ...editFormData, Harga_Sewa: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" placeholder="1500000" /></TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" disabled={actionLoading === 'save'} onClick={() => handleSave('Master_Kamar', 'ID_Kamar')} className="bg-green-600 h-8 px-3 transition-all active:scale-95">
                                {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {rooms.map((room: any) => (
                        <TableRow key={room.ID_Kamar} className="border-white/10 hover:bg-white/5 transition-colors">
                          <TableCell className="text-white">
                            {editingId === room.ID_Kamar ? (
                              <select value={editFormData.ID_Kost || ''} onChange={e => setEditFormData({ ...editFormData, ID_Kost: e.target.value })} className="bg-zinc-900 border-zinc-800 text-white p-1 rounded h-8 text-xs">
                                {kosts.map((k: any) => <option key={k.ID_Kost} value={k.ID_Kost}>{k.Nama_Kost}</option>)}
                              </select>
                            ) : kosts.find((k: any) => k.ID_Kost === room.ID_Kost)?.Nama_Kost || room.ID_Kost}
                          </TableCell>
                          <TableCell className="text-white font-bold">
                            {editingId === room.ID_Kamar ? <Input value={editFormData.No_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, No_Kamar: e.target.value })} className="bg-zinc-900 border-zinc-800 h-8" /> : room.No_Kamar}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {editingId === room.ID_Kamar ? <Input type="number" value={editFormData.Lantai || ''} onChange={e => setEditFormData({ ...editFormData, Lantai: e.target.value })} className="bg-zinc-900 border-zinc-800 h-8" /> : room.Lantai}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {editingId === room.ID_Kamar ? <Input type="number" value={editFormData.Harga_Sewa || ''} onChange={e => setEditFormData({ ...editFormData, Harga_Sewa: e.target.value })} className="bg-zinc-900 border-zinc-800 h-8" /> : `Rp ${parseInt(room.Harga_Sewa).toLocaleString()}`}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              {editingId === room.ID_Kamar ? (
                                <>
                                  <Button size="sm" disabled={actionLoading === 'save'} onClick={() => handleSave('Master_Kamar', 'ID_Kamar')} className="bg-green-600 h-8 px-3">
                                    {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                                </>
                              ) : (
                                <>
                                  <Button size="icon" variant="ghost" onClick={() => handleEdit(room, 'ID_Kamar')} className="h-8 w-8 text-zinc-400 hover:text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></Button>
                                  <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${room.ID_Kamar}`} onClick={() => handleDelete('Master_Kamar', 'ID_Kamar', room.ID_Kamar)} className="h-8 w-8 text-zinc-400 hover:text-red-400 transition-colors">
                                    {actionLoading === `delete-${room.ID_Kamar}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabContentWrapper>
          </TabsContent>

          <TabsContent value="tenants">
            <TabContentWrapper>
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                  <CardTitle className="text-lg font-semibold text-white">Master Penghuni</CardTitle>
                  <Button size="sm" onClick={() => { setIsAdding(true); setEditFormData({ Bawa_Mobil: 'Tidak' }); setEditingId('new'); }} className="bg-blue-600 hover:bg-blue-700 transition-all active:scale-95">
                    <Plus className="w-4 h-4 mr-2" /> Add Penghuni
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/10">
                        <TableHead className="text-zinc-400">Nama</TableHead>
                        <TableHead className="text-zinc-400">No. HP</TableHead>
                        <TableHead className="text-zinc-400">Bawa Mobil</TableHead>
                        <TableHead className="text-zinc-400">Kontak Darurat</TableHead>
                        <TableHead className="text-zinc-400 text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isAdding && editingId === 'new' && (
                        <TableRow className="border-white/10 bg-blue-500/5">
                          <TableCell><Input value={editFormData.Nama || ''} onChange={e => setEditFormData({ ...editFormData, Nama: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" placeholder="Nama" /></TableCell>
                          <TableCell><Input value={editFormData.No_HP || ''} onChange={e => setEditFormData({ ...editFormData, No_HP: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" placeholder="628xxxx" /></TableCell>
                          <TableCell>
                            <select
                              value={editFormData.Bawa_Mobil || 'Tidak'}
                              onChange={e => setEditFormData({ ...editFormData, Bawa_Mobil: e.target.value })}
                              className="w-full bg-zinc-900 border-zinc-800 text-white p-2 rounded-md h-9 text-sm"
                            >
                              <option value="Tidak">Tidak</option>
                              <option value="Ya">Ya</option>
                            </select>
                          </TableCell>
                          <TableCell><Input value={editFormData.Kontak_Darurat || ''} onChange={e => setEditFormData({ ...editFormData, Kontak_Darurat: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" placeholder="628xxxx" /></TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" disabled={actionLoading === 'save'} onClick={() => handleSave('Master_Penghuni', 'ID_Penghuni')} className="bg-green-600 h-8 px-3 transition-all active:scale-95">
                                {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {tenants.map((tenant: any) => (
                        <TableRow key={tenant.ID_Penghuni} className="border-white/10 hover:bg-white/5 transition-colors">
                          <TableCell className="text-white font-medium">
                            {editingId === tenant.ID_Penghuni ? <Input value={editFormData.Nama || ''} onChange={e => setEditFormData({ ...editFormData, Nama: e.target.value })} className="bg-zinc-900 border-zinc-800 h-8" /> : tenant.Nama}
                          </TableCell>
                          <TableCell className="text-white">
                            {editingId === tenant.ID_Penghuni ? <Input value={editFormData.No_HP || ''} onChange={e => setEditFormData({ ...editFormData, No_HP: e.target.value })} className="bg-zinc-900 border-zinc-800 h-8" /> : tenant.No_HP}
                          </TableCell>
                          <TableCell className="text-white">
                            {editingId === tenant.ID_Penghuni ? (
                              <select value={editFormData.Bawa_Mobil || ''} onChange={e => setEditFormData({ ...editFormData, Bawa_Mobil: e.target.value })} className="bg-zinc-900 border-zinc-800 text-white p-1 rounded h-8 text-xs">
                                <option value="Tidak">Tidak</option>
                                <option value="Ya">Ya</option>
                              </select>
                            ) : tenant.Bawa_Mobil}
                          </TableCell>
                          <TableCell className="text-white">
                            {editingId === tenant.ID_Penghuni ? <Input value={editFormData.Kontak_Darurat || ''} onChange={e => setEditFormData({ ...editFormData, Kontak_Darurat: e.target.value })} className="bg-zinc-900 border-zinc-800 h-8" /> : tenant.Kontak_Darurat}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              {editingId === tenant.ID_Penghuni ? (
                                <>
                                  <Button size="sm" disabled={actionLoading === 'save'} onClick={() => handleSave('Master_Penghuni', 'ID_Penghuni')} className="bg-green-600 h-8 px-3">
                                    {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                                </>
                              ) : (
                                <>
                                  <Button size="icon" variant="ghost" onClick={() => handleEdit(tenant, 'ID_Penghuni')} className="h-8 w-8 text-zinc-400 hover:text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></Button>
                                  <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${tenant.ID_Penghuni}`} onClick={() => handleDelete('Master_Penghuni', 'ID_Penghuni', tenant.ID_Penghuni)} className="h-8 w-8 text-zinc-400 hover:text-red-400 transition-colors">
                                    {actionLoading === `delete-${tenant.ID_Penghuni}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabContentWrapper>
          </TabsContent>

          <TabsContent value="rentals">
            <TabContentWrapper>
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                  <CardTitle className="text-lg font-semibold text-white">Transaksi Sewa</CardTitle>
                  <Button size="sm" onClick={() => { setIsAdding(true); setEditFormData({ Status_Aktif: 'TRUE', Tgl_Masuk: new Date().toISOString().split('T')[0], Tgl_DP: new Date().toISOString().split('T')[0], Periode_Sewa: '1', Nominal_Deposit: '0' }); setEditingId('new'); }} className="bg-blue-600 hover:bg-blue-700 transition-all active:scale-95">
                    <Plus className="w-4 h-4 mr-2" /> Add Rental
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10">
                          <TableHead className="text-zinc-400">Kost</TableHead>
                          <TableHead className="text-zinc-400">Kamar</TableHead>
                          <TableHead className="text-zinc-400">Penghuni</TableHead>
                          <TableHead className="text-zinc-400">Tgl Masuk</TableHead>
                          <TableHead className="text-zinc-400">Tgl DP</TableHead>
                          <TableHead className="text-zinc-400">Periode</TableHead>
                          <TableHead className="text-zinc-400">Deposit</TableHead>
                          <TableHead className="text-zinc-400">Status</TableHead>
                          <TableHead className="text-zinc-400 text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isAdding && editingId === 'new' && (
                        <TableRow className="border-white/10 bg-blue-500/5">
                          <TableCell className="text-zinc-500 italic">Auto</TableCell>
                          <TableCell>
                            <select value={editFormData.ID_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, ID_Kamar: e.target.value })} className="w-full bg-zinc-900 border-zinc-800 text-white p-2 rounded-md h-9 text-xs">
                              <option value="">Kamar</option>
                              {rooms.map((r: any) => <option key={r.ID_Kamar} value={r.ID_Kamar}>{r.No_Kamar}</option>)}
                            </select>
                          </TableCell>
                          <TableCell>
                            <select value={editFormData.ID_Penghuni || ''} onChange={e => setEditFormData({ ...editFormData, ID_Penghuni: e.target.value })} className="w-full bg-zinc-900 border-zinc-800 text-white p-2 rounded-md h-9 text-xs">
                              <option value="">Penghuni</option>
                              {tenants.map((t: any) => <option key={t.ID_Penghuni} value={t.ID_Penghuni}>{t.Nama}</option>)}
                            </select>
                          </TableCell>
                          <TableCell><Input type="date" value={editFormData.Tgl_Masuk || ''} onChange={e => setEditFormData({ ...editFormData, Tgl_Masuk: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" /></TableCell>
                          <TableCell><Input type="date" value={editFormData.Tgl_DP || ''} onChange={e => setEditFormData({ ...editFormData, Tgl_DP: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" /></TableCell>
                          <TableCell><Input type="number" value={editFormData.Periode_Sewa || '1'} onChange={e => setEditFormData({ ...editFormData, Periode_Sewa: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" /></TableCell>
                          <TableCell><Input type="number" value={editFormData.Nominal_Deposit || ''} onChange={e => setEditFormData({ ...editFormData, Nominal_Deposit: e.target.value })} className="bg-zinc-900 border-zinc-800 h-9" placeholder="1500000" /></TableCell>
                          <TableCell>
                            <select value={editFormData.Status_Aktif || 'TRUE'} onChange={e => setEditFormData({ ...editFormData, Status_Aktif: e.target.value })} className="bg-zinc-900 border-zinc-800 text-white p-2 rounded-md h-9 text-xs">
                              <option value="TRUE">AKTIF</option>
                              <option value="FALSE">SELESAI</option>
                            </select>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" disabled={actionLoading === 'save'} onClick={() => handleSave('Transaksi_Sewa', 'ID_Sewa')} className="bg-green-600 h-8 px-3 transition-all active:scale-95">
                                {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {rentals.map((rental: any) => {
                        const room = rooms.find((r: any) => r.ID_Kamar === rental.ID_Kamar);
                        const tenant = tenants.find((t: any) => t.ID_Penghuni === rental.ID_Penghuni);
                        return (
                          <TableRow key={rental.ID_Sewa} className="border-white/10 hover:bg-white/5 transition-colors text-sm">
                            <TableCell className="text-blue-400 font-medium">
                              {kosts.find((k: any) => k.ID_Kost === rooms.find((r: any) => r.ID_Kamar === rental.ID_Kamar)?.ID_Kost)?.Nama_Kost || '-'}
                            </TableCell>
                            <TableCell className="text-white font-bold">{room?.No_Kamar || rental.ID_Kamar}</TableCell>
                            <TableCell className="text-white">{tenant?.Nama || rental.ID_Penghuni}</TableCell>
                            <TableCell className="text-zinc-400 text-xs">{rental.Tgl_Masuk}</TableCell>
                            <TableCell className="text-zinc-500 text-xs">{rental.Tgl_DP}</TableCell>
                            <TableCell className="text-zinc-400">{rental.Periode_Sewa} Bln</TableCell>
                            <TableCell className="text-zinc-400 text-xs">Rp {parseInt(rental.Nominal_Deposit || '0').toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rental.Status_Aktif === 'TRUE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/20 text-zinc-500'}`}>
                                {rental.Status_Aktif === 'TRUE' ? 'AKTIF' : 'SELESAI'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${rental.ID_Sewa}`} onClick={() => handleDelete('Transaksi_Sewa', 'ID_Sewa', rental.ID_Sewa)} className="h-8 w-8 text-zinc-400 hover:text-red-400 transition-colors">
                                {actionLoading === `delete-${rental.ID_Sewa}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabContentWrapper>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
