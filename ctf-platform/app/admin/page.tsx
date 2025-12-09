import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/token';
import { redirect } from 'next/navigation';
import { ShieldAlert, Users, Ban, AlertTriangle, Terminal, Lock, Activity, Database } from 'lucide-react';
import AdminClientPanel from '../../components/AdminClientPanel'; // Теперь этот импорт будет работать

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/auth/login');
  
  const payload = await verifyJWT(token);
  if (!payload || payload.role !== 'ADMIN') {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 space-y-4">
        <ShieldAlert className="w-24 h-24" />
        <h1 className="text-2xl font-mono tracking-widest uppercase">Access Denied // Level 5 Security</h1>
      </div>
    );
  }

  const [users, teams, challenges, recentSolves] = await Promise.all([
    prisma.user.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      include: { team: { select: { name: true } } } 
    }),
    prisma.team.findMany({ 
      orderBy: { score: 'desc' },
      include: { captain: { select: { username: true } }, _count: { select: { members: true } } }
    }),
    prisma.challenge.findMany({ 
      orderBy: { points: 'asc' },
      include: { _count: { select: { solves: true } } }
    }),
    prisma.solve.findMany({ 
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { username: true } },
        challenge: { select: { title: true, category: true, points: true } }
      }
    })
  ]);

  const stats = {
    totalUsers: users.length,
    bannedUsers: users.filter((u: any) => u.banned).length,
    totalTeams: teams.length,
    disqualifiedTeams: teams.filter((t: any) => t.disqualified).length,
    activeChallenges: challenges.length,
    // FIX: Явная типизация для reduce, чтобы исправить ошибку TS7006
    totalSolves: challenges.reduce((acc: number, c: any) => acc + (c._count?.solves || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-red-900 selection:text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-red-600 flex items-center justify-center rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <Lock className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase">System Administration</h1>
            </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Operatives" value={stats.totalUsers} icon={Users} color="text-blue-500" />
          <StatCard label="Units" value={stats.totalTeams} icon={Terminal} color="text-green-500" />
          <StatCard label="Challenges" value={stats.activeChallenges} icon={Database} color="text-purple-500" />
          <StatCard label="Total Breaches" value={stats.totalSolves} icon={Activity} color="text-cyan-500" />
          <StatCard label="Banned" value={stats.bannedUsers} icon={Ban} color="text-red-500" alert={stats.bannedUsers > 0} />
          <StatCard label="Frozen Units" value={stats.disqualifiedTeams} icon={AlertTriangle} color="text-amber-500" alert={stats.disqualifiedTeams > 0} />
        </div>

        <AdminClientPanel users={users} teams={teams} challenges={challenges} logs={recentSolves} />
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, alert }: any) {
  return (
    <div className={`bg-zinc-900/30 border ${alert ? 'border-red-500/30 bg-red-900/10' : 'border-white/5'} p-4 relative overflow-hidden group`}>
      <div className="flex justify-between items-start mb-2">
        <Icon className={`w-5 h-5 ${color} opacity-70`} />
        {alert && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
      </div>
      <div className="text-2xl font-bold tracking-tighter tabular-nums">{value}</div>
      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}