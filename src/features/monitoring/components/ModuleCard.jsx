import { number } from "../../../lib/format.js";
import "../monitoring.css";

export default function ModuleCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="module-card">
      <span>
        <Icon size={18} />
        {label}
      </span>
      <strong>{loading ? "…" : number(value)}</strong>
      <small>catatan tersimpan</small>
    </div>
  );
}
