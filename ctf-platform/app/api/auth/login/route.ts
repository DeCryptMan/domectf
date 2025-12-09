import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth'; // Хеширование берем из auth
import { signJWT } from '@/lib/token';       // JWT берем из token

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signJWT({ id: user.id, role: user.role, teamId: user.teamId });
    
    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set('token', token, { httpOnly: true, path: '/' });
    
    return response;
  } catch (e) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}