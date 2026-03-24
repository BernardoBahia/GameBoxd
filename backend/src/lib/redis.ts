import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let client: Redis | null = null;

function getClient(): Redis {
  if (!client) {
    client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    client.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });

    client.on("connect", () => {
      console.log("[Redis] Connected");
    });
  }
  return client;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await getClient().get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (err) {
    console.error("[Redis] Get error:", err);
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 300,
): Promise<void> {
  try {
    await getClient().set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error("[Redis] Set error:", err);
  }
}

export async function deleteCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await getClient().del(...keys);
  } catch (err) {
    console.error("[Redis] Delete error:", err);
  }
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    const redis = getClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    console.error("[Redis] Delete pattern error:", err);
  }
}

export default getClient;
