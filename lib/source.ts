import type { Node, Root } from "fumadocs-core/page-tree";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";
import { docs } from "@/.source/server";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (!icon) return;

    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons]);
    }
  },
});

type DocPage = ReturnType<typeof source.getPages>[number];
type DocsSource = typeof source;

const PUBLIC_SECTION_SLUG = "public";
const INTERNAL_SECTION_SLUG = "internal";
const PUBLIC_SOURCE_PREFIX = `/docs/${PUBLIC_SECTION_SLUG}`;
const INTERNAL_SOURCE_PREFIX = `/docs/${INTERNAL_SECTION_SLUG}`;
const PUBLIC_ROUTE_PREFIX = "/docs";
const INTERNAL_ROUTE_PREFIX = "/docs/interno";

function isSectionContentSlug(slugs: string[], section: string) {
  return slugs[0] === section;
}

function isSectionUrl(url: string, sourcePrefix: string) {
  return url === sourcePrefix || url.startsWith(`${sourcePrefix}/`);
}

function rewriteSectionUrl(
  url: string,
  sourcePrefix: string,
  routePrefix: string,
) {
  if (url === sourcePrefix) {
    return routePrefix;
  }

  return url.replace(`${sourcePrefix}/`, `${routePrefix}/`);
}

function toSectionRouteSlugs(slugs: string[], section: string) {
  return isSectionContentSlug(slugs, section) ? slugs.slice(1) : slugs;
}

function toSectionContentSlugs(section: string, slugs: string[] | undefined) {
  return [section, ...(slugs ?? [])];
}

export function toPublicContentSlugs(slugs: string[] | undefined) {
  return toSectionContentSlugs(PUBLIC_SECTION_SLUG, slugs);
}

export function toInternalContentSlugs(slugs: string[] | undefined) {
  return toSectionContentSlugs(INTERNAL_SECTION_SLUG, slugs);
}

function rewritePublicUrl(url: string) {
  return rewriteSectionUrl(url, PUBLIC_SOURCE_PREFIX, PUBLIC_ROUTE_PREFIX);
}

function rewriteInternalUrl(url: string) {
  return rewriteSectionUrl(url, INTERNAL_SOURCE_PREFIX, INTERNAL_ROUTE_PREFIX);
}

function rewritePublicPage(page: DocPage): DocPage {
  return {
    ...page,
    slugs: toSectionRouteSlugs(page.slugs, PUBLIC_SECTION_SLUG),
    url: rewritePublicUrl(page.url),
  };
}

function rewriteInternalPage(page: DocPage): DocPage {
  return {
    ...page,
    slugs: toSectionRouteSlugs(page.slugs, INTERNAL_SECTION_SLUG),
    url: rewriteInternalUrl(page.url),
  };
}

function filterTree(
  tree: Root,
  includePage: (url: string) => boolean,
  rewriteUrl: (url: string) => string = (url) => url,
): Root {
  return {
    ...tree,
    children: filterNodes(tree.children, includePage, rewriteUrl),
  };
}

function filterNodes(
  nodes: Node[],
  includePage: (url: string) => boolean,
  rewriteUrl: (url: string) => string,
): Node[] {
  const filtered: Node[] = [];

  for (const node of nodes) {
    if (node.type === "page") {
      if (includePage(node.url)) {
        filtered.push({ ...node, url: rewriteUrl(node.url) });
      }

      continue;
    }

    if (node.type === "folder") {
      const index =
        node.index && includePage(node.index.url)
          ? { ...node.index, url: rewriteUrl(node.index.url) }
          : undefined;
      const children = filterNodes(node.children, includePage, rewriteUrl);

      if (index || children.length > 0) {
        filtered.push({ ...node, index, children });
      }

      continue;
    }

    filtered.push(node);
  }

  return filtered;
}

function unwrapSingleFolder(tree: Root): Root {
  const [first, ...rest] = tree.children;

  if (rest.length > 0 || first?.type !== "folder") {
    return tree;
  }

  return {
    ...tree,
    children: first.index ? [first.index, ...first.children] : first.children,
  };
}

const publicPageTree = unwrapSingleFolder(
  filterTree(
    source.pageTree,
    (url) => isSectionUrl(url, PUBLIC_SOURCE_PREFIX),
    rewritePublicUrl,
  ),
);
const internalPageTree = unwrapSingleFolder(
  filterTree(
    source.pageTree,
    (url) => isSectionUrl(url, INTERNAL_SOURCE_PREFIX),
    rewriteInternalUrl,
  ),
);

const generatePublicParams = ((slug?: string) => {
  const key = slug ?? "slug";

  return source
    .getPages()
    .filter((page) => isSectionContentSlug(page.slugs, PUBLIC_SECTION_SLUG))
    .map((page) => ({
      [key]: toSectionRouteSlugs(page.slugs, PUBLIC_SECTION_SLUG),
    }));
}) as DocsSource["generateParams"];

const generateInternalParams = ((slug?: string) => {
  const key = slug ?? "slug";

  return source
    .getPages()
    .filter((page) => isSectionContentSlug(page.slugs, INTERNAL_SECTION_SLUG))
    .map((page) => ({
      [key]: toSectionRouteSlugs(page.slugs, INTERNAL_SECTION_SLUG),
    }));
}) as DocsSource["generateParams"];

export const publicDocs: DocsSource = {
  ...source,
  pageTree: publicPageTree,
  getPageTree: () => publicPageTree,
  getPages: (_language?: string) =>
    source
      .getPages()
      .filter((page) => isSectionContentSlug(page.slugs, PUBLIC_SECTION_SLUG))
      .map(rewritePublicPage),
  getPage: (slugs: string[] | undefined, _language?: string) => {
    const page = source.getPage(toPublicContentSlugs(slugs));

    if (!page) {
      return;
    }

    return rewritePublicPage(page);
  },
  generateParams: generatePublicParams,
};

export const internalDocs: DocsSource = {
  ...source,
  pageTree: internalPageTree,
  getPageTree: () => internalPageTree,
  getPages: (_language?: string) =>
    source
      .getPages()
      .filter((page) => isSectionContentSlug(page.slugs, INTERNAL_SECTION_SLUG))
      .map(rewriteInternalPage),
  getPage: (slugs: string[] | undefined, _language?: string) => {
    const page = source.getPage(toInternalContentSlugs(slugs));

    if (!page) {
      return;
    }

    return rewriteInternalPage(page);
  },
  generateParams: generateInternalParams,
};

export function isInternalMarkdownSlug(slug: string[]) {
  return slug[0] === "interno" || slug[0] === INTERNAL_SECTION_SLUG;
}

export function isDirectSectionMarkdownSlug(slug: string[]) {
  return slug[0] === PUBLIC_SECTION_SLUG || slug[0] === INTERNAL_SECTION_SLUG;
}

export function toDocsMarkdownContentSlug(slug: string[]) {
  if (slug[0] === "interno") {
    return toInternalContentSlugs(slug.slice(1));
  }

  return toPublicContentSlugs(slug);
}
