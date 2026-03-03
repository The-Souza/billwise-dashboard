export function getInitials(name: string | null | undefined) {
  if (!name || name.trim() === "") {
    return "BW";
  }

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  const first = words[0];
  const last = words[words.length - 1];

  const firstLetter = first?.[0] || "";
  const lastLetter = last?.[0] || "";

  return (firstLetter + lastLetter).toUpperCase();
}