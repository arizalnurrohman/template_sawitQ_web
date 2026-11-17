import "./Panel.css";

export default function Panel({
  title,
  description,
  icon: Icon,
  className = "",
  children,
}) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || description || Icon) && (
        <div className="panel-heading">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {Icon && (
            <span className="soft-icon">
              <Icon size={19} />
            </span>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
