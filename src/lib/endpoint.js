// Konfigurasi alamat backend.
//
// Default same-origin "/api" agar cocok dengan proxy Vite (dev) maupun
// reverse proxy di hosting. Untuk hosting statis tanpa reverse proxy,
// set VITE_API_BASE_URL ke URL backend, mis. https://be.sawitq.my.id/api.
// VITE_API_KEY hanya diperlukan pada mode langsung; nilainya akan ikut
// ter-bundle di browser sehingga jangan dipakai untuk rahasia sungguhan.
//
// VITE_BE_URL (opsional) adalah URL dasar backend yang ditampilkan pada
// indikator online/offline. Jika tidak diisi, diturunkan dari
// VITE_API_BASE_URL.
//
// Nilai di bawah disuntikkan oleh `define` di vite.config.js. Saat modul
// dijalankan di Node (unit test), identifier-nya belum ada sehingga
// fallback dipakai.
const env = import.meta.env ?? {};

function deriveBeUrl(apiBase) {
  if (/^https?:\/\//i.test(apiBase)) {
    return apiBase.replace(/\/api\/?$/i, "").replace(/\/+$/, "") || apiBase;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

const RAW_BASE =
  typeof __SAWITQ_API_BASE__ !== "undefined" ? __SAWITQ_API_BASE__ : "/api";
const RAW_KEY =
  typeof __SAWITQ_API_KEY__ !== "undefined" ? __SAWITQ_API_KEY__ : "";
const RAW_BE_URL =
  typeof __SAWITQ_BE_URL__ !== "undefined"
    ? __SAWITQ_BE_URL__
    : env.VITE_BE_URL || deriveBeUrl(RAW_BASE);

export function normalizeBase(value) {
  const trimmed = String(value ?? "").trim().replace(/\/+$/, "");
  return trimmed || "/api";
}

export const API_BASE = normalizeBase(RAW_BASE);
export const API_KEY = String(RAW_KEY ?? "").trim();
export const BE_URL = String(RAW_BE_URL ?? "").trim().replace(/\/+$/, "");

export function apiUrl(path) {
  const normalized = String(path ?? "");
  return `${API_BASE}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}
