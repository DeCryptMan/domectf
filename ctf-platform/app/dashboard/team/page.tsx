'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Hash, LogOut, Copy, CheckCircle, UserPlus, Shield, Key, AlertOctagon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TeamPage() {
  const { data: userData, isLoading } = useSWR('/api/auth/me', fetcher);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('join');
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  if (isLoading) return <div className="p-12 font-mono text-accent animate-pulse tracking-widest text-sm">&gt; LOADING TEAM DATA...</div>;
  
  const user = userData?.user;
  const isCaptain = user?.id === user?.team?.captainId || user?.role === 'CAPTAIN';

  // === UI: УЖЕ В КОМАНДЕ ===
  if (user?.teamId && user.team) {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(user.team.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = async () => {
      if(!confirm('Are you sure you want to leave this team?')) return;
      await fetch('/api/team/leave', { method: 'POST' });
      window.location.reload();
    };

    const handleDelete = async () => {
      const confirmText = prompt(`CONFIRM DELETION.\nTo dissolve team "${user.team.name}", type its name below:`);
      if (confirmText !== user.team.name) {
        if (confirmText) alert('Name does not match.');
        return;
      }
      
      setLoading(true);
      const res = await fetch('/api/team/delete', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      } else {
        const json = await res.json();
        alert(json.error);
        setLoading(false);
      }
    };

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER CARD */}
        <div className="relative border border-accent/20 bg-accent/5 p-8 overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-accent/10 blur-[100px] rounded-full group-hover:bg-accent/20 transition-all duration-1000" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <h2 className="text-xs font-mono text-accent uppercase tracking-widest">Team Profile</h2>
                {isCaptain && <span className="bg-accent text-white text-[9px] px-2 py-0.5 rounded-full font-bold">CAPTAIN</span>}
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">{user.team.name}</h1>
              <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                <span>ID: <span className="text-white select-all">{user.team.id.slice(0, 8)}...</span></span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-accent transition-colors" onClick={copyToClipboard}>
                  {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'COPIED' : 'COPY NAME'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
               <div className="text-4xl font-bold text-white font-mono tabular-nums">{user.team.score.toLocaleString()}</div>
               <div className="text-[10px] uppercase text-text-muted tracking-[0.2em]">Total Score</div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Member List */}
           <div className="md:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-accent"/> TEAM MEMBERS</h3>
                 <span className="text-xs font-mono text-text-muted">{user.team.members?.length || 1} Total</span>
              </div>
              
              <div className="grid gap-3">
                 {user.team.members && user.team.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-panel border border-white/5 hover:border-accent/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 flex items-center justify-center font-bold text-sm bg-white/5 border border-white/10 ${member.id === user.team.captainId ? 'text-yellow-500 border-yellow-500/50' : 'text-text-muted'}`}>
                             {member.id === user.team.captainId ? <Shield className="w-4 h-4"/> : member.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                             <div className={`font-mono font-bold ${member.id === user.id ? 'text-white' : 'text-text-main'}`}>
                                {member.username} {member.id === user.id && <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded ml-2">YOU</span>}
                             </div>
                             <div className="text-[10px] text-text-muted uppercase tracking-wider">
                                {member.id === user.team.captainId ? 'Team Captain' : 'Member'}
                             </div>
                          </div>
                       </div>
                       <div className="text-sm font-mono text-white font-bold tabular-nums">
                          {member.score?.toLocaleString() || 0} PTS
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Actions Panel */}
           <div className="space-y-6">
              <div className="bg-panel border border-white/10 p-6 space-y-6">
                 <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4">Management</h3>
                 
                 <button onClick={copyToClipboard} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 text-xs font-mono text-text-main transition-colors border border-transparent hover:border-white/20 group">
                    <span className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-accent" /> INVITE MEMBERS</span>
                    <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                 </button>

                 {!isCaptain && (
                    <div className="pt-4 border-t border-white/5">
                        <button onClick={handleLeave} className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest transition-colors border border-red-500/20 hover:border-red-500/50">
                           <LogOut className="w-4 h-4" /> LEAVE TEAM
                        </button>
                    </div>
                 )}

                 {/* CAPTAIN ZONE */}
                 {isCaptain && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                        <div className="text-[10px] text-red-500 font-mono flex items-center gap-2">
                           <AlertOctagon className="w-3 h-3" /> CAPTAIN CONTROLS
                        </div>
                        <button 
                           onClick={handleDelete}
                           disabled={loading}
                           className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-red-900/20"
                        >
                           {loading ? 'DELETING...' : (
                              <><Trash2 className="w-4 h-4" /> DELETE TEAM</>
                           )}
                        </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // === UI: СОЗДАНИЕ / ВХОД ===
  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const endpoint = activeTab === 'create' ? '/api/team/create' : '/api/team/join';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      await mutate('/api/auth/me'); 
      window.location.reload(); 
    } else {
      const json = await res.json();
      alert(json.error || 'OPERATION FAILED');
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* TAB SWITCHER */}
        <div className="flex mb-8 border-b border-white/10">
          <button onClick={() => setActiveTab('join')} className={`flex-1 pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-all ${activeTab === 'join' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-white'}`}>
            Join Team
          </button>
          <button onClick={() => setActiveTab('create')} className={`flex-1 pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-all ${activeTab === 'create' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-white'}`}>
            Create Team
          </button>
        </div>

        <form onSubmit={handleAction} className="space-y-6 bg-panel border border-white/10 p-8 relative overflow-hidden group">
          {/* Tech Corners */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-accent/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-accent/30" />
          
          <div className="space-y-4 relative z-10">
            {/* NAME INPUT */}
            <div className="space-y-2">
                <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold">
                {activeTab === 'create' ? 'Team Name' : 'Existing Team Name'}
                </label>
                <div className="relative">
                {activeTab === 'create' ? <Plus className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" /> : <Hash className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />}
                <Input 
                    className="pl-10 bg-black/50 border-white/10 focus:border-accent font-mono text-sm py-3"
                    placeholder={activeTab === 'create' ? "My Team" : "Enter team name..."}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                />
                </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-2">
                <label className="text-[10px] uppercase text-text-muted tracking-widest font-bold flex justify-between">
                   Access Code
                   <span className="text-accent/50 text-[9px]">{activeTab === 'create' ? '(OPTIONAL)' : '(IF REQUIRED)'}</span>
                </label>
                <div className="relative">
                <Key className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
                <Input 
                    type="password"
                    className="pl-10 bg-black/50 border-white/10 focus:border-accent font-mono text-sm py-3"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                </div>
            </div>
          </div>

          <Button disabled={loading} className="w-full py-6 bg-white text-black hover:bg-accent hover:text-white font-black text-xs tracking-[0.2em] transition-all uppercase relative overflow-hidden mt-6">
            {loading ? 'PROCESSING...' : activeTab === 'create' ? 'CREATE TEAM' : 'JOIN TEAM'}
          </Button>
        </form>
      </div>
    </div>
  );
}