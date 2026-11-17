import { useEffect } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton.jsx";
import "./Modal.css";

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!open) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-head">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <IconButton label="Tutup dialog" icon={X} size={18} onClick={onClose} />
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}
