import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/token';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SkillRadar, TeamActivityLog } from '@/components/dashboard/Widgets';
import { Shield, Target, Award, Activity, Flag, AlertTriangle, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

// === TYPE DEFINITIONS FOR TYPE SAFETY ===
// Оставляем интерфейсы для справки и возможного расширения
interface ChallengeSolve {
  id: string;
  createdAt: Date;
  challenge: {
    title: string;
    category: string;
    points: number;
  };
}

interface TeamMember {
  id: string;
  username: string;
  solves: ChallengeSolve[];
}

// === DATA FETCHING ===
async function getUserData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) redirect('/auth/login');
  
  const payload = await verifyJWT(token);
  if (!payload) redirect('/auth/login');

  const [user, totalChallenges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.id as string },
      include: {
        team: {
          include: {
            members: {
              select: {
                id: true,
                username: true,
                solves: {
                  take: 5,
                  orderBy: { createdAt: 'desc' },
                  include: { challenge: true }
                }
              }
            }
          }
        },
        solves: { 
          include: { challenge: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    prisma.challenge.count()
  ]);

  if (!user) redirect('/auth/login');
  return { user, totalChallenges };
}

export default async function DashboardPage() {
  const { user, totalChallenges } = await getUserData();
  const totalScore = user.team ? user.team.score : 0;
  
  // 1. DATA PROCESSING FOR RADAR
  const categoryStats: Record<string, number> = {};
  
  // FIX: Явно указываем тип any для solve, чтобы избежать ошибки TS7006
  user.solves.forEach((solve: any) => {
    const cat = solve.challenge.category || 'MISC';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  const maxSolves = Math.max(...Object.values(categoryStats), 1);
  const radarData = Object.entries(categoryStats).map(([subject, count]) => ({
    subject: subject.toUpperCase(),
    A: (count / maxSolves) * 100,
    fullMark: 100,
    count: count
  }));

  if (radarData.length === 0) {
    radarData.push({ subject: 'NO DATA', A: 0, fullMark: 100, count: 0 });
  }

  // 2. DATA PROCESSING FOR ACTIVITY FEED
  let teamActivity: any[] = [];
  if (user.team) {
    // FIX: Явно указываем тип any для member
    user.team.members.forEach((member: any) => {
      // FIX: Явно указываем тип any для solve
      member.solves.forEach((solve: any) => {
        teamActivity.push({
          id: solve.id,
          username: member.username,
          challenge: solve.challenge.title,
          category: solve.challenge.category,
          points: solve.challenge.points,
          time: new Date(solve.createdAt),
          isMe: member.id === user.id
        });
      });
    });
    teamActivity.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 7);
  }

  const rank = user.team 
    ? await prisma.team.count({ where: { score: { gt: user.team.score } } }) + 1 
    : '-';
  const completionRate = totalChallenges > 0 
    ? ((user.solves.length / totalChallenges) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-10">
      
      {/* === HERO BANNER (Responsive) === */}
      <div className="relative p-6 md:p-8 bg-gradient-to-r from-accent/10 via-transparent to-transparent border-l-4 border-accent overflow-hidden rounded-sm">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 text-accent text-[10px] font-mono uppercase tracking-widest mb-1">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> 
                 System Connected
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase mb-2">
                 Welcome, {user.username}
              </h1>
              <p className="text-xs font-mono text-text-muted uppercase tracking-[0.1em] flex flex-wrap items-center gap-3 md:gap-4">
                 <span className="bg-white/5 px-2 py-1 rounded">Role: {user.role}</span>
                 <span className="hidden md:inline text-white/20">|</span>
                 <span>ID: <span className="text-white">{user.id.slice(0, 8)}</span></span>
              </p>
            </div>
            <Shield className="w-12 h-12 md:w-16 md:h-16 text-accent/10 absolute right-4 top-4 md:relative md:right-0 md:top-0 md:text-accent/20" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* === LEFT COLUMN: STATS & ANALYTICS === */}
         <div className="lg:col-span-8 space-y-6">
            
            {/* STAT CARDS GRID (Adaptive 2x2 -> 4x1) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
               <StatCard label="Total Score" value={totalScore} icon={Award} sub="Team Points" delay={0.1} />
               <StatCard label="Solves" value={user.solves.length} icon={Target} sub={`${totalChallenges} Total`} delay={0.2} />
               <StatCard label="Rank" value={rank !== '-' ? `#${rank}` : 'N/A'} icon={Flag} sub="Position" delay={0.3} />
               <StatCard label="Progress" value={`${completionRate}%`} icon={Activity} sub="Completion" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* SKILL RADAR */}
               <div className="bg-panel border border-white/5 relative overflow-hidden flex flex-col min-h-[320px]">
                  <div className="px-4 py-3 bg-white/5 text-[10px] font-mono text-text-muted uppercase border-b border-white/5 flex justify-between items-center">
                    <span>Skills Analysis</span>
                    <Target className="w-3 h-3 opacity-50"/>
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-center">
                    <SkillRadar data={radarData} />
                  </div>
               </div>
               
               {/* TEAM ACTIVITY */}
               <div className="bg-panel border border-white/5 relative overflow-hidden flex flex-col min-h-[320px]">
                  <div className="px-4 py-3 bg-white/5 text-[10px] font-mono text-text-muted uppercase border-b border-white/5 flex justify-between items-center">
                     <span>Activity Log</span>
                     <Activity className="w-3 h-3 text-accent" />
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
                     <TeamActivityLog activities={teamActivity} />
                  </div>
               </div>
            </div>
         </div>

         {/* === RIGHT COLUMN: TEAM STATUS === */}
         <div className="lg:col-span-4 space-y-6">
            <div className={`bg-panel border relative overflow-hidden h-full flex flex-col ${user.team ? 'border-green-500/20' : 'border-red-500/20'}`}>
               
               {/* Header */}
               <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-black/40">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Team Status</span>
                  {user.team ? (
                      <span className="flex items-center gap-1.5 text-green-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> ACTIVE
                      </span>
                  ) : (
                      <span className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold">
                         <span className="w-1.5 h-1.5 rounded-full bg-red-500"/> INACTIVE
                      </span>
                  )}
               </div>

               {user.team ? (
                  <div className="flex-1 p-6 flex flex-col gap-6">
                     <div className="text-center p-6 border border-white/5 bg-white/[0.02] rounded-lg">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 text-accent border border-accent/20">
                            <Users className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter break-words leading-tight">
                            {user.team.name}
                        </h2>
                     </div>
                     
                     <div className="flex-1">
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                           <Users className="w-3 h-3" /> Team Members
                        </p>
                        <div className="space-y-1">
                            {/* FIX: Явно указываем тип any для m */}
                            {user.team.members.map((m: any) => (
                               <div key={m.id} className="flex justify-between items-center text-xs p-2.5 bg-white/5 hover:bg-white/10 transition-colors border-l-2 border-transparent hover:border-accent">
                                  <span className={`font-mono ${m.id === user.id ? "text-white font-bold" : "text-text-muted"}`}>
                                     {m.username} {m.id === user.id && <span className="text-[8px] text-accent ml-1">YOU</span>}
                                  </span>
                                  <span className="font-mono text-[10px] opacity-70">{m.solves.length} Solves</span>
                               </div>
                            ))}
                        </div>
                     </div>
                     
                     <Link href="/dashboard/team" className="block w-full text-center py-3 bg-white text-black hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest transition-all rounded-sm mt-auto">
                        Manage Team
                     </Link>
                  </div>
               ) : (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
                     <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500">
                         <AlertTriangle className="w-8 h-8 opacity-80" />
                     </div>
                     <div>
                        <p className="text-white font-bold mb-1">No Team Assigned</p>
                        <p className="text-xs text-text-muted max-w-[200px] mx-auto leading-relaxed">
                            Join an existing team or create a new one to participate in challenges.
                        </p>
                     </div>
                     <Link href="/dashboard/team" className="px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest rounded-sm">
                        Create / Join Team
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

// === STAT CARD COMPONENT ===
function StatCard({ label, value, icon: Icon, sub, delay }: any) {
   return (
      <div 
        className="bg-panel border border-white/5 p-4 hover:border-accent/40 transition-all duration-300 group relative overflow-hidden rounded-sm" 
        style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
      >
         {/* Hover Gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
         
         <div className="flex justify-between items-start mb-3 relative z-10">
            <Icon className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors duration-300" />
            {sub && <span className="text-[9px] text-white/20 uppercase tracking-wider font-mono">{sub}</span>}
         </div>
         
         <div className="relative z-10">
            <div className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tighter tabular-nums leading-none">
                {value}
            </div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider mt-2 group-hover:text-white transition-colors">
                {label}
            </div>
         </div>
      </div>
   );
}