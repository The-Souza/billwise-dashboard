export type NotificationFilterType =
  | "all"
  | "overdue"
  | "due_soon"
  | "budget_exceeded"
  | "recurring_generated"
  | "workspace_invite"
  | "workspace_deleted";

export const NOTIFICATION_FILTER_OPTIONS: {
  value: NotificationFilterType;
  label: string;
}[] = [
  { value: "all", label: "Todas" },
  { value: "overdue", label: "Vencidas" },
  { value: "due_soon", label: "Prestes a vencer" },
  { value: "budget_exceeded", label: "Orçamento" },
  { value: "recurring_generated", label: "Recorrentes" },
  { value: "workspace_invite", label: "Convites" },
  { value: "workspace_deleted", label: "Workspaces removidos" },
];
