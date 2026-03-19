import { account_status } from "@/generated/prisma/enums";

export const STATUS_OPTIONS: { value: account_status; label: string }[] = [
  { value: account_status.paid, label: "Pago" },
  { value: account_status.pending, label: "Pendente" },
  { value: account_status.overdue, label: "Vencido" },
];
