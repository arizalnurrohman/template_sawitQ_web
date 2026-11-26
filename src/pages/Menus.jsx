import { useState } from "react";
import { ListTree, Pencil, Plus, Trash2 } from "lucide-react";
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
import { iconOptions } from "../config/menuIcons.js";
import "../features/access/access.css";

const GROUPS = [
  "WORKSPACE",
  "ADMINISTRASI",
  "PENDUKUNG",
  "PANDUAN",
  "LAINNYA",
];
const emptyForm = {
  label: "",
  key: "",
  path: "",
  group: "ADMINISTRASI",
  icon: "ListTree",
  order: 10,
  parent_id: "",
  is_active: true,
};

export default function Menus() {
  const { reload: reloadNavigation, can } = useNavigation();
  const { data, loading, error, reload } = useApiResource("/admin/menus");
  const { mutate, loading: saving, error: saveError } = useMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const mayAdd = can("menus", "add");
  const mayEdit = can("menus", "edit");
  const mayDelete = can("menus", "delete");
  const [search, setSearch] = useState("");
  const items = (Array.isArray(data) ? data : data?.data || []).filter((menu) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [menu.label, menu.key, menu.path, menu.group]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setNotice("");
    setOpen(true);
  }

  function openEdit(menu) {
    setEditing(menu);
    setForm({
      label: menu.label || "",
      key: menu.key || "",
      path: menu.path || "",
      group: menu.group || "LAINNYA",
      icon: menu.icon || "ListTree",
      order: Number(menu.order ?? 10),
      parent_id: menu.parent_id ?? "",
      is_active: menu.is_active !== false,
    });
    setNotice("");
    setOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    const payload = {
      ...form,
      order: Number(form.order),
      parent_id: form.parent_id || null,
    };
    try {
      if (editing) await mutate(`/admin/menus/${editing.id}`, { method: "PUT", body: payload });
      else await mutate("/admin/menus", { body: payload });
      setOpen(false);
      reload();
      reloadNavigation();
    } catch (failure) {
      setNotice(failure.message);
    }
  }

  async function remove(menu) {
    if (!window.confirm(`Hapus menu "${menu.label}"?`)) return;
    setDeletingId(menu.id);
    try {
      await mutate(`/admin/menus/${menu.id}`, { method: "DELETE" });
      reload();
      reloadNavigation();
    } catch (failure) {
      setNotice(failure.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Page
      title="Manajemen menu"
      eyebrow="AKSES"
      description="Atur menu yang tampil di sidebar beserta urutan, grup, dan ikonnya."
      actions={
        <RefreshButton loading={loading} onClick={() => { reload(); reloadNavigation(); }} />
      }
      footer={`${items.length} menu terdaftar`}
    >
      <div className="crud-toolbar">
        <div>
          <h2>Daftar menu</h2>
          <p>Perubahan menu akan memengaruhi sidebar setelah data dimuat ulang.</p>
        </div>
        {mayAdd && (
          <Button icon={Plus} onClick={openCreate}>Tambah menu</Button>
        )}
      </div>

      {notice && <div className="notice"><Alert>{notice}</Alert></div>}

      <div className="crud-filters" style={{ marginBottom: 12 }}>
        <label className="crud-search">
          <span>Cari menu</span>
          <span className="input-wrap">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Label, key, path, atau grup"
            />
          </span>
        </label>
      </div>

      <DataTable
        ariaLabel="Daftar menu"
        columns={["Menu", "Path", "Grup", "Urutan", "Status", "Aksi"]}
        data={items}
        loading={loading}
        error={error}
        errorTitle="Menu tidak dapat dimuat"
        emptyTitle="Belum ada menu"
        emptyDescription="Tambahkan menu pertama untuk mengisi sidebar."
        emptyIcon={ListTree}
        onRetry={reload}
        renderRow={(menu) => (
          <tr key={menu.id}>
            <td className="cell-strong">{menu.label}</td>
            <td className="cell-muted">{menu.path}</td>
            <td>{menu.group || "LAINNYA"}</td>
            <td>{menu.order ?? "-"}</td>
            <td>
              <Badge tone={menu.is_active === false ? "danger" : "success"}>
                {menu.is_active === false ? "Nonaktif" : "Aktif"}
              </Badge>
            </td>
            <td>
              <div className="row-actions">
                {mayEdit && (
                  <Button variant="outline" icon={Pencil} onClick={() => openEdit(menu)}>
                    Ubah
                  </Button>
                )}
                {mayDelete && (
                  <Button
                    variant="text"
                    icon={Trash2}
                    loading={deletingId === menu.id}
                    onClick={() => remove(menu)}
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
        title={editing ? "Ubah menu" : "Tambah menu"}
        description="Key harus unik karena dipakai sebagai penghubung ke komponen halaman."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" form="menu-form" loading={saving} loadingText="Menyimpan…">
              Simpan
            </Button>
          </>
        }
      >
        <form id="menu-form" className="crud-form" onSubmit={submit}>
          <div className="form-row">
            <div className="form-block">
              <label htmlFor="menu-label">Label menu</label>
              <input
                id="menu-label"
                className="crud-input"
                value={form.label}
                onChange={(event) => setField("label", event.target.value)}
                required
              />
            </div>
            <div className="form-block">
              <label htmlFor="menu-key">Key</label>
              <input
                id="menu-key"
                className="crud-input"
                value={form.key}
                onChange={(event) => setField("key", event.target.value)}
                placeholder="contoh: users"
                required
              />
            </div>
          </div>
          <div className="form-block">
            <label htmlFor="menu-path">Path rute</label>
            <input
              id="menu-path"
              className="crud-input"
              value={form.path}
              onChange={(event) => setField("path", event.target.value)}
              placeholder="/users"
              required
            />
            <span className="form-hint">Harus sama dengan `path` di src/config/routes.js.</span>
          </div>
          <div className="form-row">
            <div className="form-block">
              <label htmlFor="menu-group">Grup</label>
              <select
                id="menu-group"
                className="crud-select"
                value={form.group}
                onChange={(event) => setField("group", event.target.value)}
              >
                {GROUPS.map((group) => <option key={group}>{group}</option>)}
              </select>
            </div>
            <div className="form-block">
              <label htmlFor="menu-icon">Ikon</label>
              <select
                id="menu-icon"
                className="crud-select"
                value={form.icon}
                onChange={(event) => setField("icon", event.target.value)}
              >
                {iconOptions.map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-block">
              <label htmlFor="menu-order">Urutan</label>
              <input
                id="menu-order"
                className="crud-input"
                type="number"
                value={form.order}
                onChange={(event) => setField("order", event.target.value)}
              />
            </div>
            <div className="form-block">
              <label htmlFor="menu-parent">Menu induk (opsional)</label>
              <select
                id="menu-parent"
                className="crud-select"
                value={form.parent_id}
                onChange={(event) => setField("parent_id", event.target.value)}
              >
                <option value="">Tidak ada</option>
                {items.filter((item) => item.id !== editing?.id).map((item) => (
                  <option value={item.id} key={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="check-line">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setField("is_active", event.target.checked)}
            />
            Menu aktif
          </label>
          {saveError && <Alert>{saveError}</Alert>}
        </form>
      </Modal>
    </Page>
  );
}
