import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Разрешаем 100MB для Server Actions
    },
  },
  // Если используешь API Routes (как мы сейчас), лимит настраивается там или в Nginx (если на VPS)
  // Но для локальной разработки и Vercel этого конфига часто недостаточно для API, 
  // поэтому мы не будем использовать bodyParser в API роуте.
};

export default nextConfig;