import { LoaderCircle, ServerOff } from "lucide-react";
import Brand from "../../../components/Brand.jsx";
import ServerStatusBadge from "../../../components/ServerStatusBadge.jsx";
import Button from "../../../components/ui/Button.jsx";
import "../../auth/session.css";

export default function AccessScreen({ status, message, onRetry, onLogout }) {
  const checking = status === "checking";
  return (
    <main className="session-screen">
      <Brand />
      <ServerStatusBadge />
      <section className="session-card" aria-live="polite">
        {checking ? (
          <>
            <LoaderCircle className="spin" size={30} />
            <h1>Memuat menu akses</h1>
            <p>Menyiapkan menu sesuai role akun Anda.</p>
          </>
        ) : (
          <>
            <ServerOff size={32} />
            <h1>Menu tidak dapat dimuat</h1>
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
