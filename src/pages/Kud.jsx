import { useState } from "react";
import {
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Sprout,
  Users,
} from "lucide-react";
import Page from "../layouts/Page.jsx";
import Panel from "../components/ui/Panel.jsx";
import Badge from "../components/ui/Badge.jsx";

// Data contoh profil KUD. Ganti dengan hasil API bila endpoint master KUD
// sudah tersedia; bentuk datanya sengaja dibuat datar agar mudah dipetakan.
const KUD_LIST = [
  {
    id: "kud-001",
    kode: "KUD-001",
    nama: "KUD Sawit Sejahtera",
    alamat:
      "Jl. Lintas Sumatera No. 128, Kec. Tanjung Beringin, Kab. Serdang Bedagai, Sumatera Utara",
    status: "Aktif",
    ketua: "H. Ahmad Siregar",
    tahunBerdiri: 1998,
    telepon: "(061) 8123 456",
    email: "admin@kudsawitsejahtera.id",
    anggota: 248,
    kelompok: 12,
    komoditas: "TBS, pupuk, dan bibit sawit",
    unitUsaha: [
      "Pengolahan TBS",
      "Koperasi simpan pinjam",
      "Penyediaan sarana produksi",
      "Pemasaran hasil panen",
    ],
  },
  {
    id: "kud-002",
    kode: "KUD-002",
    nama: "KUD Tani Makmur",
    alamat:
      "Jl. Desa Sumber Rejo No. 45, Kec. Pangkalan Susu, Kab. Langkat, Sumatera Utara",
    status: "Aktif",
    ketua: "Siti Rahmawati",
    tahunBerdiri: 2004,
    telepon: "(061) 8877 210",
    email: "kontak@kudtanimakmur.id",
    anggota: 176,
    kelompok: 9,
    komoditas: "TBS dan kopra",
    unitUsaha: [
      "Pengumpulan TBS",
      "Penyediaan pupuk",
      "Simpan pinjam anggota",
    ],
  },
];

function DetailItem({ icon: Icon, label, children }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "var(--surface-muted, #f1f5f9)",
          flex: "none",
        }}
      >
        <Icon size={15} />
      </span>
      <div>
        <p className="cell-muted" style={{ margin: 0, fontSize: 12 }}>
          {label}
        </p>
        <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{children}</p>
      </div>
    </div>
  );
}

export default function Kud() {
  const [selectedId, setSelectedId] = useState(KUD_LIST[0].id);
  const selected = KUD_LIST.find((item) => item.id === selectedId) ?? KUD_LIST[0];

  return (
    <Page
      title="Profil KUD"
      eyebrow="KUD"
      description="Lihat nama KUD dan informasi detail masing-masing koperasi unit desa."
      footer="Pilih KUD untuk melihat detailnya"
    >
      <Panel
        title="Daftar KUD"
        description="Klik salah satu KUD untuk menampilkan informasi detail."
      >
        <div className="role-summary">
          {KUD_LIST.map((kud) => (
            <button
              type="button"
              key={kud.id}
              className="button button-outline"
              aria-pressed={kud.id === selectedId}
              onClick={() => setSelectedId(kud.id)}
            >
              <Building2 size={14} /> {kud.nama}
            </button>
          ))}
        </div>
      </Panel>

      <div style={{ marginTop: 22 }}>
        <Panel
          title={selected.nama}
          description={selected.alamat}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <Badge tone={selected.status === "Aktif" ? "success" : "danger"}>
              {selected.status}
            </Badge>
            <Badge>{selected.kode}</Badge>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px 24px",
            }}
          >
            <DetailItem icon={MapPin} label="Alamat">
              {selected.alamat}
            </DetailItem>
            <DetailItem icon={Users} label="Ketua">
              {selected.ketua}
            </DetailItem>
            <DetailItem icon={CalendarDays} label="Tahun berdiri">
              {selected.tahunBerdiri}
            </DetailItem>
            <DetailItem icon={Phone} label="Telepon">
              {selected.telepon}
            </DetailItem>
            <DetailItem icon={Mail} label="Email">
              {selected.email}
            </DetailItem>
            <DetailItem icon={Sprout} label="Komoditas">
              {selected.komoditas}
            </DetailItem>
            <DetailItem icon={Users} label="Jumlah anggota">
              {selected.anggota} orang
            </DetailItem>
            <DetailItem icon={Building2} label="Jumlah kelompok">
              {selected.kelompok} kelompok
            </DetailItem>
          </div>
        </Panel>
      </div>

      <div style={{ marginTop: 22 }}>
        <Panel
          title="Unit usaha"
          description="Layanan dan unit usaha yang dikelola KUD terpilih."
        >
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
            {selected.unitUsaha.map((unit) => (
              <li key={unit}>{unit}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </Page>
  );
}
