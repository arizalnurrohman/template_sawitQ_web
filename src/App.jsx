import { useEffect, useMemo } from "react";
import { matchPath, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useNavigation } from "./context/NavigationContext.jsx";
import { adminRoutes, routeByKey } from "./config/routes.js";
import { canDo } from "./config/access.js";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AccessScreen from "./features/navigation/components/AccessScreen.jsx";
import SessionScreen from "./features/auth/components/SessionScreen.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  const { status, message, retry, logout } = useAuth();
  const {
    menus,
    degraded,
    error: menuError,
    loading: menuLoading,
    reload: reloadMenus,
  } = useNavigation();
  const { pathname } = useLocation();
  const authenticated = status === "authenticated";

  // Rute dibangun dari menu database. Komponen halaman diambil dari registry
  // berdasarkan `key`, sehingga path & label mengikuti data database.
  const visibleRoutes = useMemo(() => {
    if (!menus.length) return [];
    return menus
      .filter((menu) => canDo(menu, "view"))
      .map((menu) => {
        const definition =
          routeByKey[menu.key] ||
          adminRoutes.find((route) => route.path === menu.path);
        if (!definition) return null;
        return {
          ...definition,
          key: menu.key,
          path: menu.path || definition.path,
          label: menu.label || definition.label,
          title: definition.title,
        };
      })
      .filter(Boolean);
  }, [menus]);

  const homePath = visibleRoutes[0]?.path || "/dashboard";
  const activeRoute = visibleRoutes.find((route) => matchPath(route.path, pathname));
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

  if (authenticated && menuLoading) {
    return (
      <AccessScreen status="checking" onRetry={reloadMenus} onLogout={logout} />
    );
  }

  if (authenticated && visibleRoutes.length === 0) {
    return (
      <AccessScreen
        status="unavailable"
        message="Akun ini belum memiliki menu yang dapat diakses. Hubungi administrator."
        onRetry={reloadMenus}
        onLogout={logout}
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={authenticated ? <Navigate to={homePath} replace /> : <Login />}
      />
      <Route
        element={
          authenticated ? (
            <AdminLayout
              navigation={visibleRoutes}
              title={activeRoute?.label}
              degraded={degraded}
              menuError={menuError}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {visibleRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>
      <Route
        path="*"
        element={<Navigate to={authenticated ? homePath : "/login"} replace />}
      />
    </Routes>
  );
}
