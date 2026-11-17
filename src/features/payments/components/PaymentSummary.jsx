import { Activity, CircleHelp } from "lucide-react";
import Panel from "../../../components/ui/Panel.jsx";
import { number } from "../../../lib/format.js";
import "../payments.css";

export default function PaymentSummary({ counts, loading }) {
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

  return (
    <Panel
      className="summary-panel"
      title="Komposisi pembayaran"
      description="Ringkasan seluruh periode"
      icon={Activity}
    >
      <div className="distribution-total">
        <strong>{loading ? "…" : number(counts.total)}</strong>
        <span>total transaksi</span>
      </div>
      <div className="distribution-bar" aria-hidden="true">
        {segments.map((segment) => (
          <span
            key={segment.label}
            className={segment.className}
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
        <CircleHelp size={14} /> Status lainnya mencakup gagal, dibatalkan,
        kedaluwarsa, dan pengembalian dana.
      </div>
    </Panel>
  );
}
