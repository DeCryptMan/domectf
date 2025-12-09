import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Удаляем куку (ставим срок действия в прошлое)
  const cookieStore = await cookies();
  cookieStore.set('token', '', { expires: new Date(0), path: '/' });
  
  return response;
}