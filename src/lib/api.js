export class ApiError extends Error {
  constructor(message, status = 0, code = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function request(
  path,
  { token, body, signal, method = "GET" } = {},
) {
  const timeout = AbortSignal.timeout(20000);
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "omit",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(
      timeout.aborted
        ? "Server terlalu lama merespons. Silakan coba lagi."
        : "Tidak dapat terhubung ke server. Periksa koneksi dan layanan API.",
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted)
      throw new ApiError("Server terlalu lama merespons. Silakan coba lagi.");
    data = null;
  }
  if (!response.ok || data?.success === false || data?.status === false) {
    const validation = data?.errors
      ? Object.values(data.errors).flat()[0]
      : null;
    const message =
      response.status === 401 && token
        ? "Sesi Anda berakhir. Silakan masuk kembali."
        : response.status === 403
          ? "Akses ditolak. Akun ini tidak memiliki izin administrator."
          : validation ||
            data?.message ||
            `Layanan tidak tersedia (HTTP ${response.status}).`;
    throw new ApiError(message, response.status, data?.code);
  }
  if (data === null)
    throw new ApiError("Respons API tidak valid. Periksa alamat server.");
  return data;
}

// crypto.randomUUID hanya tersedia pada secure context (HTTPS/localhost).
// Di deployment HTTP biasa (mis. IP LAN), gunakan fallback agar login tetap jalan.
function createDeviceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `sawitq-web-${crypto.randomUUID()}`;
  }

  const random = Math.random().toString(36).slice(2, 12);
  return `sawitq-web-${Date.now().toString(36)}-${random}`;
}

export async function loginAdmin(login, password) {
  const response = await request("/login", {
    method: "POST",
    body: {
      login: login.trim(),
      password,
      // Token yang dicabut logout masih dapat tersimpan pada sesi device di backend.
      device_id: createDeviceId(),
      device_name: "SawitQ Admin Web",
      platform: "web",
    },
  });
  const token = response.data?.access_token;
  if (!token)
    throw new ApiError("Token login tidak ditemukan dalam respons API.");
  if (response.data?.user?.role !== "admin") {
    await request("/logout", { method: "POST", token }).catch(() => {});
    throw new ApiError(
      "Portal ini khusus administrator. Gunakan akun dengan role admin.",
      403,
    );
  }
  return { token, user: response.data.user };
}

export async function getCurrentAdmin(token, signal) {
  const response = await request("/me", { token, signal });
  if (response.data?.user?.role !== "admin") {
    throw new ApiError(
      "Akses administrator tidak lagi tersedia untuk akun ini.",
      403,
    );
  }
  return response.data.user;
}
