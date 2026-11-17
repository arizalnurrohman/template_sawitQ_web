import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { request } from "../lib/api.js";

export default function useApiResource(path, revision = 0) {
  const { token, clearSession } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({
    loading: true,
    data: null,
    error: "",
  });
  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setResult({ loading: true, data: null, error: "" });
    request(path, { token, signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted)
          setResult({ loading: false, data: response.data, error: "" });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if ([401, 403].includes(error.status)) clearSession(error.message);
        else setResult({ loading: false, data: null, error: error.message });
      });
    return () => controller.abort();
  }, [path, token, clearSession, revision, attempt]);

  return { ...result, reload };
}
