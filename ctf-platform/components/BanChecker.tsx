'use client';
import useSWR from 'swr';
import BannedScreen from './BannedScreen';

// Простая функция для fetch
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BanChecker() {
  // SWR автоматически опрашивает сервер
  const { data } = useSWR('/api/auth/status', fetcher, {
    refreshInterval: 2000, // ПРОВЕРЯТЬ КАЖДЫЕ 2 СЕКУНДЫ (Очень быстро)
    dedupingInterval: 1000,
    focusThrottleInterval: 0, // Проверять даже если вкладка не активна (опционально)
  });

  // Если бан
  if (data?.banned) {
    return <BannedScreen type="banned" />;
  }

  // Если дисквалификация
  if (data?.disqualified) {
    return <BannedScreen type="disqualified" />;
  }

  // Если все чисто - ничего не рендерим
  return null;
}