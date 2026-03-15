import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from "lucide-react";

export type AppBadgeVariant = "paid" | "pending" | "overdue";

const appBadgeConfig: Record<
  AppBadgeVariant,
  { label: string; className: string; icon: React.ElementType }
> = {
  paid: {
    label: "Pago",
    className:
      "border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5",
    icon: CheckCircleIcon,
  },
  pending: {
    label: "Pendente",
    className:
      "border-none bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5",
    icon: AlertCircleIcon,
  },
  overdue: {
    label: "Vencido",
    className:
      "border-none bg-destructive/10 text-destructive focus-visible:ring-destructive/20 focus-visible:outline-none dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/5",
    icon: AlertTriangleIcon,
  },
};

interface AppBadgeProps {
  variant: AppBadgeVariant;
  className?: string;
}

export function AppBadge({ variant, className }: AppBadgeProps) {
  const config = appBadgeConfig[variant];

  return (
    <Badge variant="ghost" className={cn(config.className, className)}>
      <config.icon className="size-3 mr-1" />
      {config.label}
    </Badge>
  );
}
