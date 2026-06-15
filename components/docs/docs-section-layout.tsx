import type { Root } from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { DocsHeader } from "@/components/docs/docs-header";
import { docsTranslations } from "@/components/docs/docs-translations";

type DocsSectionLayoutProps = {
  children: ReactNode;
  navUrl: string;
  searchApi: string;
  tree: Root;
};

export function DocsSectionLayout({
  children,
  navUrl,
  searchApi,
  tree,
}: DocsSectionLayoutProps) {
  return (
    <RootProvider
      i18n={{ locale: "pt-BR", translations: docsTranslations }}
      search={{
        options: {
          api: searchApi,
        },
      }}
      theme={{ enabled: false }}
    >
      <DocsLayout
        tree={tree}
        nav={{
          title: <DocsHeader />,
          url: navUrl,
        }}
        searchToggle={{
          enabled: true,
        }}
        themeSwitch={{
          enabled: false,
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
