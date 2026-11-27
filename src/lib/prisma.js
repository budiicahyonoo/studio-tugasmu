import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis;
const rawUrl = process.env.DATABASE_URL;
let datasourceUrl;
if (rawUrl) {
  const url = new URL(rawUrl);
  url.searchParams.set("connect_timeout", "5");
  url.searchParams.set("pool_timeout", "5");
  datasourceUrl = url.toString();
}
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(datasourceUrl ? { datasourceUrl } : {});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
