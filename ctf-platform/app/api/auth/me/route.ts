import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/token';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

  // 1. Получаем данные
  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: { 
      id: true, 
      username: true, 
      email: true, 
      role: true, 
      teamId: true,
      team: {
        include: {
          members: {
            select: { 
              id: true, 
              username: true,
              solves: {
                select: {
                  challenge: {
                    select: {
                      points: true
                    }
                  }
                }
              }
            }
          }
        }
      } 
    }
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // 2. Трансформируем данные: Считаем сумму очков для каждого участника
  const enhancedUser = {
    ...user,
    team: user.team ? {
      ...user.team,
      members: user.team.members
        // FIX: Добавлен тип :any для member
        .map((member: any) => ({
          id: member.id,
          username: member.username,
          // FIX: Добавлены типы :any для acc и solve
          score: member.solves.reduce((acc: any, solve: any) => acc + solve.challenge.points, 0)
        }))
        // FIX: Добавлены типы :any для a и b
        .sort((a: any, b: any) => b.score - a.score)
    } : null
  };

  return NextResponse.json({ user: enhancedUser });
}