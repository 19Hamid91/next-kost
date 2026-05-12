'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import useSWR from 'swr';
import { LogOut, Building2, LayoutDashboard, Settings, ChevronLeft, Loader2, Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const kostId = params.kostId as string;
  const { data: kostsData } = useSWR(kostId ? '/api/data/Master_Kost' : null, fetcher);
  const kosts = kostsData?.data || [];
  const currentKost = kosts.find((k: any) => k.ID_Kost === kostId);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: `/${kostId}/dashboard` },
    { label: 'Manajemen', icon: Settings, href: `/${kostId}/management` },
  ];



  return (
    <header className="h-20 border-b border-border bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50 shadow-sm">
      {/* Left: Back + Kost Name */}
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-primary hover:bg-muted px-2 group transition-all"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest ml-1">Kosts</span>
        </Button>

        {kostId && (
          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-tight">Property</span>
                <span className="font-black text-primary tracking-tight text-sm">
                  {currentKost ? currentKost.Nama_Kost : <div className="h-4 w-24 bg-muted animate-pulse rounded" />}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Nav (Desktop) */}
      {kostId && (
        <nav className="hidden lg:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {navItems.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                variant="ghost"
                size="sm"
                onClick={() => router.push(href)}
                className={`flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-slate-900" : "text-slate-400")} />
                {label}
              </Button>
            );
          })}
        </nav>
      )}

      {/* Right: Profile Dropdown */}
      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex items-center gap-2.5 p-1.5 pr-4 bg-muted hover:bg-slate-200 transition-all rounded-2xl border border-border group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-xs font-black text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col items-start text-left hidden sm:flex">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">User</span>
            <span className="text-xs font-black text-primary truncate max-w-[100px]">
              {session?.user?.name || session?.user?.email}
            </span>
          </div>
        </button>

        {/* Profile Dropdown Menu */}
        {profileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setProfileMenuOpen(false)}
            />
            <div className="absolute top-14 right-0 mt-2 w-56 bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-xs font-black text-primary truncate">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 px-4 py-3 mt-1 text-xs font-bold text-destructive hover:bg-destructive/5 transition-all rounded-xl text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="uppercase tracking-widest">Logout</span>
              </button>
            </div>
          </>
        )}

        {/* Mobile Menu Toggle */}
        {kostId && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 rounded-xl bg-slate-50 text-slate-600 border border-slate-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Mobile Nav Dropdown */}
      {kostId && mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-2xl p-4 flex flex-col gap-2 lg:hidden animate-in slide-in-from-top-4 duration-300">
          {navItems.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-12 rounded-xl font-bold text-sm uppercase tracking-wider",
                  isActive ? "bg-slate-900 text-white" : "text-slate-500"
                )}
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
