import React from "react";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { CalendarClock, Loader2, CheckCircle, RotateCcw } from "lucide-react";

interface TenantSheetFooterProps {
    mode: "view" | "sewa" | "renew";
    setMode: (mode: "view" | "sewa" | "renew") => void;
    isBooked: boolean;
    tenantExists: boolean;
    loading: boolean;
    handleBooking: () => Promise<void>;
    handleSewa: () => Promise<void>;
    handleActivateBooking: () => Promise<void>;
    handleRenew: () => Promise<void>;
    setShowCheckoutConfirm: (show: boolean) => void;
}

export default function TenantSheetFooter({ mode, setMode, isBooked, tenantExists, loading, handleBooking, handleSewa, handleActivateBooking, handleRenew, setShowCheckoutConfirm }: TenantSheetFooterProps) {
    return (
        <SheetFooter>
            {/* SEWA MODE */}
            {mode === "sewa" && (
                <div className="flex gap-3 w-full">
                    <Button
                        id="btn-booking-kamar"
                        onClick={handleBooking}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 h-11 sm:h-12 font-bold rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarClock className="w-4 h-4 mr-2" />}
                        Booking (DP)
                    </Button>
                    <Button
                        id="btn-sewa-kamar"
                        onClick={handleSewa}
                        disabled={loading}
                        className="flex-1 h-11 sm:h-12 font-bold rounded-xl shadow-xl shadow-orange-500/10 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Sewa Aktif
                    </Button>
                </div>
            )}

            {/* VIEW MODE — BOOKING */}
            {mode === "view" && isBooked && (
                <div className="flex gap-3 w-full">
                    <Button
                        id="btn-checkout-booking"
                        onClick={() => setShowCheckoutConfirm(true)}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 h-11 sm:h-12 font-bold rounded-xl text-muted-foreground cursor-pointer"
                    >
                        Batalkan Booking
                    </Button>
                    <Button
                        id="btn-activate-booking"
                        onClick={handleActivateBooking}
                        disabled={loading}
                        className="flex-1 h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-500/10 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Aktifkan (Check-in)
                    </Button>
                </div>
            )}

            {/* VIEW MODE — ACTIVE */}
            {mode === "view" && !isBooked && tenantExists && (
                <div className="flex gap-3 w-full">
                    <Button
                        id="btn-perpanjang-sewa"
                        onClick={() => setMode("renew")}
                        variant="outline"
                        className="flex-1 h-11 sm:h-12 font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" /> Perpanjang
                    </Button>
                    <Button
                        id="btn-selesai-sewa"
                        onClick={() => setShowCheckoutConfirm(true)}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1 h-11 sm:h-12 font-bold rounded-xl shadow-xl shadow-destructive/10 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {loading ? "Memproses..." : "Selesaikan Sewa"}
                    </Button>
                </div>
            )}

            {/* RENEW MODE */}
            {mode === "renew" && (
                <div className="flex gap-3 w-full">
                    <Button
                        variant="ghost"
                        onClick={() => setMode("view")}
                        className="flex-1 h-11 sm:h-12 font-bold rounded-xl text-muted-foreground cursor-pointer"
                    >
                        Batal
                    </Button>
                    <Button
                        id="btn-konfirmasi-perpanjang"
                        onClick={handleRenew}
                        disabled={loading}
                        className="flex-1 h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/10 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                        {loading ? "Menyimpan..." : "Konfirmasi"}
                    </Button>
                </div>
            )}
        </SheetFooter>
    );
}
