import {
  Building2,
  Component,
  FileText,
  History,
  KeyRound,
  LayoutDashboard,
  ListTree,
  Shield,
  Users,
} from "lucide-react";
import { fullPermissions } from "./access.js";
import Dashboard from "../pages/Dashboard.jsx";
import Menus from "../pages/Menus.jsx";
import Roles from "../pages/Roles.jsx";
import UsersPage from "../pages/Users.jsx";
import Permissions from "../pages/Permissions.jsx";
import ActivityLogs from "../pages/ActivityLogs.jsx";
import ComponentExample from "../features/examples/ComponentExample.jsx";
import Blank from "../pages/Blank.jsx";
import Kud from "../pages/Kud.jsx";

// Registry tunggal: path halaman, label menu, judul tab, ikon, dan komponen.
// `key` adalah penghubung dengan baris menu di database (kolom `key`).
export const adminRoutes = [
  {
    key: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    title: "Dashboard Developer",
    icon: LayoutDashboard,
    component: Dashboard,
    group: "WORKSPACE",
    order: 1,
  },
  {
    key: "kud",
    path: "/kud",
    label: "KUD",
    title: "Profil KUD",
    icon: Building2,
    component: Kud,
    group: "WORKSPACE",
    order: 2,
  },
  {
    key: "menus",
    path: "/menus",
    label: "Manajemen Menu",
    title: "Manajemen Menu",
    icon: ListTree,
    component: Menus,
    group: "ADMINISTRASI",
    order: 10,
  },
  {
    key: "roles",
    path: "/roles",
    label: "Manajemen Role",
    title: "Manajemen Role",
    icon: Shield,
    component: Roles,
    group: "ADMINISTRASI",
    order: 11,
  },
  {
    key: "users",
    path: "/users",
    label: "Manajemen User",
    title: "Manajemen User",
    icon: Users,
    component: UsersPage,
    group: "ADMINISTRASI",
    order: 12,
  },
  {
    key: "permissions",
    path: "/permissions",
    label: "Hak Akses",
    title: "Peta Hak Akses",
    icon: KeyRound,
    component: Permissions,
    group: "PENDUKUNG",
    order: 20,
  },
  {
    key: "activity_logs",
    path: "/activity-logs",
    label: "Riwayat Aktivitas",
    title: "Riwayat Aktivitas",
    icon: History,
    component: ActivityLogs,
    group: "PENDUKUNG",
    order: 21,
  },
  {
    key: "example",
    path: "/examples/component",
    label: "Contoh Komponen",
    title: "Contoh Penggunaan Komponen",
    icon: Component,
    component: ComponentExample,
    group: "PANDUAN",
    order: 30,
  },
  {
    key: "blank",
    path: "/examples/blank",
    label: "Halaman Kosong",
    title: "Halaman Kosong",
    icon: FileText,
    component: Blank,
    group: "PANDUAN",
    order: 31,
  },
];

export const routeByKey = Object.fromEntries(
  adminRoutes.map((route) => [route.key, route]),
);

export const routeByPath = Object.fromEntries(
  adminRoutes.map((route) => [route.path, route]),
);

// Dipakai hanya saat API/menu database belum tersedia (mode fallback).
export const fallbackMenus = adminRoutes.map(
  ({ key, label, path, icon, group, order }) => ({
    id: key,
    key,
    label,
    path,
    icon,
    group,
    order,
    parent_id: null,
    is_active: true,
    permissions: fullPermissions(),
  }),
);
