export const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(dateString));

export const formatRuleEndDate = (dateString: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateString));

export const formatNotificationDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatNotificationDateTime = (dateString: string) =>
  new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatJoinDate = (date: Date | string) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);

export function computeRecurrenceEndDate(startIso: string, months: number): string {
  const start = new Date(startIso);
  const end = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth() + months,
      start.getUTCDate(),
    ),
  );
  return `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, "0")}-${String(end.getUTCDate()).padStart(2, "0")}`;
}
