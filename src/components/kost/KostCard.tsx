'use client';

import { Building2, Pencil, Trash2, LayoutDashboard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface KostCardProps {
  kost: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function KostCard({ kost, onEdit, onDelete, isDeleting }: KostCardProps) {
  const router = useRouter();

  return (
    <Card className="group relative bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 rounded-[32px] overflow-hidden">
      <CardContent className="p-0">
        <div 
          className="p-8 cursor-pointer relative" 
          onClick={() => router.push(`/${kost.ID_Kost}/dashboard`)}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 shadow-lg shadow-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-all duration-300">
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="font-black text-xl text-slate-900 tracking-tight">{kost.Nama_Kost}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest line-clamp-1">{kost.Alamat || 'Alamat belum diatur'}</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-white transition-all"
            onClick={() => router.push(`/${kost.ID_Kost}/dashboard`)}
          >
            <LayoutDashboard className="w-3.5 h-3.5 mr-2 opacity-50" /> Manage
          </Button>
          
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-white transition-all"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-white transition-all"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
