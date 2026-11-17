import { useEffect } from "react";
import {
  matchPath,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { adminRoutes } from "./config/routes.js";
import AdminLayout from "./layouts/AdminLayout.jsx";
import SessionScreen from "./features/auth/components/SessionScreen.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  const { status, message, retry, logout } = useAuth();
  const { pathname } = useLocation();
  const authenticated = status === "authenticated";
  const activeRoute = adminRoutes.find((route) =>
    matchPath(route.path, pathname),
  );
  const title = authenticated
    ? activeRoute?.title || "Developer Console"
    : "Login Developer";

  useEffect(() => {
    document.title = `${title} — SawitQ`;
  }, [title]);

  if (status === "checking" || status === "unavailable") {
    return (
      <SessionScreen
        status={status}
        message={message}
        onRetry={retry}
        onLogout={logout}
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        element={
          authenticated ? (
            <AdminLayout navigation={adminRoutes} title={activeRoute?.label} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {adminRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>
      <Route
        path="*"
        element={
          <Navigate to={authenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}
