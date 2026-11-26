import { useState } from "react";
import { ArrowLeft, Building2, Users } from "lucide-react";
import Page from "../layouts/Page.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import Alert from "../components/ui/Alert.jsx";
import Badge from "../components/ui/Badge.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import useApiResource from "../hooks/useApiResource.js";

function asArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function Kud() {
  const [selectedKudId, setSelectedKudId] = useState(null);
  const [selectedKelompokId, setSelectedKelompokId] = useState(null);

  const kudList = useApiResource("/admin/kud");
  const kelompokList = useApiResource(
    selectedKudId ? `/admin/kud/${selectedKudId}/kelompok` : null,
  );
  const anggotaList = useApiResource(
    selectedKelompokId ? `/admin/kud/kelompok/${selectedKelompokId}/anggota` : null,
  );

  const kuds = asArray(kudList.data);
  const kelompoks = asArray(kelompokList.data);
  const anggotas = asArray(anggotaList.data);

  const selectedKud = kuds.find((item) => item.id === selectedKudId);
  const selectedKelompok = kelompoks.find(
    (item) => item.id === selectedKelompokId,
  );

  function resetToKud() {
    setSelectedKelompokId(null);
    setSelectedKudId(null);
  }

  function resetToKelompok() {
    setSelectedKelompokId(null);
  }

  return (
    <Page
      title="Profil KUD"
      eyebrow="KUD"
      description="Data KUD, kelompok tani, dan anggota kelompok dari backend."
      footer="Pilih KUD untuk melihat kelompok tani, lalu pilih kelompok untuk melihat anggotanya"
    >
      {kudList.error && <Alert>{kudList.error}</Alert>}
      {kelompokList.error && <Alert>{kelompokList.error}</Alert>}
      {anggotaList.error && <Alert>{anggotaList.error}</Alert>}

      {!selectedKudId && (
        <>
          <div className="crud-toolbar">
            <div>
              <h2>Daftar KUD</h2>
              <p>Pilih salah satu KUD untuk melihat kelompok tani di dalamnya.</p>
            </div>
            <RefreshButton loading={kudList.loading} onClick={kudList.reload} />
          </div>
          <DataTable
            ariaLabel="Daftar KUD"
            columns={["Nama KUD", "Alamat", "Status", "Dibuat", "Aksi"]}
            data={kuds}
            loading={kudList.loading}
            error={kudList.error}
            errorTitle="KUD tidak dapat dimuat"
            emptyTitle="Belum ada KUD"
            emptyDescription="Data KUD akan muncul setelah ada entri di kudm_kud."
            emptyIcon={Building2}
            onRetry={kudList.reload}
            renderRow={(kud) => (
              <tr key={kud.id}>
                <td className="cell-strong">{kud.kud_nama || "-"}</td>
                <td className="cell-muted">{kud.kud_alamat || "-"}</td>
                <td>
                  <Badge tone={kud.kud_status ? "success" : "danger"}>
                    {kud.kud_status ? "Aktif" : "Nonaktif"}
                  </Badge>
                </td>
                <td className="cell-muted">
                  {kud.created_at ? kud.created_at : "-"}
                </td>
                <td>
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setSelectedKudId(kud.id)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            )}
          />
        </>
      )}

      {selectedKudId && !selectedKelompokId && (
        <>
          <div className="crud-toolbar">
            <div>
              <button
                type="button"
                className="button button-text"
                onClick={resetToKud}
              >
                <ArrowLeft size={14} /> Kembali ke daftar KUD
              </button>
              <h2>Kelompok tani — {selectedKud?.kud_nama || selectedKudId}</h2>
              <p>Klik anggota untuk melihat daftar anggota kelompok.</p>
            </div>
            <RefreshButton
              loading={kelompokList.loading}
              onClick={kelompokList.reload}
            />
          </div>
          <DataTable
            ariaLabel="Daftar kelompok tani"
            columns={["Nama kelompok", "Area", "Ketua kelompok", "Dibuat", "Aksi"]}
            data={kelompoks}
            loading={kelompokList.loading}
            error={kelompokList.error}
            errorTitle="Kelompok tidak dapat dimuat"
            emptyTitle="Belum ada kelompok tani"
            emptyDescription="Tidak ada kelompok tani untuk KUD ini."
            emptyIcon={Users}
            onRetry={kelompokList.reload}
            renderRow={(kelompok) => (
              <tr key={kelompok.id}>
                <td className="cell-strong">{kelompok.nama || "-"}</td>
                <td className="cell-muted">{kelompok.area || "-"}</td>
                <td>{kelompok.ketua || "-"}</td>
                <td className="cell-muted">{kelompok.created_at || "-"}</td>
                <td>
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setSelectedKelompokId(kelompok.id)}
                  >
                    Anggota
                  </button>
                </td>
              </tr>
            )}
          />
        </>
      )}

      {selectedKelompokId && (
        <>
          <div className="crud-toolbar">
            <div>
              <button
                type="button"
                className="button button-text"
                onClick={resetToKelompok}
              >
                <ArrowLeft size={14} /> Kembali ke kelompok
              </button>
              <h2>Anggota kelompok — {selectedKelompok?.nama || selectedKelompokId}</h2>
              <p>Daftar anggota yang tergabung dalam kelompok ini.</p>
            </div>
            <RefreshButton
              loading={anggotaList.loading}
              onClick={anggotaList.reload}
            />
          </div>
          <DataTable
            ariaLabel="Daftar anggota kelompok"
            columns={["Nama", "No. lahan", "Alamat", "No. HP", "Email", "Urutan"]}
            data={anggotas}
            loading={anggotaList.loading}
            error={anggotaList.error}
            errorTitle="Anggota tidak dapat dimuat"
            emptyTitle="Belum ada anggota"
            emptyDescription="Tidak ada anggota untuk kelompok ini."
            emptyIcon={Users}
            onRetry={anggotaList.reload}
            renderRow={(anggota) => (
              <tr key={anggota.id}>
                <td className="cell-strong">{anggota.nama || "-"}</td>
                <td className="cell-muted">{anggota.nomor_lahan || "-"}</td>
                <td className="cell-muted">{anggota.alamat || "-"}</td>
                <td className="cell-muted">{anggota.no_hp || "-"}</td>
                <td className="cell-muted">{anggota.email || "-"}</td>
                <td className="cell-muted">{anggota.sort ?? "-"}</td>
              </tr>
            )}
          />
        </>
      )}
    </Page>
  );
}
