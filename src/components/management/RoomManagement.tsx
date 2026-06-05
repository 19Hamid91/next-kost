'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, Save, X, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomManagementProps {
  rooms: any[];
  editingId: string | null;
  editFormData: any;
  isAdding: boolean;
  actionLoading: string | null;
  selectedIds: string[];
  onEdit: (room: any) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onStartAdding: () => void;
  onBulkAdd: () => void;
  onToggleSelect: (id: string) => void;
  setEditFormData: (data: any) => void;
}

export default function RoomManagement({
  rooms, editingId, editFormData, isAdding, actionLoading, selectedIds,
  onEdit, onSave, onDelete, onCancel, onStartAdding, onBulkAdd,
  onToggleSelect, setEditFormData,
}: RoomManagementProps) {
  const allSelected = rooms.length > 0 && rooms.every(room => selectedIds.includes(room.ID_Kamar));

  const toggleAll = () => {
    if (allSelected) {
      rooms.forEach(room => {
        if (selectedIds.includes(room.ID_Kamar)) onToggleSelect(room.ID_Kamar);
      });
    } else {
      rooms.forEach(room => {
        if (!selectedIds.includes(room.ID_Kamar)) onToggleSelect(room.ID_Kamar);
      });
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-soft rounded-[2rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-6 gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-foreground">Master Kamar</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Manajemen unit kost aktif</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkAdd}
            className="rounded-xl text-primary border-primary/20 hover:bg-primary/5"
          >
            <Layers className="w-4 h-4 mr-2" /> Tambah Massal
          </Button>
          <Button size="sm" onClick={onStartAdding} className="rounded-xl shadow-lg shadow-orange-500/10">
            <Plus className="w-4 h-4 mr-2" /> Tambah Unit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border">
                <TableHead className="w-12 pl-6 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </TableHead>
                {['No. Kamar', 'Lantai', 'Harga Sewa', 'Aksi'].map((head, idx) => (
                  <TableHead
                    key={head}
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4',
                      idx === 3 ? 'text-right pr-8' : ''
                    )}
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* ADD ROW */}
              {isAdding && editingId === 'new' && (
                <TableRow className="border-border bg-orange-50/30">
                  <TableCell className="pl-6" />
                  <TableCell>
                    <Input value={editFormData.No_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, No_Kamar: e.target.value })} className="h-10 rounded-xl" placeholder="A1" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={editFormData.Lantai || '1'} onChange={e => setEditFormData({ ...editFormData, Lantai: e.target.value })} className="h-10 rounded-xl" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={editFormData.Harga_Sewa || ''} onChange={e => setEditFormData({ ...editFormData, Harga_Sewa: e.target.value })} className="h-10 rounded-xl" placeholder="1500000" />
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-xl font-bold">
                        {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                      </Button>
                      <Button size="icon" disabled={actionLoading === 'save'} variant="ghost" onClick={onCancel} className="h-10 w-10 rounded-xl">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {rooms.map((room: any) => {
                const isEditing = editingId === room.ID_Kamar;
                const isSelected = selectedIds.includes(room.ID_Kamar);
                return (
                  <TableRow
                    key={room.ID_Kamar}
                    className={cn(
                      'border-border hover:bg-muted/20 transition-colors',
                      isSelected ? 'bg-primary/5' : ''
                    )}
                  >
                    <TableCell className="pl-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(room.ID_Kamar)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {isEditing ? <Input value={editFormData.No_Kamar || ''} onChange={e => setEditFormData({ ...editFormData, No_Kamar: e.target.value })} className="h-9 rounded-lg" /> : room.No_Kamar}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {isEditing ? <Input type="number" value={editFormData.Lantai || ''} onChange={e => setEditFormData({ ...editFormData, Lantai: e.target.value })} className="h-9 rounded-lg" /> : `Lantai ${room.Lantai}`}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {isEditing
                        ? <Input type="number" value={editFormData.Harga_Sewa || ''} onChange={e => setEditFormData({ ...editFormData, Harga_Sewa: e.target.value })} className="h-9 rounded-lg" />
                        : `Rp ${parseInt(room.Harga_Sewa || '0').toLocaleString('id-ID')}`}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 rounded-xl font-bold">
                            {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                          </Button>
                          <Button size="icon" disabled={actionLoading === 'save'} variant="ghost" onClick={onCancel} className="h-9 w-9 rounded-xl">
                            <X className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => onEdit(room)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${room.ID_Kamar}`} onClick={() => onDelete(room.ID_Kamar)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                            {actionLoading === `delete-${room.ID_Kamar}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
