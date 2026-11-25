import { apiUrl } from "./endpoint.js";

export const HEALTH_TIMEOUT_MS = 8000;

export function healthUrl() {
  return apiUrl("/health");
}

/**
 * Hanya respons 2xx dengan `status: "ok"` dari /health yang dianggap online.
 * Respons lain (404 halaman statis, 5xx, JSON tidak dikenal) berarti backend
 * tidak dapat dipakai oleh aplikasi web ini.
 */
export function classifyHealth({ ok, payload }) {
  return ok && payload?.status === "ok" ? "online" : "offline";
}

function createTimeoutSignal(signal, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new DOMException("Health check timeout", "TimeoutError"));
  }, timeoutMs);

  const forwardAbort = () => controller.abort(signal.reason);
  if (signal) {
    if (signal.aborted) forwardAbort();
    else signal.addEventListener("abort", forwardAbort, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", forwardAbort);
    },
  };
}

/**
 * Cek /health pada base API yang sedang dipakai. Tidak pernah melempar error
 * kecuali pemanggil membatalkan lewat `signal`; kegagalan jaringan/timeout
 * dikembalikan sebagai state "offline" agar UI tetap bisa menampilkannya.
 */
export async function checkServer({ signal, timeoutMs = HEALTH_TIMEOUT_MS } = {}) {
  const startedAt = Date.now();
  const request = createTimeoutSignal(signal, timeoutMs);

  try {
    const response = await fetch(healthUrl(), {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: request.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    const state = classifyHealth({ ok: response.ok, payload });
    return {
      state,
      checking: false,
      httpStatus: response.status,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      database:
        typeof payload?.database === "string" ? payload.database : null,
      version: typeof payload?.version === "string" ? payload.version : null,
      message:
        state === "online"
          ? ""
          : `Health check gagal (HTTP ${response.status}).`,
    };
  } catch (error) {
    if (signal?.aborted) throw error;

    const timedOut =
      request.signal.aborted && request.signal.reason?.name === "TimeoutError";
    return {
      state: "offline",
      checking: false,
      httpStatus: 0,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      database: null,
      version: null,
      message: timedOut
        ? `Backend tidak merespons dalam ${Math.round(timeoutMs / 1000)} detik.`
        : "Tidak dapat menghubungi backend. Periksa koneksi atau alamat API.",
    };
  } finally {
    request.cleanup();
  }
}
