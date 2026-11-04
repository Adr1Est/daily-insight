import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/client";
import { getEnv } from "@/lib/env";

// Un único cliente por proceso. En desarrollo se guarda en globalThis para sobrevivir al hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Cliente de Prisma, creado la primera vez que se usa. */
export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const { DATABASE_URL } = getEnv();
  if (!DATABASE_URL) throw new Error("DATABASE_URL no está definida");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
  globalForPrisma.prisma = prisma;
  return prisma;
}
