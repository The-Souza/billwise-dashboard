import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/auth/sign-in", "/auth/sign-up"],
        disallow: "/",
      },
    ],
  };
}
