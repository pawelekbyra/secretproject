import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

// Create a client that uses the native fetch API, which is available in Edge Runtime.
export const redis = new Redis({
  url: url || 'https://mock.upstash.io',
  token: token || 'mock_token',
});
