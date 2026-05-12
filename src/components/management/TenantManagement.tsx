'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface TenantManagementProps {
  tenants: any[];
  editingId: string | null;
  editFormData: any;
  isAdding: boolean;
  actionLoading: string | null;
  onEdit: (tenant: any) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onStartAdding: () => void;
  setEditFormData: (data: any) => void;
}

export default function TenantManagement({
  tenants,
  editingId,
  editFormData,
  isAdding,
  actionLoading,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  onStartAdding,
  setEditFormData
}: TenantManagementProps) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-6">
        <div className="space-y-0.5">
          <CardTitle className="text-xl font-black text-slate-900">Master Penghuni</CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manajemen database penyewa</p>
        </div>
        <Button 
          size="sm" 
          onClick={onStartAdding} 
          className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 h-10 font-bold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Penghuni
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Nama</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">No. HP</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bawa Mobil</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kontak Darurat</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && editingId === 'new' && (
                <TableRow className="border-slate-100 bg-slate-50/50">
                  <TableCell><Input value={editFormData.Nama || ''} onChange={e => setEditFormData({ ...editFormData, Nama: e.target.value })} className="bg-white border-slate-200 h-10 rounded-xl" placeholder="Nama" /></TableCell>
                  <TableCell><Input value={editFormData.No_HP || ''} onChange={e => setEditFormData({ ...editFormData, No_HP: e.target.value })} className="bg-white border-slate-200 h-10 rounded-xl" placeholder="628xxxx" /></TableCell>
                  <TableCell>
                    <select
                      value={editFormData.Bawa_Mobil || 'Tidak'}
                      onChange={e => setEditFormData({ ...editFormData, Bawa_Mobil: e.target.value })}
                      className="w-full bg-white border-slate-200 text-slate-900 p-2 rounded-xl h-10 text-xs font-bold"
                    >
                      <option value="Tidak">Tidak</option>
                      <option value="Ya">Ya</option>
                    </select>
                  </TableCell>
                  <TableCell><Input value={editFormData.Kontak_Darurat || ''} onChange={e => setEditFormData({ ...editFormData, Kontak_Darurat: e.target.value })} className="bg-white border-slate-200 h-10 rounded-xl" placeholder="628xxxx" /></TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-4 rounded-xl font-bold">
                        {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                      </Button>
                      <Button size="icon" variant="ghost" onClick={onCancel} className="h-9 w-9 rounded-xl"><X className="w-4 h-4 text-slate-400" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {tenants.map((tenant: any) => (
                <TableRow key={tenant.ID_Penghuni} className="border-slate-100 hover:bg-slate-50/30 transition-colors">
                  <TableCell className="font-black text-slate-900 py-4">
                    {editingId === tenant.ID_Penghuni ? <Input value={editFormData.Nama || ''} onChange={e => setEditFormData({ ...editFormData, Nama: e.target.value })} className="bg-white border-slate-200 h-9 rounded-lg" /> : tenant.Nama}
                  </TableCell>
                  <TableCell className="font-bold text-slate-500">
                    {editingId === tenant.ID_Penghuni ? <Input value={editFormData.No_HP || ''} onChange={e => setEditFormData({ ...editFormData, No_HP: e.target.value })} className="bg-white border-slate-200 h-9 rounded-lg" /> : tenant.No_HP}
                  </TableCell>
                  <TableCell className="font-bold text-slate-500">
                    {editingId === tenant.ID_Penghuni ? (
                      <select value={editFormData.Bawa_Mobil || ''} onChange={e => setEditFormData({ ...editFormData, Bawa_Mobil: e.target.value })} className="bg-white border-slate-200 text-slate-900 p-1 rounded-lg h-9 text-xs font-bold">
                        <option value="Tidak">Tidak</option>
                        <option value="Ya">Ya</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${tenant.Bawa_Mobil === 'Ya' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>
                        {tenant.Bawa_Mobil === 'Ya' ? 'MOBIL' : 'TANPA MOBIL'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-slate-500">
                    {editingId === tenant.ID_Penghuni ? <Input value={editFormData.Kontak_Darurat || ''} onChange={e => setEditFormData({ ...editFormData, Kontak_Darurat: e.target.value })} className="bg-white border-slate-200 h-9 rounded-lg" /> : tenant.Kontak_Darurat}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-1">
                      {editingId === tenant.ID_Penghuni ? (
                        <>
                          <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 rounded-lg font-bold">
                            {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                          </Button>
                          <Button size="icon" variant="ghost" onClick={onCancel} className="h-8 w-8 rounded-lg"><X className="w-4 h-4 text-slate-400" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(tenant)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${tenant.ID_Penghuni}`} onClick={() => onDelete(tenant.ID_Penghuni)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                            {actionLoading === `delete-${tenant.ID_Penghuni}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
