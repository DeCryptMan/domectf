import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/token';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = await verifyJWT(token || '');

  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: { id: true, teamId: true }
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      points: true,
      author: true,
      fileUrl: true, // <--- ВАЖНО: Добавили это поле
      solves: {
        where: user.teamId 
          ? { user: { teamId: user.teamId } }
          : { userId: user.id },
        select: { 
          id: true,
          user: { select: { username: true } }
        },
        take: 1
      }
    }
  });

  if (!challenge) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  const solvedData = challenge.solves[0];

  return NextResponse.json({
    ...challenge,
    solved: !!solvedData,
    solvedBy: solvedData?.user.username || null
  });
}