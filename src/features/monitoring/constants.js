import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Database,
  History,
  Leaf,
  Sprout,
} from "lucide-react";

export const operationModules = [
  { key: "panen", label: "Panen", icon: Sprout },
  { key: "perawatan", label: "Perawatan", icon: Leaf },
  { key: "pemasukan", label: "Pemasukan", icon: ArrowDownLeft },
  { key: "pengeluaran", label: "Pengeluaran", icon: ArrowUpRight },
  { key: "jadwal_panen", label: "Jadwal panen", icon: CalendarDays },
];

export const recordTypes = {
  kebun: "Kebun",
  panen: "Panen",
  perawatan: "Perawatan",
  pemasukan: "Pemasukan",
  pengeluaran: "Pengeluaran",
  jadwal_panen: "Jadwal panen",
  pembayaran: "Pembayaran Pro",
};

export const logTypes = {
  kebun: "Kebun",
  panen: "Panen",
  perawatan: "Perawatan",
  pemasukan: "Pemasukan",
  pengeluaran: "Pengeluaran",
  member: "Anggota kebun",
  role: "Role kebun",
};

export const monitoringViews = [
  { value: "records", label: "Data terbaru", icon: Database },
  { value: "logs", label: "Log perubahan kebun", icon: History },
];
