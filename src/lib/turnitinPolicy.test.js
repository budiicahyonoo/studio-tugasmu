import { describe, expect, it } from "vitest";
import {
  getTurnitinUploadPolicy,
  TURNITIN_DOCUMENT_FORMAT,
} from "./turnitinPolicy";

describe("Turnitin upload policy", () => {
  it("uses the saved format and size limit", () => {
    expect(
      getTurnitinUploadPolicy({
        turnitinFormat: TURNITIN_DOCUMENT_FORMAT,
        turnitinMaksMb: 3,
      }),
    ).toEqual({ pdf: true, maxMb: 3 });
  });

  it("rejects an unsupported saved format", () => {
    expect(() =>
      getTurnitinUploadPolicy({
        turnitinFormat: "application/msword",
        turnitinMaksMb: 3,
      }),
    ).toThrow("Format dokumen Turnitin belum didukung.");
  });
});
