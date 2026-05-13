import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { InternalHeader } from "@/components/internal/internal-header";
import { Toaster } from "@/components/ui/sonner";
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
  title: {
    default: "Portal interno | Elinsa",
    template: "%s | Elinsa",
  },
  description: "Acesso interno às ferramentas da Elinsa",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InternoLayout({
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
      <body className="min-h-screen bg-muted/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <InternalHeader />
          <main className="pt-24">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
