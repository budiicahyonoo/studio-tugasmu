import { describe, expect, it } from "vitest";
import { validateUpload } from "./uploads";
const file = (type, bytes, size = bytes.length) => ({
  type,
  size,
  arrayBuffer: async () => Uint8Array.from(bytes).buffer,
});
describe("file validation", () => {
  it("rejects no file, empty files, unsupported types and files above 4 MB", async () => {
    await expect(validateUpload(null)).rejects.toThrow();
    await expect(validateUpload(file("image/png", []))).rejects.toThrow();
    await expect(
      validateUpload(file("image/svg+xml", [1, 2])),
    ).rejects.toThrow();
    await expect(
      validateUpload(file("image/png", [1], 4 * 1024 * 1024 + 1)),
    ).rejects.toThrow();
  });
  it("checks the signature even if the MIME type is allowed", async () => {
    await expect(validateUpload(file("image/png", [1, 2, 3]))).rejects.toThrow(
      "Isi file",
    );
    await expect(
      validateUpload(file("application/pdf", [60, 104, 116, 109, 108], 5), {
        pdf: true,
      }),
    ).rejects.toThrow();
  });
  it("accepts a PDF signature and honors a configured size limit", async () => {
    await expect(
      validateUpload(file("application/pdf", [37, 80, 68, 70, 45]), {
        pdf: true,
      }),
    ).resolves.toBeInstanceOf(Buffer);
    await expect(
      validateUpload(
        file("application/pdf", [37, 80, 68, 70, 45], 2 * 1024 * 1024),
        { pdf: true, maxMb: 1 },
      ),
    ).rejects.toThrow("1 MB");
  });
});
