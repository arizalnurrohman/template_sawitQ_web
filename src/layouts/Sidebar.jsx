import { Leaf, ShieldCheck, Sprout, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import Brand from "../components/Brand.jsx";
import IconButton from "../components/ui/IconButton.jsx";
import SidebarAccount from "./SidebarAccount.jsx";
import "./admin.css";

export default function Sidebar({ items, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? "is-open" : ""}`} id="main-navigation">
      <div className="sidebar-brand">
        <Brand />
        <IconButton
          className="mobile-close"
          label="Tutup navigasi"
          icon={X}
          size={20}
          onClick={onClose}
        />
      </div>
      <div className="workspace-label">
        <span className="workspace-icon">
          <Sprout size={18} />
        </span>
        <div>
          <strong>Developer console</strong>
          <small>Manajemen SawitQ Pro</small>
        </div>
        <ShieldCheck size={16} />
      </div>
      <nav aria-label="Navigasi utama">
        <p className="nav-heading">WORKSPACE</p>
        {items.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            onClick={onClose}
          >
            {({ isActive }) => (
              <>
                <Icon size={19} />
                <span>{label}</span>
                {isActive && <span className="nav-active-dot" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-note">
        <Leaf size={22} />
        <strong>Pantauan menyeluruh.</strong>
        <p>
          Data seluruh pengguna aplikasi, bukan hanya kebun milik akun ini.
          Modul manajemen berikutnya akan hadir bertahap.
        </p>
        <span>DEVELOPER CONSOLE · V0.1</span>
      </div>
      <SidebarAccount />
    </aside>
  );
}
