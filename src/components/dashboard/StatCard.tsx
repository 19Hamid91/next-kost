"use client";

export default function StatCard({ icon: Icon, label, value, color, description }: { icon: any; label: string; value: number; color: string; description: string }) {
    return (
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-white/20 shadow-soft hover:shadow-premium transition-all duration-500">
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center ${color} shadow-lg shadow-black/5 group-hover:scale-105 transition-transform duration-500 shrink-0`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tighter leading-none">{value}</p>
                    <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1.5">{label}</p>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-bold uppercase tracking-widest">{description}</span>
            </div>
        </div>
    );
}
