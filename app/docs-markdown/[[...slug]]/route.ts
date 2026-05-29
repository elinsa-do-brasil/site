import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

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
  const { slug = [] } = await params;

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
