import { toast } from "sonner";

const baseOptions = {
  position: "top-right" as const,
};

export const appToast = {
  success: (message: string) =>
    toast.success(message, {
      ...baseOptions,
      style: {
        "--normal-bg": "color-mix(in oklab, var(--primary) 10%, var(--background))",
        "--normal-text": "var(--primary)",
        "--normal-border": "var(--primary)",
      } as React.CSSProperties,
    }),

  error: (message: string) =>
    toast.error(message, {
      ...baseOptions,
      style: {
        "--normal-bg":
          "color-mix(in oklab, var(--destructive) 10%, var(--background))",
        "--normal-text": "var(--destructive)",
        "--normal-border": "var(--destructive)",
      } as React.CSSProperties,
    }),

  info: (message: string) =>
    toast.info(message, {
      ...baseOptions,
      style: {
        "--normal-bg": "var(--secondary)",
        "--normal-text": "var(--foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties,
    }),

  warning: (message: string) =>
    toast.warning(message, {
      ...baseOptions,
      style: {
        "--normal-bg": "color-mix(in oklab, var(--primary) 10%, var(--background))",
        "--normal-text": "var(--primary)",
        "--normal-border": "var(--primary)",
      } as React.CSSProperties,
    }),

  undo: (
    message: string,
    options: { label: string; onClick: () => void; duration?: number },
  ) =>
    toast(message, {
      ...baseOptions,
      duration: options.duration,
      action: {
        label: options.label,
        onClick: options.onClick,
      },
      actionButtonStyle: {
        background: "var(--primary)",
        color: "var(--primary-foreground)",
      } as React.CSSProperties,
      style: {
        "--normal-bg": "var(--secondary)",
        "--normal-text": "var(--foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties,
    }),
};
