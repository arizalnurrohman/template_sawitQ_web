# Panduan Komponen, Halaman, dan Akses Dinamis

Dokumen ini menjelaskan tiga hal:

1. Cara memakai komponen, contoh file, dan halaman kosong.
2. Struktur menu dinamis dari database lengkap dengan role + aksi `view/add/edit/delete`.
3. Daftar menu yang dibuat dan kontrak API yang harus disediakan backend.

---

## 1. Komponen

### 1.1 Aturan umum

- Semua UI primitive ada di `src/components/ui/` (Button, Badge, Panel, DataTable, Modal, dll).
- Ikon memakai `lucide-react`; jangan membuat ikon manual.
- CSS ditaruh berdampingan dengan komponen/feature (`Button.css`, `access.css`, dll).
- Halaman berada di `src/pages/`, komponen khusus fitur di `src/features/<nama>/components/`.
- `src/config/routes.js` adalah **sumber tunggal** untuk path, label sidebar, judul tab, ikon, dan komponen halaman.

### 1.2 Memakai komponen yang sudah ada

```jsx
import { Plus } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Panel from "../components/ui/Panel.jsx";
import DataTable from "../components/ui/DataTable.jsx";

<Panel title="Daftar pengguna" icon={Users}>
  <Button icon={Plus} onClick={openCreate}>Tambah user</Button>
  <Badge tone="success">Aktif</Badge>
  <DataTable
    columns={["Nama", "Email"]}
    data={items}
    loading={loading}
    error={error}
    onRetry={reload}
    renderRow={(item) => <tr key={item.id}><td>{item.name}</td></tr>}
  />
</Panel>
```

| Komponen | Props penting |
|---|---|
| `Button` | `variant` (primary/outline/text), `icon`, `iconPosition`, `loading`, `loadingText`, `type`, `form` |
| `Badge` | `tone` (neutral/success/warning/danger) |
| `Panel` | `title`, `description`, `icon`, `className` |
| `DataTable` | `columns`, `data`, `loading`, `error`, `onRetry`, `emptyTitle`, `renderRow`, `ariaLabel` |
| `Pagination` | `result`, `page`, `onPageChange`, `itemLabel` |
| `Modal` | `open`, `title`, `description`, `onClose`, `footer`, `size` (md/lg) |
| `FormField` | `label`, `id`, `icon`, `endAdornment`, + props input biasa |
| `MetricCard` | `icon`, `label`, `value`, `note`, `tone`, `loading` |

### 1.3 Membuat komponen sendiri

Contoh nyata: `src/features/examples/components/ExampleCard.jsx`.

```jsx
export default function ExampleCard({ icon: Icon, title, tone = "neutral", children }) {
  return (
    <Panel title={title} icon={Icon}>
      <Badge tone={tone}>Contoh</Badge>
      {children}
    </Panel>
  );
}
```

Pemakaiannya ada di `src/features/examples/ComponentExample.jsx` (menu **Contoh Komponen**).

### 1.4 Halaman kosong (template)

File: `src/pages/Blank.jsx`.

Halaman ini sudah terdaftar di menu dengan key `blank` dan path `/examples/blank`, jadi bisa langsung dibuka. Isinya sengaja minimal: hanya `Page` + komentar `TODO` tempat komponen ditambahkan. Untuk membuat modul baru:

1. Salin `Blank.jsx` menjadi `src/pages/NamaModul.jsx`.
2. Tambahkan komponen di dalam `<Page>`.
3. Daftarkan di `src/config/routes.js` (path, label, title, icon, component, key).
4. Buat baris menu di database dengan `key` yang sama.

---

## 2. Menu dinamis + role + hak akses

### 2.1 Alur data

```
login (role admin)
  -> AuthContext: /api/me
  -> NavigationContext: GET /api/admin/menus
  -> normalizeMenus(): menu + permissions {view,add,edit,delete}
  -> Sidebar: hanya menu dengan permissions.view = true
  -> App.jsx: hanya rute dengan permissions.view = true yang didaftarkan
  -> can(key, action): dipakai tombol Tambah/Ubah/Hapus di tiap halaman
```

File terkait:

| File | Peran |
|---|---|
| `src/config/access.js` | konstanta aksi, normalisasi permission & menu |
| `src/config/routes.js` | registry komponen + menu bawaan (fallback) |
| `src/context/NavigationContext.jsx` | memuat menu dari API, menyediakan `can()` |
| `src/features/navigation/components/AccessScreen.jsx` | layar saat menu dimuat/gagal |
| `src/layouts/Sidebar.jsx` | render menu dinamis per grup |
| `src/App.jsx` | menyaring rute sesuai izin `view` |
| `src/features/access/components/PermissionMatrix.jsx` | matriks view/add/edit/delete |

### 2.2 Fallback

Jika endpoint `/admin/menus` belum tersedia atau error, aplikasi memakai `fallbackMenus` dari `routes.js` dan menampilkan peringatan di sidebar. Ini hanya untuk kemudahan pengembangan — **backend tetap wajib memvalidasi izin**, karena pengecekan di frontend bukan pengamanan.

### 2.3 Memakai `can()`

```jsx
import { useNavigation } from "../context/NavigationContext.jsx";

const { can } = useNavigation();
const bolehTambah = can("users", "add");
const bolehUbah = can("users", "edit");
const bolehHapus = can("users", "delete");
```

`can(key, action)` mengembalikan `false` jika menu tidak ditemukan (fail-closed).

### 2.4 Matriks hak akses

Tiap baris menu memiliki empat aksi:

| Aksi | Efek di UI |
|---|---|
| `view` | menu tampil di sidebar & rute aktif |
| `add` | tombol Tambah muncul |
| `edit` | tombol Ubah muncul |
| `delete` | tombol Hapus muncul |

Halaman **Manajemen Role** menyediakan matriks lengkap untuk mengatur keempat aksi tersebut per menu. Halaman **Hak Akses** menampilkan matriks yang sama secara read-only untuk een role yang dipilih.

---

## 3. Daftar menu

| Grup | Menu | Key | Path | Kegunaan |
|---|---|---|---|---|
| WORKSPACE | Dashboard | `dashboard` | `/dashboard` | Monitoring seluruh ekosistem |
| ADMINISTRASI | Manajemen Menu | `menus` | `/menus` | CRUD menu, urutan, grup, ikon |
| ADMINISTRASI | Manajemen Role | `roles` | `/roles` | CRUD role + matriks akses |
| ADMINISTRASI | Manajemen User | `users` | `/users` | CRUD akun + penetapan role |
| PENDUKUNG | Hak Akses | `permissions` | `/permissions` | Peta izin role (read-only) |
| PENDUKUNG | Riwayat Aktivitas | `activity_logs` | `/activity-logs` | Audit perubahan menu/role/user |
| PANDUAN | Contoh Komponen | `example` | `/examples/component` | Dokumentasi komponen langsung di UI |
| PANDUAN | Halaman Kosong | `blank` | `/examples/blank` | Template modul baru |

Menu pendukung sengaja ditambahkan: **Hak Akses** untuk audit izin, **Riwayat Aktivitas** untuk jejak perubahan, serta dua menu panduan untuk mempercepat pengembangan.

---

## 4. Kontrak API yang dibutuhkan backend

Semua endpoint di bawah berada di bawah middleware `auth:sanctum` + `admin`.

### 4.1 `GET /api/admin/menus`

Respons: array menu (boleh dibungkus `{ "data": [...] }`).

```json
{
  "data": [
    {
      "id": "01J...",
      "key": "users",
      "label": "Manajemen User",
      "path": "/users",
      "group": "ADMINISTRASI",
      "icon": "Users",
      "order": 12,
      "parent_id": null,
      "is_active": true,
      "permissions": { "view": true, "add": true, "edit": true, "delete": false }
    }
  ]
}
```

`permissions` di sini adalah izin **role yang sedang login**, bukan izin semua role.

### 4.2 Role

| Method | Path | Body / keterangan |
|---|---|---|
| GET | `/admin/roles` | daftar role |
| GET | `/admin/roles/{id}` | detail + `permissions` |
| POST | `/admin/roles` | `{ name, slug, description, permissions }` |
| PUT | `/admin/roles/{id}` | sama seperti POST |
| DELETE | `/admin/roles/{id}` | — |

Bentuk `permissions` yang diterima:

```json
{
  "permissions": {
    "<menu_id>": { "view": true, "add": false, "edit": false, "delete": false }
  }
}
```

### 4.3 User

| Method | Path | Body / keterangan |
|---|---|---|
| GET | `/admin/users?page=1&search=&role_id=` | paginasi Laravel (`data`, `total`, `last_page`, dll) |
| POST | `/admin/users` | `{ name, email, password, role_id, is_active }` |
| PUT | `/admin/users/{id}` | sama; `password` opsional |
| DELETE | `/admin/users/{id}` | — |

### 4.4 Menu (CRUD)

| Method | Path | Body |
|---|---|---|
| POST | `/admin/menus` | `{ label, key, path, group, icon, order, parent_id, is_active }` |
| PUT | `/admin/menus/{id}` | sama |
| DELETE | `/admin/menus/{id}` | — |

### 4.5 Audit

`GET /admin/activity-logs?page=&type=menu|role|user` dengan format paginasi Laravel.

---

## 5. Usulan tabel database (Laravel)

```text
admin_menus
  id (uuid, pk)
  key (string, unique)         # penghubung dengan routes.js
  label (string)
  path (string)
  group (string)
  icon (string, nullable)
  order (integer)
  parent_id (uuid, nullable)
  is_active (boolean)
  timestamps

admin_roles
  id (uuid, pk)
  name (string, unique)
  slug (string, unique)
  description (string, nullable)
  is_system (boolean)          # role bawaan tidak boleh dihapus
  timestamps

admin_role_menu                 # pivot hak akses
  role_id (uuid, fk)
  menu_id (uuid, fk)
  can_view (boolean)
  can_add (boolean)
  can_edit (boolean)
  can_delete (boolean)
  PRIMARY KEY (role_id, menu_id)

admin_user_role (atau kolom role_id di users)
  user_id (uuid, fk)
  role_id (uuid, fk)

activity_logs
  id (uuid, pk)
  actor_id (uuid)
  actor_name (string)
  action (string)              # created|updated|deleted
  entity_type (string)         # menu|role|user
  context (json, nullable)
  created_at
```

Backend harus mengembalikan `permissions` pada `GET /admin/menus` dengan cara menggabungkan `admin_role_menu` dan role aktif user. Endpoint lain tetap memakai middleware `admin` + validasi permission di server.

---

## 6. Cara menambah menu baru (checklist)

1. Buat halaman di `src/pages/` (boleh salin `Blank.jsx`).
2. Tambahkan entri di `adminRoutes` (`src/config/routes.js`) dengan `key` unik.
3. Jalankan migration/seed untuk menambah baris di `admin_menus` dengan `key` yang sama.
4. Berikan izin `view` (dan aksi lain yang diperlukan) ke role melalui **Manajemen Role**.
5. Klik refresh pada sidebar/app untuk memuat ulang menu.

Jika `key` di database tidak cocok dengan `key` di `routes.js`, menu akan tampil dengan ikon generik dan rute tidak akan aktif — jadi jaga agar keduanya identik.
