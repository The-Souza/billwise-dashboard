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
      "border-none bg-secondary text-foreground focus-visible:ring-foreground/20 focus-visible:outline-none [a&]:hover:bg-secondary/80",
    icon: CheckCircleIcon,
  },
  pending: {
    label: "Pendente",
    className:
      "border-none bg-muted text-muted-foreground focus-visible:ring-muted-foreground/20 focus-visible:outline-none [a&]:hover:bg-muted/80",
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
