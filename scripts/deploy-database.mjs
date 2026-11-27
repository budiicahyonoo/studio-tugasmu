import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasourceUrl: url });
const run = (args) => {
  try {
    execFileSync(
      process.execPath,
      ["node_modules/prisma/build/index.js", ...args],
      {
        env: { ...process.env, DATABASE_URL: url },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    console.log(
      JSON.stringify({
        operation: args.slice(0, 2).join(" "),
        status: "passed",
      }),
    );
  } catch {
    throw new Error(args.slice(0, 2).join(" ") + " failed");
  }
};
try {
  const before =
    await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = current_schema()`;
  const tables = before.map((row) => row.tablename);
  const countsBefore = await Promise.all(
    ["Pesanan", "Pembayaran", "Portfolio", "Ulasan", "Admin"].map(
      async (name) => [
        name,
        tables.includes(name)
          ? Number(
              (
                await prisma.$queryRawUnsafe(
                  `SELECT COUNT(*)::int AS count FROM "${name}"`,
                )
              )[0].count,
            )
          : 0,
      ],
    ),
  );
  if (tables.includes("Layanan") && !tables.includes("_prisma_migrations"))
    run(["migrate", "resolve", "--applied", "20261126000000_baseline"]);
  run(["migrate", "deploy"]);
  const countsAfter = await Promise.all(
    countsBefore.map(async ([name]) => [
      name,
      Number(
        (
          await prisma.$queryRawUnsafe(
            `SELECT COUNT(*)::int AS count FROM "${name}"`,
          )
        )[0].count,
      ),
    ]),
  );
  console.log(
    JSON.stringify({
      preservedRows:
        JSON.stringify(countsBefore) === JSON.stringify(countsAfter),
      countsBefore,
      countsAfter,
    }),
  );
} catch (error) {
  console.error(
    JSON.stringify({
      status: "failed",
      reason: error.message?.startsWith("migrate")
        ? error.message
        : "Database operation unavailable",
    }),
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
