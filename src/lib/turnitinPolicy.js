export const TURNITIN_DOCUMENT_FORMAT = "application/pdf";

export function getTurnitinUploadPolicy(settings) {
  if (settings?.turnitinFormat !== TURNITIN_DOCUMENT_FORMAT)
    throw new Error("Format dokumen Turnitin belum didukung.");

  return {
    pdf: true,
    maxMb: settings.turnitinMaksMb,
  };
}
