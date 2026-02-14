/**
 * Rate limit store abstraction for API routes.
 * In-memory by default; implement RedisStore for multi-instance production.
 */

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry): Promise<void>;
  incr(key: string, windowMs: number): Promise<{ count: number; resetTime: number }>;
}

const memoryStore: Record<string, RateLimitEntry> = {};

export const inMemoryStore: RateLimitStore = {
  async get(key: string): Promise<RateLimitEntry | null> {
    return memoryStore[key] ?? null;
  },

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    memoryStore[key] = entry;
  },

  async incr(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = memoryStore[key];
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const resetTime = windowStart + windowMs;

    if (!existing || existing.resetTime < now) {
      const entry: RateLimitEntry = { count: 1, resetTime };
      memoryStore[key] = entry;
      return { count: 1, resetTime };
    }

    existing.count += 1;
    return { count: existing.count, resetTime: existing.resetTime };
  },
};

const CLEANUP_THRESHOLD = 10000;
const CLEANUP_PROBABILITY = 0.01;

function maybeCleanup(): void {
  const keys = Object.keys(memoryStore);
  if (keys.length <= CLEANUP_THRESHOLD && Math.random() >= CLEANUP_PROBABILITY) {
    return;
  }
  const now = Date.now();
  keys.forEach((k) => {
    if (memoryStore[k].resetTime < now) {
      delete memoryStore[k];
    }
  });
}

let store: RateLimitStore = inMemoryStore;

export function getRateLimitStore(): RateLimitStore {
  return store;
}

export function setRateLimitStore(s: RateLimitStore): void {
  store = s;
}

export function getRateLimitStoreWithCleanup(): RateLimitStore {
  return {
    ...inMemoryStore,
    async incr(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
      maybeCleanup();
      return inMemoryStore.incr(key, windowMs);
    },
  };
}
