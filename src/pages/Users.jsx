import { useState } from "react";
import { Pencil, Plus, Search, Trash2, Users as UsersIcon } from "lucide-react";
import Page from "../layouts/Page.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import Alert from "../components/ui/Alert.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import Modal from "../components/ui/Modal.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import useApiResource from "../hooks/useApiResource.js";
import useMutation from "../hooks/useMutation.js";
import usePaginatedResource from "../hooks/usePaginatedResource.js";
import { useNavigation } from "../context/NavigationContext.jsx";
import { dateTime } from "../lib/format.js";
import "../features/access/access.css";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role_id: "",
  is_active: true,
};

export default function UsersPage() {
  const { can } = useNavigation();
  const roles = useApiResource("/admin/roles");
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const users = usePaginatedResource("/admin/users", {
    filterName: "search",
    extraParams: { role_id: roleFilter },
    revision,
  });
  const { mutate, loading: saving, error: saveError } = useMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const mayAdd = can("users", "add");
  const mayEdit = can("users", "edit");
  const mayDelete = can("users", "delete");
  const roleItems = Array.isArray(roles.data) ? roles.data : roles.data?.data || [];

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function refresh() {
    setRevision((value) => value + 1);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setNotice("");
    setOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role_id: user.role_id ?? user.role?.id ?? "",
      is_active: user.is_active !== false,
    });
    setNotice("");
    setOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    const payload = { ...form };
    if (editing && !payload.password) delete payload.password;
    try {
      if (editing)
        await mutate(`/admin/users/${editing.id}`, { method: "PUT", body: payload });
      else await mutate("/admin/users", { body: payload });
      setOpen(false);
      refresh();
    } catch (failure) {
      setNotice(failure.message);
    }
  }

  async function remove(user) {
    if (!window.confirm(`Hapus pengguna "${user.name}"?`)) return;
    setDeletingId(user.id);
    try {
      await mutate(`/admin/users/${user.id}`, { method: "DELETE" });
      refresh();
    } catch (failure) {
      setNotice(failure.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Page
      title="Manajemen user"
      eyebrow="AKSES"
      description="Kelola akun administrator dan petugas, lalu tetapkan role untuk masing-masing."
      actions={<RefreshButton loading={users.result.loading || roles.loading} onClick={refresh} />}
      footer="Perubahan role akan memengaruhi menu setelah halaman dimuat ulang"
    >
      <div className="crud-toolbar">
        <div>
          <h2>Daftar pengguna</h2>
          <p>Gunakan filter untuk mencari akun berdasarkan nama/email atau role.</p>
        </div>
        {mayAdd && <Button icon={Plus} onClick={openCreate}>Tambah user</Button>}
      </div>

      <div className="crud-filters">
        <label className="crud-search">
          <span>Cari pengguna</span>
          <span className="input-wrap">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                users.setFilter(event.target.value);
              }}
              placeholder="Nama atau email"
            />
          </span>
        </label>
        <label className="crud-search">
          <span>Role</span>
          <select
            className="crud-select"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              users.setPage(1);
            }}
          >
            <option value="">Semua role</option>
            {roleItems.map((role) => (
              <option value={role.id} key={role.id}>{role.name}</option>
            ))}
          </select>
        </label>
      </div>

      {notice && <div className="notice"><Alert>{notice}</Alert></div>}

      <DataTable
        ariaLabel="Daftar pengguna"
        columns={["Nama", "Email", "Role", "Status", "Bergabung", "Aksi"]}
        data={users.result.data}
        loading={users.result.loading}
        error={users.result.error}
        errorTitle="Pengguna tidak dapat dimuat"
        emptyTitle="Tidak ada pengguna"
        emptyDescription="Coba ubah kata kunci pencarian atau tambahkan pengguna baru."
        emptyIcon={UsersIcon}
        onRetry={users.reload}
        renderRow={(user) => (
          <tr key={user.id}>
            <td className="cell-strong">{user.name}</td>
            <td className="cell-muted">{user.email}</td>
            <td>
              <Badge>{user.role?.name || user.role || "-"}</Badge>
            </td>
            <td>
              <Badge tone={user.is_active === false ? "danger" : "success"}>
                {user.is_active === false ? "Nonaktif" : "Aktif"}
              </Badge>
            </td>
            <td className="cell-muted">
              {user.created_at ? dateTime(user.created_at) : "-"}
            </td>
            <td>
              <div className="row-actions">
                {mayEdit && (
                  <Button variant="outline" icon={Pencil} onClick={() => openEdit(user)}>
                    Ubah
                  </Button>
                )}
                {mayDelete && (
                  <Button
                    variant="text"
                    icon={Trash2}
                    loading={deletingId === user.id}
                    onClick={() => remove(user)}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination
        result={users.result}
        page={users.page}
        onPageChange={users.setPage}
        itemLabel="pengguna"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Ubah ${editing.name}` : "Tambah user"}
        description="Password hanya wajib diisi saat membuat akun baru."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" form="user-form" loading={saving} loadingText="Menyimpan…">
              Simpan
            </Button>
          </>
        }
      >
        <form id="user-form" className="crud-form" onSubmit={submit}>
          <div className="form-row">
            <div className="form-block">
              <label htmlFor="user-name">Nama</label>
              <input
                id="user-name"
                className="crud-input"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                required
              />
            </div>
            <div className="form-block">
              <label htmlFor="user-email">Email</label>
              <input
                id="user-email"
                type="email"
                className="crud-input"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-block">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                className="crud-select"
                value={form.role_id}
                onChange={(event) => setField("role_id", event.target.value)}
                required
              >
                <option value="">Pilih role</option>
                {roleItems.map((role) => (
                  <option value={role.id} key={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="form-block">
              <label htmlFor="user-password">
                Password {editing ? "(kosongkan jika tidak diubah)" : ""}
              </label>
              <input
                id="user-password"
                type="password"
                className="crud-input"
                value={form.password}
                onChange={(event) => setField("password", event.target.value)}
                required={!editing}
              />
            </div>
          </div>
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
