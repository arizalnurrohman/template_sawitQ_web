import "./page.css";

export default function PageHeader({ title, eyebrow, description, actions }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow text-green">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}
