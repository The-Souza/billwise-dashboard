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
import { MoreHorizontal } from "lucide-react";
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
  workspaces: "Workspaces",
};

const uuidContextLabels: Record<string, string> = {
  accounts: "Editar Conta",
  budgets: "Editar Orçamento",
};

function getLabel(segment: string, prevSegment?: string): string {
  if (isUuid(segment)) {
    return (prevSegment && uuidContextLabels[prevSegment]) ?? "Editar";
  }
  return routeLabels[segment] ?? segment;
}

export function HeaderBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => s !== "dashboard");

  const isDashboardPage = pathname === "/dashboard";

  if (isDashboardPage) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const middleSegments = segments.slice(0, -1);
  const lastSegment = segments[segments.length - 1];
  const hasMiddle = middleSegments.length > 0;
  const lastLabel = getLabel(lastSegment, segments[segments.length - 2]);
  const parentHref = `/${middleSegments.join("/")}`;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Middle items — hidden on mobile when collapsed into ellipsis */}
        {middleSegments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const label = getLabel(segment, index > 0 ? segments[index - 1] : undefined);
          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator className={hasMiddle ? "hidden sm:block" : undefined} />
              <BreadcrumbItem className={hasMiddle ? "hidden sm:inline-flex" : undefined}>
                <BreadcrumbLink asChild>
                  <Link href={href}>{label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}

        {/* Ellipsis shown only on mobile when there are middle segments — links back to the parent page */}
        {hasMiddle && (
          <>
            <BreadcrumbSeparator className="sm:hidden" />
            <BreadcrumbItem className="sm:hidden">
              <BreadcrumbLink asChild>
                <Link href={parentHref} aria-label="Voltar">
                  <MoreHorizontal className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{lastLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
