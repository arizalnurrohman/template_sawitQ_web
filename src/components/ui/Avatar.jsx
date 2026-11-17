import { initials } from "../../lib/format.js";
import "./Avatar.css";

export default function Avatar({ name, className = "", ...props }) {
  return (
    <span {...props} className={`avatar ${className}`.trim()}>
      {initials(name)}
    </span>
  );
}
