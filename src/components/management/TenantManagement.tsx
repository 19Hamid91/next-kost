'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-soft rounded-[2rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-8">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Master Penghuni</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Manajemen database penyewa</p>
        </div>
        <Button
          size="sm"
          onClick={onStartAdding}
          className="rounded-xl shadow-lg shadow-orange-500/10"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Penghuni
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-5 pl-8">Nama</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No. HP</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bawa Mobil</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kontak Darurat</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && editingId === 'new' && (
                <TableRow className="border-border bg-orange-50/30">
                  <TableCell className="pl-8"><Input value={editFormData.Nama || ''} onChange={e => setEditFormData({ ...editFormData, Nama: e.target.value })} className="h-10 rounded-xl" placeholder="Nama" /></TableCell>
                  <TableCell><Input value={editFormData.No_HP || ''} onChange={e => setEditFormData({ ...editFormData, No_HP: e.target.value })} className="h-10 rounded-xl" placeholder="628xxxx" /></TableCell>
                  <TableCell>
                    <select
                      value={editFormData.Bawa_Mobil || 'Tidak'}
                      onChange={e => setEditFormData({ ...editFormData, Bawa_Mobil: e.target.value })}
                      className="w-full bg-white border border-border text-foreground p-2 rounded-xl h-10 text-xs font-bold"
                    >
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
                      <Button size="icon" disabled={actionLoading === 'save'} variant="ghost" onClick={onCancel} className="h-10 w-10 rounded-xl"><X className="w-4 h-4 text-muted-foreground" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {tenants.map((tenant: any) => (
                <TableRow key={tenant.ID_Penghuni} className="border-border hover:bg-muted/20 transition-colors">
                  <TableCell className="font-bold text-foreground py-5 pl-8">
                    {editingId === tenant.ID_Penghuni ? <Input value={editFormData.Nama || ''} onChange={e => setEditFormData({ ...editFormData, Nama: e.target.value })} className="h-9 rounded-lg" /> : tenant.Nama}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {editingId === tenant.ID_Penghuni ? <Input value={editFormData.No_HP || ''} onChange={e => setEditFormData({ ...editFormData, No_HP: e.target.value })} className="h-9 rounded-lg" /> : tenant.No_HP}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {editingId === tenant.ID_Penghuni ? (
                      <select value={editFormData.Bawa_Mobil || ''} onChange={e => setEditFormData({ ...editFormData, Bawa_Mobil: e.target.value })} className="bg-white border border-border text-foreground p-1 rounded-lg h-9 text-xs font-bold">
                        <option value="Tidak">Tidak</option>
                        <option value="Ya">Ya</option>
                      </select>
                    ) : (
                      <Badge variant={tenant.Bawa_Mobil === 'Ya' ? 'default' : 'outline'} className={cn('rounded-full text-[10px] font-bold px-3 border-0', tenant.Bawa_Mobil === 'Ya' ? 'bg-primary/10 text-primary hover:bg-primary/10' : 'bg-muted text-muted-foreground hover:bg-muted')}>
                        {tenant.Bawa_Mobil === 'Ya' ? 'MOBIL' : 'TANPA MOBIL'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {editingId === tenant.ID_Penghuni ? <Input value={editFormData.Kontak_Darurat || ''} onChange={e => setEditFormData({ ...editFormData, Kontak_Darurat: e.target.value })} className="h-9 rounded-lg" /> : tenant.Kontak_Darurat}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      {editingId === tenant.ID_Penghuni ? (
                        <>
                          <Button size="sm" disabled={actionLoading === 'save'} onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 rounded-xl font-bold">
                            {actionLoading === 'save' ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Simpan
                          </Button>
                          <Button size="icon" disabled={actionLoading === 'save'} variant="ghost" onClick={onCancel} className="h-9 w-9 rounded-xl"><X className="w-4 h-4 text-muted-foreground" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => onEdit(tenant)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${tenant.ID_Penghuni}`} onClick={() => onDelete(tenant.ID_Penghuni)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
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
