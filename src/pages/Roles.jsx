import { useState } from "react";
import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
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
import { toPermissionPayload, ACCESS_ACTIONS, emptyPermissions } from "../config/access.js";
import PermissionMatrix from "../features/access/components/PermissionMatrix.jsx";
import { toMatrix } from "../features/access/permissionUtils.js";
import "../features/access/access.css";

const emptyForm = { name: "", slug: "", description: "" };

export default function Roles() {
  const { token } = useAuth();
  const { reload: reloadNavigation, can } = useNavigation();
  const roles = useApiResource("/admin/roles");
  const menus = useApiResource("/admin/menus");
  const { mutate, loading: saving, error: saveError } = useMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [matrix, setMatrix] = useState({});
  const [notice, setNotice] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const mayAdd = can("roles", "add");
  const mayEdit = can("roles", "edit");
  const mayDelete = can("roles", "delete");
  const roleItems = Array.isArray(roles.data) ? roles.data : roles.data?.data || [];
  const menuItems = Array.isArray(menus.data)
    ? menus.data
    : menus.data?.data || [];

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function buildEmptyMatrix() {
    return Object.fromEntries(
      menuItems.map((menu) => [menu.id, emptyPermissions()]),
    );
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setMatrix(buildEmptyMatrix());
    setNotice("");
    setOpen(true);
  }

  async function openEdit(role) {
    setEditing(role);
    setForm({
      name: role.name || "",
      slug: role.slug || role.name?.toLowerCase().replace(/\s+/g, "-") || "",
      description: role.description || "",
    });
    setNotice("");
    setMatrix(buildEmptyMatrix());
    setOpen(true);
    setLoadingDetail(true);
    try {
      const response = await request(`/admin/roles/${role.id}`, { token });
      const permissions =
        response.data?.permissions ?? response.data?.role?.permissions ?? role.permissions;
      setMatrix({ ...buildEmptyMatrix(), ...toMatrix(permissions) });
    } catch (failure) {
      setNotice(failure.message);
    } finally {
      setLoadingDetail(false);
    }
  }

  function changePermission(menuId, action, checked) {
    setMatrix((current) => ({
      ...current,
      [menuId]: { ...(current[menuId] || emptyPermissions()), [action]: checked },
    }));
  }

  function toggleAll(menuId, checked) {
    const actions = Object.fromEntries(
      ACCESS_ACTIONS.map((action) => [action, checked]),
    );
    setMatrix((current) => ({
      ...current,
      [menuId]: { ...(current[menuId] || emptyPermissions()), ...actions },
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    const payload = {
      ...form,
      permissions: toPermissionPayload(matrix),
    };
    try {
      if (editing)
        await mutate(`/admin/roles/${editing.id}`, { method: "PUT", body: payload });
      else await mutate("/admin/roles", { body: payload });
      setOpen(false);
      roles.reload();
      reloadNavigation();
    } catch (failure) {
      setNotice(failure.message);
    }
  }

  async function remove(role) {
    if (!window.confirm(`Hapus role "${role.name}"?`)) return;
    setDeletingId(role.id);
    try {
      await mutate(`/admin/roles/${role.id}`, { method: "DELETE" });
      roles.reload();
      reloadNavigation();
    } catch (failure) {
      setNotice(failure.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Page
      title="Manajemen role"
      eyebrow="AKSES"
      description="Buat role dan tentukan aksi yang diizinkan untuk setiap menu."
      actions={<RefreshButton loading={roles.loading || menus.loading} onClick={() => { roles.reload(); menus.reload(); }} />}
      footer={`${roleItems.length} role · ${menuItems.length} menu`}
    >
      <div className="crud-toolbar">
        <div>
          <h2>Daftar role</h2>
          <p>Akses bersifat dinamis: centang menu lalu simpan untuk menerapkannya.</p>
        </div>
        {mayAdd && <Button icon={Plus} onClick={openCreate}>Tambah role</Button>}
      </div>

      {notice && <div className="notice"><Alert>{notice}</Alert></div>}

      <DataTable
        ariaLabel="Daftar role"
        columns={["Role", "Slug", "Keterangan", "Aksi"]}
        data={roleItems}
        loading={roles.loading}
        error={roles.error}
        errorTitle="Role tidak dapat dimuat"
        emptyTitle="Belum ada role"
        emptyDescription="Tambahkan role untuk mulai mengatur hak akses menu."
        emptyIcon={Shield}
        onRetry={roles.reload}
        renderRow={(role) => (
          <tr key={role.id}>
            <td className="cell-strong">{role.name}</td>
            <td><Badge>{role.slug || "-"}</Badge></td>
            <td className="cell-muted">{role.description || "-"}</td>
            <td>
              <div className="row-actions">
                {mayEdit && (
                  <Button variant="outline" icon={Pencil} onClick={() => openEdit(role)}>
                    Atur akses
                  </Button>
                )}
                {mayDelete && (
                  <Button
                    variant="text"
                    icon={Trash2}
                    loading={deletingId === role.id}
                    onClick={() => remove(role)}
                  >
                    Hapus
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
        size="lg"
        title={editing ? `Ubah role ${editing.name}` : "Tambah role"}
        description="Matriks hak akses: Lihat, Tambah, Ubah, dan Hapus per menu."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" form="role-form" loading={saving || loadingDetail} loadingText="Menyimpan…">
              Simpan
            </Button>
          </>
        }
      >
        <form id="role-form" className="crud-form" onSubmit={submit}>
          <div className="form-row">
            <div className="form-block">
              <label htmlFor="role-name">Nama role</label>
              <input
                id="role-name"
                className="crud-input"
                value={form.name}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((current) => ({
                    ...current,
                    name: value,
                    slug: current.slug || value.toLowerCase().replace(/\s+/g, "-"),
                  }));
                }}
                required
              />
            </div>
            <div className="form-block">
              <label htmlFor="role-slug">Slug</label>
              <input
                id="role-slug"
                className="crud-input"
                value={form.slug}
                onChange={(event) => setField("slug", event.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-block">
            <label htmlFor="role-description">Keterangan</label>
            <input
              id="role-description"
              className="crud-input"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Hak akses menu</label>
            <PermissionMatrix
              menus={menuItems}
              value={matrix}
              onChange={changePermission}
              onToggleAll={toggleAll}
              readOnly={loadingDetail}
            />
          </div>
          {saveError && <Alert>{saveError}</Alert>}
        </form>
      </Modal>
    </Page>
  );
}
