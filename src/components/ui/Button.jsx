import { LoaderCircle } from "lucide-react";
import "./Button.css";

export default function Button({
  variant = "primary",
  icon: Icon,
  iconPosition = "start",
  loading = false,
  loadingText,
  children,
  className = "",
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      {...props}
      className={`button button-${variant} ${className}`.trim()}
      type={type}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <LoaderCircle size={18} className="spin" aria-hidden="true" />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {Icon && iconPosition !== "end" && <Icon size={18} />}
          {children}
          {Icon && iconPosition === "end" && <Icon size={18} />}
        </>
      )}
    </button>
  );
}
