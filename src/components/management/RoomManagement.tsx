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
    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-soft rounded-[2rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-8">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Master Kamar</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Manajemen unit kost aktif</p>
        </div>
        <Button
          size="sm"
          onClick={onStartAdding}
          className="rounded-xl shadow-lg shadow-orange-500/10"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Unit
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-5 pl-8">No. Kamar</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lantai</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Harga Sewa</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && editingId === 'new' && (
                <TableRow className="border-border bg-orange-50/30">
                  <TableCell className="pl-8"><Input value={editFormData.No_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, No_Kamar: e.target.value })} className="h-10 rounded-xl" placeholder="Contoh: A1" /></TableCell>
                  <TableCell><Input type="number" value={editFormData.Lantai || '1'} onChange={e => setEditFormData({ ...editFormData, Lantai: e.target.value })} className="h-10 rounded-xl" /></TableCell>
                  <TableCell><Input type="number" value={editFormData.Harga_Sewa || ''} onChange={e => setEditFormData({ ...editFormData, Harga_Sewa: e.target.value })} className="h-10 rounded-xl" placeholder="1500000" /></TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-xl font-bold">
                        {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                      </Button>
                      <Button size="icon" disabled={actionLoading === 'save'} variant="ghost" onClick={onCancel} className="h-10 w-10 rounded-xl"><X className="w-4 h-4 text-muted-foreground" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rooms.map((room: any) => (
                <TableRow key={room.ID_Kamar} className="border-border hover:bg-muted/20 transition-colors">
                  <TableCell className="font-bold text-foreground py-5 pl-8">
                    {editingId === room.ID_Kamar ? <Input value={editFormData.No_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, No_Kamar: e.target.value })} className="h-9 rounded-lg" /> : room.No_Kamar}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {editingId === room.ID_Kamar ? <Input type="number" value={editFormData.Lantai || ''} onChange={e => setEditFormData({ ...editFormData, Lantai: e.target.value })} className="h-9 rounded-lg" /> : `Lantai ${room.Lantai}`}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {editingId === room.ID_Kamar ? <Input type="number" value={editFormData.Harga_Sewa || ''} onChange={e => setEditFormData({ ...editFormData, Harga_Sewa: e.target.value })} className="h-9 rounded-lg" /> : `Rp ${parseInt(room.Harga_Sewa).toLocaleString('id-ID')}`}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      {editingId === room.ID_Kamar ? (
                        <>
                          <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 rounded-xl font-bold">
                            {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                          </Button>
                          <Button size="icon" disabled={actionLoading === 'save'} variant="ghost" onClick={onCancel} className="h-9 w-9 rounded-xl"><X className="w-4 h-4 text-muted-foreground" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(room)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${room.ID_Kamar}`} onClick={() => onDelete(room.ID_Kamar)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
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
