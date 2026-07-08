import React from "react";
import { cn } from "@/lib/utils";

export function InfoRow({ icon: Icon, label, value, iconClass = "" }: { icon: any; label: string; value: string; iconClass?: string }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border hover:border-orange-200 hover:shadow-soft transition-all duration-300 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <Icon className={cn("w-4 h-4", iconClass)} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0 leading-tight">{label}</p>
                <p className="text-xs font-bold text-foreground truncate break-all mb-0 leading-tight">{value}</p>
            </div>
        </div>
    );
}

export function ContractCard({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
    return (
        <div className={cn("p-4 rounded-xl flex flex-col gap-0.5 overflow-hidden", dark ? "bg-primary text-primary-foreground shadow-lg shadow-orange-500/10" : "bg-muted/30 border border-border")}>
            <p className={cn("text-[9px] font-bold uppercase tracking-wider mb-0 leading-tight", dark ? "text-white/70" : "text-muted-foreground")}>{label}</p>
            <p className={cn("text-xs font-bold truncate break-all mb-0 leading-tight", dark ? "text-white" : "text-foreground")}>{value}</p>
        </div>
    );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">{children}</h3>;
}
