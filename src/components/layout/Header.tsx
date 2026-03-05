"use client";

import { ToggleTheme } from "@/components/ui/toggle-theme";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const routeTitles: { path: string; title: string }[] = [
  // Admin
  { path: "/admin/dashboard", title: "Dashboard Administrativo" },
  { path: "/admin/users", title: "Gerenciar Usuários" },
  { path: "/admin/accounts", title: "Gerenciar Contas" },
  { path: "/admin/budgets", title: "Gerenciar Orçamentos" },
  { path: "/admin/metrics", title: "Visualizar Métricas" },

  // User
  { path: "/accounts", title: "Contas" },
  { path: "/budgets", title: "Orçamentos" },
  { path: "/dashboard", title: "Dashboard" },
  
  // Settings
  { path: "/profile", title: "Meu Perfil" },
  { path: "/settings", title: "Configurações" },
  { path: "/notifications", title: "Notificações" },
];

export function Header() {
  const pathname = usePathname();

  function getHeaderTitle(pathname: string): string {
    const match = routeTitles.find((route) => pathname.startsWith(route.path));

    return match?.title ?? "Dashboard";
  }

  const headerTitle = getHeaderTitle(pathname);

  return (
    <header className="flex p-4 pb-0 items-center justify-between">
      <div className="flex gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-heading">{headerTitle}</h1>
      </div>

      <ToggleTheme />
    </header>
  );
}
