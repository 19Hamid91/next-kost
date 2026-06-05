'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Loader2, Save, AlertCircle } from 'lucide-react';
import { mutate } from 'swr';
import { toast } from 'sonner';

// ── Column definitions per entity ───────────────────────────────────

interface ColumnDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  width?: string;
  options?: { value: string; label: string }[];
}

const ROOM_COLUMNS: ColumnDef[] = [
  { key: 'No_Kamar', label: 'No. Kamar', placeholder: 'A1', width: 'w-28' },
  { key: 'Lantai', label: 'Lantai', placeholder: '1', type: 'number', width: 'w-20' },
  { key: 'Harga_Sewa', label: 'Harga Sewa', placeholder: '1500000', type: 'number', width: 'w-36' },
];

const TENANT_COLUMNS: ColumnDef[] = [
  { key: 'Nama', label: 'Nama', placeholder: 'Nama penghuni', width: 'w-40' },
  { key: 'No_HP', label: 'No. HP', placeholder: '628xxx', width: 'w-36' },
  { key: 'Bawa_Mobil', label: 'Mobil', width: 'w-24', options: [{ value: 'Tidak', label: 'Tidak' }, { value: 'Ya', label: 'Ya' }] },
  { key: 'Kontak_Darurat', label: 'Kontak Darurat', placeholder: 'Opsional', width: 'w-36' },
];

export type BulkAddEntityType = 'rooms' | 'tenants';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: BulkAddEntityType;
  kostId: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

function makeEmptyRow(columns: ColumnDef[]): Record<string, string> {
  const row: Record<string, string> = {};
  columns.forEach(col => {
    row[col.key] = col.options ? col.options[0].value : '';
  });
  return row;
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '62' + cleaned.substring(1);
  return cleaned;
}

// ── Main Component ────────────────────────────────────────────────

export default function BulkAddModal({ isOpen, onClose, entityType, kostId }: BulkAddModalProps) {
  const isRooms = entityType === 'rooms';
  const columns = isRooms ? ROOM_COLUMNS : TENANT_COLUMNS;
  const sheetName = isRooms ? 'Master_Kamar' : 'Master_Penghuni';
  const idPrefix = isRooms ? 'K' : 'P';
  const title = isRooms ? 'Tambah Massal Kamar' : 'Tambah Massal Penghuni';

  const [rows, setRows] = useState<Record<string, string>[]>([makeEmptyRow(columns), makeEmptyRow(columns)]);
  const [loading, setLoading] = useState(false);
  const [failedRowIndices, setFailedRowIndices] = useState<number[]>([]);

  const handleClose = () => {
    if (loading) return;
    setRows([makeEmptyRow(columns), makeEmptyRow(columns)]);
    setFailedRowIndices([]);
    onClose();
  };

  const addRow = () => setRows(prev => [...prev, makeEmptyRow(columns)]);

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, idx) => idx !== rowIndex));
    setFailedRowIndices(prev => prev.filter(i => i !== rowIndex).map(i => i > rowIndex ? i - 1 : i));
  };

  const updateCell = useCallback((rowIndex: number, key: string, value: string) => {
    setRows(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [key]: value };
      return updated;
    });
    setFailedRowIndices(prev => prev.filter(i => i !== rowIndex));
  }, []);

  const handleSave = async () => {
    // Client-side validation — check required first column
    const requiredKey = columns[0].key;
    const emptyRows = rows
      .map((row, idx) => ({ idx, empty: !row[requiredKey]?.trim() }))
      .filter(r => r.empty)
      .map(r => r.idx);

    if (emptyRows.length > 0) {
      setFailedRowIndices(emptyRows);
      toast.error(`${emptyRows.length} baris belum diisi`);
      return;
    }

    setLoading(true);
    setFailedRowIndices([]);

    try {
      // Build objects
      const objectRows = rows.map((row, idx) => {
        const obj: Record<string, string> = {
          [isRooms ? 'ID_Kamar' : 'ID_Penghuni']: `${idPrefix}${Date.now()}${idx}`,
          ID_Kost: kostId,
          ...row,
        };
        // Normalize phone numbers for tenants
        if (!isRooms) {
          if (obj.No_HP) obj.No_HP = formatPhone(obj.No_HP);
          if (obj.Kontak_Darurat) obj.Kontak_Darurat = formatPhone(obj.Kontak_Darurat);
        }
        return obj;
      });

      const res = await fetch(`/api/data/${sheetName}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: objectRows }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`${result.count} ${isRooms ? 'kamar' : 'penghuni'} berhasil ditambahkan`);
        mutate(`/api/data/${sheetName}`);
        handleClose();
      } else {
        if (result.failedRows) setFailedRowIndices(result.failedRows);
        toast.error(result.message || 'Gagal menyimpan data');
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full bg-white rounded-[2rem] p-0 overflow-hidden shadow-2xl border-0 gap-0">

        {/* Header */}
        <DialogHeader className="p-8 pb-6 border-b border-border bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-foreground">{title}</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Input baris sekaligus, simpan dalam satu klik
              </DialogDescription>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-0 font-bold rounded-xl px-3 py-1">
              {rows.length} Baris
            </Badge>
          </div>
        </DialogHeader>

        {/* Grid */}
        <div className="overflow-auto max-h-[50vh] p-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 pr-3 w-10">#</th>
                {columns.map(col => (
                  <th key={col.key} className={cn('text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground pb-3 pr-3', col.width)}>
                    {col.label}
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="space-y-2">
              {rows.map((row, rowIndex) => {
                const isFailed = failedRowIndices.includes(rowIndex);
                return (
                  <tr
                    key={rowIndex}
                    className={cn(
                      'group transition-colors rounded-xl',
                      isFailed ? 'bg-red-50' : 'hover:bg-muted/20'
                    )}
                  >
                    <td className="py-2 pr-3 text-[11px] font-bold text-muted-foreground align-middle">
                      {isFailed
                        ? <AlertCircle className="w-4 h-4 text-destructive" />
                        : <span className="opacity-40">{rowIndex + 1}</span>
                      }
                    </td>
                    {columns.map(col => (
                      <td key={col.key} className="py-2 pr-3 align-middle">
                        {col.options ? (
                          <select
                            value={row[col.key]}
                            onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                            className={cn(
                              'w-full bg-white border text-foreground p-2 rounded-xl h-10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20',
                              isFailed ? 'border-destructive' : 'border-border'
                            )}
                          >
                            {col.options.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={col.type || 'text'}
                            value={row[col.key]}
                            onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                            placeholder={col.placeholder}
                            className={cn(
                              'h-10 rounded-xl text-xs',
                              isFailed ? 'border-destructive focus-visible:ring-destructive/20' : ''
                            )}
                          />
                        )}
                      </td>
                    ))}
                    <td className="py-2 align-middle">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeRow(rowIndex)}
                        disabled={rows.length <= 1}
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Add row button */}
          <button
            onClick={addRow}
            className="mt-4 w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Baris
          </button>
        </div>

        {/* Footer */}
        <div className="p-8 pt-6 border-t border-border flex gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl font-bold text-muted-foreground"
          >
            Batal
          </Button>
          <Button
            id="btn-bulk-save"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl font-bold shadow-xl shadow-orange-500/10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {loading ? 'Menyimpan...' : `Simpan ${rows.length} Baris`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
