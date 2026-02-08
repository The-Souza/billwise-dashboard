import { inter, poppins } from "./fonts";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans">
        <main className="flex-1 px-6 py-6 sm:px-10 flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
