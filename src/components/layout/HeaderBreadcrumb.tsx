"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { isUuid } from "@/utils/is-uuid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  accounts: "Contas",
  budgets: "Orçamentos",
  profile: "Meu Perfil",
  settings: "Configurações",
  notifications: "Notificações",
  "change-password": "Alterar Senha",
  "add-account": "Nova Conta",
  analytics: "Análises",
};

const uuidContextLabels: Record<string, string> = {
  accounts: "Editar Conta",
  budgets: "Editar Orçamento",
};

export function HeaderBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const isDashboardPage = pathname === "/dashboard";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isDashboardPage ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {!isDashboardPage && segments.length > 0 && (
          <>
            <BreadcrumbSeparator />
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const isLast = index === segments.length - 1;
              const label = isUuid(segment)
                ? (uuidContextLabels[segments[index - 1]] ?? "Editar")
                : (routeLabels[segment] ?? segment);

              if (segment === "dashboard") {
                return null;
              }

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
