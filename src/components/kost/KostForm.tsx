'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface KostFormProps {
  formData: any;
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function KostForm({ formData, onChange, onSave, onCancel, loading }: KostFormProps) {
  return (
    <Card className="bg-white border-slate-200 shadow-xl shadow-slate-100 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Detail Properti</p>
          <Input 
            autoFocus 
            placeholder="Nama Kost" 
            value={formData.Nama_Kost || ''} 
            onChange={e => onChange({ ...formData, Nama_Kost: e.target.value })} 
            className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-2xl focus:bg-white transition-all px-4" 
          />
          <Input 
            placeholder="Alamat Lengkap" 
            value={formData.Alamat || ''} 
            onChange={e => onChange({ ...formData, Alamat: e.target.value })} 
            className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-2xl focus:bg-white transition-all px-4" 
          />
        </div>
        <div className="flex gap-2">
          <Button 
            disabled={loading} 
            onClick={onSave} 
            className="bg-slate-900 hover:bg-slate-800 text-white flex-1 h-11 rounded-xl font-bold transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Properti'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel} 
            className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 h-11 px-6 rounded-xl font-bold"
          >
            Batal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
