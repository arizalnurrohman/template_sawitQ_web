import { useState } from "react";
import { Activity } from "lucide-react";
import Panel from "../../../components/ui/Panel.jsx";
import ActivityFeed from "./ActivityFeed.jsx";
import OperationsSummary from "./OperationsSummary.jsx";
import "../monitoring.css";

export default function MonitoringPanel({ operations, loading, revision }) {
  const [view, setView] = useState("records");
  return (
    <section
      className="monitoring-section"
      aria-label="Monitoring global aplikasi"
    >
      <OperationsSummary operations={operations} loading={loading} />
      <Panel
        className="activity-panel"
        title="Aktivitas aplikasi"
        description="Data terbaru lintas kebun dan kelompok, serta riwayat perubahan yang tercatat."
        icon={Activity}
      >
        <ActivityFeed
          key={view}
          view={view}
          onViewChange={setView}
          revision={revision}
        />
      </Panel>
    </section>
  );
}
