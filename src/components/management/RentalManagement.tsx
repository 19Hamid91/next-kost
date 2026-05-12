'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface RentalManagementProps {
  rentals: any[];
  rooms: any[];
  tenants: any[];
  editingId: string | null;
  editFormData: any;
  isAdding: boolean;
  actionLoading: string | null;
  onEdit: (rental: any) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onStartAdding: (data: any) => void;
  setEditFormData: (data: any) => void;
}

// ─── Reusable inline select ─────────────────────────────────────────
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
      className={`bg-white border-slate-200 text-slate-900 rounded-lg font-bold text-xs ${className}`}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

// ─── Action buttons ──────────────────────────────────────────────────
function SaveCancelButtons({ onSave, onCancel, loading }: { onSave: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="flex justify-end gap-1">
      <Button size="icon" variant="ghost" disabled={loading} onClick={onSave} className="h-9 w-9 text-emerald-500 hover:text-emerald-600">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      </Button>
      <Button size="icon" variant="ghost" onClick={onCancel} className="h-9 w-9 text-slate-400">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function RentalManagement({
  rentals, rooms, tenants,
  editingId, editFormData, isAdding, actionLoading,
  onEdit, onSave, onDelete, onCancel, onStartAdding, setEditFormData
}: RentalManagementProps) {

  const statusOptions = [
    { value: 'TRUE', label: 'AKTIF' },
    { value: 'FALSE', label: 'SELESAI' },
  ];

  const set = (field: string) => (val: string) =>
    setEditFormData({ ...editFormData, [field]: val });

  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-6">
        <div className="space-y-0.5">
          <CardTitle className="text-xl font-black text-slate-900">Transaksi Sewa</CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Riwayat dan status kontrak aktif</p>
        </div>
        <Button
          size="sm"
          onClick={() => onStartAdding({
            Status_Aktif: 'TRUE',
            Tgl_Masuk: new Date().toISOString().split('T')[0],
            Tgl_DP: new Date().toISOString().split('T')[0],
            Periode_Sewa: '1',
            Nominal_Deposit: '0',
          })}
          className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 h-10 font-bold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Sewa
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                {['Kamar', 'Penghuni', 'Tgl Masuk', 'Tgl DP', 'Deposit', 'Periode', 'Status', 'Aksi'].map((head, i) => (
                  <TableHead
                    key={head}
                    className={`text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 ${i === 7 ? 'text-right pr-8' : ''}`}
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* ── ADD ROW ── */}
              {isAdding && editingId === 'new' && (
                <TableRow className="border-slate-100 bg-slate-50/50">
                  <TableCell>
                    <select value={editFormData.ID_Kamar || ''} onChange={e => set('ID_Kamar')(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 p-2 rounded-xl h-10 text-xs font-bold">
                      <option value="">Pilih Kamar</option>
                      {rooms.map((r: any) => <option key={r.ID_Kamar} value={r.ID_Kamar}>{r.No_Kamar}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <select value={editFormData.ID_Penghuni || ''} onChange={e => set('ID_Penghuni')(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 p-2 rounded-xl h-10 text-xs font-bold">
                      <option value="">Pilih Penghuni</option>
                      {tenants.map((t: any) => <option key={t.ID_Penghuni} value={t.ID_Penghuni}>{t.Nama}</option>)}
                    </select>
                  </TableCell>
                  <TableCell><Input type="date" value={editFormData.Tgl_Masuk || ''} onChange={e => set('Tgl_Masuk')(e.target.value)} className="bg-white border-slate-200 h-10 rounded-xl" /></TableCell>
                  <TableCell><Input type="date" value={editFormData.Tgl_DP || ''} onChange={e => set('Tgl_DP')(e.target.value)} className="bg-white border-slate-200 h-10 rounded-xl" /></TableCell>
                  <TableCell><Input type="number" value={editFormData.Nominal_Deposit || '0'} onChange={e => set('Nominal_Deposit')(e.target.value)} className="bg-white border-slate-200 h-10 rounded-xl w-28" placeholder="0" /></TableCell>
                  <TableCell><Input type="number" value={editFormData.Periode_Sewa || '1'} onChange={e => set('Periode_Sewa')(e.target.value)} className="bg-white border-slate-200 h-10 rounded-xl w-16" /></TableCell>
                  <TableCell>
                    <InlineSelect value={editFormData.Status_Aktif || 'TRUE'} onChange={set('Status_Aktif')} options={statusOptions} className="p-2 rounded-xl h-10 w-full" />
                  </TableCell>
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

              {/* ── DATA ROWS ── */}
              {rentals.map((rental: any) => {
                const room = rooms.find((r: any) => r.ID_Kamar === rental.ID_Kamar);
                const tenant = tenants.find((t: any) => t.ID_Penghuni === rental.ID_Penghuni);
                const isEditing = editingId === rental.ID_Sewa;

                return (
                  <TableRow key={rental.ID_Sewa} className="border-slate-100 hover:bg-slate-50/30 transition-colors">
                    {/* Kamar */}
                    <TableCell className="font-black text-slate-900 py-4">
                      {isEditing
                        ? <select value={editFormData.ID_Kamar || ''} onChange={e => set('ID_Kamar')(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 p-1 rounded-lg h-9 text-xs font-bold">
                            {rooms.map((r: any) => <option key={r.ID_Kamar} value={r.ID_Kamar}>{r.No_Kamar}</option>)}
                          </select>
                        : (room?.No_Kamar || rental.ID_Kamar)}
                    </TableCell>
                    {/* Penghuni */}
                    <TableCell className="font-bold text-slate-500">
                      {isEditing
                        ? <select value={editFormData.ID_Penghuni || ''} onChange={e => set('ID_Penghuni')(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 p-1 rounded-lg h-9 text-xs font-bold">
                            {tenants.map((t: any) => <option key={t.ID_Penghuni} value={t.ID_Penghuni}>{t.Nama}</option>)}
                          </select>
                        : (tenant?.Nama || rental.ID_Penghuni)}
                    </TableCell>
                    {/* Tgl Masuk */}
                    <TableCell className="font-bold text-slate-400 text-[11px]">
                      {isEditing
                        ? <Input type="date" value={editFormData.Tgl_Masuk || ''} onChange={e => set('Tgl_Masuk')(e.target.value)} className="h-9 text-xs p-1 rounded-lg" />
                        : rental.Tgl_Masuk}
                    </TableCell>
                    {/* Tgl DP */}
                    <TableCell className="font-bold text-slate-400 text-[11px]">
                      {isEditing
                        ? <Input type="date" value={editFormData.Tgl_DP || ''} onChange={e => set('Tgl_DP')(e.target.value)} className="h-9 text-xs p-1 rounded-lg" />
                        : (rental.Tgl_DP || '-')}
                    </TableCell>
                    {/* Deposit */}
                    <TableCell className="font-bold text-slate-500 text-[11px]">
                      {isEditing
                        ? <Input type="number" value={editFormData.Nominal_Deposit || '0'} onChange={e => set('Nominal_Deposit')(e.target.value)} className="h-9 text-xs p-1 w-28 rounded-lg" />
                        : `Rp ${parseInt(rental.Nominal_Deposit || '0').toLocaleString('id-ID')}`}
                    </TableCell>
                    {/* Periode */}
                    <TableCell className="font-bold text-slate-500">
                      {isEditing
                        ? <Input type="number" value={editFormData.Periode_Sewa || ''} onChange={e => set('Periode_Sewa')(e.target.value)} className="h-9 text-xs p-1 w-16 rounded-lg" />
                        : `${rental.Periode_Sewa} Bln`}
                    </TableCell>
                    {/* Status */}
                    <TableCell>
                      {isEditing
                        ? <InlineSelect value={editFormData.Status_Aktif || ''} onChange={set('Status_Aktif')} options={statusOptions} className="p-1 rounded-lg h-9" />
                        : <span className={`px-3 py-1 rounded-full text-[10px] font-black ${rental.Status_Aktif === 'TRUE' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                            {rental.Status_Aktif === 'TRUE' ? 'AKTIF' : 'SELESAI'}
                          </span>}
                    </TableCell>
                    {/* Aksi */}
                    <TableCell className="text-right pr-8">
                      {isEditing
                        ? <SaveCancelButtons onSave={onSave} onCancel={onCancel} loading={actionLoading === 'save'} />
                        : <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => onEdit(rental)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" disabled={actionLoading === `delete-${rental.ID_Sewa}`} onClick={() => onDelete(rental.ID_Sewa)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                              {actionLoading === `delete-${rental.ID_Sewa}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>}
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
