const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TEST_SITE_KEYS = new Set([
  "1x00000000000000000000BB", // always passes
  "2x00000000000000000000AB", // always blocks
  "3x00000000000000000000FF", // forces challenge
]);

export async function verifyTurnstileToken(
  token: string | undefined,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Skip in dev when using test site keys or when secret is absent
  if (!secretKey) return { success: true };

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  if (TEST_SITE_KEYS.has(siteKey)) return { success: true };

  if (!token) {
    return { success: false, error: "Token de segurança ausente." };
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });

    const data = (await res.json()) as { success: boolean };
    if (!data.success) {
      return { success: false, error: "Verificação de segurança falhou." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao verificar segurança." };
  }
}
