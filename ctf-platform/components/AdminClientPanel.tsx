'use client';

import { useState, useTransition, useActionState } from 'react';
import { Search, RefreshCw, Trash2, Plus, FileCode, Database, List, Upload, X } from 'lucide-react';
import { toggleUserBan, toggleTeamDisqualify, deleteChallenge, createChallenge } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button'; 
import { Input } from '@/components/ui/Input';   

// --- BADGE COMPONENT ---
function StatusBadge({ type, children }: { type: 'success' | 'danger' | 'warning', children: React.ReactNode }) {
  const styles = {
    success: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]",
    danger: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
  };
  return <span className={`flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border w-fit backdrop-blur-md ${styles[type]}`}>{children}</span>;
}

export default function AdminClientPanel({ users, teams, challenges, logs }: { users: any[], teams: any[], challenges: any[], logs: any[] }) {
  const [activeTab, setActiveTab] = useState<'users' | 'teams' | 'challenges' | 'logs'>('users');
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  // Создание задачи
  const [formState, formAction] = useActionState(createChallenge, null);
  const [isCreating, setIsCreating] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null); // Для отображения имени выбранного файла

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search));
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const filteredChallenges = challenges.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleDeleteChallenge = (id: string) => {
    if(!confirm('CRITICAL WARNING: DELETING THIS CHALLENGE WILL REMOVE ALL ASSOCIATED FLAGS. PROCEED?')) return;
    startTransition(() => deleteChallenge(id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
    else setFileName(null);
  };

  return (
    <div className="space-y-6">
      {/* TABS CONTROLS */}
      <div className="flex flex-col xl:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-sm w-full xl:w-auto">
          {[
            { id: 'users', label: 'Operatives', icon: null },
            { id: 'teams', label: 'Squadrons', icon: null },
            { id: 'challenges', label: 'Inject Protocol', icon: Database },
            { id: 'logs', label: 'Audit Logs', icon: List },
          ].map((tab: any) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-accent text-black shadow-[0_0_20px_rgba(0,255,127,0.3)]' : 'text-zinc-500 hover:text-white'}`}
            >
              {tab.icon && <tab.icon className="w-3 h-3" />} {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'logs' && (
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="QUERY DATABASE..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-white/10 pl-10 pr-4 py-2 text-xs focus:border-accent/50 focus:outline-none transition-all placeholder:text-zinc-700 font-mono text-white"
            />
          </div>
        )}
      </div>

      <div className="bg-zinc-900/20 border border-white/5 overflow-hidden min-h-[500px] relative">
        {/* Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-10 h-10 animate-spin text-accent" />
            <div className="text-accent font-mono text-xs tracking-widest animate-pulse">PROCESSING REQUEST...</div>
          </div>
        )}

        {/* 1. USERS */}
        {activeTab === 'users' && (
           <table className="w-full text-left text-[11px]">
             <thead className="bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
               <tr><th className="p-4">User</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
             </thead>
             <tbody className="divide-y divide-white/5">{filteredUsers.map(user => (
               <tr key={user.id} className={`transition-all ${user.banned ? 'bg-red-950/10' : 'hover:bg-white/5'}`}>
                   <td className="p-4 font-bold text-white">{user.username}</td>
                   <td className="p-4">{user.banned ? <StatusBadge type="danger">BANNED</StatusBadge> : <StatusBadge type="success">ACTIVE</StatusBadge>}</td>
                   <td className="p-4 text-right"><button onClick={() => startTransition(() => toggleUserBan(user.id, user.banned))} className="text-red-500 border border-red-500/30 px-3 py-1 hover:bg-red-500 hover:text-white transition-all uppercase font-bold">Toggle</button></td>
               </tr>
           ))}</tbody></table>
        )}

        {/* 2. TEAMS */}
        {activeTab === 'teams' && (
           <table className="w-full text-left text-[11px]">
             <thead className="bg-white/5 text-zinc-500 font-bold uppercase tracking-widest">
               <tr><th className="p-4">Team</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
             </thead>
             <tbody className="divide-y divide-white/5">{filteredTeams.map(team => (
               <tr key={team.id} className={`transition-all ${team.disqualified ? 'bg-amber-950/10' : 'hover:bg-white/5'}`}>
                   <td className="p-4 font-bold text-white">{team.name}</td>
                   <td className="p-4">{team.disqualified ? <StatusBadge type="warning">DQ</StatusBadge> : <StatusBadge type="success">ACTIVE</StatusBadge>}</td>
                   <td className="p-4 text-right"><button onClick={() => startTransition(() => toggleTeamDisqualify(team.id, team.disqualified))} className="text-amber-500 border border-amber-500/30 px-3 py-1 hover:bg-amber-500 hover:text-white transition-all uppercase font-bold">Toggle</button></td>
               </tr>
           ))}</tbody></table>
        )}

        {/* 3. CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xs font-bold text-accent uppercase tracking-widest">Active Protocols</h2>
               <button onClick={() => setIsCreating(!isCreating)} className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                 {isCreating ? 'CANCEL' : 'INJECT NEW'} <Plus className="w-3 h-3" />
               </button>
            </div>
            
            {isCreating && (
              <form action={formAction} className="mb-8 p-6 bg-black/50 border border-accent/20 animate-in slide-in-from-top-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <Input name="title" placeholder="Operation Name" className="bg-zinc-900 border-zinc-800" required />
                    <select name="category" className="w-full bg-zinc-900 border border-zinc-800 text-xs p-3 text-white focus:border-accent outline-none">
                        <option value="WEB">WEB</option>
                        <option value="CRYPTO">CRYPTO</option>
                        <option value="PWN">PWN</option>
                        <option value="REV">REVERSE</option>
                        <option value="FORENSIC">FORENSIC</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input name="points" type="number" placeholder="Points Value" className="bg-zinc-900 border-zinc-800" required />
                    <Input name="flag" placeholder="flag{secret}" className="bg-zinc-900 border-zinc-800 font-mono text-accent" required />
                 </div>
                 
                 {/* FILE UPLOAD FIELD */}
                 <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold">Data Packet (Optional)</label>
                    <div className="relative group">
                        <input 
                            type="file" 
                            name="file" 
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                        />
                        <div className={`w-full bg-zinc-900 border border-dashed border-zinc-700 p-4 flex items-center justify-center gap-3 transition-colors group-hover:border-accent group-hover:bg-accent/5 ${fileName ? 'border-accent text-accent' : 'text-zinc-500'}`}>
                            {fileName ? (
                                <><FileCode className="w-4 h-4" /> {fileName}</>
                            ) : (
                                <><Upload className="w-4 h-4" /> UPLOAD FILE PAYLOAD</>
                            )}
                        </div>
                    </div>
                 </div>

                 <textarea name="description" rows={3} className="w-full bg-zinc-900 border border-zinc-800 text-xs p-3 text-white focus:border-accent outline-none font-mono" placeholder="Mission briefing..." required />
                 
                 <Button className="w-full bg-accent text-black hover:bg-white font-bold tracking-widest">DEPLOY TO SERVER</Button>
                 
                 {formState?.error && <p className="text-red-500 text-[10px] font-mono mt-2 flex items-center gap-2"><X className="w-3 h-3"/> {formState.error}</p>}
              </form>
            )}

            <div className="grid gap-2">
               {filteredChallenges.map(challenge => (
                 <div key={challenge.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all group border-l-2 border-transparent hover:border-accent">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-black border border-zinc-800 text-zinc-500"><FileCode className="w-4 h-4" /></div>
                       <div>
                          <div className="font-bold text-white text-xs">{challenge.title}</div>
                          <div className="text-[9px] text-zinc-500 mt-1 flex gap-2">
                             <span>{challenge.category}</span>•<span>{challenge.points} PTS</span>
                             {challenge.fileUrl && <span className="text-accent flex items-center gap-1">• FILE ATTACHED</span>}
                          </div>
                       </div>
                    </div>
                    <button onClick={() => handleDeleteChallenge(challenge.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* 4. LOGS */}
        {activeTab === 'logs' && (
           <div className="p-0">
              <div className="p-4 border-b border-white/5 bg-black/20 text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex justify-between"><span>Live Security Feed</span><span className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> RECORDING</span></div>
              <div className="divide-y divide-white/5 font-mono text-[10px]">{logs.map((log) => (
                    <div key={log.id} className="p-3 flex items-center gap-4 hover:bg-white/5 transition-colors">
                       <span className="text-zinc-600">{new Date(log.createdAt).toLocaleTimeString()}</span><span className="text-accent font-bold">{log.user.username}</span><span className="text-zinc-500">solved</span><span className="text-white px-1 py-0.5 bg-white/10 rounded">{log.challenge.title}</span>
                    </div>
                 ))}</div>
           </div>
        )}
      </div>
    </div>
  );
}