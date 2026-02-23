import { ToggleTheme } from "@/components/ui/toggle-theme";

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="absolute top-6 right-6">
        <ToggleTheme />
      </div>
      <main className="flex-1 h-screen flex flex-col items-center">
        {children}
      </main>
    </>
  );
}