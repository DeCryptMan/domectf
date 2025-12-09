import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-change-it');

export async function signJWT(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

// === НОВАЯ ФУНКЦИЯ ДЛЯ БЕЗОПАСНОЙ УСТАНОВКИ КУК ===
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  
  cookieStore.set('token', token, {
    httpOnly: true,     // JS не может прочитать куку (защита от XSS)
    secure: process.env.NODE_ENV === 'production', // Только HTTPS в проде
    sameSite: 'strict', // Защита от CSRF
    maxAge: 60 * 60 * 24, // 1 день
    path: '/',
  });
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}