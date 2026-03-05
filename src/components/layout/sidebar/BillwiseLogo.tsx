import { useMounted } from "@/hooks/useMounted";
import { useTheme } from "next-themes";
import Image from "next/image";

export function BillwiseLogo() {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  const iconSrc =
    mounted && resolvedTheme === "dark"
      ? "/icon-dark-theme.png"
      : "/icon-light-theme.png";

  return (
    <div className="flex items-center gap-2 group-data-[collapsible=icon]:ml-1">
      <Image
        src={iconSrc}
        width={24}
        height={24}
        alt="Billwise Icon"
        priority
      />
      <h1 className="text-lg font-heading group-data-[collapsible=icon]:hidden">
        Billwise
      </h1>
    </div>
  );
}
