"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import useSWR from "swr";
import { LogOut, Building2, LayoutDashboard, Settings, ChevronLeft, Loader2, Menu, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const kostId = params.kostId as string;
    const { data: kostsData } = useSWR(kostId ? "/api/data/Master_Kost" : null, fetcher);
    const kosts = kostsData?.data || [];
    const currentKost = kosts.find((k: any) => k.ID_Kost === kostId);

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, href: `/${kostId}/dashboard` },
        { label: "Manajemen", icon: Settings, href: `/${kostId}/management` },
        { label: "Finance", icon: Wallet, href: `/${kostId}/finance` },
    ];

    return (
        <header className="h-16 border-b border-border bg-white/70 backdrop-blur-xl flex items-center justify-between px-4 sm:px-10 sticky top-0 z-50">
            {/* Left: Back + Kost Name */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {kostId && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/")}
                            className="text-muted-foreground hover:text-primary transition-all h-9 w-9 rounded-xl shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Project</span>
                                <span className="font-extrabold text-foreground tracking-tight text-xs sm:text-sm truncate">
                                    {currentKost ? currentKost.Nama_Kost : <span className="inline-block h-3 w-16 bg-muted animate-pulse rounded" />}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Center: Nav (Desktop) */}
            {kostId && (
                <nav className="hidden lg:flex items-center gap-1 bg-muted/50 p-1 rounded-2xl border border-border">
                    {navItems.map(({ label, icon: Icon, href }) => {
                        const isActive = pathname === href;
                        return (
                            <Button
                                key={href}
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(href)}
                                className={cn(
                                    "flex items-center gap-2 h-9 px-6 rounded-xl text-xs font-semibold transition-all",
                                    isActive ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                {label}
                            </Button>
                        );
                    })}
                </nav>
            )}

            <div className="flex items-center gap-2 sm:gap-4 relative shrink-0">
                <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-0 sm:gap-3 p-1 sm:pr-4 bg-muted/50 hover:bg-muted transition-all rounded-xl sm:rounded-2xl border border-border group focus:outline-none"
                >
                    <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground transition-transform group-hover:scale-105 shrink-0">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="flex flex-col items-start text-left hidden sm:flex shrink-0">
                        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Admin</span>
                        <span className="text-xs font-bold text-foreground truncate max-w-[100px]">{session?.user?.name || session?.user?.email}</span>
                    </div>
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setProfileMenuOpen(false)}
                        />
                        <div className="absolute top-14 right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-premium z-50 overflow-hidden flex flex-col p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-border">
                                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
                                <p className="text-xs font-bold text-foreground truncate">{session?.user?.email}</p>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="flex items-center gap-3 px-4 py-3 mt-1 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-all rounded-xl text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </>
                )}

                {/* Mobile Menu Toggle */}
                {kostId && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-10 w-10 rounded-xl bg-muted/50 border border-border"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Mobile Nav Dropdown */}
            {kostId && mobileMenuOpen && (
                <div className="absolute top-20 left-0 right-0 bg-white border-b border-border shadow-premium p-4 flex flex-col gap-2 lg:hidden animate-in slide-in-from-top-4 duration-300">
                    {navItems.map(({ label, icon: Icon, href }) => {
                        const isActive = pathname === href;
                        return (
                            <Button
                                key={href}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("justify-start h-12 rounded-xl font-semibold text-sm", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground")}
                                onClick={() => {
                                    router.push(href);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Icon className="w-4 h-4 mr-3" />
                                {label}
                            </Button>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
