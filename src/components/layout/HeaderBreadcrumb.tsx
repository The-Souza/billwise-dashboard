"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UserRole } from "@/lib/auth/getUserWithRole";
import { isUuid } from "@/utils/is-uuid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Usuários",
  accounts: "Contas",
  budgets: "Orçamentos",
  metrics: "Métricas",
  profile: "Meu Perfil",
  settings: "Configurações",
  notifications: "Notificações",
  "change-password": "Alterar Senha",
  "add-account": "Nova Conta",
};

const uuidContextLabels: Record<string, string> = {
  accounts: "Editar Conta",
  budgets: "Editar Orçamento",
};

const nonNavigableSegments = ["admin"];

interface BreadcrumbProps {
  userRole: UserRole;
}

export function HeaderBreadcrumb({ userRole }: BreadcrumbProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const homeHref = userRole === "admin" ? "/admin/dashboard" : "/dashboard";

  const isDashboardPage = pathname === homeHref;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isDashboardPage ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={homeHref}>Home</Link>
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

              if (
                segment === "dashboard" ||
                (segment === "admin" && userRole === "admin")
              ) {
                return null;
              }

              const isNavigable = !nonNavigableSegments.includes(segment);

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast || !isNavigable ? (
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
