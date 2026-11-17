import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiError, getCurrentAdmin, loginAdmin, request } from "../lib/api.js";

const AuthContext = createContext(null);
const SESSION_KEY = "sawitq.admin.token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(token ? "checking" : "anonymous");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  const clearSession = useCallback((notice = "") => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
    setUser(null);
    setStatus("anonymous");
    setMessage(notice);
  }, []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    getCurrentAdmin(token, controller.signal)
      .then((currentUser) => {
        if (controller.signal.aborted) return;
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if ([401, 403].includes(error.status)) clearSession(error.message);
        else {
          setStatus("unavailable");
          setMessage(error.message);
        }
      });
    return () => controller.abort();
  }, [token, attempt, clearSession]);

  async function login(login, password) {
    const session = await loginAdmin(login, password);
    try {
      sessionStorage.setItem(SESSION_KEY, session.token);
    } catch {
      await request("/logout", { method: "POST", token: session.token }).catch(
        () => {},
      );
      throw new ApiError(
        "Penyimpanan sesi browser tidak tersedia. Izinkan penyimpanan untuk situs ini.",
      );
    }
    setMessage("");
    setUser(session.user);
    setStatus("checking");
    setToken(session.token);
  }

  async function logout() {
    let notice = "";
    try {
      if (token) await request("/logout", { method: "POST", token });
    } catch (error) {
      if (error.status !== 401)
        notice =
          "Sesi browser telah dihapus, tetapi pencabutan sesi di server belum dapat dikonfirmasi.";
    } finally {
      clearSession(notice);
    }
  }

  function retry() {
    setStatus("checking");
    setAttempt((value) => value + 1);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        status,
        message,
        login,
        logout,
        clearSession,
        retry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
