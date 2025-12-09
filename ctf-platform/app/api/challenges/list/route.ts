import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';

// Включаем кэширование на 60 секунд (ISR)
// Это снизит нагрузку на базу в 60 раз при активном CTF
export const revalidate = 60; 

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token || '');

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Получаем полные данные юзера, чтобы узнать teamId
  // Этот запрос быстрый, так как ищем по ID
  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: { id: true, teamId: true }
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // ЛОГИКА: Если есть команда -> ищем решения команды. Если нет -> только свои.
  const solveWhereClause = user.teamId 
    ? { user: { teamId: user.teamId } } // Любой участник команды
    : { userId: user.id };              // Только я

  const challenges = await prisma.challenge.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      points: true,
      solves: {
        where: solveWhereClause, 
        select: { id: true }
      }
    },
    orderBy: { points: 'asc' }
  });

  // Форматируем для фронтенда (превращаем массив solves в булево solved)
  const formatted = challenges.map((c: any) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    points: c.points,
    solved: c.solves.length > 0 // Если массив не пустой, значит решено
  }));

  return NextResponse.json(formatted);
}