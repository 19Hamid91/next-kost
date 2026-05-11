'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, Building2, LayoutDashboard, Settings } from 'lucide-react';

interface Kost {
  ID_Kost: string;
  Nama_Kost: string;
}

export default function Header({ kosts }: { kosts: Kost[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const currentKostId = searchParams.get('kostId') || kosts[0]?.ID_Kost;

  const handleKostChange = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('kostId', id);
    router.push(`/dashboard?${params.toString()}`);
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Management', icon: Settings, href: '/management' },
  ];

  return (
    <header className="h-16 border-b border-white/5 bg-black/70 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Logo + Kost Selector */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-sm">NextKost</span>
        </div>

        <div className="h-5 w-px bg-zinc-800" />

        <Select value={currentKostId} onValueChange={handleKostChange}>
          <SelectTrigger id="select-kost" className="w-[180px] bg-zinc-900/80 border-zinc-800 text-white text-sm rounded-lg h-9">
            <SelectValue placeholder="Pilih Kost" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
            {kosts.map((kost) => (
              <SelectItem key={kost.ID_Kost} value={kost.ID_Kost} className="text-sm">
                {kost.Nama_Kost}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Center: Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + '?');
          return (
            <Button
              key={href}
              id={`nav-${label.toLowerCase()}`}
              variant="ghost"
              size="sm"
              onClick={() => router.push(href)}
              className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm transition-all ${
                isActive 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          );
        })}
      </nav>

      {/* Right: User + Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 rounded-full border border-zinc-800">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <span className="text-xs font-medium text-white hidden sm:block">
            {session?.user?.name || session?.user?.email}
          </span>
        </div>
        <Button 
          id="btn-logout"
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-zinc-500"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
