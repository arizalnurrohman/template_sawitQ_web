import { LoaderCircle, ServerOff } from "lucide-react";
import Brand from "../../../components/Brand.jsx";
import ServerStatusBadge from "../../../components/ServerStatusBadge.jsx";
import Button from "../../../components/ui/Button.jsx";
import "../session.css";

export default function SessionScreen({ status, message, onRetry, onLogout }) {
  return (
    <main className="session-screen">
      <Brand />
      <ServerStatusBadge />
      <section className="session-card" aria-live="polite">
        {status === "checking" ? (
          <>
            <LoaderCircle className="spin" size={30} />
            <h1>Memeriksa sesi Anda</h1>
            <p>Menyiapkan ruang developer SawitQ.</p>
          </>
        ) : (
          <>
            <ServerOff size={32} />
            <h1>Server belum terhubung</h1>
            <p>{message}</p>
            <Button onClick={onRetry}>Coba lagi</Button>
            <Button variant="text" onClick={onLogout}>
              Kembali ke login
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
