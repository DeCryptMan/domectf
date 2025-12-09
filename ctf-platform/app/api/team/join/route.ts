import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT, signJWT } from '@/lib/token';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token || '');
  
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, password } = await req.json();
  const userId = payload.id as string;

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user?.teamId) throw new Error('You are already in a team');

      const team = await tx.team.findUnique({ where: { name } });
      if (!team) throw new Error('Team not found');

      // ПРОВЕРКА ПАРОЛЯ
      if (team.passwordHash) {
        if (!password) throw new Error('This unit is protected. Password required.');
        const isValid = await verifyPassword(password, team.passwordHash);
        if (!isValid) throw new Error('Invalid access code');
      }

      await tx.user.update({
        where: { id: userId },
        data: { teamId: team.id }
      });
      
      return team;
    });

    // Обновляем токен (добавляем teamId)
    const newToken = await signJWT({ id: userId, role: payload.role, teamId: result.id });
    const response = NextResponse.json({ success: true, teamName: result.name });
    response.cookies.set('token', newToken, { httpOnly: true, path: '/' });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}