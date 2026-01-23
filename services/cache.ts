/**
 * Simple in-memory cache with TTL and stale fallback
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleUntil: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number, staleTtl: number): void {
    const now = Date.now();
    this.store.set(key, {
      data,
      timestamp: now,
      staleUntil: now + staleTtl,
    });
  }

  get<T>(key: string, ttl: number): { data: T; isStale: boolean } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    // Fresh data
    if (age < ttl) {
      return { data: entry.data, isStale: false };
    }

    // Stale but within fallback window
    if (now < entry.staleUntil) {
      return { data: entry.data, isStale: true };
    }

    // Expired
    this.store.delete(key);
    return null;
  }

  clear(): void {
    this.store.clear();
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

export const cache = new Cache();
