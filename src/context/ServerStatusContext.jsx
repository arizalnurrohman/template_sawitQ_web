import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { checkServer } from "../lib/serverStatus.js";

const POLL_INTERVAL_MS = 30000;

const initialStatus = {
  state: "checking",
  checking: true,
  httpStatus: null,
  latencyMs: null,
  checkedAt: null,
  database: null,
  version: null,
  message: "",
};

const ServerStatusContext = createContext({
  ...initialStatus,
  refresh() {},
});

export function ServerStatusProvider({ children }) {
  const [status, setStatus] = useState(initialStatus);
  const controllerRef = useRef(null);
  const mountedRef = useRef(true);

  const run = useCallback(async ({ quiet = false } = {}) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    if (!quiet) {
      setStatus((previous) => ({ ...previous, checking: true }));
    }

    try {
      const result = await checkServer({ signal: controller.signal });
      if (controller.signal.aborted || !mountedRef.current) return;
      setStatus(result);
    } catch (error) {
      if (controller.signal.aborted || !mountedRef.current) return;
      setStatus({
        ...initialStatus,
        state: "offline",
        checking: false,
        checkedAt: new Date().toISOString(),
        message:
          error?.message || "Tidak dapat menghubungi backend SawitQ.",
      });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    run();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") run({ quiet: true });
    }, POLL_INTERVAL_MS);

    function handleOnline() {
      run();
    }

    function handleOffline() {
      controllerRef.current?.abort();
      setStatus((previous) => ({
        ...previous,
        state: "offline",
        checking: false,
        checkedAt: new Date().toISOString(),
        message: "Perangkat sedang offline.",
      }));
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") run({ quiet: true });
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mountedRef.current = false;
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      controllerRef.current?.abort();
    };
  }, [run]);

  const refresh = useCallback(() => run(), [run]);

  return (
    <ServerStatusContext.Provider value={{ ...status, refresh }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  return useContext(ServerStatusContext);
}
