import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Database } from "lucide-react";
import { createServer } from "vite";

let server;
before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL("..", import.meta.url)),
    logLevel: "error",
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
});
after(async () => {
  await server?.close();
});

async function render(path, props = {}, children) {
  const { default: Component } = await server.ssrLoadModule(`/src/${path}.jsx`);
  return renderToStaticMarkup(h(Component, props, children));
}
const ui = (name, props, children) =>
  render(`components/ui/${name}`, props, children);

const tableProps = {
  columns: ["Nama", "Status"],
  data: [],
  ariaLabel: "Data uji",
  errorTitle: "Gagal memuat",
  emptyTitle: "Belum ada data",
  emptyDescription: "Data belum tersedia.",
  emptyIcon: Database,
  renderRow: (row) =>
    h(
      "tr",
      { key: row.id },
      h("td", null, row.name),
      h("td", null, row.status),
    ),
};

test("Button defaults to non-submit and preserves loading state", async () => {
  const idle = await ui("Button", { variant: "outline" }, "Perbarui");
  assert.match(idle, /type="button"/);
  assert.match(idle, /button-outline/);
  const busy = await ui(
    "Button",
    { type: "submit", loading: true, loadingText: "Memproses" },
    "Simpan",
  );
  assert.match(busy, /disabled=""/);
  assert.match(busy, /Memproses/);
  assert.doesNotMatch(busy, />Simpan</);
});

test("IconButton carries accessible labels and navigation attributes", async () => {
  const html = await ui("IconButton", {
    label: "Buka navigasi",
    icon: Database,
    "aria-expanded": true,
    "aria-controls": "main-navigation",
  });
  assert.match(html, /aria-label="Buka navigasi"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="main-navigation"/);
});

test("DataTable loading rows match the number of columns", async () => {
  const html = await ui("DataTable", { ...tableProps, loading: true });
  assert.match(html, /aria-busy="true"/);
  assert.equal((html.match(/<td/g) || []).length, 8);
  assert.doesNotMatch(html, /Belum ada data/);
});

test("DataTable error has one spanning cell, alert and retry", async () => {
  const html = await ui("DataTable", {
    ...tableProps,
    error: "API tidak tersedia",
    onRetry() {},
  });
  assert.match(html, /colSpan="2"|colspan="2"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /Coba lagi/);
  assert.match(html, /API tidak tersedia/);
  assert.doesNotMatch(html, /Belum ada data/);
});

test("DataTable empty state accepts a feature-specific reset action", async () => {
  const html = await ui("DataTable", {
    ...tableProps,
    emptyAction: h("button", null, "Hapus filter"),
  });
  assert.match(html, /Belum ada data/);
  assert.match(html, /Hapus filter/);
});

test("DataTable renders rows and escapes untrusted values", async () => {
  const html = await ui("DataTable", {
    ...tableProps,
    data: [{ id: "1", name: "<script>alert(1)</script>", status: "Aktif" }],
  });
  assert.match(html, /class="data-table"/);
  assert.match(html, /aria-label="Data uji"/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test("Pagination disables both directions for loading, error and empty data", async () => {
  for (const result of [
    { loading: true },
    { error: "Gagal" },
    { last_page: 1, total: 0 },
  ]) {
    const html = await ui("Pagination", { result, page: 1, onPageChange() {} });
    assert.equal((html.match(/disabled=""/g) || []).length, 2);
  }
});

test("Pagination respects first and last page and custom labels", async () => {
  for (const page of [1, 3]) {
    const html = await ui("Pagination", {
      result: { last_page: 3, from: 1, to: 20, total: 45 },
      page,
      onPageChange() {},
      previousLabel: "Aktivitas sebelumnya",
      nextLabel: "Aktivitas berikutnya",
      itemLabel: "log",
    });
    assert.equal((html.match(/disabled=""/g) || []).length, 1);
    assert.match(html, /1–20 dari 45 log/);
    assert.match(html, /Aktivitas berikutnya/);
  }
});

test("FilterSelect renders a selected value and all option", async () => {
  const html = await ui("FilterSelect", {
    label: "Status",
    ariaLabel: "Filter status",
    value: "paid",
    onChange() {},
    allLabel: "Semua status",
    options: [{ value: "paid", label: "Lunas" }],
  });
  assert.match(html, /aria-label="Filter status"/);
  assert.match(html, /value="paid" selected=""/);
  assert.match(html, /value=""/);
});

test("SegmentedControl exposes one pressed button", async () => {
  const html = await ui("SegmentedControl", {
    label: "Jenis data",
    value: "logs",
    onChange() {},
    options: [
      { value: "records", label: "Data" },
      { value: "logs", label: "Log" },
    ],
  });
  assert.match(html, /role="group"/);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
  assert.match(html, /aria-pressed="false"/);
});

test("FormField and PasswordField work without a login-specific wrapper", async () => {
  const field = await ui("FormField", {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
  });
  assert.match(field, /for="email"/);
  assert.match(field, /class="field-label"/);
  assert.match(field, /required=""/);
  const password = await ui("PasswordField", {
    id: "secret",
    disabled: true,
    autoComplete: "current-password",
  });
  assert.match(password, /type="password"/);
  assert.match(password, /aria-label="Tampilkan password"/);
  assert.match(password, /aria-pressed="false"/);
  assert.equal((password.match(/disabled=""/g) || []).length, 2);
});

test("MetricCard distinguishes missing data from zero", async () => {
  const zero = await ui("MetricCard", {
    icon: Database,
    label: "Jumlah",
    value: "0",
    note: "catatan",
  });
  assert.match(zero, />0<\/strong>/);
  const missing = await ui("MetricCard", {
    icon: Database,
    label: "Jumlah",
    value: "—",
  });
  assert.match(missing, />—<\/strong>/);
});

test("Page composes reusable heading, children and footer", async () => {
  const html = await render(
    "layouts/Page",
    {
      title: "Halaman baru",
      description: "Deskripsi",
      actions: h("button", null, "Tambah"),
      footer: "Diperbarui",
    },
    h("section", null, "Isi halaman"),
  );
  assert.match(html, /<h1>Halaman baru<\/h1>/);
  assert.match(html, /Isi halaman/);
  assert.match(html, /Tambah/);
  assert.match(html, /class="page-footer"/);
  assert.match(html, /Diperbarui/);
});

test("SessionScreen keeps checking and unavailable states distinct", async () => {
  const checking = await render("features/auth/components/SessionScreen", {
    status: "checking",
  });
  assert.match(checking, /Memeriksa sesi Anda/);
  assert.doesNotMatch(checking, /Kembali ke login/);
  const unavailable = await render("features/auth/components/SessionScreen", {
    status: "unavailable",
    message: "Tidak terhubung",
    onRetry() {},
    onLogout() {},
  });
  assert.match(unavailable, /Tidak terhubung/);
  assert.match(unavailable, /Coba lagi/);
  assert.match(unavailable, /Kembali ke login/);
});

test("PaymentStatus handles refunded and unknown statuses", async () => {
  const refunded = await render("features/payments/components/PaymentStatus", {
    status: "refunded",
  });
  assert.match(refunded, /Dikembalikan/);
  const unknown = await render("features/payments/components/PaymentStatus", {
    status: "custom",
  });
  assert.match(unknown, /badge neutral/);
  assert.match(unknown, /custom/);
});

test("Route registry supplies page, menu and title from one definition", async () => {
  const { adminRoutes } = await server.ssrLoadModule("/src/config/routes.js");
  const paths = adminRoutes.map((route) => route.path);
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(paths.includes("/dashboard"));
  assert.ok(paths.includes("/kud"));
  for (const route of adminRoutes) {
    assert.ok(route.path.startsWith("/"));
    assert.ok(route.label && route.title && route.icon);
    assert.equal(typeof route.component, "function");
  }
});
