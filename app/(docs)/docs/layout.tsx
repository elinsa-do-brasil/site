import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/docs/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        
        title: "Elinsa Docs",
        url: "/docs",
      }}
      tabMode="auto"
    >
      {children}
    </DocsLayout>
  );
}
