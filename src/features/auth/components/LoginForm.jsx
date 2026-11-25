import { useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import Alert from "../../../components/ui/Alert.jsx";
import Button from "../../../components/ui/Button.jsx";
import FormField from "../../../components/ui/FormField.jsx";
import PasswordField from "../../../components/ui/PasswordField.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useServerStatus } from "../../../context/ServerStatusContext.jsx";
import "../auth.css";

export default function LoginForm() {
  const { login, message } = useAuth();
  const { refresh: refreshServer } = useServerStatus();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    if (!identifier.trim()) {
      setError("Masukkan username atau email Anda.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(identifier, password);
    } catch (failure) {
      setError(failure.message);
      if (!failure.status || failure.status === 404 || failure.status >= 500) {
        refreshServer();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-form-wrap">
      <div className="login-icon">
        <LockKeyhole size={25} strokeWidth={1.7} />
      </div>
      <span className="eyebrow text-green">SELAMAT DATANG KEMBALI</span>
      <h2>Masuk ke ruang developer.</h2>
      <p className="login-description">
        Gunakan akun developer dengan akses admin untuk memantau seluruh
        aplikasi SawitQ.
      </p>
      <form onSubmit={submit}>
        {(error || message) && <Alert>{error || message}</Alert>}
        <FormField
          label="Username atau email"
          id="login"
          icon={UserRound}
          name="login"
          autoComplete="username"
          placeholder="Masukkan username atau email"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
          disabled={loading}
          autoCapitalize="none"
          spellCheck={false}
        />
        <PasswordField
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Masukkan password Anda"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={loading}
        />
        <div className="session-hint">
          <ShieldCheck size={15} /> Sesi hanya disimpan pada tab browser ini.
        </div>
        <Button
          className="login-submit"
          type="submit"
          loading={loading}
          loadingText="Memverifikasi akun…"
          icon={ArrowRight}
          iconPosition="end"
        >
          Masuk ke dashboard
        </Button>
      </form>
      <div className="login-help">
        <span>Butuh akses atau lupa password?</span>
        <p>Hubungi pengelola akun SawitQ Anda.</p>
      </div>
    </div>
  );
}
