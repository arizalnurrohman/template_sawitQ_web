import { ShieldCheck } from "lucide-react";
import ServerStatusBadge from "../components/ServerStatusBadge.jsx";
import LoginStory from "../features/auth/components/LoginStory.jsx";
import "../features/auth/auth.css";

export default function AuthLayout({ children }) {
  return (
    <main className="login-page">
      <LoginStory />
      <section className="login-panel">
        <div className="login-topline">
          <span>SAWITQ WEB</span>
          <span>
            <ServerStatusBadge compact />
            <span className="login-admin-label">
              <ShieldCheck size={14} /> Akses administrator
            </span>
          </span>
        </div>
        {children}
      </section>
    </main>
  );
}
