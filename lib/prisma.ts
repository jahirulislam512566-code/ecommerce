// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ✅ Only initialize in production, not during build
let prismaClient: PrismaClient | null = null;

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // ✅ Don't throw during build - just return null
    if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
      console.warn("DATABASE_URL not set, skipping Prisma initialization");
      return null;
    }
    throw new Error("DATABASE_URL is not defined");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrismaClient() {
  // ✅ Only create the client if we're not in a build environment
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null as any; // Return null during build
  }

  if (!prismaClient) {
    prismaClient = createPrismaClient();
  }
  return prismaClient;
}

// ✅ Export a proxy that handles null client
export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getPrismaClient();
    if (!client) {
      // Return a no-op function during build
      return async () => {
        console.warn("Prisma client not available during build");
        return null;
      };
    }
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;