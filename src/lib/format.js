export function number(value) {
  return value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("id-ID").format(value);
}

export function rupiah(value) {
  return value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value);
}

export function dateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "A"
  );
}

export const paymentStatuses = {
  paid: { label: "Lunas", tone: "success" },
  pending: { label: "Menunggu", tone: "warning" },
  failed: { label: "Gagal", tone: "danger" },
  expired: { label: "Kedaluwarsa", tone: "neutral" },
  cancelled: { label: "Dibatalkan", tone: "neutral" },
  refunded: { label: "Dikembalikan", tone: "neutral" },
};
