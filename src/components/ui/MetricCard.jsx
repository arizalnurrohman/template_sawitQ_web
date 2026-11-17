import "./MetricCard.css";

export default function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone = "green",
  loading,
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <strong className={loading ? "skeleton metric-skeleton" : ""}>
        {loading ? "\u00a0" : value}
      </strong>
      <div className="metric-note">
        <span className={`tiny-dot ${tone}`} />
        {note}
      </div>
    </article>
  );
}
