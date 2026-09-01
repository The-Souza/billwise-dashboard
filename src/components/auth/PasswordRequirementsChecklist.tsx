import { checkRequirements } from "@/utils/check-requirements";
import { CheckCircle2, Circle } from "lucide-react";

interface PasswordRequirementsChecklistProps {
  password: string;
}

export function PasswordRequirementsChecklist({
  password,
}: PasswordRequirementsChecklistProps) {
  const requirements = checkRequirements(password);

  const items = [
    { met: requirements.minChar, text: "No mínimo 6 caracteres" },
    { met: requirements.upperCase, text: "Uma letra maiúscula" },
    { met: requirements.lowerCase, text: "Uma letra minúscula" },
    { met: requirements.number, text: "Pelo menos um número" },
    { met: requirements.specialChar, text: "Um caractere especial (@$!%*?&)" },
  ];

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-2">
      <p className="text-sm font-medium">Requisitos da senha:</p>
      <ul className="grid grid-cols-1 gap-1.5">
        {items.map(({ met, text }) => (
          <li
            key={text}
            className={`flex items-center gap-2 transition-colors duration-300 ${
              met ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {met ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : (
              <Circle className="size-4" aria-hidden="true" />
            )}
            <span className="text-sm">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
