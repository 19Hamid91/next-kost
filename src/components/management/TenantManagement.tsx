'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Pencil, Trash2, Save, X, Layers } from 'lucide-react';

interface TenantManagementProps {
  tenants: any[];
  editingId: string | null;
  editFormData: any;
  isAdding: boolean;
  actionLoading: string | null;
  selectedIds: string[];
  onEdit: (tenant: any) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onStartAdding: () => void;
  onBulkAdd: () => void;
  onToggleSelect: (id: string) => void;
  setEditFormData: (data: any) => void;
}

export default function TenantManagement({
  tenants, editingId, editFormData, isAdding, actionLoading, selectedIds,
  onEdit, onSave, onDelete, onCancel, onStartAdding, onBulkAdd,
  onToggleSelect, setEditFormData,
}: TenantManagementProps) {
  const allSelected = tenants.length > 0 && tenants.every(t => selectedIds.includes(t.ID_Penghuni));

  const toggleAll = () => {
    if (allSelected) {
      tenants.forEach(t => { if (selectedIds.includes(t.ID_Penghuni)) onToggleSelect(t.ID_Penghuni); });
    } else {
      tenants.forEach(t => { if (!selectedIds.includes(t.ID_Penghuni)) onToggleSelect(t.ID_Penghuni); });
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-soft rounded-[2rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-6 gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-foreground">Master Penghuni</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Manajemen database penyewa</p>
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
            <Plus className="w-4 h-4 mr-2" /> Tambah Penghuni
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
                {['Nama', 'No. HP', 'Bawa Mobil', 'Kontak Darurat', 'Aksi'].map((head, idx) => (
                  <TableHead
                    key={head}
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4',
                      idx === 4 ? 'text-right pr-8' : ''
                    )}
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && editingId === 'new' && (
                <TableRow className="border-border bg-orange-50/30">
                  <TableCell className="pl-6" />
                  <TableCell><Input value={editFormData.Nama || ''} onChange={e => setEditFormData({ ...editFormData, Nama: e.target.value })} className="h-10 rounded-xl" placeholder="Nama" /></TableCell>
                  <TableCell><Input value={editFormData.No_HP || ''} onChange={e => setEditFormData({ ...editFormData, No_HP: e.target.value })} className="h-10 rounded-xl" placeholder="628xxxx" /></TableCell>
                  <TableCell>
                    <select value={editFormData.Bawa_Mobil || 'Tidak'} onChange={e => setEditFormData({ ...editFormData, Bawa_Mobil: e.target.value })} className="w-full bg-white border border-border text-foreground p-2 rounded-xl h-10 text-xs font-bold">
                      <option value="Tidak">Tidak</option>
                      <option value="Ya">Ya</option>
                    </select>
                  </TableCell>
                  <TableCell><Input value={editFormData.Kontak_Darurat || ''} onChange={e => setEditFormData({ ...editFormData, Kontak_Darurat: e.target.value })} className="h-10 rounded-xl" placeholder="628xxxx" /></TableCell>
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

              {tenants.map((tenant: any) => {
                const isEditing = editingId === tenant.ID_Penghuni;
                const isSelected = selectedIds.includes(tenant.ID_Penghuni);
                return (
                  <TableRow
                    key={tenant.ID_Penghuni}
                    className={cn('border-border hover:bg-muted/20 transition-colors', isSelected ? 'bg-primary/5' : '')}
                  >
                    <TableCell className="pl-6 py-4">
                      <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(tenant.ID_Penghuni)} className="w-4 h-4 rounded accent-primary cursor-pointer" />
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {isEditing ? <Input value={editFormData.Nama || ''} onChange={e => setEditFormData({ ...editFormData, Nama: e.target.value })} className="h-9 rounded-lg" /> : tenant.Nama}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {isEditing ? <Input value={editFormData.No_HP || ''} onChange={e => setEditFormData({ ...editFormData, No_HP: e.target.value })} className="h-9 rounded-lg" /> : tenant.No_HP}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {isEditing ? (
                        <select value={editFormData.Bawa_Mobil || ''} onChange={e => setEditFormData({ ...editFormData, Bawa_Mobil: e.target.value })} className="bg-white border border-border text-foreground p-1 rounded-lg h-9 text-xs font-bold">
                          <option value="Tidak">Tidak</option>
                          <option value="Ya">Ya</option>
                        </select>
                      ) : (
                        <Badge variant={tenant.Bawa_Mobil === 'Ya' ? 'default' : 'outline'} className={cn('rounded-full text-[10px] font-bold px-3', tenant.Bawa_Mobil === 'Ya' ? 'bg-gradient-to-r from-slate-300 via-white to-slate-300 text-slate-700 border border-slate-300/80 shadow-md shadow-slate-500/20 animate-shimmer' : 'border-0 bg-muted text-muted-foreground hover:bg-muted')}>
                          {tenant.Bawa_Mobil === 'Ya' ? 'MOBIL' : 'TANPA MOBIL'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {isEditing ? <Input value={editFormData.Kontak_Darurat || ''} onChange={e => setEditFormData({ ...editFormData, Kontak_Darurat: e.target.value })} className="h-9 rounded-lg" /> : (tenant.Kontak_Darurat || '—')}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 rounded-xl font-bold">
                              {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                            </Button>
                            <Button size="icon" disabled={actionLoading === 'save'} variant="ghost" onClick={onCancel} className="h-9 w-9 rounded-xl">
                              <X className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => onEdit(tenant)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${tenant.ID_Penghuni}`} onClick={() => onDelete(tenant.ID_Penghuni)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                              {actionLoading === `delete-${tenant.ID_Penghuni}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </>
                        )}
                      </div>
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
