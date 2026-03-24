import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis;

function getClient() {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    redis.on("error", (err) =>
      console.error("[Redis] Cache handler error:", err.message),
    );
  }
  return redis;
}

export default class RedisCache {
  constructor(_options) {}

  async get(key) {
    try {
      const value = await getClient().get(`next:${key}`);
      if (!value) return null;
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      const ttl = ctx?.revalidate ?? 60;
      await getClient().set(`next:${key}`, JSON.stringify(data), "EX", ttl);
    } catch (err) {
      console.error("[Redis] Cache set error:", err);
    }
  }

  async revalidateTag(tag) {
    try {
      const client = getClient();
      let cursor = "0";
      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          "MATCH",
          "next:*",
          "COUNT",
          100,
        );
        cursor = nextCursor;
        for (const key of keys) {
          const value = await client.get(key);
          if (!value) continue;
          try {
            const parsed = JSON.parse(value);
            if (parsed?.tags?.includes(tag)) {
              await client.del(key);
            }
          } catch {}
        }
      } while (cursor !== "0");
    } catch (err) {
      console.error("[Redis] Revalidate tag error:", err);
    }
  }
}
