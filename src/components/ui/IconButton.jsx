import "./Button.css";

export default function IconButton({
  label,
  icon: Icon,
  size = 18,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      {...props}
      className={`icon-button ${className}`.trim()}
      type={type}
      aria-label={label}
    >
      <Icon size={size} aria-hidden="true" />
    </button>
  );
}
