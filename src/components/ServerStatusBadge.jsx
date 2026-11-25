import { API_BASE } from "../lib/endpoint.js";
import { useServerStatus } from "../context/ServerStatusContext.jsx";
import "./serverStatus.css";

const LABELS = {
  checking: "Memeriksa BE",
  online: "BE online",
  offline: "BE offline",
};

function detailText(status) {
  const parts = [];
  if (status.state === "online" && status.latencyMs != null) {
    parts.push(`Respons ${status.latencyMs} ms`);
  }
  if (status.database) {
    parts.push(
      status.database === "connected"
        ? "Database terhubung"
        : `Database ${status.database}`,
    );
  }
  if (status.message) parts.push(status.message);
  if (status.checkedAt) {
    parts.push(
      `Dicek ${new Date(status.checkedAt).toLocaleTimeString("id-ID")}`,
    );
  }
  parts.push(`Endpoint ${API_BASE}`);
  parts.push("Klik untuk memeriksa ulang.");
  return parts.join(" · ");
}

export default function ServerStatusBadge({
  compact = false,
  className = "",
}) {
  const status = useServerStatus();
  const { state, checking, latencyMs, refresh } = status;
  const label =
    state === "checking" ? LABELS.checking : LABELS[state] || LABELS.offline;
  const detail = detailText(status);
  const classes = [
    "server-status",
    `is-${state}`,
    checking ? "is-checking" : "",
    compact ? "is-compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={refresh}
      title={detail}
      aria-label={`${label}. ${detail}`}
      aria-live="polite"
    >
      <span className="server-status-dot" aria-hidden="true" />
      <span className="server-status-text">{label}</span>
      {!compact && state === "online" && latencyMs != null && (
        <span className="server-status-latency">{latencyMs} ms</span>
      )}
    </button>
  );
}
