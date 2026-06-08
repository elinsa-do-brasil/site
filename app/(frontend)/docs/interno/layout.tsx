import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DocsSectionLayout } from "@/components/docs/docs-section-layout";
import { auth } from "@/lib/auth";
import { internalDocs } from "@/lib/source";

export const dynamic = "force-dynamic";

export default async function InternalDocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id) {
    redirect("/entrar?redirectTo=/docs/interno");
  }

  return (
    <DocsSectionLayout
      navUrl="/docs/interno"
      searchApi="/api/search/docs/interno"
      tree={internalDocs.pageTree}
    >
      {children}
    </DocsSectionLayout>
  );
}
