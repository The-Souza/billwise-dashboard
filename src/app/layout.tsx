import { ThemeProvider } from "@/providers/ThemeProvider";
import { inter, poppins } from "./fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Billwise - Gerenciamento de Contas",
    template: "%s | Billwise",
  },
  description:
    "Gerencie suas contas e orçamentos de forma eficiente com o Billwise.",
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
        alt: "Billwise - Gerenciamento de Contas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Billwise - Gerenciamento de Contas",
    description:
      "Gerencie suas contas e orçamentos de forma eficiente com o Billwise.",
    images: ["/icon-light-theme.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  applicationName: "Billwise",
  appleWebApp: {
    title: "Billwise",
    statusBarStyle: "default",
  },
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
      <body className="min-h-screen font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
