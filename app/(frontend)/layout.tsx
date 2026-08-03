import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import "../globals.css";
import { Footer } from "@/components/footer";
import { FrontendShell } from "@/components/frontend-shell";
import { FrontendTelemetry } from "@/components/frontend-telemetry";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  absoluteUrl,
  DEFAULT_SOCIAL_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
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
  metadataBase: SITE_URL,
  title: {
    default: `Infraestrutura elétrica no Pará | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    title: `Infraestrutura elétrica no Pará | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        alt: `${SITE_NAME} — infraestrutura elétrica no Pará`,
        url: absoluteUrl(DEFAULT_SOCIAL_IMAGE),
      },
    ],
    locale: "pt_BR",
    siteName: SITE_NAME,
    type: "website",
    url: absoluteUrl("/"),
  },
  icons: {
    icon: [
      {
        url: "/favicon/e.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon/e.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon/e.ico",
      },
    ],
    shortcut: "/favicon/e.ico",
    apple: "/favicon/e.png",
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  twitter: {
    card: "summary_large_image",
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_SOCIAL_IMAGE)],
    title: `Infraestrutura elétrica no Pará | ${SITE_NAME}`,
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  initialScale: 1,
  themeColor: [
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
    { color: "#171717", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
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
          <TooltipProvider>
            <FrontendShell footer={<Footer />}>{children}</FrontendShell>
          </TooltipProvider>
        </ThemeProvider>
        <Suspense fallback={null}>
          <FrontendTelemetry />
        </Suspense>
      </body>
    </html>
  );
}
