import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

const databaseUrl = process.env.DATABASE_URL;
const datasourceUrl =
  databaseUrl && databaseUrl.includes("?")
    ? `${databaseUrl}&connect_timeout=5&pool_timeout=5`
    : `${databaseUrl || ""}?connect_timeout=5&pool_timeout=5`;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;