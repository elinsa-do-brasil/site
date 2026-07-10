import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { getInternalAccessContext } from "@/lib/organization/access";

export const metadata: Metadata = {
  title: "Entrar",
};

type EntrarPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function EntrarPage({ searchParams }: EntrarPageProps) {
  const { redirectTo } = await searchParams;
  const safeRedirect = getSafePortalRedirect(redirectTo);
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user.id) {
    const context = await getInternalAccessContext(session.user.id);

    if (context) {
      redirect(safeRedirect);
    }
  }

  return (
    <main
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      id="conteudo-principal"
    >
      <LoginForm redirectTo={safeRedirect} />
    </main>
  );
}

function getSafePortalRedirect(value: string | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return "/portal";
  }

  if (value === "/entrar" || value.startsWith("/entrar?")) {
    return "/portal";
  }

  if (value === "/interno") {
    return "/portal";
  }

  if (value.startsWith("/interno/admin/convites")) {
    return value.replace("/interno/admin/convites", "/portal/gestao/convites");
  }

  if (value.startsWith("/interno/")) {
    return value.replace("/interno", "/portal");
  }

  if (value === "/comite" || value.startsWith("/comite/")) {
    return value.replace("/comite", "/portal/comite-de-etica");
  }

  if (
    value === "/ti" ||
    value.startsWith("/ti/") ||
    value === "/ferramentas" ||
    value.startsWith("/ferramentas/")
  ) {
    return "/portal";
  }

  if (value === "/blog" || value.startsWith("/blog/")) {
    return value.replace("/blog", "/portal/blog");
  }

  return value;
}
