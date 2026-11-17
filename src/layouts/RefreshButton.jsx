import { RefreshCw } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import "./page.css";

export default function RefreshButton({ loading, disabled, onClick }) {
  return (
    <Button
      variant="outline"
      className="refresh-button"
      onClick={onClick}
      disabled={disabled || loading}
    >
      <RefreshCw size={16} className={loading ? "spin" : ""} /> Perbarui
    </Button>
  );
}
