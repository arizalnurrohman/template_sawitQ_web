import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoaderCircle, ServerOff } from "lucide-react";
import { useAuth } from "./context/AuthContext.jsx";
import Brand from "./components/Brand.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const { status, message, retry, logout } = useAuth();
  useEffect(() => {
    document.title = `${status === "authenticated" ? "Dashboard Developer" : "Login Developer"} — SawitQ`;
  }, [status]);

  if (status === "checking" || status === "unavailable") {
    return (
      <main className="session-screen">
        <Brand />
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
              <button className="button button-primary" onClick={retry}>
                Coba lagi
              </button>
              <button className="button button-text" onClick={logout}>
                Kembali ke login
              </button>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          status === "authenticated" ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          status === "authenticated" ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={status === "authenticated" ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}
