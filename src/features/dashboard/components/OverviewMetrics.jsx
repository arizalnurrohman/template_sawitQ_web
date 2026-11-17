import { Crown, Trees, UserRound, Users } from "lucide-react";
import MetricCard from "../../../components/ui/MetricCard.jsx";
import { number } from "../../../lib/format.js";

export default function OverviewMetrics({ users, kebun, loading }) {
  return (
    <section className="metrics-grid" aria-label="Ringkasan seluruh pengguna">
      <MetricCard
        icon={Users}
        label="Total pengguna"
        value={number(users.total)}
        note={`Termasuk ${number(users.admin)} administrator`}
        loading={loading}
      />
      <MetricCard
        icon={Crown}
        label="Pengguna Pro"
        value={number(users.pro)}
        note="Akun dengan status Pro aktif"
        tone="purple"
        loading={loading}
      />
      <MetricCard
        icon={UserRound}
        label="Pengguna Free"
        value={number(users.free)}
        note="Akun tanpa status Pro"
        tone="blue"
        loading={loading}
      />
      <MetricCard
        icon={Trees}
        label="Seluruh kebun"
        value={number(kebun.total)}
        note="Kebun tersimpan lintas pengguna"
        tone="amber"
        loading={loading}
      />
    </section>
  );
}
