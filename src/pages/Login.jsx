import { useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sprout,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Brand from "../components/Brand.jsx";

export default function Login() {
  const { login, message } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="SawitQ Developer Console">
        <Brand light />
        <div className="story-copy">
          <span className="eyebrow">
            <span className="live-dot" /> TUMBUH BERSAMA SAWITQ
          </span>
          <h1>
            Satu aplikasi.
            <br />
            Pandangan <em>menyeluruh.</em>
          </h1>
          <p>
            Pusat monitoring developer untuk pengguna, kebun, aktivitas
            aplikasi, dan bisnis SawitQ Pro.
          </p>
        </div>
        <div className="garden-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-sun" />
          <div className="art-hill hill-back" />
          <div className="art-hill hill-front" />
          <div className="art-tree tree-left">
            <Sprout />
          </div>
          <div className="art-tree tree-main">
            <Sprout />
          </div>
          <div className="art-tree tree-right">
            <Sprout />
          </div>
          <div className="art-label">
            <span>
              <Leaf size={19} />
            </span>
            <div>
              <strong>Ekosistem yang bertumbuh</strong>
              <small>Dikelola dengan lebih terarah</small>
            </div>
            <Check size={17} />
          </div>
        </div>
        <div className="story-footer">
          <span>Untuk kebun. Untuk masa depan.</span>
          <span>01 / DEVELOPER</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-topline">
          <span>SAWITQ WEB</span>
          <span>
            <ShieldCheck size={14} /> Akses administrator
          </span>
        </div>
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
            {(error || message) && (
              <div className="alert alert-error" role="alert">
                {error || message}
              </div>
            )}
            <label htmlFor="login">Username atau email</label>
            <div className="input-wrap">
              <UserRound size={18} />
              <input
                id="login"
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
            </div>
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                id="password"
                name="password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setVisible(!visible)}
                aria-label={
                  visible ? "Sembunyikan password" : "Tampilkan password"
                }
                aria-pressed={visible}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="session-hint">
              <ShieldCheck size={15} /> Sesi hanya disimpan pada tab browser
              ini.
            </div>
            <button
              className="button button-primary login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="spin" /> Memverifikasi
                  akun…
                </>
              ) : (
                <>
                  Masuk ke dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          <div className="login-help">
            <span>Butuh akses atau lupa password?</span>
            <p>Hubungi pengelola akun SawitQ Anda.</p>
          </div>
        </div>
        <footer className="login-footer">
          <span>
            © {new Date().getFullYear()} SawitQ. Semua hak dilindungi.
          </span>
          <span className="footer-dot" /> Developer Console v0.1
        </footer>
      </section>
    </main>
  );
}
