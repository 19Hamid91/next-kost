'use client';

export default function StatCard({ icon: Icon, label, value, color, description }: { icon: any; label: string; value: number; color: string; description: string }) {
  return (
    <div className="group relative overflow-hidden bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className="flex items-start justify-between">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-primary tracking-tighter">{value}</p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">{label}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-border" />
        <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">{description}</span>
      </div>
    </div>
  );
}
