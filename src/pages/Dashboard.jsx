import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Crown,
  Database,
  LayoutDashboard,
  Leaf,
  LoaderCircle,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Users,
  UserRound,
  Trees,
  X,
} from "lucide-react";
import Brand from "../components/Brand.jsx";
import MonitoringPanel from "../components/MonitoringPanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { request } from "../lib/api.js";
import {
  dateTime,
  initials,
  number,
  paymentStatuses,
  rupiah,
} from "../lib/format.js";

function Metric({ icon: Icon, label, value, note, tone = "green", loading }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <strong className={loading ? "skeleton metric-skeleton" : ""}>
        {loading ? "\u00a0" : value}
      </strong>
      <div className="metric-note">
        <span className={`tiny-dot ${tone}`} />
        {note}
      </div>
    </article>
  );
}

function Status({ status }) {
  const details = paymentStatuses[status] || {
    label: status || "Tidak diketahui",
    tone: "neutral",
  };
  return (
    <span className={`badge ${details.tone}`}>
      <span />
      {details.label}
    </span>
  );
}

export default function Dashboard() {
  const { user, token, logout, clearSession } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [revision, setRevision] = useState(0);
  const [overview, setOverview] = useState({
    loading: true,
    errors: [],
    counts: {},
  });
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState({
    loading: true,
    data: [],
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();
    setOverview((previous) => ({ ...previous, loading: true }));
    const paths = ["/admin/overview", "/admin/plan", "/maintenance-status"];
    Promise.allSettled(
      paths.map((path) => request(path, { token, signal: controller.signal })),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const denied = results.find(
        (result) =>
          result.status === "rejected" &&
          [401, 403].includes(result.reason.status),
      );
      if (denied) {
        clearSession(denied.reason.message);
        return;
      }
      const value = (index) =>
        results[index].status === "fulfilled"
          ? results[index].value.data
          : null;
      const labels = ["Monitoring global", "Paket Pro", "Status layanan"];
      setOverview({
        loading: false,
        counts: value(0)?.payments || {},
        users: value(0)?.users || {},
        kebun: value(0)?.kebun || {},
        operations: value(0)?.operations || {},
        plan: value(1),
        maintenance: value(2),
        updatedAt: new Date().toISOString(),
        errors: results.flatMap((result, index) =>
          result.status === "rejected"
            ? [`${labels[index]}: ${result.reason.message}`]
            : [],
        ),
      });
    });
    return () => controller.abort();
  }, [token, revision, clearSession]);

  useEffect(() => {
    const controller = new AbortController();
    setPayments({ loading: true, data: [], error: "" });
    request(
      `/admin/payments?page=${page}${filter ? `&status=${encodeURIComponent(filter)}` : ""}`,
      { token, signal: controller.signal },
    )
      .then((response) => {
        if (!controller.signal.aborted)
          setPayments({ ...response.data, loading: false, error: "" });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if ([401, 403].includes(error.status)) clearSession(error.message);
        else setPayments({ loading: false, data: [], error: error.message });
      });
    return () => controller.abort();
  }, [token, page, filter, revision, clearSession]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  async function signOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
  }

  const {
    counts,
    users = {},
    kebun = {},
    operations = {},
    plan,
    maintenance,
    loading,
  } = overview;
  const other = [counts.total, counts.paid, counts.pending].every(
    (value) => typeof value === "number",
  )
    ? Math.max(0, counts.total - counts.paid - counts.pending)
    : null;
  const segments = [
    { label: "Lunas", value: counts.paid, className: "paid" },
    { label: "Menunggu", value: counts.pending, className: "pending" },
    { label: "Status lainnya", value: other, className: "other" },
  ];
  const firstName = user.name?.trim().split(/\s+/)[0] || "Admin";

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${menuOpen ? "is-open" : ""}`}
        id="main-navigation"
      >
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-close"
            aria-label="Tutup navigasi"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="workspace-icon">
            <Sprout size={18} />
          </span>
          <div>
            <strong>Developer console</strong>
            <small>Manajemen SawitQ Pro</small>
          </div>
          <ShieldCheck size={16} />
        </div>
        <nav aria-label="Navigasi utama">
          <p className="nav-heading">WORKSPACE</p>
          <a className="nav-link active" href="/dashboard" aria-current="page">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
            <span className="nav-active-dot" />
          </a>
        </nav>
        <div className="sidebar-note">
          <Leaf size={22} />
          <strong>Pantauan menyeluruh.</strong>
          <p>
            Data seluruh pengguna aplikasi, bukan hanya kebun milik akun ini.
            Modul manajemen berikutnya akan hadir bertahap.
          </p>
          <span>DEVELOPER CONSOLE · V0.1</span>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <strong>{user.name || "Administrator"}</strong>
              <small>Developer · Admin</small>
            </div>
            <span className="online-dot" />
          </div>
          <button
            className="logout-button"
            onClick={signOut}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <LogOut size={17} />
            )}{" "}
            {loggingOut ? "Keluar…" : "Keluar dari akun"}
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Buka navigasi"
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>Dashboard</strong>
          </div>
          <div className="topbar-right">
            <span className="admin-label">
              <ShieldCheck size={15} /> Developer access
            </span>
            <span className="topbar-divider" />
            <span className="avatar avatar-small" title={user.name}>
              {initials(user.name)}
            </span>
          </div>
        </header>
        <main className="dashboard-main" id="main-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow text-green">OVERVIEW</span>
              <h1>Dashboard developer</h1>
              <p>
                Halo, {firstName}. Pantau seluruh ekosistem aplikasi SawitQ dari
                sini.
              </p>
            </div>
            <div className="heading-actions">
              <span className="date-chip">
                <CalendarDays size={16} />
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date())}
              </span>
              <button
                className="button button-outline refresh-button"
                onClick={() => setRevision((value) => value + 1)}
                disabled={loading || payments.loading}
              >
                <RefreshCw size={16} className={loading ? "spin" : ""} />
                Perbarui
              </button>
            </div>
          </div>
          <section className="welcome-banner">
            <div className="welcome-content">
              <span className="eyebrow">
                MANAJEMEN SAWITQ PRO · LINTAS PENGGUNA
              </span>
              <h2>
                Seluruh aplikasi.
                <br />
                <span>Satu pusat pemantauan.</span>
              </h2>
              <p>
                Pantau pengguna, kebun, data operasional, dan pembayaran Pro.
                <br className="desktop-break" /> Akses global, tanpa mengubah
                data pengguna.
              </p>
              <span className="welcome-tag">
                <ShieldCheck size={14} /> Monitoring developer · hanya baca
              </span>
            </div>
            <div className="banner-art" aria-hidden="true">
              <div className="banner-ring" />
              <div className="banner-ring ring-inner" />
              <div className="banner-leaf">
                <Sprout strokeWidth={1} />
              </div>
              <span className="banner-float float-one">
                <Activity size={17} />
                Terhubung
              </span>
              <span className="banner-float float-two">
                <CheckCheck size={18} />
                Tumbuh bersama
              </span>
              <span className="banner-spark" />
            </div>
          </section>
          {overview.errors.length > 0 && (
            <div className="alert alert-error dashboard-alert" role="alert">
              <strong>Sebagian data belum dapat dimuat.</strong>
              <ul>
                {overview.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
              <span>Periksa API, lalu gunakan tombol Perbarui.</span>
            </div>
          )}
          <section
            className="metrics-grid"
            aria-label="Ringkasan seluruh pengguna"
          >
            <Metric
              icon={Users}
              label="Total pengguna"
              value={number(users.total)}
              note={`Termasuk ${number(users.admin)} administrator`}
              loading={loading}
            />
            <Metric
              icon={Crown}
              label="Pengguna Pro"
              value={number(users.pro)}
              note="Akun dengan status Pro aktif"
              tone="purple"
              loading={loading}
            />
            <Metric
              icon={UserRound}
              label="Pengguna Free"
              value={number(users.free)}
              note="Akun tanpa status Pro"
              tone="blue"
              loading={loading}
            />
            <Metric
              icon={Trees}
              label="Seluruh kebun"
              value={number(kebun.total)}
              note="Kebun tersimpan lintas pengguna"
              tone="amber"
              loading={loading}
            />
          </section>
          <MonitoringPanel
            operations={operations}
            loading={loading}
            revision={revision}
          />
          <div className="business-heading">
            <div>
              <span className="eyebrow text-green">BISNIS SAWITQ PRO</span>
              <h2>Pembayaran & paket</h2>
              <p>Pendapatan aplikasi dipisahkan dari kas operasional kebun.</p>
            </div>
            <div className="revenue-summary">
              <span>Total pembayaran lunas</span>
              <strong>{loading ? "…" : rupiah(counts.revenue)}</strong>
              <small>
                {number(counts.paid)} lunas · {number(counts.pending)} menunggu
              </small>
            </div>
          </div>
          <div className="dashboard-grid">
            <section className="panel payments-panel">
              <div className="panel-heading">
                <div>
                  <h2>Transaksi terbaru</h2>
                  <p>Daftar pembayaran paket Pro dari seluruh pengguna.</p>
                </div>
                <span className="soft-icon">
                  <ArrowDownLeft size={19} />
                </span>
              </div>
              <div className="table-toolbar">
                <span className="table-label">
                  <span className="tiny-dot green" /> Pembayaran Pro
                </span>
                <label className="filter-select">
                  Status
                  <select
                    aria-label="Filter status pembayaran"
                    value={filter}
                    onChange={(event) => {
                      setFilter(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Semua status</option>
                    {Object.entries(paymentStatuses).map(([value, details]) => (
                      <option key={value} value={value}>
                        {details.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="table-scroll" aria-busy={payments.loading}>
                <table>
                  <thead>
                    <tr>
                      <th>Pengguna / Transaksi</th>
                      <th>Tanggal</th>
                      <th>Nominal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.loading ? (
                      Array.from({ length: 4 }, (_, index) => (
                        <tr key={index} aria-hidden="true">
                          <td>
                            <span className="skeleton table-skeleton" />
                          </td>
                          <td>
                            <span className="skeleton table-skeleton" />
                          </td>
                          <td>
                            <span className="skeleton table-skeleton" />
                          </td>
                          <td>
                            <span className="skeleton table-skeleton" />
                          </td>
                        </tr>
                      ))
                    ) : payments.error ? (
                      <tr>
                        <td colSpan="4">
                          <div className="empty-state" role="alert">
                            <Database size={29} />
                            <strong>Transaksi belum dapat dimuat</strong>
                            <p>{payments.error}</p>
                            <button
                              className="button button-outline"
                              onClick={() => setRevision((value) => value + 1)}
                            >
                              Coba lagi
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : payments.data.length === 0 ? (
                      <tr>
                        <td colSpan="4">
                          <div className="empty-state">
                            <CreditCard size={32} />
                            <strong>
                              {filter
                                ? "Belum ada transaksi dengan status ini"
                                : "Belum ada transaksi"}
                            </strong>
                            <p>
                              Pembayaran pengguna akan tampil di sini setelah
                              tersedia.
                            </p>
                            {filter && (
                              <button
                                className="button button-text"
                                onClick={() => {
                                  setFilter("");
                                  setPage(1);
                                }}
                              >
                                Tampilkan semua status
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      payments.data.map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            <div className="table-user">
                              <span className="avatar table-avatar">
                                {initials(payment.user?.name)}
                              </span>
                              <div>
                                <strong>
                                  {payment.user?.name ||
                                    "Pengguna tidak tersedia"}
                                </strong>
                                <small title={payment.order_id}>
                                  {payment.order_id}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="table-date">
                              {dateTime(payment.created_at)}
                            </span>
                          </td>
                          <td className="table-amount">
                            {rupiah(payment.amount)}
                          </td>
                          <td>
                            <Status status={payment.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span aria-live="polite">
                  {payments.loading
                    ? "Memuat transaksi…"
                    : payments.error
                      ? "Data tidak tersedia"
                      : `${number(payments.from || 0)}–${number(payments.to || 0)} dari ${number(payments.total || 0)} transaksi`}
                </span>
                <div className="pagination">
                  <button
                    className="icon-button"
                    aria-label="Halaman sebelumnya"
                    disabled={payments.loading || !!payments.error || page <= 1}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <span>{page}</span>
                  <button
                    className="icon-button"
                    aria-label="Halaman berikutnya"
                    disabled={
                      payments.loading ||
                      !!payments.error ||
                      page >= (payments.last_page || 1)
                    }
                    onClick={() => setPage((value) => value + 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </section>
            <div className="right-column">
              <section className="panel summary-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Komposisi pembayaran</h2>
                    <p>Ringkasan seluruh periode</p>
                  </div>
                  <Activity size={18} className="muted-icon" />
                </div>
                <div className="distribution-total">
                  <strong>{loading ? "…" : number(counts.total)}</strong>
                  <span>total transaksi</span>
                </div>
                <div className="distribution-bar" aria-hidden="true">
                  {segments.map((segment) => (
                    <span
                      className={segment.className}
                      key={segment.label}
                      style={{
                        width: `${counts.total && segment.value != null ? (segment.value / counts.total) * 100 : 0}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="distribution-legend">
                  {segments.map((segment) => (
                    <div key={segment.label}>
                      <span>
                        <i className={segment.className} />
                        {segment.label}
                      </span>
                      <strong>{loading ? "…" : number(segment.value)}</strong>
                    </div>
                  ))}
                </div>
                <div className="summary-note">
                  <CircleHelp size={14} /> Status lainnya mencakup gagal,
                  dibatalkan, kedaluwarsa, dan pengembalian dana.
                </div>
              </section>
              <section className="plan-card">
                <div className="plan-card-heading">
                  <span className="plan-crown">
                    <Crown size={21} />
                  </span>
                  <span>PAKET SAWITQ</span>
                  <ArrowUpRight size={18} />
                </div>
                <h2>{plan?.pro_name || "Pro"}</h2>
                <p>
                  {plan
                    ? "Satu kali pembayaran. Manfaat jangka panjang."
                    : loading
                      ? "Memuat konfigurasi paket…"
                      : "Konfigurasi paket belum tersedia dari API."}
                </p>
                <div className="plan-price">
                  {loading ? "…" : rupiah(plan?.pro_price)}
                  <span>/ lifetime</span>
                </div>
                <div className="plan-detail">
                  <span>
                    <Check size={15} /> Kuota foto Pro
                  </span>
                  <strong>
                    {plan ? `${number(plan.pro_photo_mb)} MB` : "—"}
                  </strong>
                </div>
                <div className="plan-detail">
                  <span>
                    <Check size={15} /> Batas kebun Free
                  </span>
                  <strong>
                    {plan ? `${number(plan.free_kebun_max)} kebun` : "—"}
                  </strong>
                </div>
                <div className="plan-readonly">
                  <ShieldCheck size={13} /> Konfigurasi ditampilkan dalam mode
                  baca.
                </div>
              </section>
            </div>
          </div>
          <section className="service-strip" aria-label="Status layanan">
            <div
              className={`service-icon ${maintenance?.maintenance ? "is-maintenance" : ""}`}
            >
              <Activity size={20} />
            </div>
            <div>
              <strong>
                {loading
                  ? "Memeriksa layanan…"
                  : maintenance
                    ? maintenance.maintenance
                      ? "Layanan dalam maintenance"
                      : "Layanan beroperasi normal"
                    : "Status layanan belum tersedia"}
              </strong>
              <p>
                {maintenance?.maintenance
                  ? maintenance.message
                  : "Status berasal dari API SawitQ, diperbarui saat dashboard dimuat."}
                {maintenance?.maintenance && maintenance.ends_at
                  ? ` Estimasi selesai: ${dateTime(maintenance.ends_at)}.`
                  : ""}
              </p>
            </div>
            <span
              className={`badge ${maintenance ? (maintenance.maintenance ? "warning" : "success") : "neutral"}`}
            >
              <span />
              {maintenance
                ? maintenance.maintenance
                  ? "Maintenance"
                  : "Operasional"
                : "Belum terhubung"}
            </span>
          </section>
          <footer className="dashboard-footer">
            <span>
              © {new Date().getFullYear()} SawitQ <span>·</span> Tumbuh
              bersama, kelola lebih baik.
            </span>
            <span>
              {overview.updatedAt
                ? `Diperiksa ${dateTime(overview.updatedAt)}`
                : "Menghubungkan ke API…"}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
