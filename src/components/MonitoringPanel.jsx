import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  History,
  Leaf,
  Sprout,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { request } from "../lib/api.js";
import { dateTime, number } from "../lib/format.js";

const modules = [
  { key: "panen", label: "Panen", icon: Sprout },
  { key: "perawatan", label: "Perawatan", icon: Leaf },
  { key: "pemasukan", label: "Pemasukan", icon: ArrowDownLeft },
  { key: "pengeluaran", label: "Pengeluaran", icon: ArrowUpRight },
  { key: "jadwal_panen", label: "Jadwal panen", icon: CalendarDays },
];
const recordTypes = {
  kebun: "Kebun",
  panen: "Panen",
  perawatan: "Perawatan",
  pemasukan: "Pemasukan",
  pengeluaran: "Pengeluaran",
  jadwal_panen: "Jadwal panen",
  pembayaran: "Pembayaran Pro",
};
const logTypes = {
  kebun: "Kebun",
  panen: "Panen",
  perawatan: "Perawatan",
  pemasukan: "Pemasukan",
  pengeluaran: "Pengeluaran",
  member: "Anggota kebun",
  role: "Role kebun",
};

export default function MonitoringPanel({ operations, loading, revision }) {
  const { token, clearSession } = useAuth();
  const [view, setView] = useState("records");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ loading: true, data: [], error: "" });
  const isLog = view === "logs";
  const types = isLog ? logTypes : recordTypes;

  useEffect(() => {
    const controller = new AbortController();
    setResult({ loading: true, data: [], error: "" });
    const endpoint =
      view === "logs" ? "/admin/activity-logs" : "/admin/activities";
    request(
      `${endpoint}?page=${page}${type ? `&type=${encodeURIComponent(type)}` : ""}`,
      { token, signal: controller.signal },
    )
      .then((response) => {
        if (!controller.signal.aborted)
          setResult({ ...response.data, loading: false, error: "" });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if ([401, 403].includes(error.status)) clearSession(error.message);
        else setResult({ loading: false, data: [], error: error.message });
      });
    return () => controller.abort();
  }, [token, clearSession, view, type, page, revision, retry]);

  function changeView(next) {
    setView(next);
    setType("");
    setPage(1);
  }

  return (
    <section
      className="monitoring-section"
      aria-label="Monitoring global aplikasi"
    >
      <div className="section-intro">
        <div>
          <h2>Operasional seluruh aplikasi</h2>
          <p>
            Total catatan tersimpan dari seluruh pengguna, tidak termasuk data
            yang sudah dihapus.
          </p>
        </div>
        <span className="badge neutral">
          <span /> Lintas pengguna
        </span>
      </div>
      <div className="module-grid">
        {modules.map(({ key, label, icon: Icon }) => (
          <div className="module-card" key={key}>
            <span>
              <Icon size={18} />
              {label}
            </span>
            <strong>{loading ? "…" : number(operations[key])}</strong>
            <small>catatan tersimpan</small>
          </div>
        ))}
      </div>
      <section className="panel activity-panel">
        <div className="panel-heading">
          <div>
            <h2>Aktivitas aplikasi</h2>
            <p>
              Data terbaru lintas kebun dan kelompok, serta riwayat perubahan
              yang tercatat.
            </p>
          </div>
          <span className="soft-icon">
            <Activity size={19} />
          </span>
        </div>
        <div className="activity-toolbar">
          <div
            className="view-switch"
            role="group"
            aria-label="Jenis pemantauan"
          >
            <button
              type="button"
              aria-pressed={!isLog}
              className={!isLog ? "selected" : ""}
              onClick={() => changeView("records")}
            >
              <Database size={14} />
              Data terbaru
            </button>
            <button
              type="button"
              aria-pressed={isLog}
              className={isLog ? "selected" : ""}
              onClick={() => changeView("logs")}
            >
              <History size={14} />
              Log perubahan kebun
            </button>
          </div>
          <label className="filter-select">
            Modul
            <select
              aria-label="Filter modul aktivitas"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua modul</option>
              {Object.entries(types).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="monitoring-note">
          {isLog
            ? "Log perubahan kebun yang telah direkam aplikasi; bukan catatan semua klik, login, atau aktivitas sebelum pencatatan aktif."
            : "Menampilkan kondisi terbaru setiap data, bukan histori setiap perubahan. Pengeluaran otomatis yang terhubung ke perawatan aktif tidak ditampilkan dua kali."}
        </p>
        <div className="table-scroll" aria-busy={result.loading}>
          <table>
            <thead>
              <tr>
                <th>{isLog ? "Perubahan / Pelaku" : "Data / Modul"}</th>
                <th>Konteks kebun</th>
                <th>{isLog ? "Waktu tercatat" : "Terakhir diperbarui"}</th>
              </tr>
            </thead>
            <tbody>
              {result.loading ? (
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
                  </tr>
                ))
              ) : result.error ? (
                <tr>
                  <td colSpan="3">
                    <div className="empty-state" role="alert">
                      <Database size={28} />
                      <strong>Aktivitas belum dapat dimuat</strong>
                      <p>{result.error}</p>
                      <button
                        className="button button-outline"
                        onClick={() => setRetry((value) => value + 1)}
                      >
                        Coba lagi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : result.data.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    <div className="empty-state">
                      <History size={28} />
                      <strong>
                        {isLog
                          ? "Belum ada log perubahan tercatat"
                          : "Belum ada data untuk ditampilkan"}
                      </strong>
                      <p>
                        {type
                          ? "Coba pilih modul lain atau tampilkan semua modul."
                          : "Data akan tampil di sini setelah tersedia di aplikasi."}
                      </p>
                      {type && (
                        <button
                          className="button button-text"
                          onClick={() => {
                            setType("");
                            setPage(1);
                          }}
                        >
                          Tampilkan semua modul
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                result.data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="activity-record">
                        <strong>
                          {isLog ? item.description || item.action : item.title}
                        </strong>
                        <small>
                          {isLog
                            ? `${item.actor_name || "Pelaku tidak tercatat"} · ${logTypes[item.entity_type] || item.entity_type}`
                            : recordTypes[item.type] || item.type}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="activity-context">
                        {isLog
                          ? item.kebun_lokasi || "Kebun tidak tersedia"
                          : item.context}
                      </span>
                    </td>
                    <td>
                      <span className="table-date">
                        {dateTime(isLog ? item.created_at : item.occurred_at)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span aria-live="polite">
            {result.loading
              ? "Memuat aktivitas…"
              : result.error
                ? "Data tidak tersedia"
                : `${number(result.from || 0)}–${number(result.to || 0)} dari ${number(result.total || 0)} ${isLog ? "log" : "data"}`}
          </span>
          <div className="pagination">
            <button
              className="icon-button"
              aria-label="Aktivitas sebelumnya"
              disabled={result.loading || !!result.error || page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>{page}</span>
            <button
              className="icon-button"
              aria-label="Aktivitas berikutnya"
              disabled={
                result.loading ||
                !!result.error ||
                page >= (result.last_page || 1)
              }
              onClick={() => setPage((value) => value + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
