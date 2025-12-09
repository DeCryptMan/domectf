import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Отключаем стандартный парсер, чтобы обработать файл вручную (для Next.js < 13.4), 
// но в App Router мы просто читаем formData().

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token || '');
  
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ACCESS DENIED: ROOT PRIVILEGES REQUIRED' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    
    // Извлекаем текстовые данные
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const points = parseInt(formData.get('points') as string);
    const flag = formData.get('flag') as string;
    const author = formData.get('author') as string;
    const file = formData.get('file') as File | null;

    if (!title || !flag || !points) {
      return NextResponse.json({ error: 'Missing critical data payload' }, { status: 400 });
    }

    let fileUrl = null;

    // ЛОГИКА СОХРАНЕНИЯ ФАЙЛА
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Создаем папку, если нет
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {
        // Игнорируем ошибку, если папка есть
      }

      // Генерируем уникальное имя, чтобы не перезатереть
      const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueName);
      
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${uniqueName}`; // Путь для веба
    }

    // Запись в БД
    const challenge = await prisma.challenge.create({
      data: {
        title,
        category: category || 'MISC',
        description,
        points,
        flagHash: flag,
        author: author || 'System',
        fileUrl, // Сохраняем ссылку
      }
    });

    return NextResponse.json({ success: true, id: challenge.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}