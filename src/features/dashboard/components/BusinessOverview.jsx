import { number, rupiah } from "../../../lib/format.js";
import "../dashboard.css";

export default function BusinessOverview({ counts, loading, children }) {
  return (
    <>
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
      <div className="dashboard-grid">{children}</div>
    </>
  );
}
