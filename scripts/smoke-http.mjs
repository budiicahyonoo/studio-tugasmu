import { readFileSync } from "node:fs";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";
const require = createRequire(import.meta.url);
const {
  encodeReply,
} = require("next/dist/compiled/react-server-dom-webpack/client.node.js");
const prisma = new PrismaClient();
const base = process.env.SMOKE_BASE_URL || "http://localhost:3100";
const reference = JSON.parse(
  readFileSync(".next/server/server-reference-manifest.json", "utf8"),
).node;
const tag = randomBytes(5).toString("hex").toUpperCase();
const records = {
  category: "QA_" + tag,
  requestId: randomUUID(),
  faculty: null,
  service: null,
  packageService: null,
  package: null,
  faq: null,
  rate: null,
};
const checks = [];
function assert(value, name) {
  if (!value) throw new Error(name);
  checks.push(name);
}
const form = (values) => {
  const body = new FormData();
  for (const [key, value] of Object.entries(values))
    body.set(key, String(value));
  return body;
};
function token(sub) {
  const data = Buffer.from(
    JSON.stringify({ sub, exp: Math.floor(Date.now() / 1000) + 300 }),
  ).toString("base64url");
  return (
    data +
    "." +
    createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
      .update(data)
      .digest("base64url")
  );
}
async function action(name, data, cookie, path = "/admin/dashboard") {
  const id = Object.entries(reference).find(
    ([, value]) => value.exportedName === name,
  )?.[0];
  if (!id) throw new Error("Missing action " + name);
  const body = await encodeReply([data]);
  const response = await fetch(base + path, {
    method: "POST",
    headers: {
      "Next-Action": id,
      Origin: base,
      ...(typeof body === "string"
        ? { "Content-Type": "text/plain;charset=UTF-8" }
        : {}),
      ...(cookie ? { Cookie: "admin_session=" + cookie } : {}),
    },
    body,
    redirect: "manual",
  });
  const text = await response.text();
  let result;
  for (const line of text.split("\n")) {
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    try {
      const value = JSON.parse(line.slice(colon + 1));
      if (
        value &&
        typeof value === "object" &&
        ("ok" in value || "error" in value)
      )
        result = value;
    } catch {}
  }
  return { response, result };
}
try {
  const admin = await prisma.admin.findFirst({ select: { id: true } });
  if (!admin || !process.env.ADMIN_SESSION_SECRET)
    throw new Error("Admin credentials are not configured");
  const cookie = token(admin.id);
  if (process.env.ADMIN_SEED_USERNAME && process.env.ADMIN_SEED_PASSWORD) {
    const login = await action("loginAdmin", form({ username: process.env.ADMIN_SEED_USERNAME, password: process.env.ADMIN_SEED_PASSWORD }), null, "/admin/login");
    assert(login.response.status === 303 && login.response.headers.get("set-cookie")?.includes("HttpOnly"), "real password login issues an HttpOnly session");
  }
  for (const route of [
    "/",
    "/simulasi",
    "/layanan",
    "/tarif",
    "/ulasan",
    "/faq",
    "/turnitin",
    "/privacy",
    "/terms",
    "/api/health",
  ]) {
    const response = await fetch(base + route);
    assert(response.status === 200, "public " + route);
    if (route === "/api/health")
      assert(
        (await response.json()).database === "connected",
        "database health",
      );
  }
  const forged = await fetch(base + "/admin/dashboard", {
    headers: { Cookie: "admin_session=true" },
    redirect: "manual",
  });
  assert(
    forged.status === 307 &&
      forged.headers.get("location")?.includes("/admin/login"),
    "forged cookie rejected",
  );
  const removed = await fetch(base + "/admin/dashboard", {
    headers: { Cookie: "admin_session=" + token("missing-qa-admin") },
    redirect: "manual",
  });
  const removedHtml = await removed.text();
  assert(
    removed.status === 307 ||
      (removedHtml.includes("NEXT_REDIRECT") &&
        removedHtml.includes("/admin/login")),
    "nonexistent admin rejected server-side",
  );
  assert(
    (
      await fetch(base + "/admin/login", {
        headers: { Cookie: "admin_session=" + token("missing-qa-admin") },
        redirect: "manual",
      })
    ).status === 200,
    "invalid account has no redirect loop",
  );
  for (const tab of [
    "ringkasan",
    "pesanan",
    "layanan",
    "kategori",
    "tarif",
    "paket",
    "fakultas",
    "ulasan",
    "faq",
    "pengaturan",
    "pembayaran",
  ]) {
    const response = await fetch(base + "/admin/dashboard?tab=" + tab, {
      headers: { Cookie: "admin_session=" + cookie },
    });
    const html = await response.text();
    assert(
      response.status === 200 &&
        html.includes("Masuk sebagai") &&
        !html.includes("NEXT_REDIRECT"),
      "admin tab " + tab,
    );
  }
  const denied = await action(
    "saveFaq",
    form({
      pertanyaan: "Unauthorized test",
      jawaban: "Must not be saved",
      urutan: 0,
      tampil: false,
    }),
  );
  assert(
    denied.response.status >= 400 || denied.response.status === 307,
    "unauthorized server action rejected",
  );
  const apply = async (name, values) => {
    const { result } = await action(name, form(values), cookie);
    assert(result?.ok, "action " + name);
    return result;
  };
  await apply("saveKategori", {
    id: records.category,
    nama: "QA category " + tag,
    urutan: 99999,
  });
  await apply("saveFakultas", {
    nama: "QA faculty " + tag,
    kelompok: "SOSHUM",
    urutan: 99999,
    aktif: false,
  });
  records.faculty = (
    await prisma.fakultas.findUnique({ where: { nama: "QA faculty " + tag } })
  ).id;
  await apply("saveLayanan", {
    nama: "QA unit " + tag,
    kategori: records.category,
    tipeHitung: "PER_LEMBAR",
    estimasiSelesai: "1x24 jam",
    urutan: 99999,
    deskripsi: "Temporary QA fixture",
    aktif: false,
  });
  records.service = (
    await prisma.layanan.findUnique({ where: { nama: "QA unit " + tag } })
  ).id;
  await apply("saveTarif", {
    layananId: records.service,
    kelompok: "SAINTEK",
    hargaPerUnit: 4000,
  });
  records.rate = (
    await prisma.tarif.findUnique({
      where: {
        layananId_kelompok: { layananId: records.service, kelompok: "SAINTEK" },
      },
    })
  ).id;
  await apply("saveTarif", {
    layananId: records.service,
    kelompok: "SAINTEK",
    hargaPerUnit: 4500,
  });
  assert(
    (await prisma.riwayatHarga.count({
      where: { referensiId: records.rate, nilaiLama: 4000, nilaiBaru: 4500 },
    })) === 1,
    "atomic price history",
  );
  await apply("saveLayanan", {
    nama: "QA package " + tag,
    kategori: records.category,
    tipeHitung: "PER_PAKET",
    estimasiSelesai: "1x24 jam",
    urutan: 99999,
    deskripsi: "Temporary QA fixture",
    aktif: false,
  });
  records.packageService = (
    await prisma.layanan.findUnique({ where: { nama: "QA package " + tag } })
  ).id;
  await apply("savePaket", {
    layananId: records.packageService,
    kelompok: "SOSHUM",
    nama: "QA full",
    harga: 5000000,
    urutan: 0,
  });
  records.package = (
    await prisma.paket.findFirst({
      where: { layananId: records.packageService },
    })
  ).id;
  await apply("saveBenefit", {
    paketId: records.package,
    teks: "QA benefit A",
    urutan: 0,
  });
  await apply("saveBenefit", {
    paketId: records.package,
    teks: "QA benefit B",
    urutan: 1,
  });
  const benefit = await prisma.benefit.findFirst({
    where: { paketId: records.package, teks: "QA benefit B" },
  });
  await apply("moveBenefit", { id: benefit.id, direction: "up" });
  assert(
    (
      await prisma.benefit.findMany({
        where: { paketId: records.package },
        orderBy: { urutan: "asc" },
      })
    )[0].id === benefit.id,
    "benefit ordering",
  );
  await apply("saveBenefit", {
    id: benefit.id,
    paketId: records.package,
    teks: "QA benefit edited",
    urutan: 0,
  });
  await apply("deleteBenefit", { id: benefit.id });
  await apply("saveFaq", {
    pertanyaan: "QA question " + tag,
    jawaban: "Temporary integration answer.",
    labelTombol: "Simulasi",
    tujuanTombol: "/simulasi",
    urutan: 99999,
    tampil: false,
  });
  records.faq = (
    await prisma.faq.findFirst({ where: { pertanyaan: "QA question " + tag } })
  ).id;
  await apply("saveFaq", {
    id: records.faq,
    pertanyaan: "QA question " + tag,
    jawaban: "Updated integration answer.",
    labelTombol: "Tarif",
    tujuanTombol: "/tarif",
    urutan: 99998,
    tampil: false,
  });
  const service = await prisma.layanan.findUnique({
    where: { nama: "Artikel" },
    include: { tarif: true },
  });
  const faculty = await prisma.fakultas.findFirst({
    where: { aktif: true, kelompok: "SOSHUM" },
  });
  const total =
    service.tarif.find((rate) => rate.kelompok === "SOSHUM").hargaPerUnit * 15;
  const payload = {
    nama: "QA integration " + tag,
    fakultasId: faculty.id,
    layananId: service.id,
    judul: "QA temporary order",
    deskripsiAsli:
      "Temporary integration test. No customer and no WhatsApp message.",
    jumlah: 15,
    requestId: records.requestId,
    quotedTotal: total,
  };
  const created = await action(
    "submitSimulasiOrder",
    payload,
    null,
    "/simulasi",
  );
  assert(
    created.result?.ok && created.result.total === total,
    "simulation saved at server price",
  );
  const repeated = await action(
    "submitSimulasiOrder",
    payload,
    null,
    "/simulasi",
  );
  assert(
    repeated.result?.kodePesanan === created.result.kodePesanan,
    "order retry is idempotent",
  );
  assert(
    (await prisma.pesanan.count({
      where: { requestId: records.requestId },
    })) === 1,
    "one order for one request",
  );
  const forgedPrice = await action(
    "submitSimulasiOrder",
    { ...payload, quotedTotal: 1, requestId: randomUUID() },
    null,
    "/simulasi",
  );
  assert(
    forgedPrice.result?.priceChanged && !forgedPrice.result.ok,
    "forged client price rejected",
  );
  const order = await prisma.pesanan.findUnique({
    where: { requestId: records.requestId },
  });
  await apply("softDeletePesanan", { id: order.id });
  assert(
    Boolean(
      (await prisma.pesanan.findUnique({ where: { id: order.id } })).deletedAt,
    ),
    "order archive uses soft deletion",
  );
  await apply("deleteFaq", { id: records.faq });
  records.faq = null;
  await apply("deletePaket", { id: records.package });
  await apply("deleteTarif", { id: records.rate });
  await apply("deleteLayanan", { id: records.service });
  await apply("deleteLayanan", { id: records.packageService });
  await apply("deleteFakultas", { id: records.faculty });
  await apply("deleteKategori", { id: records.category });
  assert(
    (await fetch(base + "/api/files?kind=dokumen&payment=missing")).status ===
      403,
    "private document access denied",
  );
  assert(
    (await fetch(base + "/api/files?kind=hasil&code=guess")).status === 403,
    "guessed result access denied",
  );
  const turnitin = await action(
    "createTurnitinOrder",
    form({
      nama: "QA integration",
      nomorWhatsApp: "628123456789",
      paketId: "missing",
      requestId: randomUUID(),
    }),
    null,
    "/turnitin",
  );
  assert(!turnitin.result?.ok, "unavailable Turnitin cannot charge");
  console.log(JSON.stringify({ passed: checks.length, checks }));
} catch (error) {
  console.error(
    JSON.stringify({ passed: checks.length, failed: error.message }),
  );
  process.exitCode = 1;
} finally {
  try {
    await prisma.pesanan.deleteMany({
      where: { requestId: records.requestId },
    });
    if (records.faq)
      await prisma.faq.deleteMany({ where: { id: records.faq } });
    await prisma.riwayatHarga.deleteMany({
      where: {
        OR: [records.rate, records.package]
          .filter(Boolean)
          .map((referensiId) => ({ referensiId })),
      },
    });
    await prisma.layanan.deleteMany({
      where: {
        id: { in: [records.service, records.packageService].filter(Boolean) },
      },
    });
    if (records.faculty)
      await prisma.fakultas.deleteMany({ where: { id: records.faculty } });
    await prisma.kategori.deleteMany({ where: { id: records.category } });
    console.log(JSON.stringify({ fixtureCleanup: "completed" }));
  } catch {
    console.error("Fixture cleanup requires review.");
    process.exitCode = 1;
  }
  await prisma.$disconnect();
}
