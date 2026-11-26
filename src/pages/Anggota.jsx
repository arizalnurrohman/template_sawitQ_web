import { useState } from "react";
import { Pencil, Users as UsersIcon } from "lucide-react";
import Page from "../layouts/Page.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import Alert from "../components/ui/Alert.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import Modal from "../components/ui/Modal.jsx";
import useApiResource from "../hooks/useApiResource.js";
import useMutation from "../hooks/useMutation.js";
import { useNavigation } from "../context/NavigationContext.jsx";
import { dateTime } from "../lib/format.js";

export default function AnggotaPage() {
  const { can } = useNavigation();
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

  const items = Array.isArray(resource.data)
    ? resource.data
    : resource.data?.data || [];

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

  return (
    <Page
      title="Data anggota"
      eyebrow="KUD"
      description="Daftar anggota KUD yang terhubung dengan akun pengguna."
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
    </Page>
  );
}
