import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  ...(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    ? { cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME }
    : {}),
  ...(process.env.CLOUDINARY_API_KEY
    ? { api_key: process.env.CLOUDINARY_API_KEY }
    : {}),
  ...(process.env.CLOUDINARY_API_SECRET
    ? { api_secret: process.env.CLOUDINARY_API_SECRET }
    : {}),
  secure: true,
});

const imageTypes = ["image/jpeg", "image/png", "image/webp"];

export async function validateUpload(file, { pdf = false, maxMb = 4 } = {}) {
  if (!file || typeof file === "string" || !file.size)
    throw new Error("Pilih file terlebih dahulu.");
  if (file.size > maxMb * 1024 * 1024)
    throw new Error(`Ukuran file maksimal ${maxMb} MB.`);
  if (!(pdf ? ["application/pdf"] : imageTypes).includes(file.type)) {
    throw new Error(
      pdf
        ? "Format file harus PDF."
        : "Format gambar harus JPG, PNG, atau WebP.",
    );
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const signature = pdf
    ? buffer.subarray(0, 5).toString() === "%PDF-"
    : (file.type === "image/jpeg" &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff) ||
      (file.type === "image/png" &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (file.type === "image/webp" &&
        buffer.subarray(0, 4).toString() === "RIFF" &&
        buffer.subarray(8, 12).toString() === "WEBP");
  if (!signature) throw new Error("Isi file tidak sesuai dengan formatnya.");
  return buffer;
}

export async function uploadFile(file, folder, options = {}) {
  const buffer = await validateUpload(file, options);
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: options.pdf ? "raw" : "image",
          type: options.private ? "authenticated" : "upload",
          ...(options.pdf
            ? { format: "pdf" }
            : options.private
              ? { format: "png" }
              : {}),
        },
        (error, result) => {
          if (error)
            reject(
              Object.assign(
                new Error("Penyimpanan file sedang tidak tersedia."),
                {
                  status: Number(error.http_code) || 0,
                  code: /^[A-Z0-9_]+$/.test(String(error.code))
                    ? String(error.code)
                    : "UPLOAD_UNAVAILABLE",
                },
              ),
            );
          else resolve(result);
        },
      )
      .end(buffer);
  });
}

export async function removeUpload(
  publicId,
  { pdf = false, private: privateFile = false } = {},
) {
  if (publicId)
    await cloudinary.uploader.destroy(publicId, {
      resource_type: pdf ? "raw" : "image",
      type: privateFile ? "authenticated" : "upload",
      invalidate: true,
    });
}

export function privateDownload(publicId, pdf) {
  return cloudinary.utils.private_download_url(publicId, pdf ? "" : "png", {
    resource_type: pdf ? "raw" : "image",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 60,
    attachment: true,
  });
}
