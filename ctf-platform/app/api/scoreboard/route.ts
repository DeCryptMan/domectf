import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { score: 'desc' },
    select: { id: true, name: true, score: true },
    take: 100
  });
  return NextResponse.json({ teams });
}