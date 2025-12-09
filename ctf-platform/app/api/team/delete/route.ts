import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT, signJWT } from '@/lib/token';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token || '');
  
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = payload.id as string;

  try {
    await prisma.$transaction(async (tx: any) => {
      const team = await tx.team.findFirst({
        where: { captainId: userId }
      });

      if (!team) throw new Error('You are not a captain of any active unit');

      // 1. Освобождаем всех участников (сбрасываем teamId и роль капитана)
      // Сначала сбрасываем роль КАПИТАНА у текущего юзера
      await tx.user.update({
        where: { id: userId },
        data: { role: 'USER' }
      });

      // Сбрасываем teamId у всех
      await tx.user.updateMany({
        where: { teamId: team.id },
        data: { teamId: null }
      });

      // 2. Удаляем команду
      await tx.team.delete({
        where: { id: team.id }
      });
    });

    // Обновляем токен (удаляем teamId, ставим роль USER)
    const newToken = await signJWT({ id: userId, role: 'USER' });
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', newToken, { httpOnly: true, path: '/' });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}