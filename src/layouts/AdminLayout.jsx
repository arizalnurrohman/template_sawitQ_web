import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import "./admin.css";

export default function AdminLayout({
  navigation,
  title,
  degraded,
  menuError,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <Sidebar
        items={navigation}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        degraded={degraded}
        menuError={menuError}
      />
      <div className="main-shell">
        <Topbar
          title={title}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
        />
        <main className="page-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
