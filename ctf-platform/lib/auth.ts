import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function hashFlag(flag: string) {
  return crypto.createHash('sha256').update(flag).digest('hex');
}