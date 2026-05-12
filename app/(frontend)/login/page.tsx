import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login - Elinsa do Brasil",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;
  const safeRedirect =
    redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/comite";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-28">
      <div className="mb-8 max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight">Acesso interno</h1>
        <p className="mt-3 text-muted-foreground">
          Entre com sua conta autorizada para acessar as ferramentas internas.
        </p>
      </div>
      <LoginForm redirectTo={safeRedirect} />
    </main>
  );
}
