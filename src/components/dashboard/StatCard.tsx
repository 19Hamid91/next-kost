'use client';

export default function StatCard({ icon: Icon, label, value, color, description }: { icon: any; label: string; value: number; color: string; description: string }) {
  return (
    <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-soft hover:shadow-premium transition-all duration-500">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center ${color} shadow-lg shadow-black/5 group-hover:scale-105 transition-transform duration-500 shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-foreground tracking-tighter leading-none">{value}</p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1.5">{label}</p>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-border/40 flex items-center gap-2">
        <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">{description}</span>
      </div>
    </div>
  );
}
