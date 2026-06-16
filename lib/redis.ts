import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

// For local development without Redis, you can use a simple Map
// export const cache = new Map();