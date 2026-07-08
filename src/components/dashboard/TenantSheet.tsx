"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CalendarClock, DoorOpen, Clock, AlertTriangle } from "lucide-react";
import { isAfter, differenceInDays, format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTenantSheet } from "@/hooks/useTenantSheet";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { calculateDueDate, parseDurasiUnit, resolveStatusSewa } from "@/lib/dateUtils";
import { Room, Tenant, Rental } from "@/types";

import TenantViewMode from "./tenant-sheet/TenantViewMode";
import TenantSewaMode from "./tenant-sheet/TenantSewaMode";
import TenantRenewMode from "./tenant-sheet/TenantRenewMode";
import UpcomingBookingsTimeline from "./tenant-sheet/UpcomingBookingsTimeline";
import TenantSheetFooter from "./tenant-sheet/TenantSheetFooter";

interface TenantSheetProps {
    room: Room | null;
    tenant: Tenant | null;
    rental: Rental | null;
    upcomingBookings?: Array<{ rental: Rental; tenant: Tenant | null }>;
    isOpen: boolean;
    onClose: () => void;
}

export default function TenantSheet({ room, tenant, rental, upcomingBookings = [], isOpen, onClose }: TenantSheetProps) {
    const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
    const {
        loading,
        mode,
        setMode,
        tenantInputMode,
        setTenantInputMode,
        selectedExistingTenantId,
        setSelectedExistingTenantId,
        renewMonths,
        setRenewMonths,
        sewaForm,
        setSewaForm,
        allTenants,
        handleSewa,
        handleBooking,
        handleCheckout,
        handleActivateBooking,
        handleRenew,
    } = useTenantSheet(room, tenant, rental, isOpen, onClose);

    const statusSewa = resolveStatusSewa(rental);
    const isBooked = statusSewa === "BOOKING";

    // Rental status calc
    const rentalStatus = (() => {
        if (!rental?.Tgl_Masuk || statusSewa !== "AKTIF") return null;
        const tglMasuk = parseISO(rental.Tgl_Masuk);
        const periode = parseInt(rental.Periode_Sewa) || 1;
        const unit = parseDurasiUnit(rental.Unit_Durasi);
        const tglJatuhTempo = calculateDueDate(tglMasuk, periode, unit);
        return {
            tglJatuhTempo,
            isOverdue: isAfter(new Date(), tglJatuhTempo),
            sisaHari: differenceInDays(tglJatuhTempo, new Date()),
        };
    })();

    const getPeriodeLabel = (periode: string, unit?: string) => {
        const unitLabel = unit || "Bulan";
        return `${periode} ${unitLabel}`;
    };

    // WhatsApp reminder URL
    const waReminderUrl = (() => {
        if (!tenant?.No_HP || !rentalStatus) return null;
        const namaEncoded = encodeURIComponent(tenant.Nama || "");
        const noKamar = encodeURIComponent(room?.No_Kamar || "");
        const tglTempo = rentalStatus.tglJatuhTempo ? encodeURIComponent(format(rentalStatus.tglJatuhTempo, "d MMMM yyyy", { locale: localeId })) : "";
        const msg = `Halo%20${namaEncoded},%20mengingatkan%20sewa%20kamar%20${noKamar}%20akan%20berakhir%20pada%20${tglTempo}.%20Terima%20kasih!`;
        return `https://wa.me/${tenant.No_HP}?text=${msg}`;
    })();

    return (
        <Sheet
            open={isOpen}
            onOpenChange={onClose}
        >
            <SheetContent className="bg-white/80 backdrop-blur-[32px] border-l border-white/20 text-foreground w-full sm:w-[540px] p-0 flex flex-col h-full shadow-2xl">
                {/* ── Header ── */}
                <div className="p-10 bg-muted/30 border-b border-border relative overflow-hidden text-left font-sans">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />

                    <SheetHeader className="relative z-10 text-left">
                        <div className="flex items-center gap-5">
                            <div className={cn("w-16 h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center", isBooked ? "bg-amber-500 shadow-amber-500/10" : "bg-primary shadow-orange-500/10")}>
                                {isBooked ? <CalendarClock className="w-8 h-8 text-white" /> : <DoorOpen className="w-8 h-8 text-primary-foreground" />}
                            </div>
                            <div>
                                <SheetTitle className="text-foreground text-3xl font-bold tracking-tight">Unit {room?.No_Kamar}</SheetTitle>
                                <SheetDescription className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", isBooked ? "bg-amber-500" : tenant ? "bg-blue-500" : "bg-emerald-500")} />
                                    {mode === "renew" ? "Perpanjang Kontrak" : isBooked ? "Kamar Ter-Booking" : tenant ? "Penghuni Aktif" : "Kamar Kosong"}
                                </SheetDescription>
                            </div>
                        </div>

                        {/* BOOKING status banner */}
                        {isBooked && mode === "view" && (
                            <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <CalendarClock className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-0 leading-tight">Status Booking</p>
                                        <p className="text-sm font-bold text-foreground mb-0 leading-tight">DP Dibayar — Belum Masuk</p>
                                    </div>
                                </div>
                                {rental?.Tgl_Masuk && (
                                    <div className="text-right flex flex-col gap-0.5">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-0 leading-tight">Check-in</p>
                                        <p className="text-sm font-bold text-foreground mb-0 leading-tight">{format(parseISO(rental.Tgl_Masuk), "d MMM", { locale: localeId })}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AKTIF status banner */}
                        {tenant && rentalStatus && mode === "view" && !isBooked && (
                            <div
                                className={cn(
                                    "mt-8 p-5 rounded-2xl flex items-center justify-between border transition-all",
                                    rentalStatus.isOverdue ? "bg-rose-500 border-rose-200 text-white shadow-lg shadow-rose-500/10" : "bg-white border-border text-foreground shadow-soft",
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", rentalStatus.isOverdue ? "bg-white/20" : "bg-muted/50")}>
                                        {rentalStatus.isOverdue ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5 text-muted-foreground" />}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-0 leading-tight", rentalStatus.isOverdue ? "text-white/70" : "text-muted-foreground")}>Status Kontrak</p>
                                        <p className="text-sm font-bold mb-0 leading-tight">{rentalStatus.isOverdue ? "Melewati Jatuh Tempo" : "Pembayaran Lancar"}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col gap-0.5">
                                    <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-0 leading-tight", rentalStatus.isOverdue ? "text-white/70" : "text-muted-foreground")}>
                                        {rentalStatus.isOverdue ? "Terlambat" : "Sisa Hari"}
                                    </p>
                                    <p className="text-sm font-bold mb-0 leading-tight">{Math.abs(rentalStatus.sisaHari)} Hari</p>
                                </div>
                            </div>
                        )}
                    </SheetHeader>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 font-sans">
                    {/* VIEW MODE */}
                    {mode === "view" && (
                        <TenantViewMode
                            room={room}
                            tenant={tenant}
                            rental={rental}
                            isBooked={isBooked}
                            rentalStatus={rentalStatus}
                            getPeriodeLabel={getPeriodeLabel}
                            waReminderUrl={waReminderUrl}
                        />
                    )}

                    {/* VIEW MODE - Upcoming Bookings Queue */}
                    {mode === "view" && (
                        <UpcomingBookingsTimeline
                            upcomingBookings={upcomingBookings}
                            getPeriodeLabel={getPeriodeLabel}
                        />
                    )}

                    {/* SEWA MODE */}
                    {mode === "sewa" && (
                        <TenantSewaMode
                            sewaForm={sewaForm}
                            setSewaForm={setSewaForm}
                            tenantInputMode={tenantInputMode}
                            setTenantInputMode={setTenantInputMode}
                            selectedExistingTenantId={selectedExistingTenantId}
                            setSelectedExistingTenantId={setSelectedExistingTenantId}
                            allTenants={allTenants}
                        />
                    )}

                    {/* RENEW MODE */}
                    {mode === "renew" && (
                        <TenantRenewMode
                            rental={rental}
                            rentalStatus={rentalStatus}
                            renewMonths={renewMonths}
                            setRenewMonths={setRenewMonths}
                        />
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="p-8 bg-white border-t border-border font-sans">
                    <TenantSheetFooter
                        mode={mode}
                        setMode={setMode}
                        isBooked={isBooked}
                        tenantExists={!!tenant}
                        loading={loading}
                        handleBooking={handleBooking}
                        handleSewa={handleSewa}
                        handleActivateBooking={handleActivateBooking}
                        handleRenew={handleRenew}
                        setShowCheckoutConfirm={setShowCheckoutConfirm}
                    />
                </div>
            </SheetContent>

            <ConfirmModal
                isOpen={showCheckoutConfirm}
                onClose={() => setShowCheckoutConfirm(false)}
                onConfirm={async () => {
                    await handleCheckout();
                    setShowCheckoutConfirm(false);
                }}
                loading={loading}
                title={isBooked ? "Batalkan Booking?" : "Selesaikan Sewa?"}
                description={isBooked ? `Apakah Anda yakin ingin membatalkan booking ${tenant?.Nama} di Kamar ${room?.No_Kamar}?` : `Apakah Anda yakin ingin menyelesaikan masa sewa ${tenant?.Nama} di Kamar ${room?.No_Kamar}?`}
            />
        </Sheet>
    );
}
