import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { request } from "../lib/api.js";
import { canDo, normalizeMenus } from "../config/access.js";
import { fallbackMenus, routeByKey } from "../config/routes.js";

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const { token, status, clearSession } = useAuth();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("database");
  const [attempt, setAttempt] = useState(0);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (status !== "authenticated") {
      setMenus([]);
      setLoading(status === "checking");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    request("/admin/menus", { token, signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const normalized = normalizeMenus(response.data, routeByKey);
        if (normalized.length) {
          setMenus(normalized);
          setSource("database");
        } else {
          setMenus(fallbackMenus);
          setSource("fallback");
          setError("Menu di database masih kosong. Menampilkan menu bawaan.");
        }
      })
      .catch((failure) => {
        if (controller.signal.aborted) return;
        if ([401, 403].includes(failure.status)) {
          clearSession(failure.message);
          return;
        }
        setMenus(fallbackMenus);
        setSource("fallback");
        setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [status, token, attempt, clearSession]);

  const can = useCallback(
    (key, action = "view") => {
      const menu = menus.find(
        (item) => item.key === key || item.path === key || item.id === key,
      );
      return menu ? canDo(menu, action) : false;
    },
    [menus],
  );

  const value = useMemo(
    () => ({
      menus,
      loading,
      error,
      source,
      degraded: source === "fallback",
      reload,
      can,
    }),
    [menus, loading, error, source, reload, can],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
