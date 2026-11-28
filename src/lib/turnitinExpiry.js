import { prisma } from "./prisma";

export async function expireExpiredTurnitinPayments({
  database = prisma,
  now = new Date(),
  limit = 100,
} = {}) {
  return database.$transaction(
    async (tx) => {
      const overdue = await tx.pembayaran.findMany({
        where: {
          deletedAt: null,
          status: "MENUNGGU_PEMBAYARAN",
          kedaluwarsaPada: { lte: now },
          pesanan: { deletedAt: null },
        },
        orderBy: [{ kedaluwarsaPada: "asc" }, { id: "asc" }],
        take: limit,
        select: { id: true, pesananId: true },
      });
      if (!overdue.length) return { expired: 0, hasMore: false };

      const paymentIds = overdue.map((payment) => payment.id);
      const orderIds = [
        ...new Set(overdue.map((payment) => payment.pesananId)),
      ];
      const changed = await tx.pembayaran.updateMany({
        where: {
          id: { in: paymentIds },
          deletedAt: null,
          status: "MENUNGGU_PEMBAYARAN",
          kedaluwarsaPada: { lte: now },
        },
        data: { status: "KEDALUWARSA" },
      });
      await tx.pesanan.updateMany({
        where: {
          id: { in: orderIds },
          deletedAt: null,
          status: "MENUNGGU_PEMBAYARAN",
        },
        data: { status: "KEDALUWARSA" },
      });

      return { expired: changed.count, hasMore: overdue.length === limit };
    },
    { isolationLevel: "Serializable" },
  );
}
