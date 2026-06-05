'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { resolveStatusSewa } from '@/lib/dateUtils';

interface RentalManagementProps {
  rentals: any[];
  rooms: any[];
  tenants: any[];
  editingId: string | null;
  editFormData: any;
  isAdding: boolean;
  actionLoading: string | null;
  selectedIds: string[];
  onEdit: (rental: any) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onStartAdding: (data: any) => void;
  onToggleSelect: (id: string) => void;
  setEditFormData: (data: any) => void;
}

function InlineSelect({ value, onChange, options, className = '' }: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`bg-white border-border text-foreground rounded-lg font-bold text-xs border ${className}`}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

const STATUS_OPTIONS = [
  { value: 'AKTIF', label: 'AKTIF' },
  { value: 'BOOKING', label: 'BOOKING' },
  { value: 'SELESAI', label: 'SELESAI' },
];

const DURASI_OPTIONS = [
  { value: 'Hari', label: 'Hari' },
  { value: 'Minggu', label: 'Minggu' },
  { value: 'Bulan', label: 'Bulan' },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    AKTIF: 'bg-blue-50 text-blue-700',
    BOOKING: 'bg-amber-50 text-amber-700',
    SELESAI: 'bg-muted text-muted-foreground',
  }[status] || 'bg-muted text-muted-foreground';

  return (
    <Badge variant="outline" className={cn('rounded-full text-[10px] font-bold px-3 border-0', cfg)}>
      {status || 'SELESAI'}
    </Badge>
  );
}

export default function RentalManagement({
  rentals, rooms, tenants,
  editingId, editFormData, isAdding, actionLoading, selectedIds,
  onEdit, onSave, onDelete, onCancel, onStartAdding,
  onToggleSelect, setEditFormData,
}: RentalManagementProps) {
  const set = (field: string) => (val: string) => setEditFormData({ ...editFormData, [field]: val });

  const allSelected = rentals.length > 0 && rentals.every(r => selectedIds.includes(r.ID_Sewa));
  const toggleAll = () => {
    if (allSelected) {
      rentals.forEach(r => { if (selectedIds.includes(r.ID_Sewa)) onToggleSelect(r.ID_Sewa); });
    } else {
      rentals.forEach(r => { if (!selectedIds.includes(r.ID_Sewa)) onToggleSelect(r.ID_Sewa); });
    }
  };

  const HEADS = ['Kamar', 'Penghuni', 'Tgl Masuk', 'Tgl DP', 'Deposit', 'Periode', 'Unit', 'Status', 'Aksi'];

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-soft rounded-[2rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-8">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Transaksi Sewa</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Riwayat dan status kontrak aktif</p>
        </div>
        <Button
          size="sm"
          onClick={() => onStartAdding({
            Status_Sewa: 'AKTIF',
            Tgl_Masuk: new Date().toISOString().split('T')[0],
            Tgl_DP: new Date().toISOString().split('T')[0],
            Periode_Sewa: '1',
            Unit_Durasi: 'Bulan',
            Nominal_Deposit: '0',
          })}
          className="rounded-xl shadow-lg shadow-orange-500/10"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Sewa
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border">
                <TableHead className="w-12 pl-8 py-5">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-primary cursor-pointer" />
                </TableHead>
                {HEADS.map((head, idx) => (
                  <TableHead
                    key={head}
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-5',
                      idx === HEADS.length - 1 ? 'text-right pr-8' : ''
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
                  <TableCell className="pl-8" />
                  <TableCell>
                    <select value={editFormData.ID_Kamar || ''} onChange={e => set('ID_Kamar')(e.target.value)} className="w-full bg-white border border-border text-foreground p-2 rounded-xl h-10 text-xs font-bold">
                      <option value="">Pilih Kamar</option>
                      {rooms.map(r => <option key={r.ID_Kamar} value={r.ID_Kamar}>{r.No_Kamar}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <select value={editFormData.ID_Penghuni || ''} onChange={e => set('ID_Penghuni')(e.target.value)} className="w-full bg-white border border-border text-foreground p-2 rounded-xl h-10 text-xs font-bold">
                      <option value="">Pilih Penghuni</option>
                      {tenants.map(t => <option key={t.ID_Penghuni} value={t.ID_Penghuni}>{t.Nama}</option>)}
                    </select>
                  </TableCell>
                  <TableCell><Input type="date" value={editFormData.Tgl_Masuk || ''} onChange={e => set('Tgl_Masuk')(e.target.value)} className="h-10 rounded-xl" /></TableCell>
                  <TableCell><Input type="date" value={editFormData.Tgl_DP || ''} onChange={e => set('Tgl_DP')(e.target.value)} className="h-10 rounded-xl" /></TableCell>
                  <TableCell><Input type="number" value={editFormData.Nominal_Deposit || '0'} onChange={e => set('Nominal_Deposit')(e.target.value)} className="h-10 rounded-xl w-32" /></TableCell>
                  <TableCell><Input type="number" value={editFormData.Periode_Sewa || '1'} onChange={e => set('Periode_Sewa')(e.target.value)} className="h-10 rounded-xl w-16" /></TableCell>
                  <TableCell><InlineSelect value={editFormData.Unit_Durasi || 'Bulan'} onChange={set('Unit_Durasi')} options={DURASI_OPTIONS} className="p-2 rounded-xl h-10 w-24" /></TableCell>
                  <TableCell><InlineSelect value={editFormData.Status_Sewa || 'AKTIF'} onChange={set('Status_Sewa')} options={STATUS_OPTIONS} className="p-2 rounded-xl h-10 w-full" /></TableCell>
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

              {/* DATA ROWS */}
              {rentals.map((rental: any) => {
                const room = rooms.find(r => r.ID_Kamar === rental.ID_Kamar);
                const tenant = tenants.find(t => t.ID_Penghuni === rental.ID_Penghuni);
                const isEditing = editingId === rental.ID_Sewa;
                const isSelected = selectedIds.includes(rental.ID_Sewa);
                const resolvedStatus = resolveStatusSewa(rental) || 'SELESAI';

                return (
                  <TableRow
                    key={rental.ID_Sewa}
                    className={cn('border-border hover:bg-muted/20 transition-colors', isSelected ? 'bg-primary/5' : '')}
                  >
                    <TableCell className="pl-8 py-5">
                      <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(rental.ID_Sewa)} className="w-4 h-4 rounded accent-primary cursor-pointer" />
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {isEditing
                        ? <select value={editFormData.ID_Kamar || ''} onChange={e => set('ID_Kamar')(e.target.value)} className="w-full bg-white border border-border text-foreground p-1 rounded-lg h-9 text-xs font-bold">
                            {rooms.map(r => <option key={r.ID_Kamar} value={r.ID_Kamar}>{r.No_Kamar}</option>)}
                          </select>
                        : (room?.No_Kamar || rental.ID_Kamar)}
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {isEditing
                        ? <select value={editFormData.ID_Penghuni || ''} onChange={e => set('ID_Penghuni')(e.target.value)} className="w-full bg-white border border-border text-foreground p-1 rounded-lg h-9 text-xs font-bold">
                            {tenants.map(t => <option key={t.ID_Penghuni} value={t.ID_Penghuni}>{t.Nama}</option>)}
                          </select>
                        : (tenant?.Nama || rental.ID_Penghuni)}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground text-xs">
                      {isEditing ? <Input type="date" value={editFormData.Tgl_Masuk || ''} onChange={e => set('Tgl_Masuk')(e.target.value)} className="h-9 text-xs p-1 rounded-lg" /> : rental.Tgl_Masuk}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground text-xs">
                      {isEditing ? <Input type="date" value={editFormData.Tgl_DP || ''} onChange={e => set('Tgl_DP')(e.target.value)} className="h-9 text-xs p-1 rounded-lg" /> : (rental.Tgl_DP || '—')}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground text-xs">
                      {isEditing
                        ? <Input type="number" value={editFormData.Nominal_Deposit || '0'} onChange={e => set('Nominal_Deposit')(e.target.value)} className="h-9 text-xs p-1 w-28 rounded-lg" />
                        : `Rp ${parseInt(rental.Nominal_Deposit || '0').toLocaleString('id-ID')}`}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {isEditing ? <Input type="number" value={editFormData.Periode_Sewa || ''} onChange={e => set('Periode_Sewa')(e.target.value)} className="h-9 text-xs p-1 w-16 rounded-lg" /> : rental.Periode_Sewa}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground text-xs">
                      {isEditing
                        ? <InlineSelect value={editFormData.Unit_Durasi || 'Bulan'} onChange={set('Unit_Durasi')} options={DURASI_OPTIONS} className="p-1 rounded-lg h-9 w-20" />
                        : (rental.Unit_Durasi || 'Bulan')}
                    </TableCell>
                    <TableCell>
                      {isEditing
                        ? <InlineSelect value={editFormData.Status_Sewa || resolvedStatus} onChange={set('Status_Sewa')} options={STATUS_OPTIONS} className="p-1 rounded-lg h-9" />
                        : <StatusBadge status={resolvedStatus} />}
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
                          <Button size="icon" variant="ghost" onClick={() => onEdit(rental)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${rental.ID_Sewa}`} onClick={() => onDelete(rental.ID_Sewa)} className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                            {actionLoading === `delete-${rental.ID_Sewa}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
