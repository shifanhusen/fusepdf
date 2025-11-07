// Unified storage abstraction for Vercel KV or Upstash Redis
// Prefers Upstash if UPSTASH_REDIS_REST_URL/TOKEN are present

// Detect Upstash REST vars OR generic REDIS_URL (Vercel Redis integration) for compatibility.
let useUpstash = Boolean(
  (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
  process.env.REDIS_URL // Some integrations expose just REDIS_URL for client libs
);
let kvClient = null;
let redisClient = null;

async function getKV() {
  if (kvClient) return kvClient;
  const mod = await import('@vercel/kv');
  kvClient = mod.kv;
  return kvClient;
}

async function getRedis() {
  if (redisClient) return redisClient;
  const { Redis } = await import('@upstash/redis');
  // Prefer explicit Upstash REST vars; otherwise attempt REDIS_URL with token (if any)
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;
  if (!url) throw new Error('No Redis URL found in environment');
  redisClient = new Redis({ url, token });
  return redisClient;
}

export const storage = {
  async lpush(key, value) {
    if (useUpstash) {
      const redis = await getRedis();
      return redis.lpush(key, value);
    }
    const kv = await getKV();
    return kv.lpush(key, value);
  },
  async lrange(key, start, stop) {
    if (useUpstash) {
      const redis = await getRedis();
      return redis.lrange(key, start, stop);
    }
    const kv = await getKV();
    return kv.lrange(key, start, stop);
  },
  async del(key) {
    if (useUpstash) {
      const redis = await getRedis();
      return redis.del(key);
    }
    const kv = await getKV();
    return kv.del(key);
  },
  async rpush(key, ...values) {
    if (useUpstash) {
      const redis = await getRedis();
      return redis.rpush(key, ...values);
    }
    const kv = await getKV();
    return kv.rpush(key, ...values);
  }
};
