import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  // Если нет токена, считаем что не забанен (пусть middleware разбирается с логином)
  if (!token) return NextResponse.json({ banned: false, disqualified: false });

  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.json({ banned: false, disqualified: false });

  // Максимально быстрый запрос - выбираем только булевы значения
  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: { 
      banned: true,
      team: { 
        select: { disqualified: true } 
      }
    }
  });

  return NextResponse.json({ 
    banned: user?.banned || false,
    disqualified: user?.team?.disqualified || false
  });
}