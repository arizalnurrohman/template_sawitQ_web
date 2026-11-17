import {
  Component,
  FileText,
  History,
  KeyRound,
  LayoutDashboard,
  ListTree,
  Shield,
  Users,
} from "lucide-react";

// Daftar ikon yang bisa dipilih saat membuat/menu melalui form.
export const iconOptions = [
  { value: "LayoutDashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "ListTree", label: "Daftar / Menu", icon: ListTree },
  { value: "Shield", label: "Role", icon: Shield },
  { value: "Users", label: "Pengguna", icon: Users },
  { value: "KeyRound", label: "Hak akses", icon: KeyRound },
  { value: "History", label: "Riwayat", icon: History },
  { value: "Component", label: "Komponen", icon: Component },
  { value: "FileText", label: "Halaman", icon: FileText },
];

export const iconByName = Object.fromEntries(
  iconOptions.map((option) => [option.value, option.icon]),
);
