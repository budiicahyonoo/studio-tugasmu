import { z } from "zod";

export const rupiahSchema = z.coerce.number().int().min(0).max(2147483647);
export const orderIndexSchema = z.coerce.number().int().min(0).max(100000);
export const internalRoutes = [
  "/",
  "/simulasi",
  "/layanan",
  "/tarif",
  "/turnitin",
  "/ulasan",
  "/faq",
  "/privacy",
  "/terms",
];

/** @param {string|null|undefined} value */
export function safeDestination(value) {
  if (!value) return true;
  if (internalRoutes.includes(value.split(/[?#]/)[0])) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "wa.me" &&
      /^\/[0-9]{9,15}$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export const faqSchema = z
  .object({
    pertanyaan: z.string().trim().min(5).max(250),
    jawaban: z.string().trim().min(5).max(6000),
    labelTombol: z.string().trim().max(80),
    tujuanTombol: z.string().trim().max(500).refine(safeDestination),
    urutan: orderIndexSchema,
    tampil: z.boolean(),
  })
  .refine((data) => Boolean(data.labelTombol) === Boolean(data.tujuanTombol));

/** @param {string} context @param {unknown} error */
export function publicError(context, error) {
  console.error(
    JSON.stringify({
      event: context,
      code:
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : "UNAVAILABLE",
    }),
  );
}
