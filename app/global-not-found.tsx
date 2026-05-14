// importações de dependências:
import type { Metadata } from "next";

// importações de fontes:
import { Geist, Geist_Mono } from "next/font/google";

// importações de estilos:
import "./globals.css";

import { MoveRightIcon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
// importações de componentes:
import { ThemeProvider } from "@/components/ui/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404 · Ampere",
  description: "A página que você está procurando não foi encontrada.",
};

export default function Page() {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className="no-scrollbar select-none"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex min-h-dvh min-w-dvw items-center justify-center gap-4">
            <h1 className="text-5xl font-mono border-r border-black dark:border-white pr-4">
              404
            </h1>
            <div>
              <p>Hum... Não temos esta página.</p>
              {/* Utiliza a tag <a> para forçar o recarregamento da página e garantir a troca correta de layout ao sair da página 404. */}
              <a href="/" className="underline flex items-center gap-2">
                <p>Voltar à página inicial</p>
                <MoveRightIcon size={18} />
              </a>
            </div>
          </main>
          <Toaster visibleToasts={1} />
        </ThemeProvider>
      </body>
    </html>
  );
}
