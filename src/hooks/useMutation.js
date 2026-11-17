import { useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { request } from "../lib/api.js";

// Helper untuk POST/PUT/PATCH/DELETE dengan token dan state loading/error.
export default function useMutation() {
  const { token } = useAuth();
  const [state, setState] = useState({ loading: false, error: "" });

  const mutate = useCallback(
    async (path, { method = "POST", body } = {}) => {
      setState({ loading: true, error: "" });
      try {
        const response = await request(path, { method, body, token });
        setState({ loading: false, error: "" });
        return response.data;
      } catch (error) {
        setState({ loading: false, error: error.message });
        throw error;
      }
    },
    [token],
  );

  const clearError = useCallback(
    () => setState((current) => ({ ...current, error: "" })),
    [],
  );

  return { ...state, mutate, clearError };
}
