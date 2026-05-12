'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface RoomManagementProps {
  rooms: any[];
  editingId: string | null;
  editFormData: any;
  isAdding: boolean;
  actionLoading: string | null;
  onEdit: (room: any) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onStartAdding: () => void;
  setEditFormData: (data: any) => void;
}

export default function RoomManagement({
  rooms,
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
}: RoomManagementProps) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-6">
        <div className="space-y-0.5">
          <CardTitle className="text-xl font-black text-slate-900">Master Kamar</CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manajemen unit properti</p>
        </div>
        <Button 
          size="sm" 
          onClick={onStartAdding} 
          className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 h-10 font-bold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Unit
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">No. Kamar</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lantai</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Harga Sewa</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && editingId === 'new' && (
                <TableRow className="border-slate-100 bg-slate-50/50">
                  <TableCell><Input value={editFormData.No_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, No_Kamar: e.target.value })} className="bg-white border-slate-200 h-10 rounded-xl" placeholder="Contoh: A1" /></TableCell>
                  <TableCell><Input type="number" value={editFormData.Lantai || '1'} onChange={e => setEditFormData({ ...editFormData, Lantai: e.target.value })} className="bg-white border-slate-200 h-10 rounded-xl" /></TableCell>
                  <TableCell><Input type="number" value={editFormData.Harga_Sewa || ''} onChange={e => setEditFormData({ ...editFormData, Harga_Sewa: e.target.value })} className="bg-white border-slate-200 h-10 rounded-xl" placeholder="1500000" /></TableCell>
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
              {rooms.map((room: any) => (
                <TableRow key={room.ID_Kamar} className="border-slate-100 hover:bg-slate-50/30 transition-colors">
                  <TableCell className="font-black text-slate-900 py-4">
                    {editingId === room.ID_Kamar ? <Input value={editFormData.No_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, No_Kamar: e.target.value })} className="bg-white border-slate-200 h-9 rounded-lg" /> : room.No_Kamar}
                  </TableCell>
                  <TableCell className="font-bold text-slate-500">
                    {editingId === room.ID_Kamar ? <Input type="number" value={editFormData.Lantai || ''} onChange={e => setEditFormData({ ...editFormData, Lantai: e.target.value })} className="bg-white border-slate-200 h-9 rounded-lg" /> : `Lantai ${room.Lantai}`}
                  </TableCell>
                  <TableCell className="font-bold text-slate-500">
                    {editingId === room.ID_Kamar ? <Input type="number" value={editFormData.Harga_Sewa || ''} onChange={e => setEditFormData({ ...editFormData, Harga_Sewa: e.target.value })} className="bg-white border-slate-200 h-9 rounded-lg" /> : `Rp ${parseInt(room.Harga_Sewa).toLocaleString('id-ID')}`}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-1">
                      {editingId === room.ID_Kamar ? (
                        <>
                          <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 rounded-lg font-bold">
                            {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                          </Button>
                          <Button size="icon" variant="ghost" onClick={onCancel} className="h-8 w-8 rounded-lg"><X className="w-4 h-4 text-slate-400" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(room)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${room.ID_Kamar}`} onClick={() => onDelete(room.ID_Kamar)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                            {actionLoading === `delete-${room.ID_Kamar}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
