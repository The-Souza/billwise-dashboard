import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCheckIcon,
  CircleAlertIcon,
} from "lucide-react";

export type AppAlertVariant = "success" | "alert" | "info" | "warning";

const appAlertConfig: Record<
  AppAlertVariant,
  { className: string; description: string; icon: React.ElementType }
> = {
  success: {
    className: "border-border bg-secondary text-foreground",
    description: "text-foreground/80",
    icon: CheckCheckIcon,
  },
  alert: {
    className: "border-primary bg-primary/10 text-primary",
    description: "text-primary/80",
    icon: AlertCircleIcon,
  },
  info: {
    className: "border-border bg-secondary text-foreground",
    description: "text-foreground/80",
    icon: CircleAlertIcon,
  },
  warning: {
    className: "bg-destructive/10 text-destructive border-destructive",
    description: "text-destructive/80",
    icon: AlertTriangleIcon,
  },
};

interface AppAlertProps {
  variant: AppAlertVariant;
  title: string;
  items?: string[];
  description?: string;
  className?: string;
}

export function AppAlert({
  variant,
  className,
  title,
  items,
  description,
}: AppAlertProps) {
  const config = appAlertConfig[variant];

  return (
    <Alert
      className={cn(
        config.className,
        "[&>svg]:text-current [&>svg]:-translate-y-1.25",
        className,
      )}
    >
      <config.icon className="h-4 w-4 shrink-0" />
      <AlertTitle className="text-start">{title}</AlertTitle>
      {items && items.length > 0 && (
        <AlertDescription className={config.description}>
          <ul className="mt-1 flex flex-col gap-2 list-disc list-inside">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </AlertDescription>
      )}
      {description && (
        <AlertDescription className={config.description}>
          {description}
        </AlertDescription>
      )}
    </Alert>
  );
}
