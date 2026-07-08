"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Pencil, Trash2, Save, X, ArrowRight, Home, Calendar, DollarSign, ShieldCheck } from "lucide-react";
import { resolveStatusSewa, calculateDueDate, parseDurasiUnit } from "@/lib/dateUtils";
import { canActivateRental } from "@/lib/rentalValidation";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Room, Tenant, Rental } from "@/types";

interface RentalManagementProps {
    rentals: Rental[];
    rooms: Room[];
    tenants: Tenant[];
    editingId: string | null;
    editFormData: any;
    isAdding: boolean;
    actionLoading: string | null;
    selectedIds: string[];
    onEdit: (rental: Rental) => void;
    onSave: () => void;
    onDelete: (id: string) => void;
    onCancel: () => void;
    onStartAdding: (data: any) => void;
    onToggleSelect: (id: string) => void;
    setEditFormData: (data: any) => void;
}

const STATUS_OPTIONS = [
    { value: "AKTIF", label: "AKTIF" },
    { value: "BOOKING", label: "BOOKING" },
    { value: "SELESAI", label: "SELESAI" },
];

const DURASI_OPTIONS = [
    { value: "Hari", label: "Hari" },
    { value: "Minggu", label: "Minggu" },
    { value: "Bulan", label: "Bulan" },
];

function StatusBadge({ status }: { status: string }) {
    const cfg =
        {
            AKTIF: "bg-blue-50 text-blue-700",
            BOOKING: "bg-amber-50 text-amber-700",
            SELESAI: "bg-muted text-muted-foreground",
        }[status] || "bg-muted text-muted-foreground";

    return (
        <Badge
            variant="outline"
            className={cn("rounded-full text-[10px] font-bold px-3 border-0", cfg)}
        >
            {status || "SELESAI"}
        </Badge>
    );
}

function DpBadge({ status, amount }: { status?: string; amount?: string }) {
    if (!amount || amount === "0") return <span className="text-[10px] text-muted-foreground">—</span>;

    const cfg =
        {
            paid: "bg-emerald-50 text-emerald-700",
            forfeited: "bg-rose-50 text-rose-700",
            pending: "bg-amber-50 text-amber-700",
        }[status || "pending"] || "bg-amber-50 text-amber-700";

    const label =
        {
            paid: "Lunas",
            forfeited: "Hangus",
            pending: "Pending",
        }[status || "pending"] || "Pending";

    return (
        <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold text-foreground">Rp {parseInt(amount).toLocaleString("id-ID")}</span>
            <Badge
                variant="outline"
                className={cn("rounded-full text-[9px] font-black px-2 py-0 border-0 uppercase leading-none scale-90 origin-right", cfg)}
            >
                {label}
            </Badge>
        </div>
    );
}

function DepositBadge({ status, amount, refundedAt }: { status?: string; amount?: string; refundedAt?: string }) {
    const isRefunded = status === "refunded";
    const displayAmount = parseInt(amount || "0");

    return (
        <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold text-foreground">Rp {displayAmount.toLocaleString("id-ID")}</span>
            {isRefunded ? (
                <div className="flex flex-col items-end gap-0.5">
                    <Badge
                        variant="outline"
                        className="rounded-full text-[9px] font-black px-2 py-0 border-0 bg-emerald-50 text-emerald-700 leading-none scale-90 origin-right uppercase"
                    >
                        Refunded
                    </Badge>
                    {refundedAt && <span className="text-[9px] text-muted-foreground scale-90 origin-right leading-none mt-0.5">{format(parseISO(refundedAt), "dd/MM/yyyy")}</span>}
                </div>
            ) : (
                <Badge
                    variant="outline"
                    className="rounded-full text-[9px] font-black px-2 py-0 border-0 bg-blue-50 text-blue-700 leading-none scale-90 origin-right uppercase"
                >
                    Held
                </Badge>
            )}
        </div>
    );
}

export default function RentalManagement({
    rentals,
    rooms,
    tenants,
    editingId,
    editFormData,
    isAdding,
    actionLoading,
    selectedIds,
    onEdit,
    onSave,
    onDelete,
    onCancel,
    onStartAdding,
    onToggleSelect,
    setEditFormData,
}: RentalManagementProps) {
    const set = (field: string) => (val: string) => setEditFormData({ ...editFormData, [field]: val });

    // Reactively compute AKTIF eligibility whenever form data changes
    const activationCheck = canActivateRental({
        rental: editFormData,
        allRentals: rentals,
        editingId,
    });
    const canActivate = activationCheck.allowed;
    const activationBlockReason = activationCheck.reason;

    // Auto-revert to BOOKING if user changes room/date causing a conflict while AKTIF is selected
    const handleStatusChange = (newStatus: string) => {
        if (newStatus === "AKTIF" && !canActivate) return; // silently block
        set("Status_Sewa")(newStatus);
    };

    // When room or date changes and status is AKTIF but now blocked, revert to BOOKING
    const setWithGuard = (field: string) => (val: string) => {
        const updatedForm = { ...editFormData, [field]: val };
        const check = canActivateRental({ rental: updatedForm, allRentals: rentals, editingId });
        if (!check.allowed && updatedForm.Status_Sewa === "AKTIF") {
            setEditFormData({ ...updatedForm, Status_Sewa: "BOOKING" });
        } else {
            setEditFormData(updatedForm);
        }
    };

    const handleNumericChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/^0+(?=\d)/, "");
        set(field)(raw === "" ? "0" : raw);
    };

    const handleNumericFocus = (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === "0") set(field)("");
    };

    const handleNumericBlur = (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === "") set(field)("0");
    };

    const allSelected = rentals.length > 0 && rentals.every((r) => selectedIds.includes(r.ID_Sewa));
    const toggleAll = () => {
        if (allSelected) {
            rentals.forEach((r) => {
                if (selectedIds.includes(r.ID_Sewa)) onToggleSelect(r.ID_Sewa);
            });
        } else {
            rentals.forEach((r) => {
                if (!selectedIds.includes(r.ID_Sewa)) onToggleSelect(r.ID_Sewa);
            });
        }
    };

    const isFormOpen = isAdding || editingId !== null;

    const getLeaseTrajectory = (rental: Rental) => {
        if (!rental.Tgl_Masuk) return { start: "—", end: "—", duration: "—" };
        try {
            const startDate = parseISO(rental.Tgl_Masuk);
            const periode = parseInt(rental.Periode_Sewa) || 1;
            const unit = parseDurasiUnit(rental.Unit_Durasi);
            const endDate = calculateDueDate(startDate, periode, unit);
            return {
                start: format(startDate, "dd/MM/yyyy"),
                end: format(endDate, "dd/MM/yyyy"),
                duration: `${periode} ${unit}`,
            };
        } catch {
            return { start: rental.Tgl_Masuk, end: "—", duration: `${rental.Periode_Sewa} ${rental.Unit_Durasi}` };
        }
    };

    const HEADS = ["Unit & Penyewa", "Masa Sewa", "Harga & DP", "Deposit", "Status", "Aksi"];

    return (
        <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-soft rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-6">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-foreground">Transaksi Sewa</CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Riwayat dan status kontrak aktif</p>
                </div>
                <Button
                    size="sm"
                    onClick={() =>
                        onStartAdding({
                            Status_Sewa: "AKTIF",
                            Tgl_Masuk: new Date().toISOString().split("T")[0],
                            Tgl_DP: new Date().toISOString().split("T")[0],
                            Periode_Sewa: "1",
                            Unit_Durasi: "Bulan",
                            Nominal_Deposit: "0",
                            Monthly_Rent: "0",
                            DP_Amount: "0",
                            DP_Status: "pending",
                            Deposit_Status: "held",
                        })
                    }
                    className="rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Sewa
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border">
                                <TableHead className="w-12 pl-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                                    />
                                </TableHead>
                                {HEADS.map((head, idx) => (
                                    <TableHead
                                        key={head}
                                        className={cn("text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4", idx === 2 || idx === 3 ? "text-right" : "", idx === HEADS.length - 1 ? "text-right pr-8" : "")}
                                    >
                                        {head}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {rentals.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-12 text-muted-foreground text-sm font-medium"
                                    >
                                        Belum ada data transaksi sewa
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rentals.map((rental) => {
                                    const room = rooms.find((r) => r.ID_Kamar === rental.ID_Kamar);
                                    const tenant = tenants.find((t) => t.ID_Penghuni === rental.ID_Penghuni);
                                    const isSelected = selectedIds.includes(rental.ID_Sewa);
                                    const resolvedStatus = resolveStatusSewa(rental) || "SELESAI";
                                    const trajectory = getLeaseTrajectory(rental);

                                    const currentRentAmount = rental.Monthly_Rent && rental.Monthly_Rent !== "0" ? parseInt(rental.Monthly_Rent) : parseInt(room?.Harga_Sewa || "0");

                                    return (
                                        <TableRow
                                            key={rental.ID_Sewa}
                                            className={cn("border-border hover:bg-muted/20 transition-colors", isSelected ? "bg-primary/5" : "")}
                                        >
                                            <TableCell className="pl-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => onToggleSelect(rental.ID_Sewa)}
                                                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                                                />
                                            </TableCell>

                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-0.5 text-left">
                                                    <span className="font-bold text-foreground text-sm">Kamar {room?.No_Kamar || rental.ID_Kamar}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Lantai {room?.Lantai || "—"}</span>
                                                    <span className="text-xs font-semibold text-foreground/80 mt-1 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                        {tenant?.Nama || rental.ID_Penghuni}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col gap-1 items-start text-left">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                        <span>{trajectory.start}</span>
                                                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>{trajectory.end}</span>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full text-[9px] font-black uppercase tracking-wider px-2 py-0 border-0 bg-muted text-muted-foreground mt-0.5 leading-none"
                                                    >
                                                        {trajectory.duration}
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="flex flex-col gap-1.5 items-end">
                                                    <div className="flex flex-col gap-0.5 items-end">
                                                        <span className="text-xs font-bold text-foreground">Rp {currentRentAmount.toLocaleString("id-ID")}</span>
                                                        <span className="text-[9px] font-semibold text-muted-foreground leading-none">sewa / bln</span>
                                                    </div>
                                                    <DpBadge
                                                        status={rental.DP_Status}
                                                        amount={rental.DP_Amount}
                                                    />
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <DepositBadge
                                                    status={rental.Deposit_Status}
                                                    amount={rental.Nominal_Deposit}
                                                    refundedAt={rental.Deposit_Refunded_At}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <StatusBadge status={resolvedStatus} />
                                            </TableCell>

                                            <TableCell className="text-right pr-8">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => onEdit(rental)}
                                                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={actionLoading === `delete-${rental.ID_Sewa}`}
                                                        onClick={() => onDelete(rental.ID_Sewa)}
                                                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                                                    >
                                                        {actionLoading === `delete-${rental.ID_Sewa}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* SEWA FORM DIALOG MODAL */}
            <Dialog
                open={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) onCancel();
                }}
            >
                <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                    className="max-w-4xl w-full bg-white rounded-[2rem] p-0 overflow-hidden shadow-2xl border-0 gap-0 font-sans"
                >
                    <DialogHeader className="p-8 bg-muted/20 border-b border-border text-left relative overflow-hidden shrink-0">
                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl" />
                        <DialogTitle className="text-2xl font-bold tracking-tight">Form Transaksi Sewa</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mt-1">{editingId === "new" ? "Tambah Sewa/Booking Baru" : "Edit Kontrak Transaksi"}</DialogDescription>
                    </DialogHeader>

                    {/* Form Two-Column Grid Area */}
                    <div className="overflow-y-auto max-h-[65vh] p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Section 1: Unit & Penyewa */}
                                <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                                        <Home className="w-3.5 h-3.5 text-primary" />
                                        Unit & Penyewa
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Kamar</Label>
                                            <SearchableSelect
                                                value={editFormData.ID_Kamar || ""}
                                                onChange={setWithGuard("ID_Kamar")}
                                                options={rooms.map((r) => ({ value: r.ID_Kamar, label: `Kamar ${r.No_Kamar}`, subLabel: `Lantai ${r.Lantai}` }))}
                                                placeholder="Pilih Kamar"
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Penyewa / Penghuni</Label>
                                            <SearchableSelect
                                                value={editFormData.ID_Penghuni || ""}
                                                onChange={set("ID_Penghuni")}
                                                options={tenants.map((t) => ({ value: t.ID_Penghuni, label: t.Nama, subLabel: t.No_HP }))}
                                                placeholder="Pilih Penghuni"
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Detail Kontrak */}
                                <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        Periode & Durasi Kontrak
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Mulai Sewa (Check-in)</Label>
                                            <Input
                                                type="date"
                                                value={editFormData.Tgl_Masuk || ""}
                                                onChange={(e) => setWithGuard("Tgl_Masuk")(e.target.value)}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Durasi Sewa</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={editFormData.Periode_Sewa || "1"}
                                                    onChange={(e) => set("Periode_Sewa")(e.target.value)}
                                                    className="h-12 rounded-xl w-24 shrink-0"
                                                />
                                                <Select
                                                    value={editFormData.Unit_Durasi || "Bulan"}
                                                    onValueChange={set("Unit_Durasi")}
                                                >
                                                    <SelectTrigger className="h-12 rounded-xl flex-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DURASI_OPTIONS.map((opt) => (
                                                            <SelectItem
                                                                key={opt.value}
                                                                value={opt.value}
                                                            >
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Section 3: Biaya & Uang Muka (DP) */}
                                <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                                        <DollarSign className="w-3.5 h-3.5 text-primary" />
                                        Biaya & DP
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Harga Sewa Bulanan (Rp)</Label>
                                            <Input
                                                type="number"
                                                value={editFormData.Monthly_Rent || ""}
                                                onChange={handleNumericChange("Monthly_Rent")}
                                                onFocus={handleNumericFocus("Monthly_Rent")}
                                                onBlur={handleNumericBlur("Monthly_Rent")}
                                                placeholder={(() => {
                                                    const selRoom = rooms.find((r) => r.ID_Kamar === editFormData.ID_Kamar);
                                                    return selRoom?.Harga_Sewa || "0";
                                                })()}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Tanggal DP</Label>
                                            <Input
                                                type="date"
                                                value={editFormData.Tgl_DP || ""}
                                                onChange={(e) => set("Tgl_DP")(e.target.value)}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Nominal DP (Rp)</Label>
                                            <Input
                                                type="number"
                                                value={editFormData.DP_Amount || "0"}
                                                onChange={handleNumericChange("DP_Amount")}
                                                onFocus={handleNumericFocus("DP_Amount")}
                                                onBlur={handleNumericBlur("DP_Amount")}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Status Uang Muka (DP)</Label>
                                            <Select
                                                value={editFormData.DP_Status || "pending"}
                                                onValueChange={set("DP_Status")}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="paid">Lunas (Paid)</SelectItem>
                                                    <SelectItem value="forfeited">Hangus (Forfeited)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Deposit & Status Sewa */}
                                <div className="p-6 bg-muted/20 border border-border rounded-2xl space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                        Deposit & Status Sewa
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Nominal Deposit (Rp)</Label>
                                            <Input
                                                type="number"
                                                value={editFormData.Nominal_Deposit || "0"}
                                                onChange={handleNumericChange("Nominal_Deposit")}
                                                onFocus={handleNumericFocus("Nominal_Deposit")}
                                                onBlur={handleNumericBlur("Nominal_Deposit")}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Tanggal Bayar Deposit</Label>
                                            <Input
                                                type="date"
                                                value={editFormData.Tgl_Deposit || ""}
                                                onChange={(e) => set("Tgl_Deposit")(e.target.value)}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Status Deposit</Label>
                                            <Select
                                                value={editFormData.Deposit_Status || "held"}
                                                onValueChange={set("Deposit_Status")}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="held">Ditahan (Held)</SelectItem>
                                                    <SelectItem value="refunded">Dikembalikan (Refunded)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {editFormData.Deposit_Status === "refunded" && (
                                            <div className="col-span-2 space-y-2 text-left">
                                                <Label className="text-muted-foreground text-xs ml-1 font-semibold">Tanggal Refund Deposit</Label>
                                                <Input
                                                    type="date"
                                                    value={editFormData.Deposit_Refunded_At || ""}
                                                    onChange={(e) => set("Deposit_Refunded_At")(e.target.value)}
                                                    className="h-12 rounded-xl"
                                                />
                                            </div>
                                        )}
                                        <div className="col-span-2 space-y-2 text-left">
                                            <Label className="text-muted-foreground text-xs ml-1 font-semibold">Status Sewa</Label>
                                            <Select
                                                value={editFormData.Status_Sewa || "AKTIF"}
                                                onValueChange={handleStatusChange}
                                            >
                                                <SelectTrigger className={cn("h-12 rounded-xl", !canActivate && editFormData.Status_Sewa === "AKTIF" ? "border-amber-400 bg-amber-50/50" : "")}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                            disabled={opt.value === "AKTIF" && !canActivate}
                                                            className={opt.value === "AKTIF" && !canActivate ? "opacity-40 cursor-not-allowed" : ""}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {!canActivate && activationBlockReason && (
                                                <p className="text-[11px] font-semibold text-amber-600 flex items-center gap-1.5 mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                    {activationBlockReason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <DialogFooter className="p-6 bg-white border-t border-border shrink-0 flex gap-3 sm:flex-row flex-col">
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            disabled={actionLoading === "save"}
                            className="flex-1 h-12 rounded-xl font-bold text-muted-foreground cursor-pointer"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={onSave}
                            disabled={actionLoading === "save"}
                            className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-orange-500/10 cursor-pointer"
                        >
                            {actionLoading === "save" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
