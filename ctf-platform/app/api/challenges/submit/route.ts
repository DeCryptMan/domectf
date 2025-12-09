import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

const rateLimit = new Map();

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token || '');
  
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate Limiting
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const userRate = rateLimit.get(ip) || { count: 0, time: now };
  if (now - userRate.time > 60000) { userRate.count = 0; userRate.time = now; }
  if (userRate.count > 10) return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  userRate.count++;
  rateLimit.set(ip, userRate);

  const { challengeId, flag } = await req.json();
  const userId = payload.id as string;

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Получаем данные юзера и задачи
      const user = await tx.user.findUnique({ where: { id: userId } });
      const challenge = await tx.challenge.findUnique({ where: { id: challengeId } });
      
      if (!challenge) throw new Error('Challenge not found');

      // 2. ГЛАВНАЯ ПРОВЕРКА: Решена ли задача КОМАНДОЙ?
      const existingSolve = await tx.solve.findFirst({
        where: {
          challengeId,
          user: user.teamId 
            ? { teamId: user.teamId } // Проверяем всю команду
            : { id: userId }          // Или только себя
        }
      });

      if (existingSolve) {
        throw new Error('Already solved by your unit');
      }

      // 3. Проверка флага
      if (flag.trim() !== challenge.flagHash) { 
        throw new Error('Incorrect flag');
      }

      // 4. Записываем решение
      await tx.solve.create({
        data: { userId, challengeId }
      });

      // 5. Начисляем очки команде
      if (user.teamId) {
        await tx.team.update({
          where: { id: user.teamId },
          data: { score: { increment: challenge.points } }
        });
      }

      return challenge;
    });

    return NextResponse.json({ success: true, points: result.points });
  } catch (e: any) {
    if (e.message === 'Incorrect flag') return NextResponse.json({ error: 'Incorrect flag', success: false }, { status: 400 });
    // Если уже решено командой - это не совсем ошибка, но сдавать нельзя
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}