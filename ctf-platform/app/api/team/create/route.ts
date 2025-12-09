import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT, signJWT } from '@/lib/token'; // signJWT нужен для обновления токена роли
import { hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token || '');
  
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, password } = await req.json();
  const userId = payload.id as string;

  if (!name || name.length < 3) {
    return NextResponse.json({ error: 'Name too short' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user?.teamId) throw new Error('You are already in a team');

      const existing = await tx.team.findUnique({ where: { name } });
      if (existing) throw new Error('Team name taken');

      // Хешируем пароль, если он есть
      let passwordHash = null;
      if (password && password.trim().length > 0) {
        passwordHash = await hashPassword(password);
      }

      // Создаем команду
      const team = await tx.team.create({
        data: {
          name,
          captainId: userId,
          passwordHash, // Сохраняем хеш
        }
      });

      // Обновляем пользователя: даем команду и роль КАПИТАНА
      await tx.user.update({
        where: { id: userId },
        data: { 
          teamId: team.id,
          role: 'CAPTAIN' 
        }
      });

      return { team, role: 'CAPTAIN' };
    });

    // Обновляем JWT токен, так как роль изменилась
    const newToken = await signJWT({ id: userId, role: 'CAPTAIN', teamId: result.team.id });
    const response = NextResponse.json({ success: true, teamId: result.team.id });
    response.cookies.set('token', newToken, { httpOnly: true, path: '/' });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}