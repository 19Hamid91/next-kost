"use client";

import { Building2, Pencil, Trash2, LayoutDashboard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
            className="group relative bg-white/70 backdrop-blur-xl border-white/20 hover:border-orange-200 shadow-soft hover:shadow-premium transition-all duration-500 rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98]"
        >
            <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-primary shadow-lg shadow-orange-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shrink-0">
                        <Building2 className="w-5.5 h-5.5 text-primary-foreground" />
                    </div>

                    <div className="flex gap-2 relative z-10">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg bg-muted/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">{kost.Nama_Kost}</h3>
                    <div className="flex items-center gap-2">
                        <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0 translate-y-[0.5px]" />
                        <span className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase leading-none truncate">{kost.Alamat || "Alamat belum diatur"}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
