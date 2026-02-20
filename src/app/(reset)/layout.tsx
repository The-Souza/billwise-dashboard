import { ToggleTheme } from "@/components/ui/toggle-theme";

export default function ResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="absolute top-6 right-6">
        <ToggleTheme />
      </div>
      {children}
    </>
  );
}
