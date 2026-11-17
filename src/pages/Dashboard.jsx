import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import DataErrors from "../components/DataErrors.jsx";
import Page from "../layouts/Page.jsx";
import DateChip from "../layouts/DateChip.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import usePaginatedResource from "../hooks/usePaginatedResource.js";
import useDashboardOverview from "../features/dashboard/hooks/useDashboardOverview.js";
import WelcomeBanner from "../features/dashboard/components/WelcomeBanner.jsx";
import OverviewMetrics from "../features/dashboard/components/OverviewMetrics.jsx";
import BusinessOverview from "../features/dashboard/components/BusinessOverview.jsx";
import ServiceStatus from "../features/dashboard/components/ServiceStatus.jsx";
import MonitoringPanel from "../features/monitoring/components/MonitoringPanel.jsx";
import PaymentsPanel from "../features/payments/components/PaymentsPanel.jsx";
import PaymentSummary from "../features/payments/components/PaymentSummary.jsx";
import PlanCard from "../features/payments/components/PlanCard.jsx";
import { dateTime } from "../lib/format.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);
  const overview = useDashboardOverview(revision);
  const payments = usePaginatedResource("/admin/payments", {
    filterName: "status",
    revision,
  });
  const { counts, users, kebun, operations, plan, maintenance, loading } =
    overview;
  const firstName = user.name?.trim().split(/\s+/)[0] || "Admin";

  return (
    <Page
      title="Dashboard developer"
      eyebrow="OVERVIEW"
      description={`Halo, ${firstName}. Pantau seluruh ekosistem aplikasi SawitQ dari sini.`}
      actions={
        <>
          <DateChip />
          <RefreshButton
            loading={loading}
            disabled={payments.result.loading}
            onClick={() => setRevision((value) => value + 1)}
          />
        </>
      }
      footer={
        overview.updatedAt
          ? `Diperiksa ${dateTime(overview.updatedAt)}`
          : "Menghubungkan ke API…"
      }
    >
      <WelcomeBanner />
      <DataErrors errors={overview.errors} />
      <OverviewMetrics users={users} kebun={kebun} loading={loading} />
      <MonitoringPanel
        operations={operations}
        loading={loading}
        revision={revision}
      />
      <BusinessOverview counts={counts} loading={loading}>
        <PaymentsPanel resource={payments} />
        <div className="right-column">
          <PaymentSummary counts={counts} loading={loading} />
          <PlanCard plan={plan} loading={loading} />
        </div>
      </BusinessOverview>
      <ServiceStatus maintenance={maintenance} loading={loading} />
    </Page>
  );
}
