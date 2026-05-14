import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { FrontendShell } from "@/components/frontend-shell";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elinsa do Brasil",
  description: "Site Institucional da Elinsa do Brasil",
   icons: {
    icon: [
      {
        url: '/favicon/e.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon/e.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/favicon/e.ico',
      },
    ],
    shortcut: '/favicon/e.ico',
    apple: '/favicon/e.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "overflow-x-hidden",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FrontendShell>{children}</FrontendShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
