'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Scan, AlertOctagon, Fingerprint, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

// Fake terminal logs for effect
const AUTH_LOGS = [
  "> ESTABLISHING SECURE CHANNEL...",
  "> HANDSHAKE PROTOCOL: INITIATED",
  "> VERIFYING BIOMETRICS...",
  "> DECRYPTING CREDENTIALS...",
  "> ACCESS GRANTED."
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS, ERROR
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('PROCESSING');
    setError('');
    setLogs([]);

    // Simulate Terminal Output
    for (let i = 0; i < AUTH_LOGS.length - 1; i++) {
      setLogs(prev => [...prev, AUTH_LOGS[i]]);
      await new Promise(r => setTimeout(r, 400)); // Delay between lines
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      setLogs(prev => [...prev, AUTH_LOGS[AUTH_LOGS.length - 1]]);
      setStatus('SUCCESS');
      setTimeout(() => router.push('/dashboard'), 800);
    } else {
      setStatus('ERROR');
      setError('ACCESS DENIED: INVALID CREDENTIALS');
      setLogs([]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-mono selection:bg-accent selection:text-white">
      
      {/* BACKGROUND: RADAR SCAN */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_transparent_300deg,_#1f6feb10_360deg)] animate-[spin_10s_linear_infinite] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_70%)]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#1f6feb 1px, transparent 1px), linear-gradient(to right, #1f6feb 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* HOLOGRAPHIC CARD */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 relative overflow-hidden group">
          
          {/* Decorative Borders */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          
          <div className="p-8 relative">
            {/* Header Icon */}
            <div className="flex flex-col items-center mb-8">
               <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                  <div className={`absolute inset-0 border-2 border-dashed border-accent/30 rounded-full animate-[spin_10s_linear_infinite] ${status === 'PROCESSING' ? 'border-accent' : ''}`} />
                  <div className={`absolute inset-2 border border-accent/20 rounded-full ${status === 'PROCESSING' ? 'animate-ping opacity-20' : ''}`} />
                  <Fingerprint className={`w-10 h-10 text-accent transition-all duration-300 ${status === 'PROCESSING' ? 'animate-pulse blur-[1px]' : ''}`} />
               </div>
               <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase">Identity Verify</h1>
               <div className="flex items-center gap-2 text-[10px] text-text-muted mt-2 uppercase">
                  <span className={`w-2 h-2 rounded-full ${status === 'ERROR' ? 'bg-red-500' : status === 'SUCCESS' ? 'bg-green-500' : 'bg-accent'} animate-pulse`} />
                  System Secure v4.2
               </div>
            </div>

            {/* Terminal Output Overlay */}
            <AnimatePresence>
              {status === 'PROCESSING' || status === 'SUCCESS' ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-black/80 border border-accent/20 p-4 text-[10px] text-accent/80 font-mono leading-relaxed"
                >
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                  <div className="animate-pulse">_</div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-red-500/10 border-l-2 border-red-500 flex items-center gap-3 text-red-400 text-xs uppercase tracking-wider">
                  <AlertOctagon className="w-4 h-4" />
                  {error}
               </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity duration-500 ${status === 'PROCESSING' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
               <div className="group relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-focus-within:bg-accent transition-colors" />
                  <div className="pl-4">
                    <label className="block text-[10px] text-text-muted uppercase tracking-widest mb-1">Agent Identifier</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 py-2 text-white text-sm focus:border-accent focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="USER@CYBERDOME.NET"
                        required
                    />
                  </div>
                  <Scan className="absolute right-2 top-6 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
               </div>

               <div className="group relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-focus-within:bg-accent transition-colors" />
                  <div className="pl-4">
                    <label className="block text-[10px] text-text-muted uppercase tracking-widest mb-1">Passphrase</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 py-2 text-white text-sm focus:border-accent focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="••••••••••••"
                        required
                    />
                  </div>
                  <Lock className="absolute right-2 top-6 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
               </div>

               <button 
                  type="submit" 
                  disabled={status === 'PROCESSING'}
                  className="w-full group relative overflow-hidden bg-white/5 border border-white/10 hover:border-accent hover:bg-accent/10 transition-all p-4"
               >
                  <div className="absolute inset-0 w-full h-full bg-accent/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                  <div className="relative flex items-center justify-center gap-3 text-xs font-bold tracking-[0.2em] text-white uppercase">
                     <span>Establish Link</span>
                     <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
               </button>
            </form>

            <div className="mt-8 pt-4 border-t border-white/5 text-center">
               <Link href="/auth/register" className="text-[10px] text-text-muted hover:text-accent transition-colors uppercase tracking-widest">
                  [ Request New Clearance ]
               </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}