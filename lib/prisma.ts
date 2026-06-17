// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ✅ Remove the unused globalForPrisma declaration
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

let prismaClient: PrismaClient | undefined;

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
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

// ✅ Lazy getter function - only creates connection when called
export function getPrismaClient() {
  if (!prismaClient) {
    prismaClient = createPrismaClient();
  }
  return prismaClient;
}

// ✅ Proxy for backward compatibility
export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// ✅ Clean up function
export async function disconnectPrisma() {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = undefined;
  }
}

export default prisma;