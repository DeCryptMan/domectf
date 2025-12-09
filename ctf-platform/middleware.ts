// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/token';

// 1. СПИСОК ЗАПРЕЩЕННЫХ USER-AGENTS (СКАНЕРЫ)
const BLACKLIST_AGENTS = [
  'sqlmap',       // SQL Injection tool
  'nikto',        // Server scanner
  'curb',         // Brute-force tool
  'nmap',         // Network scanner
  'nessus',       // Vulnerability scanner
  'dirbuster',    // Directory bruteforce
  'gobuster',     // Directory bruteforce
  'wpscan',       // Wordpress scanner
  'burpcollaborator', // Burp Suite
  'acunetix',     // Vuln scanner
  'netsparker',   // Vuln scanner
  'python-requests', // Боты на питоне
  'aiohttp',      // Асинхронные боты
  'httpx',        // Go http tool
  'wget',         // Часто используется для скачивания
  'curl',         // Часто используется для проверки
];

// 2. СПИСОК ПОДОЗРИТЕЛЬНЫХ ПУТЕЙ И РАСШИРЕНИЙ
// Если кто-то ищет это в Next.js приложении — это атака.
const SUSPICIOUS_PATTERNS = [
  '/.env',
  '/wp-admin',
  '/phpmyadmin',
  '/.git',
  '/admin/config.php',
  '/actuator/health',
  '/api/v1/debug',
  '.php', 
  '.pl', 
  '.cgi', 
  '.jsp', 
  '.sh', 
  '.bak', 
  '.sql'
];

export default async function middleware(req: NextRequest) {
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
  const path = req.nextUrl.pathname.toLowerCase();

  // ==========================================================
  // ЭТАП 1: АКТИВНАЯ ЗАЩИТА (ACTIVE DEFENSE)
  // Выполняется ДО проверки авторизации!
  // ==========================================================

  // Проверка A: Сигнатура сканера в User-Agent
  const isScanner = BLACKLIST_AGENTS.some(agent => userAgent.includes(agent));
  
  // Проверка B: Поиск уязвимых путей
  const isAttackPath = SUSPICIOUS_PATTERNS.some(pattern => path.includes(pattern));

  // Проверка C: Специфичные заголовки сканеров (Burp, Acunetix)
  const suspiciousHeader = req.headers.get('X-Scanner') || req.headers.get('X-Acunetix-Request');

  if (isScanner || isAttackPath || suspiciousHeader) {
    console.log(`>>> [SECURITY BLOCK] ATTACK DETECTED: ${path} [UA: ${userAgent}]`);
    
    // ПЕРЕНАПРАВЛЯЕМ НА БАН (Rewrite)
    // Используем rewrite, чтобы URL в браузере хакера не менялся,
    // но сервер выполнял код бана.
    const reason = isScanner ? 'SCANNER_SIGNATURE' : 'SUSPICIOUS_PATH';
    return NextResponse.rewrite(new URL(`/api/security/ban?reason=${reason}`, req.url));
  }

  // ==========================================================
  // ЭТАП 2: АВТОРИЗАЦИЯ И РОЛИ
  // ==========================================================

  const token = req.cookies.get('token')?.value;
  // Не проверяем токен на статических файлах и API бана, чтобы не грузить систему
  const isPublicApi = path.startsWith('/api/security') || path.startsWith('/api/auth');
  const verified = (token && !isPublicApi) ? await verifyJWT(token) : null;

  // 1. Защита Dashboard (Нужен логин)
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!verified) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // 2. Защита Admin (Нужна роль ADMIN)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!verified || (verified as any).role !== 'ADMIN') {
      // Если не админ — кидаем в обычный дашборд
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 3. Редирект авторизованных пользователей со страниц входа
  if ((req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/auth/register') && verified) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher: Применяется ко всем путям, КРОМЕ статики (_next/static, favicon, images)
  // Это важно, чтобы защита работала на корлевом уровне (например, при запросе /admin.php)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};