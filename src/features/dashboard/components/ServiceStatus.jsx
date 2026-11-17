import { Activity } from "lucide-react";
import Badge from "../../../components/ui/Badge.jsx";
import { dateTime } from "../../../lib/format.js";
import "../dashboard.css";

export default function ServiceStatus({ maintenance, loading }) {
  return (
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
      <Badge
        tone={
          maintenance
            ? maintenance.maintenance
              ? "warning"
              : "success"
            : "neutral"
        }
      >
        {maintenance
          ? maintenance.maintenance
            ? "Maintenance"
            : "Operasional"
          : "Belum terhubung"}
      </Badge>
    </section>
  );
}
