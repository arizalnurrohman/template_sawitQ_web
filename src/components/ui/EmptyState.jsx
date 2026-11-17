import "./EmptyState.css";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  role,
}) {
  return (
    <div className="empty-state" role={role}>
      {Icon && <Icon size={role === "alert" ? 29 : 32} />}
      {title && <strong>{title}</strong>}
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
