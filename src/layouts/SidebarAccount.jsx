import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import Avatar from "../components/ui/Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./admin.css";

export default function SidebarAccount() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function signOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
  }

  return (
    <div className="sidebar-bottom">
      <div className="sidebar-user">
        <Avatar name={user.name} />
        <div>
          <strong>{user.name || "Administrator"}</strong>
          <small>Developer · Admin</small>
        </div>
        <span className="online-dot" />
      </div>
      <button
        type="button"
        className="logout-button"
        onClick={signOut}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <LoaderCircle size={17} className="spin" />
        ) : (
          <LogOut size={17} />
        )}
        {loggingOut ? "Keluar…" : "Keluar dari akun"}
      </button>
    </div>
  );
}
