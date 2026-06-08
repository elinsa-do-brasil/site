import type { Root } from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { DocsHeader } from "@/components/docs/docs-header";

const translations = {
  search: "Pesquisar",
  searchNoResult: "Nenhum resultado encontrado",
  searchOpen: "Abrir pesquisa",
  searchClose: "Fechar pesquisa",
  toc: "Nesta página",
  tocNoHeadings: "Sem seções",
  tocInline: "Índice",
  nextPage: "Próxima página",
  previousPage: "Página anterior",
  chooseTheme: "Tema",
  editOnGithub: "Editar no GitHub",
  themeToggle: "Alternar tema",
  themeLight: "Claro",
  themeDark: "Escuro",
  themeSystem: "Sistema",
  codeBlockCopy: "Copiar texto",
  codeBlockCopied: "Texto copiado",
  accordionCopyAnchor: "Copiar link",
  headingCopyAnchor: "Copiar link da seção",
  menuToggle: "Alternar menu",
  pageActionsCopyMarkdown: "Copiar Markdown",
  pageActionsOpen: "Abrir",
  pageActionsOpenClaude: "Abrir no Claude",
  pageActionsOpenGitHub: "Abrir no GitHub",
  pageActionsOpenInLLMPrompt:
    "Leia {url} e me ajude a entender os pontos principais, riscos, lacunas e melhorias possíveis.",
  sidebarOpen: "Abrir navegação",
  sidebarCollapse: "Recolher navegação",
  notFoundTitle: "Página não encontrada",
  notFoundDescription:
    "A página solicitada pode ter sido removida ou ter mudado de endereço.",
  notFoundLink: "Voltar ao início",
};

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
      i18n={{ locale: "pt-BR", translations }}
      search={{
        options: {
          api: searchApi,
          type: "static",
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
