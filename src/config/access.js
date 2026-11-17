// Konstanta dan helper untuk hak akses menu.
// Aksi yang dikenal: view (lihat), add (tambah), edit (ubah), delete (hapus).

export const ACCESS_ACTIONS = ["view", "add", "edit", "delete"];

export const ACTION_LABELS = {
  view: "Lihat",
  add: "Tambah",
  edit: "Ubah",
  delete: "Hapus",
};

export function emptyPermissions() {
  return { view: false, add: false, edit: false, delete: false };
}

export function fullPermissions() {
  return { view: true, add: true, edit: true, delete: true };
}

// Menerima objek { view: true, ... }, array ["view", "add"], atau bentuk angka 1/0.
export function normalizePermissions(value) {
  if (Array.isArray(value)) {
    return Object.fromEntries(
      ACCESS_ACTIONS.map((action) => [action, value.includes(action)]),
    );
  }
  if (!value || typeof value !== "object") return emptyPermissions();
  return Object.fromEntries(
    ACCESS_ACTIONS.map((action) => [
      action,
      value[action] === true || value[action] === 1,
    ]),
  );
}

export function canDo(menu, action) {
  return normalizePermissions(menu?.permissions)[action] === true;
}

// Mengubah respons API menjadi bentuk menu yang dipakai UI.
// `registry` berisi definisi statis dari src/config/routes.js (ikon, grup, dll).
export function normalizeMenus(payload, registry = {}) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return rows
    .map((row, index) => {
      const key = row.key || row.slug || row.path;
      const definition = registry[key] || {};
      return {
        id: row.id ?? key,
        key,
        label: row.label || row.name || row.title || key,
        path: row.path || definition.path || "/",
        icon: definition.icon || row.icon || null,
        group: row.group || definition.group || "LAINNYA",
        order: Number(row.order ?? row.sort_order ?? index + 1),
        parentId: row.parent_id ?? row.parentId ?? null,
        isActive: row.is_active !== false && row.isActive !== false,
        permissions: normalizePermissions(
          row.permissions ?? row.abilities ?? row.access,
        ),
      };
    })
    .filter((menu) => menu.isActive && menu.key)
    .sort((a, b) => a.order - b.order);
}

// Menyiapkan payload permissions untuk disimpan ke backend.
export function toPermissionPayload(value) {
  return Object.fromEntries(
    Object.entries(value || {}).map(([menuId, actions]) => [
      menuId,
      Object.fromEntries(
        ACCESS_ACTIONS.map((action) => [action, Boolean(actions?.[action])]),
      ),
    ]),
  );
}
