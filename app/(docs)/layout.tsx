import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "../globals.css";
import "fumadocs-ui/style.css";
import { portugueseDocsTranslations } from "@/lib/docs/translations";
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
    default: "Documentacao | Elinsa",
    template: "%s | Documentacao Elinsa",
  },
  description: "Documentacao tecnica e institucional da Elinsa do Brasil.",
};

export default function DocsRootLayout({
  children,
}: Readonly<{
  children: ReactNode;
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
      <body className="flex min-h-screen flex-col">
        <RootProvider
          i18n={{
            locale: "pt-BR",
            translations: portugueseDocsTranslations,
          }}
          search={{
            options: {
              type: "static",
            },
          }}
          theme={{
            attribute: "class",
            defaultTheme: "system",
            enableSystem: true,
            disableTransitionOnChange: true,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
