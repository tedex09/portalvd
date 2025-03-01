import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const cacheGet = async (key: string) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheSet = async (key: string, value: any, expireSeconds = 300) => {
  await redis.setex(key, expireSeconds, JSON.stringify(value));
};

export const cacheDelete = async (key: string) => {
  await redis.del(key);
};

export const cacheFlush = async () => {
  await redis.flushall();
};

export default redis;