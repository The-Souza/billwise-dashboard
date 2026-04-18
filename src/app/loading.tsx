import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-16 text-primary" />

        <span
          role="status"
          aria-live="polite"
          className="text-lg text-primary"
        >
          Loading…
        </span>
      </div>
    </div>
  );
}
