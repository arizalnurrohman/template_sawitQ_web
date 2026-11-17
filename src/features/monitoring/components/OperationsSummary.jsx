import Badge from "../../../components/ui/Badge.jsx";
import SectionHeader from "../../../layouts/SectionHeader.jsx";
import { operationModules } from "../constants.js";
import ModuleCard from "./ModuleCard.jsx";
import "../monitoring.css";

export default function OperationsSummary({ operations, loading }) {
  return (
    <>
      <SectionHeader
        title="Operasional seluruh aplikasi"
        description="Total catatan tersimpan dari seluruh pengguna, tidak termasuk data yang sudah dihapus."
        action={<Badge>Lintas pengguna</Badge>}
      />
      <div className="module-grid">
        {operationModules.map(({ key, ...module }) => (
          <ModuleCard
            key={key}
            {...module}
            value={operations[key]}
            loading={loading}
          />
        ))}
      </div>
    </>
  );
}
