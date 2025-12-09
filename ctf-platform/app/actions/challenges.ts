'use server';

import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

// Схема валидации (дублируем тут или импортируем из lib/validators, если создал)
const SubmitFlagSchema = z.object({
  challengeId: z.string().uuid(),
  flag: z.string().min(1, "Flag cannot be empty"),
});

// Простой Rate Limiter (в памяти)
// В продакшене лучше заменить на Redis (например, @upstash/ratelimit)
const rateLimit = new Map<string, { count: number; time: number }>();

export async function submitFlagAction(prevState: any, formData: FormData) {
  // 1. Извлекаем данные из FormData
  const rawData = {
    challengeId: formData.get('challengeId'),
    flag: formData.get('flag'),
  };

  // 2. Валидация Zod
  const validated = SubmitFlagSchema.safeParse(rawData);
  
  if (!validated.success) {
    // Возвращаем первую ошибку валидации
    return { error: validated.error.issues[0].message };
  }
  
  const { challengeId, flag } = validated.data;

  // 3. Проверка авторизации
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const userPayload = await verifyJWT(token || '');
  
  if (!userPayload) {
    return { error: 'Unauthorized: Session expired' };
  }
  
  const userId = userPayload.id as string;

  // 4. Rate Limiting (по IP)
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const userRate = rateLimit.get(ip) || { count: 0, time: now };
  
  // Сброс счетчика раз в минуту
  if (now - userRate.time > 60000) { 
    userRate.count = 0; 
    userRate.time = now; 
  }
  
  // Лимит: 10 попыток в минуту
  if (userRate.count > 10) {
    return { error: 'Rate limit exceeded. Cooldown active.' };
  }
  
  userRate.count++;
  rateLimit.set(ip, userRate);

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // Ищем задачу
      const challenge = await tx.challenge.findUnique({ where: { id: challengeId } });
      if (!challenge) throw new Error('Challenge not found');

      // Получаем юзера для проверки команды
      const user = await tx.user.findUnique({ where: { id: userId } });
      
      // Проверяем, решал ли кто-то из команды
      const existingSolve = await tx.solve.findFirst({
        where: {
          challengeId,
          user: user.teamId ? { teamId: user.teamId } : { id: userId }
        }
      });

      if (existingSolve) throw new Error('Already solved by your unit');
      
      // Сравнение флага
      if (flag.trim() !== challenge.flagHash) throw new Error('Incorrect flag');

      // Запись решения
      await tx.solve.create({
        data: { userId, challengeId }
      });

      // Начисление очков команде
      if (user.teamId) {
        await tx.team.update({
          where: { id: user.teamId },
          data: { score: { increment: challenge.points } }
        });
      }

      return challenge.points;
    });

    // 5. ВАЖНО: Сбрасываем кэш
    // Это заставляет UI обновиться мгновенно без полной перезагрузки страницы
    revalidatePath(`/dashboard/challenges/${challengeId}`); // Обновить страницу задачи
    revalidatePath('/dashboard/challenges'); // Обновить список задач (галочки)
    revalidatePath('/dashboard'); // Обновить виджеты на главной
    
    return { success: true, points: result };

  } catch (e: any) {
    return { error: e.message };
  }
}