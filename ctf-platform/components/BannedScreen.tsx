'use client'; // Обязательно для анимаций и стилей

import { AlertTriangle, Lock, ShieldAlert, AlertOctagon } from "lucide-react";

interface BannedScreenProps {
  type: 'banned' | 'disqualified';
}

export default function BannedScreen({ type }: BannedScreenProps) {
  const isBan = type === 'banned';

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden ${isBan ? 'bg-black text-red-500' : 'bg-black text-amber-500'}`}>
      
      {/* Background Noise & Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div className={`absolute inset-0 bg-[size:50px_50px] pointer-events-none opacity-20 ${
          isBan 
            ? 'bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(245,158,11,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.1)_1px,transparent_1px)]'
      }`} />
      
      <div className={`relative z-10 flex flex-col items-center max-w-3xl text-center p-12 border-y-4 backdrop-blur-xl animate-in zoom-in duration-300 ${
          isBan 
            ? 'border-red-600 bg-red-950/30' 
            : 'border-amber-500 bg-amber-950/30'
      }`}>
        
        <div className="mb-8 relative">
           {isBan ? (
             <>
               <ShieldAlert className="w-32 h-32 text-red-600 animate-pulse" />
               <Lock className="w-10 h-10 text-white absolute bottom-0 right-0 drop-shadow-lg" />
             </>
           ) : (
             <AlertOctagon className="w-32 h-32 text-amber-500 animate-pulse" />
           )}
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase mb-4 text-white glitch-text">
          {isBan ? 'BANNED' : 'FROZEN'}
        </h1>
        
        <div className={`text-2xl md:text-3xl font-mono font-bold tracking-[0.2em] mb-10 border-b-2 pb-6 w-full ${
            isBan ? 'text-red-500 border-red-500/30' : 'text-amber-500 border-amber-500/30'
        }`}>
          {isBan ? 'CONNECTION TERMINATED' : 'UNIT DISQUALIFIED'}
        </div>

        <div className={`space-y-3 text-sm font-mono uppercase tracking-widest text-left mx-auto ${isBan ? 'text-red-400' : 'text-amber-400'}`}>
          <p>&gt; SYSTEM ALERT: {isBan ? 'CRITICAL SECURITY VIOLATION' : 'RULESET VIOLATION DETECTED'}</p>
          <p>&gt; STATUS: {isBan ? 'USER ID BLACKLISTED' : 'UNIT OPERATIONS SUSPENDED'}</p>
          <p>&gt; ACTION: {isBan ? 'IMMEDIATE DISCONNECT' : 'SCOREBOARD FREEZE ACTIVE'}</p>
        </div>

        <div className="mt-16 text-[10px] text-zinc-500 font-mono">
           REF_CODE: {isBan ? '0xDEAD_BEEF' : '0xDQ_FLAG'} // CONTACT ADMINISTRATOR
        </div>
      </div>

      <style jsx>{`
        .glitch-text {
          text-shadow: ${isBan ? '3px 3px 0px #7f1d1d, -3px -3px 0px #000' : '3px 3px 0px #78350f, -3px -3px 0px #000'};
          animation: glitch 2s infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  );
}