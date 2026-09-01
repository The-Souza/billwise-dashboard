const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA"; // forces interactive challenge

export const TURNSTILE_SITE_KEY =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "")
    : (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TURNSTILE_TEST_SITE_KEY);
