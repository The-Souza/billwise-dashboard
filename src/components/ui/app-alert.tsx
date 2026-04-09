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
    className:
      "border-green-600 bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
    description: "text-green-600/80 dark:text-green-400/80",
    icon: CheckCheckIcon,
  },
  alert: {
    className:
      "border-amber-600 bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    description: "text-amber-600/80 dark:text-amber-400/80",
    icon: AlertCircleIcon,
  },
  info: {
    className:
      "border-sky-600 bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
    description: "text-sky-600/80 dark:text-sky-400/80",
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
