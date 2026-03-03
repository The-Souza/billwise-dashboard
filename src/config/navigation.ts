import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Shield,
  Users,
  BarChart3,
} from "lucide-react";

export const navigation = {
  user: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Contas",
      url: "/accounts",
      icon: Wallet,
    },
    {
      title: "Orçamentos",
      url: "/budgets",
      icon: Receipt,
    },
  ],

  admin: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Shield,
    },
    {
      title: "Usuários",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Contas",
      url: "/admin/accounts",
      icon: Wallet,
    },
    {
      title: "Orçamentos",
      url: "/admin/budgets",
      icon: Receipt,
    },
    {
      title: "Métricas",
      url: "/admin/metrics",
      icon: BarChart3,
    },
  ],
};