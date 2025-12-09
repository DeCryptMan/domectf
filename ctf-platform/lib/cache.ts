import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

// === КЭШИРОВАННЫЙ СКОРБОРД ===
// Обновляется не чаще, чем раз в 60 секунд.
// Даже если 1000 человек обновят страницу, запрос в БД уйдет только один.
export const getCachedScoreboard = unstable_cache(
  async () => {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        score: true,
        updatedAt: true, // Используется для сортировки (кто раньше набрал очки, тот выше)
        captain: {
           select: { username: true } // Получаем имя капитана через связь
        },
        _count: {
           select: { 
             members: true // Считаем количество участников
             // solves: true // УДАЛЕНО: Прямой связи нет, да и не нужно для таблицы
           } 
        }
      },
      orderBy: [
        { score: 'desc' },     // Сначала по очкам (от большего к меньшему)
        { updatedAt: 'asc' }   // При равенстве — кто раньше обновился (решил задачу)
      ],
      take: 100 // Ограничиваем топ-100, чтобы не перегружать рендер
    });

    return teams;
  },
  ['scoreboard-data'], // Уникальный ключ кэша
  { 
    revalidate: 60, // Время жизни кэша в секундах (TTL)
    tags: ['scoreboard'] // Тег для ручного сброса (revalidateTag)
  }
);