import type { Metadata } from "next";
import { LoginInternoForm } from "@/components/auth/InternalLoginForm";

export const metadata: Metadata = {
  title: "Entrar - Portal Interno Elinsa",
};

type EntrarPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function EntrarPage({ searchParams }: EntrarPageProps) {
  const { redirectTo } = await searchParams;
  const safeRedirect =
    redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/comite";

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <LoginInternoForm redirectTo={safeRedirect} />
    </main>
  );
}
