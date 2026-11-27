"use client";
import {
  deleteBenefit,
  deleteFakultas,
  deleteLayanan,
  deletePaket,
  deleteTarif,
  moveBenefit,
  saveBenefit,
  saveFakultas,
  saveLayanan,
  savePaket,
  saveTarif,
} from "../../actions/admin";
import { deleteKategori, saveKategori } from "../../actions/content";
import {
  Editor,
  Field,
  Paged,
  kelompokOptions,
  visibilityOptions,
} from "./AdminForms";
import { formatRupiah } from "../../lib/calculateEstimate";

const name = {
  name: "nama",
  label: "Nama",
  required: true,
  minLength: 2,
  maxLength: 120,
};
const order = {
  name: "urutan",
  label: "Urutan",
  type: "number",
  min: 0,
  initial: 0,
};
const active = {
  name: "aktif",
  label: "Aktif",
  options: visibilityOptions,
  initial: "true",
};
const group = {
  name: "kelompok",
  label: "Kelompok tarif",
  options: kelompokOptions,
  initial: "SOSHUM",
};
export function KategoriPanel({ kategori, runAction }) {
  const fields = [
    {
      name: "id",
      label: "Kode kategori (huruf besar)",
      pattern: "[A-Z0-9_]{2,40}",
      required: true,
    },
    name,
    order,
  ];
  return (
    <div className="space-y-5">
      <Editor
        title="Tambah kategori"
        fields={fields}
        save={saveKategori}
        runAction={runAction}
      />
      <Paged
        items={kategori}
        render={(item) => (
          <Editor
            key={item.id}
            title={item.nama}
            item={item}
            fields={fields.map((field) =>
              field.name === "id" ? { ...field, readOnly: true } : field,
            )}
            save={saveKategori}
            remove={deleteKategori}
            runAction={runAction}
          />
        )}
      />
    </div>
  );
}
export function LayananPanel({ layanan, kategori = [], runAction }) {
  const fields = [
    name,
    {
      name: "kategori",
      label: "Kategori",
      options: kategori.map((item) => ({ value: item.id, label: item.nama })),
      required: true,
    },
    {
      name: "tipeHitung",
      label: "Tipe hitungan",
      options: ["PER_LEMBAR", "PER_SLIDE", "PER_PAKET"].map((value) => ({
        value,
        label: value,
      })),
      initial: "PER_LEMBAR",
    },
    {
      name: "estimasiSelesai",
      label: "Estimasi selesai",
      initial: "1x24 jam",
      required: true,
      maxLength: 60,
    },
    {
      name: "deskripsi",
      label: "Deskripsi",
      type: "textarea",
      maxLength: 2000,
    },
    order,
    active,
  ];
  return (
    <div className="space-y-5">
      <Editor
        title="Tambah layanan"
        fields={fields}
        save={saveLayanan}
        runAction={runAction}
      />
      <Paged
        items={layanan}
        render={(item) => (
          <div key={item.id} className="space-y-3">
            <Editor
              title={item.nama}
              item={item}
              fields={fields}
              save={saveLayanan}
              remove={deleteLayanan}
              runAction={runAction}
            />
            <BenefitEditor
              target={{ layananId: item.id }}
              benefits={item.benefit}
              runAction={runAction}
            />
          </div>
        )}
      />
    </div>
  );
}
export function FakultasPanel({ fakultas, runAction }) {
  const fields = [name, group, order, active];
  return (
    <div className="space-y-5">
      <Editor
        title="Tambah fakultas"
        fields={fields}
        save={saveFakultas}
        runAction={runAction}
      />
      <Paged
        items={fakultas}
        render={(item) => (
          <Editor
            key={item.id}
            title={item.nama}
            item={item}
            fields={fields}
            save={saveFakultas}
            remove={deleteFakultas}
            runAction={runAction}
          />
        )}
      />
    </div>
  );
}
export function TarifPanel({ layanan, riwayatHarga, runAction }) {
  return (
    <div className="space-y-7">
      <Paged
        items={layanan.filter((item) => item.tipeHitung !== "PER_PAKET")}
        render={(item) => (
          <section key={item.id} className="surface-card p-5">
            <h2 className="text-xl font-bold">{item.nama}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["SOSHUM", "SAINTEK"].map((kelompok) => {
                const rate = item.tarif.find(
                  (value) => value.kelompok === kelompok,
                );
                return (
                  <div key={kelompok}>
                    <form
                      onSubmit={(event) =>
                        runAction(
                          event,
                          saveTarif,
                          "Tarif dan riwayat perubahan tersimpan.",
                        )
                      }
                      className="space-y-3"
                    >
                      <input type="hidden" name="layananId" value={item.id} />
                      <input type="hidden" name="kelompok" value={kelompok} />
                      <Field
                        name="hargaPerUnit"
                        label={`Tarif ${kelompok} (Rupiah)`}
                        type="number"
                        min={0}
                        max={2147483647}
                        required
                        defaultValue={rate?.hargaPerUnit ?? ""}
                      />
                      <button type="submit" className="btn-primary">
                        Simpan tarif {kelompok}
                      </button>
                    </form>
                    {rate && (
                      <form
                        onSubmit={(event) =>
                          runAction(
                            event,
                            deleteTarif,
                            "Tarif dihapus dan dicatat di riwayat.",
                          )
                        }
                        className="mt-2"
                      >
                        <input type="hidden" name="id" value={rate.id} />
                        <button type="submit" className="btn-danger">
                          Hapus tarif {kelompok}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      />
      <section>
        <h2 className="mb-4 text-lg font-bold">Riwayat perubahan harga</h2>
        <Paged
          items={riwayatHarga}
          render={(row) => (
            <article
              key={row.id}
              className="border-b border-[#DCE4EB] py-3 text-sm"
            >
              <p className="font-bold">{row.keterangan}</p>
              <p className="mt-1">
                {formatRupiah(row.nilaiLama)} menjadi{" "}
                {formatRupiah(row.nilaiBaru)}
              </p>
              <p className="mt-1 text-[#526277]">
                {row.diubahOleh} · {new Date(row.waktu).toLocaleString("id-ID")}
              </p>
            </article>
          )}
        />
      </section>
    </div>
  );
}
export function BenefitEditor({ target, benefits, runAction }) {
  const targetName = target.paketId ? "paketId" : "layananId";
  return (
    <details className="rounded-xl border border-[#DCE4EB] p-4">
      <summary className="flex min-h-11 items-center text-sm font-bold">
        Kelola benefit ({benefits.length})
      </summary>
      <form
        onSubmit={(event) =>
          runAction(event, saveBenefit, "Benefit ditambahkan.")
        }
        className="my-4 grid gap-3 sm:grid-cols-[1fr_auto]"
      >
        <input type="hidden" name={targetName} value={target[targetName]} />
        <input
          type="hidden"
          name="urutan"
          value={
            benefits.length
              ? Math.max(...benefits.map((item) => item.urutan)) + 1
              : 0
          }
        />
        <Field
          name="teks"
          label="Benefit baru"
          required
          minLength={2}
          maxLength={1000}
        />
        <button type="submit" className="btn-primary self-end">
          Tambah benefit
        </button>
      </form>
      <Paged
        items={benefits}
        render={(item, index) => (
          <div key={item.id} className="border-t border-[#DCE4EB] py-4">
            <form
              onSubmit={(event) =>
                runAction(event, saveBenefit, "Benefit diperbarui.")
              }
              className="space-y-3"
            >
              <input type="hidden" name="id" value={item.id} />
              <input
                type="hidden"
                name={targetName}
                value={target[targetName]}
              />
              <input type="hidden" name="urutan" value={item.urutan} />
              <Field
                name="teks"
                label="Teks benefit"
                defaultValue={item.teks}
                required
                maxLength={1000}
              />
              <button type="submit" className="btn-secondary">
                Simpan benefit
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {["up", "down"].map((direction) => (
                <form
                  key={direction}
                  onSubmit={(event) =>
                    runAction(event, moveBenefit, "Urutan diperbarui.")
                  }
                >
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value={direction} />
                  <button
                    type="submit"
                    className="btn-secondary"
                    disabled={
                      direction === "up"
                        ? index === 0
                        : index === benefits.length - 1
                    }
                  >
                    {direction === "up" ? "Naikkan" : "Turunkan"}
                  </button>
                </form>
              ))}
              <form
                onSubmit={(event) =>
                  runAction(event, deleteBenefit, "Benefit dihapus.")
                }
              >
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="btn-danger">
                  Hapus benefit
                </button>
              </form>
            </div>
          </div>
        )}
      />
    </details>
  );
}
export function PaketBenefitPanel({ layanan, runAction }) {
  const services = layanan.filter((item) => item.tipeHitung === "PER_PAKET");
  const packages = services.flatMap((item) =>
    item.paket.map((p) => ({ ...p, layananNama: item.nama })),
  );
  const fields = [
    {
      name: "layananId",
      label: "Layanan",
      options: services.map((item) => ({ value: item.id, label: item.nama })),
      required: true,
    },
    group,
    name,
    {
      name: "deskripsi",
      label: "Cakupan paket",
      type: "textarea",
      maxLength: 2000,
    },
    {
      name: "harga",
      label: "Harga total (Rupiah)",
      type: "number",
      min: 0,
      max: 2147483647,
      required: true,
    },
    order,
  ];
  return (
    <div className="space-y-5">
      {services.length ? (
        <Editor
          title="Tambah paket"
          fields={fields}
          save={savePaket}
          runAction={runAction}
        />
      ) : (
        <p className="empty-state">
          Buat layanan dengan tipe per paket terlebih dahulu.
        </p>
      )}
      <Paged
        items={packages}
        render={(item) => (
          <div key={item.id} className="space-y-3">
            <Editor
              title={`${item.layananNama}: ${item.nama} (${item.kelompok})`}
              item={item}
              fields={fields}
              save={savePaket}
              remove={deletePaket}
              runAction={runAction}
            />
            <BenefitEditor
              target={{ paketId: item.id }}
              benefits={item.benefit}
              runAction={runAction}
            />
          </div>
        )}
      />
    </div>
  );
}
