import { prisma } from '@/lib/prisma';
import LandingHero from '@/components/LandingHero';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    // Параллельный запрос: Статистика + Топ 5 команд
    const [users, teamsCount, challenges, solves, topTeams] = await Promise.all([
      prisma.user.count(),
      prisma.team.count(),
      prisma.challenge.count(),
      prisma.solve.count(),
      prisma.team.findMany({
        take: 5,
        orderBy: { score: 'desc' },
        select: { id: true, name: true, score: true },
      }),
    ]);

    return {
      stats: { users, teams: teamsCount, challenges, solves },
      topTeams
    };
  } catch (error) {
    console.error("Database connection failed:", error);
    return {
      stats: { users: 0, teams: 0, challenges: 0, solves: 0 },
      topTeams: []
    };
  }
}

export default async function Home() {
  const data = await getData();
  return <LandingHero stats={data.stats} topTeams={data.topTeams} />;
}