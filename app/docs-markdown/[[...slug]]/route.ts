import { readFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  isDirectSectionMarkdownSlug,
  isInternalMarkdownSlug,
  toDocsMarkdownContentSlug,
} from "@/lib/source";

type RouteProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

function isSafeSlug(slug: string[]) {
  return slug.every(
    (segment) =>
      segment.length > 0 &&
      segment !== "." &&
      segment !== ".." &&
      !segment.includes("/") &&
      !segment.includes("\\") &&
      !path.isAbsolute(segment),
  );
}

function resolveDocsPath(docsRoot: string, candidate: string) {
  const filePath = path.resolve(docsRoot, candidate);
  const relativePath = path.relative(docsRoot, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

export async function GET(_: Request, { params }: RouteProps) {
  const { slug: routeSlug = [] } = await params;

  if (isDirectSectionMarkdownSlug(routeSlug)) {
    notFound();
  }

  if (isInternalMarkdownSlug(routeSlug)) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user.id) {
      return new Response("Não autorizado", { status: 401 });
    }
  }

  const slug = toDocsMarkdownContentSlug(routeSlug);

  if (!isSafeSlug(slug)) {
    notFound();
  }

  const candidates =
    slug.length === 0
      ? ["index.mdx"]
      : [`${path.join(...slug)}.mdx`, path.join(...slug, "index.mdx")];
  const docsRoot = path.resolve(process.cwd(), "docs");

  for (const candidate of candidates) {
    const filePath = resolveDocsPath(docsRoot, candidate);

    if (!filePath) {
      continue;
    }

    try {
      const content = await readFile(filePath, "utf8");

      return new Response(content, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
        },
      });
    } catch {
      // Try the next candidate, for example section.mdx before section/index.mdx.
    }
  }

  notFound();
}
