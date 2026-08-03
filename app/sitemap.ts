import type { MetadataRoute } from "next";
import { getEditorialCoverImage, getEditorialPosts } from "@/lib/editorial";
import { getGallerySitemapData } from "@/lib/gallery";
import { createSitemap, getCmsSeoImage } from "@/lib/seo";
import { getVagasAbertas } from "@/lib/vagas";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, jobs, gallery] = await Promise.all([
    loadOrFallback(() => getEditorialPosts("imprensa"), []),
    loadOrFallback(getVagasAbertas, []),
    loadOrFallback(getGallerySitemapData, null),
  ]);

  return createSitemap({
    gallery,
    jobs,
    posts: posts.map((post) => ({
      _status: post._status,
      image:
        getCmsSeoImage(post.meta?.image)?.url ??
        getEditorialCoverImage(post, "hero")?.url,
      slug: post.slug,
      updatedAt: post.updatedAt,
    })),
  });
}

async function loadOrFallback<T>(loader: () => Promise<T>, fallback: T) {
  try {
    return await loader();
  } catch (error) {
    console.error(
      "Não foi possível carregar conteúdo dinâmico do sitemap.",
      error,
    );
    return fallback;
  }
}
