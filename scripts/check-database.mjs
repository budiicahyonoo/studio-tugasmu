import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const tables =
    await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = current_schema()`;
  console.log(
    JSON.stringify({
      databaseConnected: true,
      tables: tables.map((row) => row.tablename),
    }),
  );
} catch (error) {
  console.log(
    JSON.stringify({
      databaseConnected: false,
      code: error.code || "UNAVAILABLE",
    }),
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
