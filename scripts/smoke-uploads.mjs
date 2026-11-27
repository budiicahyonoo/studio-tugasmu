import { readFile } from "node:fs/promises";
import {
  uploadFile,
  removeUpload,
  privateDownload,
} from "../src/lib/uploads.js";
const configured = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET),
);
if (!configured) {
  console.log(
    JSON.stringify({
      status: "blocked",
      reason: "Cloudinary credentials not configured",
    }),
  );
  process.exit(0);
}
const uploads = [];
try {
  const png = new File([await readFile("public/logo.png")], "qa.png", {
    type: "image/png",
  });
  const pdf = new File(
    [
      "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
    ],
    "qa.pdf",
    { type: "application/pdf" },
  );
  const results = [];
  for (const [file, isPdf] of [
    [png, false],
    [pdf, true],
  ]) {
    const uploaded = await uploadFile(file, "studio_qa_temporary", {
      private: true,
      pdf: isPdf,
    });
    uploads.push({ id: uploaded.public_id, pdf: isPdf });
    const unsigned = await fetch(uploaded.secure_url);
    const signed = await fetch(privateDownload(uploaded.public_id, isPdf));
    results.push({
      kind: isPdf ? "pdf" : "image",
      unsignedStatus: unsigned.status,
      signedStatus: signed.status,
      dimensions: isPdf ? null : Boolean(uploaded.width && uploaded.height),
    });
    if (![401, 403, 404].includes(unsigned.status) || signed.status !== 200)
      process.exitCode = 1;
  }
  console.log(
    JSON.stringify({ status: process.exitCode ? "failed" : "passed", results }),
  );
} catch (error) {
  console.log(
    JSON.stringify({
      status: "blocked",
      reason: error.message,
      statusCode: error.status || 0,
      code: error.code || "VALIDATION",
    }),
  );
  process.exitCode = 1;
} finally {
  for (const upload of uploads)
    await removeUpload(upload.id, { private: true, pdf: upload.pdf }).catch(
      () => {
        process.exitCode = 1;
      },
    );
  console.log(JSON.stringify({ temporaryUploadsCleaned: uploads.length }));
}
