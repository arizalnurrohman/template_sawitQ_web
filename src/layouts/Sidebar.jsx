import { useMemo } from "react";
import {
  AlertTriangle,
  LayoutGrid,
  Leaf,
  ShieldCheck,
  Sprout,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Brand from "../components/Brand.jsx";
import IconButton from "../components/ui/IconButton.jsx";
import SidebarAccount from "./SidebarAccount.jsx";
import "./admin.css";

function groupMenus(items) {
  return items.reduce((groups, item) => {
    const name = item.group || "LAINNYA";
    if (!groups[name]) groups[name] = [];
    groups[name].push(item);
    return groups;
  }, {});
}

function NavItems({ items, onClose, depth = 0 }) {
  return items.map(({ path, label, icon: Icon, children = [] }) => {
    const Glyph = Icon || LayoutGrid;
    return (
      <div key={path}>
        <NavLink
          to={path}
          end
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          style={depth ? { paddingLeft: 14 + depth * 16 } : undefined}
          onClick={onClose}
        >
          {({ isActive }) => (
            <>
              <Glyph size={19} />
              <span>{label}</span>
              {isActive && <span className="nav-active-dot" />}
            </>
          )}
        </NavLink>
        {children.length > 0 && (
          <NavItems items={children} onClose={onClose} depth={depth + 1} />
        )}
      </div>
    );
  });
}

export default function Sidebar({ items = [], open, onClose, degraded, menuError }) {
  const groups = useMemo(() => groupMenus(items), [items]);

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

      {degraded && (
        <div className="nav-degraded" role="status">
          <AlertTriangle size={15} />
          <span>
            Menu bawaan digunakan. {menuError || "Hubungkan API menu database."}
          </span>
        </div>
      )}

      <nav aria-label="Navigasi utama" className="sidebar-nav">
        {Object.entries(groups).map(([group, groupItems]) => (
          <div className="nav-group" key={group}>
            <p className="nav-heading">{group}</p>
            <NavItems items={groupItems} onClose={onClose} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="nav-empty">Tidak ada menu yang dapat diakses.</p>
        )}
      </nav>

      <div className="sidebar-note">
        <Leaf size={22} />
        <span>DEVELOPER CONSOLE · V0.1</span>
      </div>
      <SidebarAccount />
    </aside>
  );
}
