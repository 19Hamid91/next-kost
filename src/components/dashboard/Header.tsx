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
    <header className="h-20 border-b border-border bg-white/70 backdrop-blur-xl flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
      {/* Left: Back + Kost Name */}
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-primary transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold text-xs uppercase tracking-widest ml-1">Kosts</span>
        </Button>

        {kostId && (
          <div className="flex items-center gap-4">
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-tight">Project</span>
                <span className="font-bold text-foreground tracking-tight text-sm">
                  {currentKost ? currentKost.Nama_Kost : <div className="h-4 w-24 bg-muted animate-pulse rounded" />}
                </span>
              </div>
            </div>
          </div>
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
                  isActive
                    ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
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
          className="flex items-center gap-3 p-1 pr-4 bg-muted/50 hover:bg-muted transition-all rounded-2xl border border-border group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground transition-transform group-hover:scale-105">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col items-start text-left hidden sm:flex">
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Admin</span>
            <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
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
            <div className="absolute top-14 right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-premium z-50 overflow-hidden flex flex-col p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-xs font-bold text-foreground truncate">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
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
                className={cn(
                  "justify-start h-12 rounded-xl font-semibold text-sm",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
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
