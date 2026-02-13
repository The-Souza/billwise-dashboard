import { toast } from "sonner";

const baseOptions = {
  position: "top-left" as const,
};

export const appToast = {
  success: (message: string) =>
    toast.success(message, {
      ...baseOptions,
      style: {
        "--normal-bg":
          "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
        "--normal-text":
          "light-dark(var(--color-green-600), var(--color-green-400))",
        "--normal-border":
          "light-dark(var(--color-green-600), var(--color-green-400))",
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
        "--normal-bg":
          "color-mix(in oklab, light-dark(var(--color-sky-600), var(--color-sky-400)) 10%, var(--background))",
        "--normal-text":
          "light-dark(var(--color-sky-600), var(--color-sky-400))",
        "--normal-border":
          "light-dark(var(--color-sky-600), var(--color-sky-400))",
      } as React.CSSProperties,
    }),

  warning: (message: string) =>
    toast.warning(message, {
      ...baseOptions,
      style: {
        "--normal-bg":
          "color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))",
        "--normal-text":
          "light-dark(var(--color-amber-600), var(--color-amber-400))",
        "--normal-border":
          "light-dark(var(--color-amber-600), var(--color-amber-400))",
      } as React.CSSProperties,
    }),
};
