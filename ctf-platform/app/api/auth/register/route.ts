import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth'; // Хеширование из auth
import { signJWT } from '@/lib/token';     // JWT из token

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, role: 'USER' }
    });

    const token = await signJWT({ id: user.id, role: user.role });
    
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, { httpOnly: true, path: '/' });
    
    return response;
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}