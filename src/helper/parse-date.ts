export function parseDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return {
    year,
    month,
    day,
    date: new Date(year, month - 1, day),
  };
}

export function parseDateLocal(date: string) {
  return parseDateParts(date).date;
}
