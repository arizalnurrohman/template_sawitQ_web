import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { request } from "../../../lib/api.js";

const sources = [
  { path: "/admin/overview", label: "Monitoring global" },
  { path: "/admin/plan", label: "Paket Pro" },
  { path: "/maintenance-status", label: "Status layanan" },
];

export default function useDashboardOverview(revision) {
  const { token, clearSession } = useAuth();
  const [overview, setOverview] = useState({
    loading: true,
    errors: [],
    counts: {},
    users: {},
    kebun: {},
    operations: {},
  });

  useEffect(() => {
    const controller = new AbortController();
    setOverview((previous) => ({ ...previous, loading: true }));
    Promise.allSettled(
      sources.map(({ path }) =>
        request(path, { token, signal: controller.signal }),
      ),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const denied = results.find(
        (result) =>
          result.status === "rejected" &&
          [401, 403].includes(result.reason.status),
      );
      if (denied) {
        clearSession(denied.reason.message);
        return;
      }
      const value = (index) =>
        results[index].status === "fulfilled"
          ? results[index].value.data
          : null;
      setOverview({
        loading: false,
        counts: value(0)?.payments || {},
        users: value(0)?.users || {},
        kebun: value(0)?.kebun || {},
        operations: value(0)?.operations || {},
        plan: value(1),
        maintenance: value(2),
        updatedAt: new Date().toISOString(),
        errors: results.flatMap((result, index) =>
          result.status === "rejected"
            ? [`${sources[index].label}: ${result.reason.message}`]
            : [],
        ),
      });
    });
    return () => controller.abort();
  }, [token, revision, clearSession]);

  return overview;
}
