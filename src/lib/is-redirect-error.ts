export function isRedirectError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const digest = (error as unknown as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
