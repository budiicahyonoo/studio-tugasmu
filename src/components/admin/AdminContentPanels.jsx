"use client";
import {
  deleteFaq,
  deleteGallery,
  saveFaq,
  saveGallery,
} from "../../actions/content";
import { Editor, Field, Paged, visibilityOptions } from "./AdminForms";
const order = {
  name: "urutan",
  label: "Urutan",
  type: "number",
  min: 0,
  initial: 0,
};
const visible = {
  name: "tampil",
  label: "Tampilkan ke publik",
  options: visibilityOptions,
  initial: "true",
};
export function FaqPanel({ faq, runAction }) {
  const fields = [
    {
      name: "pertanyaan",
      label: "Pertanyaan",
      minLength: 5,
      maxLength: 250,
      required: true,
    },
    {
      name: "jawaban",
      label: "Jawaban",
      type: "textarea",
      rows: 5,
      minLength: 5,
      maxLength: 6000,
      required: true,
    },
    { name: "labelTombol", label: "Label tombol (opsional)", maxLength: 80 },
    {
      name: "tujuanTombol",
      label: "Tujuan tombol (contoh: /simulasi)",
      maxLength: 500,
    },
    order,
    visible,
  ];
  return (
    <div className="space-y-5">
      <p className="text-sm leading-7 text-[#526277]">
        Tombol boleh mengarah ke halaman publik situs atau tautan https://wa.me/
        dengan nomor admin. Isi label dan tujuan bersama-sama.
      </p>
      <Editor
        title="Tambah FAQ"
        fields={fields}
        save={saveFaq}
        runAction={runAction}
      />
      <Paged
        items={faq}
        render={(item) => (
          <Editor
            key={item.id}
            title={item.pertanyaan}
            item={item}
            fields={fields}
            save={saveFaq}
            remove={deleteFaq}
            runAction={runAction}
          />
        )}
      />
    </div>
  );
}
export function GalleryPanel({ galeri, runAction }) {
  const fields = [
    {
      name: "label",
      label: "Label foto",
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    order,
    visible,
  ];
  return (
    <div className="space-y-5">
      <p className="rounded-xl bg-[#FEF6E7] p-4 text-sm leading-7">
        Sensor nama, nomor telepon, dan data pribadi pelanggan sebelum
        mengunggah. Gunakan JPG, PNG, atau WebP maksimal 4 MB. Foto ditampilkan
        utuh sesuai dimensinya.
      </p>
      <Editor
        title="Unggah foto ulasan"
        fields={fields}
        save={saveGallery}
        runAction={runAction}
      >
        <Field
          name="image"
          label="Foto ulasan"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </Editor>
      <Paged
        items={galeri}
        render={(item) => (
          <Editor
            key={item.id}
            title={item.label}
            item={item}
            fields={fields}
            save={saveGallery}
            remove={deleteGallery}
            runAction={runAction}
          >
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                width={item.lebar}
                height={item.tinggi}
                alt={`Foto ulasan ${item.label}`}
                className="mb-3 max-h-60 w-full object-contain"
              />
              <Field
                name="image"
                label="Ganti foto (opsional)"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </div>
          </Editor>
        )}
      />
    </div>
  );
}
