import React from "react";
import { Search, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionTitle } from "./shared";
import { cn } from "@/lib/utils";
import { Tenant } from "@/types";

interface TenantSewaModeProps {
    sewaForm: {
        Nama: string;
        No_HP: string;
        Bawa_Mobil: "Ya" | "Tidak";
        Kontak_Darurat: string;
        Tgl_Masuk: string;
        Tgl_DP: string;
        Periode_Sewa: string;
        Unit_Durasi: "Hari" | "Minggu" | "Bulan";
        Nominal_Deposit: string;
    };
    setSewaForm: (form: any) => void;
    tenantInputMode: "new" | "existing";
    setTenantInputMode: (mode: "new" | "existing") => void;
    selectedExistingTenantId: string;
    setSelectedExistingTenantId: (id: string) => void;
    allTenants: Tenant[];
}

export default function TenantSewaMode({ sewaForm, setSewaForm, tenantInputMode, setTenantInputMode, selectedExistingTenantId, setSelectedExistingTenantId, allTenants }: TenantSewaModeProps) {
    return (
        <>
            <section className="space-y-5">
                <SectionTitle>Penghuni</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setTenantInputMode("existing")}
                        className={cn(
                            "flex items-center gap-3 p-5 rounded-2xl border transition-all text-left cursor-pointer",
                            tenantInputMode === "existing" ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-orange-500/10" : "bg-white text-muted-foreground border-border hover:border-orange-200",
                        )}
                    >
                        <Search className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Penghuni Lama</p>
                            <p className="text-[11px] opacity-70">Cari database</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setTenantInputMode("new")}
                        className={cn(
                            "flex items-center gap-3 p-5 rounded-2xl border transition-all text-left cursor-pointer",
                            tenantInputMode === "new" ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-orange-500/10" : "bg-white text-muted-foreground border-border hover:border-orange-200",
                        )}
                    >
                        <UserPlus className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Penghuni Baru</p>
                            <p className="text-[11px] opacity-70">Input data baru</p>
                        </div>
                    </button>
                </div>

                {tenantInputMode === "existing" && (
                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs ml-1">Pilih Penghuni</Label>
                        <Select
                            value={selectedExistingTenantId}
                            onValueChange={setSelectedExistingTenantId}
                        >
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue placeholder="Cari penghuni..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allTenants.map((t) => (
                                    <SelectItem
                                        key={t.ID_Penghuni}
                                        value={t.ID_Penghuni}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold">{t.Nama}</span>
                                            <span className="text-xs text-muted-foreground">{t.No_HP}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {tenantInputMode === "new" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs ml-1">Nama Lengkap</Label>
                            <Input
                                value={sewaForm.Nama}
                                onChange={(e) => setSewaForm({ ...sewaForm, Nama: e.target.value })}
                                placeholder="Nama penghuni"
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs ml-1">WhatsApp</Label>
                                <Input
                                    value={sewaForm.No_HP}
                                    onChange={(e) => setSewaForm({ ...sewaForm, No_HP: e.target.value })}
                                    placeholder="08xx / 62xx"
                                    className="h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs ml-1">Kontak Darurat</Label>
                                <Input
                                    value={sewaForm.Kontak_Darurat}
                                    onChange={(e) => setSewaForm({ ...sewaForm, Kontak_Darurat: e.target.value })}
                                    placeholder="Opsional"
                                    className="h-12 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs ml-1">Bawa Kendaraan?</Label>
                            <Select
                                value={sewaForm.Bawa_Mobil}
                                onValueChange={(val) => setSewaForm({ ...sewaForm, Bawa_Mobil: val as "Ya" | "Tidak" })}
                            >
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tidak">Tidak</SelectItem>
                                    <SelectItem value="Ya">Ya (Mobil)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </section>

            <section className="space-y-5">
                <SectionTitle>Detail Kontrak</SectionTitle>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs ml-1">Mulai Sewa</Label>
                            <Input
                                type="date"
                                value={sewaForm.Tgl_Masuk}
                                onChange={(e) => setSewaForm({ ...sewaForm, Tgl_Masuk: e.target.value })}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs ml-1">Tanggal DP</Label>
                            <Input
                                type="date"
                                value={sewaForm.Tgl_DP}
                                onChange={(e) => setSewaForm({ ...sewaForm, Tgl_DP: e.target.value })}
                                className="h-12 rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs ml-1">Durasi</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    value={sewaForm.Periode_Sewa}
                                    onChange={(e) => setSewaForm({ ...sewaForm, Periode_Sewa: e.target.value })}
                                    className="h-12 rounded-xl w-20"
                                />
                                <Select
                                    value={sewaForm.Unit_Durasi}
                                    onValueChange={(val) => setSewaForm({ ...sewaForm, Unit_Durasi: val as "Hari" | "Minggu" | "Bulan" })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl flex-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hari">Hari</SelectItem>
                                        <SelectItem value="Minggu">Minggu</SelectItem>
                                        <SelectItem value="Bulan">Bulan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs ml-1">Deposit (Rp)</Label>
                            <Input
                                type="number"
                                value={sewaForm.Nominal_Deposit}
                                onChange={(e) => setSewaForm({ ...sewaForm, Nominal_Deposit: e.target.value })}
                                placeholder="0"
                                className="h-12 rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
