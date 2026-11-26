import { useState } from "react";
import { History } from "lucide-react";
import Page from "../layouts/Page.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import Button from "../components/ui/Button.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import usePaginatedResource from "../hooks/usePaginatedResource.js";
import { dateTime } from "../lib/format.js";
import "../features/access/access.css";

const TYPE_OPTIONS = [
  { value: "menu", label: "Menu" },
  { value: "role", label: "Role" },
  { value: "user", label: "User" },
];

export default function ActivityLogs() {
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const logs = usePaginatedResource("/admin/access-activity-logs", {
    filterName: "type",
    revision,
  });

  const filtered = (logs.result.data || []).filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [log.actor_name, log.actor, log.action, log.description, log.entity_type, log.entity, log.context]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  function refresh() {
    setRevision((value) => value + 1);
  }

  return (
    <Page
      title="Riwayat aktivitas"
      eyebrow="PENDUKUNG"
      description="Jejak perubahan pada menu, role, dan pengguna untuk keperluan audit."
      actions={<RefreshButton loading={logs.result.loading} onClick={refresh} />}
      footer="Data dibaca dari activity log backend"
    >
      <div className="crud-filters">
        <div className="crud-search">
          <span>Jenis aktivitas</span>
          <div className="role-summary">
            <button
              type="button"
              className="button button-outline"
              aria-pressed={logs.filter === ""}
              onClick={() => logs.setFilter("")}
            >
              Semua
            </button>
            {TYPE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className="button button-outline"
                aria-pressed={logs.filter === option.value}
                onClick={() => logs.setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="crud-filters" style={{ marginTop: 8, marginBottom: 12 }}>
        <label className="crud-search">
          <span>Cari aktivitas</span>
          <span className="input-wrap">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Aktor, aksi, entitas, keterangan"
            />
          </span>
        </label>
      </div>

      <DataTable
        ariaLabel="Riwayat aktivitas"
        columns={["Waktu", "Aktor", "Aksi", "Entitas", "Keterangan"]}
        data={filtered}
        loading={logs.result.loading}
        error={logs.result.error}
        errorTitle="Riwayat tidak dapat dimuat"
        emptyTitle="Belum ada aktivitas"
        emptyDescription="Perubahan pada menu, role, dan user akan tampil di sini."
        emptyIcon={History}
        onRetry={logs.reload}
        emptyAction={<Button variant="outline" onClick={() => logs.setFilter("")}>Reset filter</Button>}
        renderRow={(log) => (
          <tr key={log.id}>
            <td className="cell-muted">
              {log.created_at ? dateTime(log.created_at) : "-"}
            </td>
            <td className="cell-strong">{log.actor_name || log.actor || "-"}</td>
            <td>{log.action || log.description || "-"}</td>
            <td>{log.entity_type || log.entity || "-"}</td>
            <td className="cell-muted">{log.context || log.meta || "-"}</td>
          </tr>
        )}
      />

      <Pagination
        result={logs.result}
        page={logs.page}
        onPageChange={logs.setPage}
        itemLabel="aktivitas"
      />
    </Page>
  );
}
