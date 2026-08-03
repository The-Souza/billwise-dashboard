import { toKebabCase } from "@/utils/to-kebab-case";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { Tag } from "lucide-react";

interface CategoryIconProps {
  name?: string | null;
  className?: string;
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  if (!name) return null;

  return (
    <DynamicIcon
      name={toKebabCase(name) as IconName}
      className={className}
      fallback={() => <Tag className={className} />}
    />
  );
}
