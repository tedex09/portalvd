// Simple in-memory cache replacement for Redis
class MemoryCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  async set(key: string, value: any, expireSeconds: number = 300): Promise<void> {
    const expires = Date.now() + (expireSeconds * 1000);
    this.cache.set(key, { data: value, expires });
  }

  async delete(key: string): Promise<void> {
    // Handle wildcard patterns
    if (key.includes('*')) {
      const pattern = key.replace(/\*/g, '');
      const keysToDelete = Array.from(this.cache.keys()).filter(k => k.includes(pattern));
      keysToDelete.forEach(k => this.cache.delete(k));
    } else {
      this.cache.delete(key);
    }
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }

  // Clean expired entries periodically
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  constructor() {
    // Clean expired entries every 5 minutes
    setInterval(() => this.cleanExpired(), 5 * 60 * 1000);
  }
}

const memoryCache = new MemoryCache();

export const cacheGet = async (key: string) => {
  return memoryCache.get(key);
};

export const cacheSet = async (key: string, value: any, expireSeconds = 300) => {
  return memoryCache.set(key, value, expireSeconds);
};

export const cacheDelete = async (key: string) => {
  return memoryCache.delete(key);
};

export const cacheFlush = async () => {
  return memoryCache.flush();
};

export default memoryCache;