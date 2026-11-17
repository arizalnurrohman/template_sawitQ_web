import { ShieldCheck } from "lucide-react";
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
            <ShieldCheck size={14} /> Akses administrator
          </span>
        </div>
        {children}
      </section>
    </main>
  );
}
