'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Target, Users, Terminal, Activity, Lock, Cpu, Globe, Zap, AlertCircle, Trophy, ChevronRight, Server } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// --- 1. VISUAL CORE: MATRIX RAIN ---
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = new Array(columns).fill(1);
    
    // Hex characters + Katakana for that "Cyber" feel
    const chars = '01ABCDEFXYZ'; 

    const draw = () => {
      // Fade out effect (trail)
      ctx.fillStyle = 'rgba(13, 17, 23, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '12px JetBrains Mono';

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        
        // Randomly highlight characters
        const isWhite = Math.random() > 0.98;
        ctx.fillStyle = isWhite ? '#ffffff' : '#1f6feb'; // White or Cyber Blue
        
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen" />;
};

// --- 2. VISUAL CORE: GLITCH TEXT ---
const GlitchText = ({ text }: { text: string }) => {
  return (
    <div className="relative inline-block group">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-accent opacity-0 group-hover:opacity-70 animate-glitch-1 translate-x-[2px]">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-0 group-hover:opacity-70 animate-glitch-2 translate-x-[-2px]">
        {text}
      </span>
    </div>
  );
};

// --- 3. UI COMPONENT: LIVE SCOREBOARD ---
const LiveScoreboard = ({ teams }: { teams: any[] }) => (
  <motion.div 
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
    className="absolute bottom-24 right-6 w-80 z-20 hidden xl:block"
  >
    <div className="bg-bg/90 backdrop-blur-md border-l-2 border-accent/50 overflow-hidden relative">
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
      
      {/* Header */}
      <div className="bg-accent/10 p-3 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2 text-accent text-[10px] font-bold tracking-widest uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Live Rankings
        </div>
        <Trophy className="w-3 h-3 text-accent" />
      </div>
      
      {/* Team List */}
      <div className="divide-y divide-white/5">
        {!teams || teams.length === 0 ? (
          <div className="p-4 text-[10px] font-mono text-text-muted text-center animate-pulse">
            &gt; WAITING FOR DATA...
          </div>
        ) : (
          teams.map((team, idx) => (
            <div key={team.id} className="p-3 flex justify-between items-center font-mono text-xs hover:bg-white/5 transition-colors group cursor-default">
              <div className="flex items-center gap-3">
                <span className={`font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-text-muted'}`}>
                  #{idx + 1}
                </span>
                <span className="text-gray-300 group-hover:text-white transition-colors uppercase tracking-tight">
                  {team.name}
                </span>
              </div>
              <span className="text-accent font-bold tabular-nums">{team.score.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
      
      {/* Footer info */}
      <div className="p-2 bg-black/60 text-[9px] text-text-muted/60 font-mono flex justify-between uppercase">
        <span>Region: Armenia</span>
        <span>Status: Active</span>
      </div>
    </div>
  </motion.div>
);

// --- 4. MAIN COMPONENT ---
export default function LandingHero({ stats, topTeams }: { stats: any, topTeams: any[] }) {
  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden bg-[#050505]">
      
      {/* BACKGROUND LAYERS */}
      <MatrixRain />
      
      {/* Vignette & Noise */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_120%)] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 z-0 pointer-events-none mix-blend-overlay"></div>

      {/* Grid Floor Effect */}
      <div 
        className="absolute bottom-0 w-full h-[50vh] opacity-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #1f6feb 100%)',
          maskImage: 'linear-gradient(to bottom, transparent, black)',
          transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
        }}
      >
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#1f6feb 1px, transparent 1px), linear-gradient(to right, #1f6feb 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* HEADER */}
      <header className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-accent/50 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              <Shield className="w-8 h-8 text-accent relative z-10" />
            </div>
            <div className="flex flex-col leading-none tracking-widest">
              <span className="text-[9px] text-accent font-mono uppercase">National Cybersecurity Platform</span>
              <span className="text-xl font-bold text-white tracking-tighter">CYBERDOME</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-mono text-[10px] text-text-muted uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-text-muted" />
                <span>Region: Yerevan</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-500">System: Online</span>
             </div>
          </div>
        </div>
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 w-full py-20">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT COLUMN (Text) - Span 7 */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 relative"
          >
            {/* Decorative Label */}
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-1 border-l border-accent/50 bg-gradient-to-r from-accent/10 to-transparent">
              <Zap className="w-3 h-3 text-accent" />
              <span className="text-accent font-mono text-[10px] tracking-[0.3em] uppercase">Professional Training Environment</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8 text-white">
              <GlitchText text="ADVANCED" /> <br />
              CYBER <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">DEFENSE</span>
            </h1>
            
            <p className="text-lg text-text-muted mb-12 max-w-xl font-mono leading-relaxed border-l-2 border-white/10 pl-6">
              <span className="text-accent">&gt;</span> Comprehensive platform for cybersecurity skill development.<br/>
              <span className="text-accent">&gt;</span> Focus areas: <span className="text-white">Network Security</span>, <span className="text-white">Forensics</span>, and <span className="text-white">Vulnerability Assessment</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/auth/register" className="relative group overflow-hidden bg-accent px-10 py-5 flex items-center justify-center clip-path-slant">
                <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 font-bold tracking-[0.2em] uppercase text-sm flex items-center gap-3 text-white group-hover:text-black transition-colors">
                  Get Started <Terminal className="w-4 h-4" />
                </span>
              </Link>
              
              <Link href="/auth/login" className="px-10 py-5 border border-white/20 hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-center font-bold tracking-[0.2em] uppercase text-sm group">
                <span className="group-hover:text-accent transition-colors">Login</span>
              </Link>
            </div>
          </motion.div>

          {/* RIGHT COLUMN (HUD Stats) - Span 5 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative perspective-1000"
          >
            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 w-20 h-20 border-t border-r border-accent/30 rounded-tr-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-20 h-20 border-b border-l border-accent/30 rounded-bl-3xl animate-pulse delay-700" />

            <div className="relative bg-panel/20 backdrop-blur-xl border border-white/10 p-1 shadow-2xl">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-accent" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-accent" />
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-accent" />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent" />

              {/* Grid Content */}
              <div className="grid grid-cols-2 divide-x divide-white/5 bg-black/40">
                <div className="divide-y divide-white/5">
                   <StatBlock label="Registered Users" value={stats.users} icon={Users} delay={0.4} />
                   <StatBlock label="Active Teams" value={stats.teams} icon={Target} delay={0.5} />
                </div>
                <div className="divide-y divide-white/5">
                   <StatBlock label="Challenges" value={stats.challenges} icon={Server} delay={0.6} />
                   <StatBlock label="Solutions" value={stats.solves} icon={Lock} delay={0.7} />
                </div>
              </div>
              
              {/* Fake Terminal */}
              <div className="p-4 bg-black/80 border-t border-white/10 font-mono text-[9px] leading-relaxed opacity-70">
                 <div className="text-green-500 flex justify-between"><span>&gt; DATABASE</span><span>[ CONNECTED ]</span></div>
                 <div className="text-blue-500 flex justify-between"><span>&gt; SECURITY</span><span>[ TLS 1.3 ]</span></div>
                 <div className="text-text-muted flex justify-between"><span>&gt; LATENCY</span><span>[ 12 MS ]</span></div>
                 <div className="text-accent mt-1 animate-pulse">&gt; READY_</div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* SCOREBOARD WIDGET */}
      <LiveScoreboard teams={topTeams} />

      {/* FOOTER TICKER */}
      <footer className="border-t border-white/5 bg-black/80 backdrop-blur-md py-2 overflow-hidden z-50">
        <div className="flex items-center gap-12 animate-marquee whitespace-nowrap text-[9px] font-mono text-text-muted/50 uppercase tracking-[0.2em]">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> RESTRICTED ACCESS</span>
           <span>///</span>
           <span>OFFICIAL USE ONLY</span>
           <span>///</span>
           <span>CYBERDOME PLATFORM</span>
           <span>///</span>
           <span>ARMENIA CYBER DEFENSE INITIATIVE</span>
        </div>
      </footer>
      
      {/* GLOBAL STYLES FOR ANIMATIONS */}
      <style jsx global>{`
        .clip-path-slant {
          clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-glitch-1 {
           animation: glitch-1 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENT: STAT BLOCK ---
function StatBlock({ label, value, icon: Icon, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 1 }}
      className="p-8 group hover:bg-white/5 transition-colors cursor-default relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3">
        <Icon className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors duration-300" />
      </div>
      <div className="text-3xl font-bold text-white mb-1 font-mono tracking-tighter tabular-nums group-hover:text-accent transition-colors duration-300">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-mono group-hover:text-white transition-colors duration-300">
        {label}
      </div>
    </motion.div>
  );
}