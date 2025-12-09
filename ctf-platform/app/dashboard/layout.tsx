import { ReactNode } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/token';
import { redirect } from 'next/navigation';
import BannedScreen from '@/components/BannedScreen';
import BanChecker from '@/components/BanChecker'; // <--- ИМПОРТИРУЕМ CHECKER

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/auth/login');
  
  const payload = await verifyJWT(token);
  if (!payload) redirect('/auth/login');

  // 1. Проверка при ЗАГРУЗКЕ страницы (Server Side)
  // Чтобы не ждать 2 секунды при первом заходе
  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: { 
      banned: true,
      team: { select: { disqualified: true } }
    }
  });

  if (user?.banned) return <BannedScreen type="banned" />;
  if (user?.team?.disqualified) return <BannedScreen type="disqualified" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-black">
      {/* 2. Живая проверка в фоне (Client Side) */}
      <BanChecker /> 

      <Sidebar />
      <main className="pl-64">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}