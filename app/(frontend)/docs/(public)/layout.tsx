import type { ReactNode } from "react";
import { DocsSectionLayout } from "@/components/docs/docs-section-layout";
import { publicDocs } from "@/lib/source";

export default function PublicDocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DocsSectionLayout
      navUrl="/docs"
      searchApi="/api/search/docs/publico"
      tree={publicDocs.pageTree}
    >
      {children}
    </DocsSectionLayout>
  );
}
