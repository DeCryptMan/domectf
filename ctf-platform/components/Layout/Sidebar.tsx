'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Trophy, Target, Users, LogOut, Terminal, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [versionId, setVersionId] = useState('v.1.0.4');

  const menu = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Challenges', href: '/dashboard/challenges', icon: Target }, // Было Operations
    { name: 'Rankings', href: '/dashboard/scoreboard', icon: Trophy },   // Было Scoreboard
    { name: 'Team', href: '/dashboard/team', icon: Users },              // Было My Unit
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <aside className="w-64 border-r border-white/10 bg-black/90 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-50">
      
      {/* BRANDING */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-white/5">
        <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm">
           <Terminal className="w-4 h-4 text-black" />
        </div>
        <div>
           <h1 className="font-bold text-white tracking-tight text-base leading-none">CYBER<span className="text-accent">DOME</span></h1>
           <p className="text-[10px] text-text-muted font-mono mt-1 uppercase tracking-wider">Training Platform</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-md transition-all group ${
                isActive 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-white'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER / USER */}
      <div className="p-4 border-t border-white/10 bg-black/40">
         <div className="flex flex-col gap-2">
            <div className="text-[10px] text-text-muted font-mono flex justify-between px-1">
                <span>SYSTEM STATUS</span>
                <span className="text-green-500">ONLINE</span>
            </div>
            
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-md transition-colors text-xs font-medium"
            >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span> {/* Было Disconnect */}
            </button>
         </div>
         
         <div className="mt-4 text-[9px] text-center text-text-muted/40 font-mono">
            BUILD: {versionId}
         </div>
      </div>
    </aside>
  );
}