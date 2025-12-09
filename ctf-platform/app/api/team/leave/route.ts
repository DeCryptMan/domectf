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
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user?.teamId) throw new Error('Not in a team');

      // 1. Выгоняем пользователя (обнуляем teamId)
      await tx.user.update({
        where: { id: userId },
        data: { 
            teamId: null,
            // Если он был капитаном, снимаем лычку (на всякий случай, хотя капитан должен использовать Disband)
            role: user.role === 'CAPTAIN' ? 'USER' : user.role 
        }
      });

      // 2. Если в команде никого не осталось — удаляем её
      const remainingMembers = await tx.user.count({ where: { teamId: user.teamId } });
      if (remainingMembers === 0) {
        await tx.team.delete({ where: { id: user.teamId } });
      }
    });

    // 3. ОБЯЗАТЕЛЬНО: Обновляем токен (убираем из него teamId)
    // Иначе сайт будет думать, что ты все еще в команде до конца сессии
    const newToken = await signJWT({ 
        id: userId, 
        role: payload.role === 'CAPTAIN' ? 'USER' : payload.role as string 
    });
    
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', newToken, { httpOnly: true, path: '/' });

    return response;

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}