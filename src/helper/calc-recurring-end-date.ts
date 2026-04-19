export function calcRecurringEndDate(startDate: Date, months: number): Date {
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);
  return end;
}
