import { ThemeProvider } from "@/providers/ThemeProvider";
import { inter, poppins } from "./fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Billwise - Gerenciamento de Contas",
    template: "%s | Billwise",
  },

  description:
    "Gerencie suas contas e orçamentos de forma eficiente com o Billwise.",

  category: "finance",

  keywords: [
    "finanças",
    "gerenciamento financeiro",
    "dashboard financeiro",
    "controle de gastos",
    "Billwise",
  ],

  authors: [{ name: "Guilherme Campos" }],
  creator: "Guilherme Campos",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    title: "Billwise - Gerenciamento de Contas",
    description:
      "Gerencie suas contas e orçamentos de forma eficiente com o Billwise.",
    siteName: "Billwise",
    images: [
      {
        url: "/icon-light-theme.png",
        width: 1200,
        height: 630,
        alt: "Billwise",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Billwise",
    description: "Gerencie suas contas e orçamentos",
    images: ["/icon-light-theme.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  applicationName: "Billwise",

  appleWebApp: {
    title: "Billwise",
    statusBarStyle: "default",
  },

  icons: {
    icon: [
      { media: '(prefers-color-scheme: light)', url: '/icon-light-theme.png', href: '/icon-light-theme.png'},
      { media: '(prefers-color-scheme: dark)', url: '/icon-dark-theme.png', href: '/icon-dark-theme.png'}
    ]
  },

  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} antialiased`}
    >
      <body className="min-h-dvh font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
