import { LayoutDashboard, FileText, Banknote, BarChart3 } from "lucide-react";

export const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Contracts", icon: FileText, href: "/dashboard/contracts" },
  { label: "Payments", icon: Banknote, href: "/dashboard/payments" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
];
