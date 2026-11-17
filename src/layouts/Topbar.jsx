import { ChevronRight, Menu, ShieldCheck } from "lucide-react";
import Avatar from "../components/ui/Avatar.jsx";
import IconButton from "../components/ui/IconButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./admin.css";

export default function Topbar({ title, menuOpen, onToggleMenu }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <IconButton
          className="mobile-menu"
          label="Buka navigasi"
          icon={Menu}
          size={22}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={onToggleMenu}
        />
        <span>Workspace</span>
        <ChevronRight size={14} />
        <strong>{title}</strong>
      </div>
      <div className="topbar-right">
        <span className="admin-label">
          <ShieldCheck size={15} /> Developer access
        </span>
        <span className="topbar-divider" />
        <Avatar name={user.name} className="avatar-small" title={user.name} />
      </div>
    </header>
  );
}
