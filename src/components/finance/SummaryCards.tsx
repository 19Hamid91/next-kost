"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";
import type { FinanceSummary } from "@/hooks/useFinance";

const formatRupiah = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

interface SummaryCardsProps {
    summary: FinanceSummary | null;
    isLoading: boolean;
}

interface StatCardData {
    label: string;
    value: number;
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
    description: string;
}

function SkeletonCard() {
    return (
        <div className="bg-white/70 rounded-[1.5rem] p-6 border border-border animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-4" />
            <div className="h-8 w-32 bg-muted rounded" />
        </div>
    );
}

export default function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
    const cards: StatCardData[] = [
        {
            label: "Rent Income",
            value: summary?.totalRentIncome ?? 0,
            icon: DollarSign,
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-500/10",
            description: "Active rentals this month",
        },
        {
            label: "DP Received",
            value: summary?.totalDpReceived ?? 0,
            icon: TrendingUp,
            colorClass: "text-blue-600",
            bgClass: "bg-blue-500/10",
            description: "Down payments collected",
        },
        {
            label: "DP Forfeited",
            value: summary?.totalDpForfeited ?? 0,
            icon: TrendingDown,
            colorClass: "text-amber-600",
            bgClass: "bg-amber-500/10",
            description: "Cancelled booking DPs",
        },
        {
            label: "Expenses",
            value: summary?.totalExpenses ?? 0,
            icon: Receipt,
            colorClass: "text-destructive",
            bgClass: "bg-destructive/10",
            description: "Operational costs",
        },
    ];

    const netCashflow = summary?.netCashflow ?? 0;
    const isPositive = netCashflow >= 0;

    return (
        <div className="space-y-6">
            {/* 4 stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {isLoading ? (
                                <SkeletonCard />
                            ) : (
                                <div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-6 border border-border shadow-soft hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{card.label}</p>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.bgClass}`}>
                                            <Icon className={`w-4 h-4 ${card.colorClass}`} />
                                        </div>
                                    </div>
                                    <p className={`text-xl font-extrabold tracking-tight ${card.colorClass}`}>{formatRupiah(card.value)}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{card.description}</p>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Net cashflow bar */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-[1.5rem] px-8 py-5 flex items-center justify-between border ${isPositive ? "bg-emerald-500/5 border-emerald-500/20" : "bg-destructive/5 border-destructive/20"}`}
            >
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Net Cashflow — This Month</p>
                    <p className={`text-2xl font-extrabold tracking-tight mt-1 ${isPositive ? "text-emerald-600" : "text-destructive"}`}>
                        {isLoading ? <span className="inline-block h-8 w-40 bg-muted animate-pulse rounded" /> : `${isPositive ? "+" : ""}${formatRupiah(netCashflow)}`}
                    </p>
                </div>
                {!isLoading && <div className={`text-xs font-bold px-4 py-2 rounded-xl ${isPositive ? "bg-emerald-500/15 text-emerald-700" : "bg-destructive/15 text-destructive"}`}>{isPositive ? "↑ Surplus" : "↓ Deficit"}</div>}
            </motion.div>
        </div>
    );
}
