import "./Alert.css";

export default function Alert({ children, className = "", ...props }) {
  return (
    <div
      role="alert"
      {...props}
      className={`alert alert-error ${className}`.trim()}
    >
      {children}
    </div>
  );
}
