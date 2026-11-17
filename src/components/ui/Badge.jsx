import "./Badge.css";

export default function Badge({ tone = "neutral", children }) {
  return (
    <span className={`badge ${tone}`}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}
