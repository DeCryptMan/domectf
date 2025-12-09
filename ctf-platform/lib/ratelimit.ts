type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const rateLimits: RateLimitStore = new Map();

export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimits.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  rateLimits.set(ip, record);
  return true;
}