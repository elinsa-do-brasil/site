import configPromise from "@payload-config";
import { getPayload } from "payload";
import {
  defaultEditorialSubject,
  type EditorialSubjectValue,
  editorialSubjects,
} from "@/lib/editorial-subjects";

export type EditorialCollectionSlug = "blog" | "imprensa";

export type EditorialConfig = {
  badge: string;
  collection: EditorialCollectionSlug;
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  eyebrow: string;
  href: string;
  navLabel: string;
  title: string;
};

export type EditorialAuthor =
  | string
  | {
      email?: null | string;
      id?: number | string;
      name?: null | string;
    };

export type EditorialImage = {
  alt?: null | string;
  filename?: null | string;
  height?: null | number;
  id?: number | string;
  sizes?: null | Record<
    string,
    {
      height?: null | number;
      url?: null | string;
      width?: null | number;
    }
  >;
  url?: null | string;
  width?: null | number;
};

export type EditorialPost = {
  content?: null | unknown;
  coverImage?: EditorialImage | null | number | string;
  createdAt?: string;
  id: number | string;
  author?: EditorialAuthor | null;
  publishedAt?: null | string;
  slug?: null | string;
  subject?: EditorialSubjectValue | null;
  summary?: null | string;
  title: string;
  updatedAt?: string;
};

export type HeadingItem = {
  id: string;
  level: number;
  title: string;
};

type LexicalNode = {
  children?: LexicalNode[];
  tag?: string;
  text?: string;
  type?: string;
};

export const editorialConfigs: Record<
  EditorialCollectionSlug,
  EditorialConfig
> = {
  imprensa: {
    badge: "Notícias públicas",
    collection: "imprensa",
    description:
      "Comunicados, notícias institucionais e atualizações públicas da Elinsa do Brasil.",
    emptyDescription:
      "As próximas notícias públicas cadastradas aparecerão aqui.",
    emptyTitle: "Nenhuma notícia publicada",
    eyebrow: "Comunicação pública",
    href: "/imprensa",
    navLabel: "Imprensa",
    title: "Imprensa",
  },
  blog: {
    badge: "Notícias internas",
    collection: "blog",
    description:
      "Eventos internos, recrutamento, comunicados para equipes e novidades da operação.",
    emptyDescription:
      "As próximas notícias internas cadastradas aparecerão aqui.",
    emptyTitle: "Nenhuma notícia interna publicada",
    eyebrow: "Comunicação interna",
    href: "/portal/blog",
    navLabel: "Blog interno",
    title: "Blog",
  },
};

export async function getEditorialPosts(
  collection: EditorialCollectionSlug,
): Promise<EditorialPost[]> {
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection,
    depth: 1,
    draft: false,
    limit: 100,
    sort: "-publishedAt",
  });

  return docs as EditorialPost[];
}

export async function getEditorialPost({
  collection,
  draft,
  slug,
}: {
  collection: EditorialCollectionSlug;
  draft: boolean;
  slug: string;
}): Promise<EditorialPost | null> {
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection,
    depth: 1,
    draft,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return (docs[0] as EditorialPost | undefined) ?? null;
}

export function getAuthorName(author: EditorialAuthor | null | undefined) {
  if (!author) {
    return "Elinsa do Brasil";
  }

  if (typeof author === "string") {
    return "Elinsa do Brasil";
  }

  return author.name || formatNameFromEmail(author.email) || "Elinsa do Brasil";
}

export function getValidEditorialSubject(value: string | string[] | undefined) {
  const subject = Array.isArray(value) ? value[0] : value;

  if (!subject) {
    return null;
  }

  return editorialSubjects.some((item) => item.value === subject)
    ? (subject as EditorialSubjectValue)
    : null;
}

export function getSubjectCounts(posts: EditorialPost[]) {
  return editorialSubjects.map((subject) => ({
    ...subject,
    count: posts.filter((post) => getPostSubjectValue(post) === subject.value)
      .length,
  }));
}

export function getPostSubjectValue(post: EditorialPost) {
  return post.subject ?? defaultEditorialSubject;
}

export function formatEditorialDate(dateString: null | string | undefined) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatEditorialShortDate(
  dateString: null | string | undefined,
) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(dateString));
}

export function getEditorialCoverImage(
  post: EditorialPost,
  size: "card" | "hero" | "thumbnail" = "card",
) {
  if (!post.coverImage || typeof post.coverImage !== "object") {
    return null;
  }

  const sizedImage = post.coverImage.sizes?.[size];
  const url = sizedImage?.url || post.coverImage.url;

  if (!url) {
    return null;
  }

  return {
    alt: post.coverImage.alt || post.title,
    height: sizedImage?.height || post.coverImage.height,
    url,
    width: sizedImage?.width || post.coverImage.width,
  };
}

export function getRichTextNodeText(node: unknown): string {
  if (!isLexicalNode(node)) {
    return "";
  }

  const ownText = typeof node.text === "string" ? node.text : "";
  const childText = Array.isArray(node.children)
    ? node.children.map((child) => getRichTextNodeText(child)).join("")
    : "";

  return `${ownText}${childText}`;
}

export function createHeadingId(
  title: string,
  usedHeadings: Map<string, number>,
) {
  const base = slugifyHeading(title);
  const count = usedHeadings.get(base) ?? 0;

  usedHeadings.set(base, count + 1);

  return count === 0 ? base : `${base}-${count + 1}`;
}

export function getHeadingsFromRichText(data: unknown): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const usedHeadings = new Map<string, number>();

  const visit = (node: unknown) => {
    if (!isLexicalNode(node)) {
      return;
    }

    if (node.type === "heading" && isTrackedHeadingTag(node.tag)) {
      const title = getRichTextNodeText(node).trim();

      if (title) {
        headings.push({
          id: createHeadingId(title, usedHeadings),
          level: Number(node.tag.replace("h", "")),
          title,
        });
      }
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        visit(child);
      }
    }
  };

  const rootChildren = getRootChildren(data);

  for (const child of rootChildren) {
    visit(child);
  }

  return headings;
}

export function getReadingMinutes(content: unknown) {
  const text = getRichTextNodeText({ children: getRootChildren(content) });
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  if (words === 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(words / 180));
}

export function isTrackedHeadingTag(
  tag: string | undefined,
): tag is "h2" | "h3" | "h4" {
  return tag === "h2" || tag === "h3" || tag === "h4";
}

function getRootChildren(data: unknown): LexicalNode[] {
  if (!isRecord(data)) {
    return [];
  }

  const root = data.root;

  if (!isRecord(root) || !Array.isArray(root.children)) {
    return [];
  }

  return root.children.filter(isLexicalNode);
}

function isLexicalNode(value: unknown): value is LexicalNode {
  return isRecord(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatNameFromEmail(email: null | string | undefined) {
  const localPart = email?.split("@")[0];

  if (!localPart) {
    return "";
  }

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function slugifyHeading(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "topico";
}
