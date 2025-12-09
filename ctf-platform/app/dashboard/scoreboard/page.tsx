import { getCachedScoreboard } from '@/lib/cache';
import { Trophy, Users, Shield, Clock } from 'lucide-react';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // ВАЖНО: Страница сама динамическая (проверяет куки), но ДАННЫЕ внутри кэшируются!

export default async function ScoreboardPage() {
  // Проверка авторизации (быстрая, без БД)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token || !(await verifyJWT(token))) redirect('/auth/login');

  // ТЯЖЕЛЫЙ ЗАПРОС - ТЕПЕРЬ ЧЕРЕЗ КЭШ
  const teams = await getCachedScoreboard();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500 animate-pulse" />
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Global Ranking</h1>
          </div>
          <p className="text-xs font-mono text-text-muted flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             LIVE FEED // UPDATE INTERVAL: 60s
          </p>
        </div>
        
        <div className="text-right hidden md:block">
           <div className="text-2xl font-mono font-bold text-white tabular-nums">{teams.length}</div>
           <div className="text-[10px] text-text-muted uppercase tracking-wider">Active Units</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-panel border border-white/10 relative overflow-hidden">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-text-muted border-b border-white/10">
                     <th className="p-4 w-16 text-center">Rank</th>
                     <th className="p-4">Unit Designation</th>
                     <th className="p-4">Commander</th>
                     <th className="p-4 text-center">Operatives</th>
                     <th className="p-4 text-right">Score</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {/* ИСПРАВЛЕНИЕ: Добавлены типы :any и :number */}
                  {teams.map((team: any, index: number) => {
                     const isTop3 = index < 3;
                     const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-text-muted';
                     
                     return (
                        <tr key={team.id} className="hover:bg-white/5 transition-colors group">
                           <td className="p-4 text-center font-mono font-bold text-lg">
                              <span className={rankColor}>#{index + 1}</span>
                           </td>
                           <td className="p-4">
                              <div className="font-bold text-white group-hover:text-accent transition-colors">
                                 {team.name}
                              </div>
                              {isTop3 && <div className="text-[9px] text-yellow-500/70 uppercase tracking-wider">Top Tier</div>}
                           </td>
                           <td className="p-4 font-mono text-xs text-text-main flex items-center gap-2">
                              <Shield className="w-3 h-3 text-text-muted" />
                              {team.captain?.username || 'Unknown'}
                           </td>
                           <td className="p-4 text-center font-mono text-xs text-text-muted">
                              <span className="flex items-center justify-center gap-1">
                                 <Users className="w-3 h-3" /> {team._count.members}
                              </span>
                           </td>
                           <td className="p-4 text-right">
                              <div className="font-mono font-bold text-accent text-lg tabular-nums">
                                 {team.score.toLocaleString()}
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
         
         {teams.length === 0 && (
            <div className="p-12 text-center text-text-muted font-mono text-xs">
               NO DATA AVAILABLE. SYSTEM STANDBY.
            </div>
         )}
      </div>
    </div>
  );
}