'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, UserPlus, FileCode, CheckSquare, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      const json = await res.json();
      setError(json.error || 'REGISTRATION REJECTED');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative py-12 px-4 font-mono selection:bg-accent selection:text-white">
      
      {/* BACKGROUND: DIGITAL NOISE */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1f6feb15_0%,_#050505_80%)]" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl z-10"
      >
        {/* HEADER SECTION */}
        <div className="flex items-end justify-between mb-6 border-b border-white/10 pb-4">
          <div>
             <div className="flex items-center gap-2 text-accent text-[10px] tracking-[0.3em] uppercase mb-2">
                <Terminal className="w-3 h-3" />
                <span>Form 10-A: Personnel</span>
             </div>
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase">New Operator</h1>
          </div>
          <div className="hidden sm:block text-right">
             <div className="text-[10px] text-text-muted uppercase tracking-widest">Clearance Level</div>
             <div className="text-xl font-bold text-white">UNCLASSIFIED</div>
          </div>
        </div>

        {/* MAIN FORM CONTAINER */}
        <div className="bg-panel/40 backdrop-blur-md border border-white/10 relative">
           
           {/* High-tech corners */}
           <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-accent" />
           <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-accent" />

           <div className="p-8">
              {error && (
                 <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 flex items-start gap-3">
                    <div className="w-1 h-full bg-red-500" />
                    <div>
                       <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Critical Error</div>
                       <div className="text-red-300/70 text-[10px]">{error}</div>
                    </div>
                 </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 
                 {/* LEFT COLUMN */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-accent uppercase tracking-widest">Codename / Alias</label>
                       <input 
                          type="text" 
                          className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white text-sm focus:border-accent focus:bg-accent/5 focus:outline-none transition-all placeholder:text-white/10"
                          placeholder="NEO_01"
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-accent uppercase tracking-widest">Secure Comms (Email)</label>
                       <input 
                          type="email" 
                          className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white text-sm focus:border-accent focus:bg-accent/5 focus:outline-none transition-all placeholder:text-white/10"
                          placeholder="AGENT@SECURE.NET"
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                       />
                    </div>
                 </div>

                 {/* RIGHT COLUMN */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-accent uppercase tracking-widest">Access Key (Password)</label>
                       <div className="relative">
                          <input 
                             type="password" 
                             className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white text-sm focus:border-accent focus:bg-accent/5 focus:outline-none transition-all placeholder:text-white/10"
                             onChange={(e) => setFormData({...formData, password: e.target.value})}
                             required
                          />
                          <div className="absolute right-3 top-3.5 text-[10px] text-green-500 font-bold hidden group-valid:block">SECURE</div>
                       </div>
                    </div>

                    <div className="pt-2">
                       <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5">
                          <CheckSquare className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <p className="text-[9px] text-text-muted leading-relaxed">
                             I acknowledge that this platform monitors all activity. Any attempt to breach the core infrastructure (outside of designated challenges) will result in immediate termination of access.
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* FULL WIDTH BUTTON */}
                 <div className="md:col-span-2 pt-4 border-t border-white/5">
                    <button 
                       type="submit" 
                       disabled={loading}
                       className="w-full bg-white text-black hover:bg-accent hover:text-white transition-all font-bold py-4 text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 group"
                    >
                       {loading ? 'ENCRYPTING DATA...' : (
                          <>
                             <UserPlus className="w-4 h-4" />
                             Initialize Profile
                             <div className="w-1 h-1 bg-black group-hover:bg-white rounded-full ml-2 animate-pulse" />
                          </>
                       )}
                    </button>
                 </div>
              </form>
           </div>
           
           {/* BOTTOM BAR */}
           <div className="bg-black/60 p-3 flex justify-between items-center text-[9px] text-text-muted border-t border-white/5">
              <span>ENCRYPTION: AES-256</span>
              <Link href="/auth/login" className="hover:text-accent transition-colors flex items-center gap-2">
                 ALREADY OPERATIONAL? <span className="text-white border-b border-white/20">LOGIN</span>
              </Link>
           </div>
        </div>
      </motion.div>
    </div>
  );
}