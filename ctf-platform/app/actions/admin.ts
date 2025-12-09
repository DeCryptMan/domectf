'use server';

import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Проверка админа
async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload && payload.role === 'ADMIN';
}

// User & Team Actions (Оставляем без изменений)
export async function toggleUserBan(userId: string, currentStatus: boolean) {
  if (!await checkAdmin()) throw new Error('Unauthorized');
  await prisma.user.update({ where: { id: userId }, data: { banned: !currentStatus } });
  revalidatePath('/admin');
}

export async function toggleTeamDisqualify(teamId: string, currentStatus: boolean) {
  if (!await checkAdmin()) throw new Error('Unauthorized');
  await prisma.team.update({ where: { id: teamId }, data: { disqualified: !currentStatus } });
  revalidatePath('/admin');
}

// Challenge Actions
export async function createChallenge(prevState: any, formData: FormData) {
  if (!await checkAdmin()) return { error: 'Unauthorized Access' };

  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const points = parseInt(formData.get('points') as string);
  const flag = formData.get('flag') as string;
  const description = formData.get('description') as string;
  
  // Обработка файла
  const file = formData.get('file') as File | null;
  let fileUrl = null;

  if (!title || !category || !points || !flag) {
    return { error: 'MISSING REQUIRED FIELDS' };
  }

  try {
    // Сохранение файла, если он есть
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Генерируем уникальное имя файла
      const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const filePath = join(uploadDir, uniqueName);
      
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${uniqueName}`; // Путь для сохранения в БД
    }

    await prisma.challenge.create({
      data: {
        title,
        category,
        points,
        flag, 
        description: description || '',
        fileUrl: fileUrl // Сохраняем URL файла
      }
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard/challenges');
    
    return { success: true };
  } catch (e) {
    console.error('Challenge creation error:', e);
    return { error: 'DATABASE ERROR: FAILED TO INJECT PROTOCOL' };
  }
}

export async function deleteChallenge(id: string) {
  if (!await checkAdmin()) return;
  try {
    await prisma.challenge.delete({ where: { id } });
    revalidatePath('/admin');
    revalidatePath('/dashboard/challenges');
  } catch (e) {
    console.error('Delete failed', e);
  }
}