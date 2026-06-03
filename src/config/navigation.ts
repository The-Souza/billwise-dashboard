import {
  LayoutDashboard,
  Wallet,
  Receipt,
  LineChart,
} from "lucide-react";

export const navigation = [
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
  {
    title: "Análises",
    url: "/analytics",
    icon: LineChart,
  },
];
