const requests = new Map<string, { count: number; timestamp: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = requests.get(key);
  if (!entry || now - entry.timestamp > windowMs) {
    requests.set(key, { count: 1, timestamp: now });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((windowMs - (now - entry.timestamp)) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}
