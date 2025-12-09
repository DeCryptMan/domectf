import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  // Получаем IP (для логов, даже если нет токена)
  const ip = req.headers.get('x-forwarded-for') || 'UNKNOWN';
  const reason = req.nextUrl.searchParams.get('reason') || 'SUSPICIOUS_ACTIVITY';

  console.log(`[SECURITY ALERT] ATTACK DETECTED FROM IP: ${ip} // REASON: ${reason}`);

  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      // БАНИМ ПОЛЬЗОВАТЕЛЯ
      await prisma.user.update({
        where: { id: payload.id as string },
        data: { banned: true }
      });
      console.log(`[SECURITY EXECUTION] USER ${payload.id} BANNED AUTOMATICALLY.`);
    }
  }

  // Возвращаем ошибку, чтобы сбить сканер с толку
  return NextResponse.json(
    { error: 'CRITICAL_SECURITY_VIOLATION', code: '0xDEAD_BEEF' },
    { status: 403 }
  );
}