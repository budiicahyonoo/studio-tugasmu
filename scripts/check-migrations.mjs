import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const rows =
    await prisma.$queryRaw`SELECT migration_name, finished_at, rolled_back_at, logs FROM "_prisma_migrations" WHERE migration_name = '20261127010000_rate_limit' ORDER BY started_at DESC LIMIT 2`;
  console.log(
    JSON.stringify(
      rows.map((row) => ({
        name: row.migration_name,
        finished: Boolean(row.finished_at),
        rolledBack: Boolean(row.rolled_back_at),
        log: row.logs?.slice(0, 1800),
      })),
    ),
  );
} finally {
  await prisma.$disconnect();
}
