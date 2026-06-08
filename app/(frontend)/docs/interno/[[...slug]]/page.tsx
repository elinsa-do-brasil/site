import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsPageActions } from "@/components/docs/page-actions";
import { internalDocs } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = internalDocs.getPage(slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const markdownUrl = page.url.replace(/^\/docs(?=\/|$)/, "/docs-markdown");
  const toc = page.data.toc.filter((item) => item.depth > 1);

  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      tableOfContent={{ style: "clerk" }}
      tableOfContentPopover={{ style: "clerk" }}
      toc={toc}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-4">
        {page.data.description}
      </DocsDescription>
      <DocsPageActions>
        <MarkdownCopyButton markdownUrl={markdownUrl} />
      </DocsPageActions>
      <DocsBody>
        <MDX components={getMDXComponents({ h1: () => null })} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return internalDocs.generateParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = internalDocs.getPage(slug);

  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
