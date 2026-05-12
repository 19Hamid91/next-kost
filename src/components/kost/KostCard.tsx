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
    <Card 
      onClick={() => router.push(`/${kost.ID_Kost}/dashboard`)}
      className="group relative bg-white/70 backdrop-blur-xl border-white/20 hover:border-orange-200 shadow-soft hover:shadow-premium transition-all duration-500 rounded-[2.5rem] overflow-hidden cursor-pointer active:scale-[0.98]"
    >
      <CardContent className="p-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="w-16 h-16 rounded-[1.5rem] bg-primary shadow-lg shadow-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <div className="flex gap-2 relative z-10">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-10 w-10 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-10 w-10 rounded-xl bg-muted/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-bold text-2xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">{kost.Nama_Kost}</h3>
          <div className="flex items-center gap-2.5">
            <span className="block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0 translate-y-[0.5px]" />
            <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase leading-none">
               {kost.Alamat || 'Alamat belum diatur'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
