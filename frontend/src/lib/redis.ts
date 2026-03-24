import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    client.on("error", (err) => {
      console.error("[Redis] Frontend error:", err.message);
    });

    client.on("connect", () => {
      console.log("[Redis] Frontend connected");
    });
  }
  return client;
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const value = await getRedisClient().get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setInCache(
  key: string,
  value: unknown,
  ttlSeconds = 300,
): Promise<void> {
  try {
    await getRedisClient().set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error("[Redis] Frontend set error:", err);
  }
}
