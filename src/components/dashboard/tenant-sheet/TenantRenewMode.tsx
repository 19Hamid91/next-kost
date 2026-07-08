import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ContractCard, SectionTitle } from "./shared";
import { calculateDueDate, parseDurasiUnit } from "@/lib/dateUtils";
import { Rental } from "@/types";

interface TenantRenewModeProps {
    rental: Rental | null;
    rentalStatus: {
        tglJatuhTempo: Date;
        isOverdue: boolean;
        sisaHari: number;
    } | null;
    renewMonths: string;
    setRenewMonths: (months: string) => void;
}

export default function TenantRenewMode({ rental, rentalStatus, renewMonths, setRenewMonths }: TenantRenewModeProps) {
    return (
        <section className="space-y-8">
            <div className="p-6 bg-muted/30 rounded-[1.5rem] border border-border space-y-4">
                <SectionTitle>Kontrak Saat Ini</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                    <ContractCard
                        label="Mulai Sewa"
                        value={rental?.Tgl_Masuk ? format(parseISO(rental.Tgl_Masuk), "d MMM yyyy", { locale: localeId }) : "—"}
                    />
                    <ContractCard
                        label="Jatuh Tempo"
                        value={rentalStatus ? format(rentalStatus.tglJatuhTempo, "d MMM yyyy", { locale: localeId }) : "—"}
                        dark
                    />
                </div>
            </div>

            <div className="space-y-5">
                <SectionTitle>Perpanjang Masa Sewa</SectionTitle>
                <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs ml-1">Tambah berapa {rental?.Unit_Durasi || "Bulan"}?</Label>
                    <Select
                        value={renewMonths}
                        onValueChange={setRenewMonths}
                    >
                        <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 6, 12].map((n) => (
                                <SelectItem
                                    key={n}
                                    value={String(n)}
                                >
                                    + {n} {rental?.Unit_Durasi || "Bulan"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {rentalStatus && (
                    <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Estimasi Jatuh Tempo Baru</p>
                            <p className="text-base font-bold text-foreground">{format(calculateDueDate(rentalStatus.tglJatuhTempo, parseInt(renewMonths), parseDurasiUnit(rental?.Unit_Durasi)), "d MMMM yyyy", { locale: localeId })}</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
