"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { checkRateLimit } from "../lib/rateLimit";

const polishSchema = z.object({
  deskripsi: z.string().trim().min(5, "Deskripsi terlalu singkat untuk dirapikan.").max(4000),
  layananNama: z.string().trim().max(100).optional(),
});

const SYSTEM_PROMPT = `Kamu adalah editor teks akademik berbahasa Indonesia.
Tugasmu HANYA merapikan ejaan, tanda baca, dan struktur paragraf atau poin dari deskripsi tugas mahasiswa agar jelas dan mudah dibaca.
ATURAN KETAT:
1. JANGAN menambah, menyarankan, atau mengubah jumlah lembar, jumlah slide, harga, fakultas, maupun pilihan paket.
2. JANGAN mengarang fakta atau instruksi baru yang tidak ditulis pengguna.
3. Pertahankan seluruh maksud asli pengguna.
4. Kembalikan HANYA teks deskripsi yang sudah dirapikan, tanpa kata pengantar atau penutup.`;

async function callOpenAiCompatible({ url, apiKey, model, userPrompt, extraHeaders = {} }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8500);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 600,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Respon AI kosong");
    }
    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function polishDescription(input) {
  const parsed = polishSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      usedFallback: true,
      deskripsiRapih: input?.deskripsi || "",
      message: parsed.error.issues[0]?.message || "Deskripsi tidak valid.",
    };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rate = checkRateLimit(`ai-polish:${ip}`, { limit: 12, windowMs: 60 * 1000 });

  if (!rate.allowed) {
    return {
      ok: false,
      usedFallback: true,
      deskripsiRapih: parsed.data.deskripsi,
      message: "Batas perapian AI sementara tercapai. Deskripsi asli tetap digunakan.",
    };
  }

  const userPrompt = `Layanan: ${parsed.data.layananNama || "Tugas akademik"}\n\nDeskripsi asli:\n${parsed.data.deskripsi}`;

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const result = await callOpenAiCompatible({
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: groqKey,
        model: "llama-3.1-8b-instant",
        userPrompt,
      });
      return { ok: true, usedFallback: false, provider: "groq", deskripsiRapih: result };
    } catch (error) {
      console.warn("Groq gagal, mencoba cadangan OpenRouter:", error.message);
    }
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    try {
      const result = await callOpenAiCompatible({
        url: "https://openrouter.ai/api/v1/chat/completions",
        apiKey: openRouterKey,
        model: "meta-llama/llama-3.2-3b-instruct:free",
        userPrompt,
        extraHeaders: { "X-Title": "Studio Tugasmu" },
      });
      return { ok: true, usedFallback: false, provider: "openrouter", deskripsiRapih: result };
    } catch (error) {
      console.warn("OpenRouter gagal, memakai deskripsi asli:", error.message);
    }
  }

  return {
    ok: false,
    usedFallback: true,
    deskripsiRapih: parsed.data.deskripsi,
    message: "Layanan perapian AI sedang tidak tersedia. Deskripsi asli tetap digunakan.",
  };
}
