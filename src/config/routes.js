import { LayoutDashboard } from "lucide-react";
import Dashboard from "../pages/Dashboard.jsx";

export const adminRoutes = [
  {
    path: "/dashboard",
    label: "Dashboard",
    title: "Dashboard Developer",
    icon: LayoutDashboard,
    component: Dashboard,
  },
];
