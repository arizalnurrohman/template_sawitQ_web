import { useEffect, useState } from "react";
import { Pencil, Map, Sprout, Users as UsersIcon } from "lucide-react";
import Page from "../layouts/Page.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import Alert from "../components/ui/Alert.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import Modal from "../components/ui/Modal.jsx";
import useApiResource from "../hooks/useApiResource.js";
import useMutation from "../hooks/useMutation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigation } from "../context/NavigationContext.jsx";
import { request } from "../lib/api.js";
import { dateTime } from "../lib/format.js";

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.panen)) return value.panen;
  if (Array.isArray(value?.pemasukan)) return value.pemasukan;
  if (Array.isArray(value?.pengeluaran)) return value.pengeluaran;
  if (Array.isArray(value?.perawatan)) return value.perawatan;
  return [];
}

function money(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function AnggotaPage() {
  const { can } = useNavigation();
  const { token } = useAuth();
  const resource = useApiResource("/admin/anggota");
  const { mutate, loading: saving, error: saveError } = useMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    no_hp: "",
    email: "",
    is_pro: false,
    is_active: true,
  });
  const [notice, setNotice] = useState("");

  const [lahanAnggotaId, setLahanAnggotaId] = useState(null);
  const [selectedLahanId, setSelectedLahanId] = useState(null);

  const lahanResource = useApiResource(
    lahanAnggotaId ? `/kebun/${lahanAnggotaId}` : null,
  );

  const [detail, setDetail] = useState(null);
  const [panen, setPanen] = useState([]);
  const [pemasukan, setPemasukan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [perawatan, setPerawatan] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const items = asArray(resource.data);
  const lahanItems = asArray(lahanResource.data);

  const mayEdit = can("anggota", "edit");

  function refresh() {
    resource.reload();
  }

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      nama: item.nama || "",
      alamat: item.alamat || "",
      no_hp: item.no_hp || "",
      email: item.email || "",
      is_pro: item.is_pro === true || item.is_pro === 1,
      is_active: item.is_active !== false,
    });
    setNotice("");
    setOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    try {
      await mutate(`/admin/anggota/${editing.id}`, {
        method: "PUT",
        body: {
          nama: form.nama,
          alamat: form.alamat,
          no_hp: form.no_hp,
          email: form.email,
          is_pro: form.is_pro,
          is_active: form.is_active,
        },
      });
      setOpen(false);
      refresh();
    } catch (failure) {
      setNotice(failure.message);
    }
  }

  useEffect(() => {
    if (!selectedLahanId) {
      setDetail(null);
      setPanen([]);
      setPemasukan([]);
      setPengeluaran([]);
      setPerawatan([]);
      setDetailError("");
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailError("");

    async function load() {
      try {
        const [detailRes, panenRes, pemasukanRes, pengeluaranRes, jenisRes] =
          await Promise.all([
            request(`/kebun-detail/${selectedLahanId}`, { token }),
            request(`/kebun-detail-panen/${selectedLahanId}`, { token }),
            request(`/kebun-detail-pemasukan/${selectedLahanId}`, { token }),
            request(`/kebun-detail-pengeluaran/${selectedLahanId}`, { token }),
            request(`/perawatan-jenis/${selectedLahanId}`, { token }),
          ]);

        if (cancelled) return;

        setDetail(detailRes.data?.data || detailRes.data);
        setPanen(asArray(panenRes.data));
        setPemasukan(asArray(pemasukanRes.data));
        setPengeluaran(asArray(pengeluaranRes.data));

        const jenisList = asArray(jenisRes.data);
        const perawatanRows = await Promise.all(
          jenisList.map(async (jenis) => {
            try {
              const res = await request(
                `/kebun-detail-perawatan/${jenis.id}/${selectedLahanId}`,
                { token },
              );
              const rows = asArray(res.data);
              return { jenis: jenis.perawatan_jenis || jenis.nama, rows };
            } catch {
              return { jenis: jenis.perawatan_jenis || jenis.nama, rows: [] };
            }
          }),
        );
        if (!cancelled) setPerawatan(perawatanRows);
      } catch (failure) {
        if (!cancelled) setDetailError(failure.message);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedLahanId, token]);

  const kebunDetail = detail;

  return (
    <Page
      title="Data anggota"
      eyebrow="KUD"
      description="Daftar anggota KUD. Klik Lahan untuk melihat lahan milik anggota dan detail laporannya."
      actions={
        <RefreshButton loading={resource.loading} onClick={resource.reload} />
      }
      footer="Data diambil dari tabel kudm_anggota yang digabung dengan users"
    >
      {resource.error && <Alert>{resource.error}</Alert>}
      {notice && <div className="notice"><Alert>{notice}</Alert></div>}

      <DataTable
        ariaLabel="Daftar anggota"
        columns={["Nama", "Email", "No. HP", "Alamat", "Akun user", "Pro", "Status", "Dibuat", "Aksi"]}
        data={items}
        loading={resource.loading}
        error={resource.error}
        errorTitle="Anggota tidak dapat dimuat"
        emptyTitle="Belum ada anggota"
        emptyDescription="Data anggota akan muncul setelah ada entri di kudm_anggota."
        emptyIcon={UsersIcon}
        onRetry={resource.reload}
        renderRow={(item) => (
          <tr key={item.id}>
            <td className="cell-strong">{item.nama || item.user_name || "-"}</td>
            <td className="cell-muted">{item.email || "-"}</td>
            <td className="cell-muted">{item.no_hp || "-"}</td>
            <td className="cell-muted">{item.alamat || "-"}</td>
            <td>
              <Badge>{item.username || item.user_name || "-"}</Badge>
              {item.user_role ? (
                <span className="cell-muted"> · {item.user_role}</span>
              ) : null}
            </td>
            <td>
              <Badge tone={item.is_pro ? "success" : "neutral"}>
                {item.is_pro ? "Pro" : "Free"}
              </Badge>
            </td>
            <td>
              <Badge tone={item.is_active === false ? "danger" : "success"}>
                {item.is_active === false ? "Nonaktif" : "Aktif"}
              </Badge>
            </td>
            <td className="cell-muted">
              {item.created_at ? dateTime(item.created_at) : "-"}
            </td>
            <td>
              <div className="row-actions">
                <Button
                  variant="outline"
                  icon={Map}
                  onClick={() => {
                    setLahanAnggotaId(item.id);
                    setSelectedLahanId(null);
                  }}
                >
                  Lahan
                </Button>
                {mayEdit && (
                  <Button variant="outline" icon={Pencil} onClick={() => openEdit(item)}>
                    Ubah
                  </Button>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Ubah ${editing.nama}` : "Ubah anggota"}
        description="Perubahan nama akan disinkronkan ke akun user terkait."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" form="anggota-form" loading={saving} loadingText="Menyimpan…">
              Simpan
            </Button>
          </>
        }
      >
        <form id="anggota-form" className="crud-form" onSubmit={submit}>
          <div className="form-row">
            <div className="form-block">
              <label htmlFor="anggota-nama">Nama</label>
              <input
                id="anggota-nama"
                className="crud-input"
                value={form.nama}
                onChange={(event) => setField("nama", event.target.value)}
                required
              />
            </div>
            <div className="form-block">
              <label htmlFor="anggota-email">Email</label>
              <input
                id="anggota-email"
                type="email"
                className="crud-input"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-block">
              <label htmlFor="anggota-nohp">No. HP</label>
              <input
                id="anggota-nohp"
                className="crud-input"
                value={form.no_hp}
                onChange={(event) => setField("no_hp", event.target.value)}
              />
            </div>
            <div className="form-block">
              <label htmlFor="anggota-alamat">Alamat</label>
              <input
                id="anggota-alamat"
                className="crud-input"
                value={form.alamat}
                onChange={(event) => setField("alamat", event.target.value)}
              />
            </div>
          </div>
          <label className="check-line">
            <input
              type="checkbox"
              checked={form.is_pro}
              onChange={(event) => setField("is_pro", event.target.checked)}
            />
            Akun Pro
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setField("is_active", event.target.checked)}
            />
            Akun aktif
          </label>
          {saveError && <Alert>{saveError}</Alert>}
        </form>
      </Modal>

      <Modal
        open={Boolean(lahanAnggotaId) && !selectedLahanId}
        onClose={() => setLahanAnggotaId(null)}
        title="Daftar lahan milik anggota"
        description="Klik Detail pada lahan untuk melihat laporan lengkap."
      >
        {lahanResource.error && <Alert>{lahanResource.error}</Alert>}
        <DataTable
          ariaLabel="Daftar lahan"
          columns={["Lokasi", "Luas", "Tanam", "Pokok", "Aksi"]}
          data={lahanItems}
          loading={lahanResource.loading}
          error={lahanResource.error}
          errorTitle="Lahan tidak dapat dimuat"
          emptyTitle="Belum ada lahan"
          emptyDescription="Anggota ini belum memiliki lahan."
          emptyIcon={Sprout}
          onRetry={lahanResource.reload}
          renderRow={(lahan) => (
            <tr key={lahan.id}>
              <td className="cell-strong">{lahan.lokasi || "-"}</td>
              <td className="cell-muted">{lahan.luas ?? "-"}</td>
              <td className="cell-muted">
                {lahan.bulan_tanam} {lahan.tahun_tanam}
              </td>
              <td className="cell-muted">{lahan.jumlah_pokok ?? "-"}</td>
              <td>
                <Button
                  variant="outline"
                  icon={Sprout}
                  onClick={() => setSelectedLahanId(lahan.id)}
                >
                  Detail
                </Button>
              </td>
            </tr>
          )}
        />
      </Modal>

      <Modal
        open={Boolean(selectedLahanId)}
        onClose={() => setSelectedLahanId(null)}
        title={kebunDetail?.lokasi || "Detail lahan"}
        description="Informasi kebun dan seluruh laporan."
        size="lg"
      >
        {detailLoading && <p className="cell-muted">Memuat detail…</p>}
        {detailError && <Alert>{detailError}</Alert>}
        {kebunDetail && (
          <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
            <p><strong>Lokasi:</strong> {kebunDetail.lokasi}</p>
            <p><strong>Luas:</strong> {kebunDetail.luas}</p>
            <p><strong>Penanaman:</strong> {kebunDetail.penanaman}</p>
            <p><strong>Janjang bulan ini:</strong> {kebunDetail.janjang}</p>
            <p><strong>Brondolan bulan ini:</strong> {kebunDetail.brondolan}</p>
            <p><strong>Total produksi bulan ini:</strong> {kebunDetail.total_produksi}</p>
          </div>
        )}

        <h3>Panen</h3>
        <DataTable
          ariaLabel="Daftar panen"
          columns={["Tanggal", "Tonase janjang", "Tonase brondolan", "Harga"]}
          data={panen}
          loading={detailLoading}
          error={null}
          emptyTitle="Belum ada panen"
          emptyDescription="Belum ada data panen untuk lahan ini."
          emptyIcon={Sprout}
          renderRow={(row) => (
            <tr key={row.id}>
              <td className="cell-muted">{row.tanggal_panen || "-"}</td>
              <td className="cell-muted">{row.tonase_janjang ?? "-"}</td>
              <td className="cell-muted">{row.tonase_brondolan ?? "-"}</td>
              <td className="cell-muted">{row.harga ?? "-"}</td>
            </tr>
          )}
        />

        <h3 style={{ marginTop: 16 }}>Pemasukan</h3>
        <DataTable
          ariaLabel="Daftar pemasukan"
          columns={["Tanggal", "Jumlah", "Keterangan"]}
          data={pemasukan}
          loading={detailLoading}
          error={null}
          emptyTitle="Belum ada pemasukan"
          emptyDescription="Belum ada data pemasukan untuk lahan ini."
          emptyIcon={Sprout}
          renderRow={(row) => (
            <tr key={row.id}>
              <td className="cell-muted">{row.tanggal_pemasukan || row.tanggal || "-"}</td>
              <td className="cell-muted">{money(row.jumlah ?? row.nominal)}</td>
              <td className="cell-muted">{row.keterangan || row.deskripsi || "-"}</td>
            </tr>
          )}
        />

        <h3 style={{ marginTop: 16 }}>Pengeluaran</h3>
        <DataTable
          ariaLabel="Daftar pengeluaran"
          columns={["Tanggal", "Jumlah", "Keterangan"]}
          data={pengeluaran}
          loading={detailLoading}
          error={null}
          emptyTitle="Belum ada pengeluaran"
          emptyDescription="Belum ada data pengeluaran untuk lahan ini."
          emptyIcon={Sprout}
          renderRow={(row) => (
            <tr key={row.id}>
              <td className="cell-muted">{row.tanggal_pengeluaran || row.tanggal || "-"}</td>
              <td className="cell-muted">{money(row.jumlah ?? row.nominal)}</td>
              <td className="cell-muted">{row.keterangan || row.deskripsi || "-"}</td>
            </tr>
          )}
        />

        <h3 style={{ marginTop: 16 }}>Perawatan</h3>
        {perawatan.length === 0 && !detailLoading && (
          <p className="cell-muted">Belum ada data perawatan.</p>
        )}
        {perawatan.map((group) => (
          <div key={group.jenis} style={{ marginBottom: 12 }}>
            <h4 style={{ margin: "8px 0 4px" }}>{group.jenis}</h4>
            <DataTable
              ariaLabel={`Perawatan ${group.jenis}`}
              columns={["Tanggal mulai", "Satuan", "Keterangan"]}
              data={group.rows}
              loading={false}
              error={null}
              emptyTitle="Belum ada riwayat"
              emptyDescription="Belum ada riwayat perawatan."
              emptyIcon={Sprout}
              renderRow={(row) => (
                <tr key={row.id}>
                  <td className="cell-muted">{row.tanggal_mulai || "-"}</td>
                  <td className="cell-muted">{row.perawatan_satuan || row.satuan || "-"}</td>
                  <td className="cell-muted">{row.keterangan || "-"}</td>
                </tr>
              )}
            />
          </div>
        ))}
      </Modal>
    </Page>
  );
}
