import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialRichText } from "@/components/editorial/editorial-rich-text";
import {
  type EditorialCollectionSlug,
  type EditorialConfig,
  type EditorialPost,
  editorialConfigs,
  formatEditorialDate,
  getAuthorName,
  getEditorialPost,
  getEditorialPosts,
  getHeadingsFromRichText,
  getReadingMinutes,
  type HeadingItem,
} from "@/lib/editorial";
import { cn } from "@/lib/utils";

export async function EditorialIndex({
  collection,
}: {
  collection: EditorialCollectionSlug;
}) {
  const config = editorialConfigs[collection];
  const posts = await getEditorialPosts(collection);
  const [featuredPost, ...remainingPosts] = posts;

  return (
    <div className="min-h-screen bg-background pt-28 text-foreground">
      <EditorialStickyHeader config={config} count={posts.length} />

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">
        <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-normal text-elinsa-primary">
              {config.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-normal text-elinsa-dark md:text-6xl dark:text-elinsa-sky">
              {config.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              {config.description}
            </p>
          </div>

          <div className="border-l border-border pl-5">
            <p className="text-sm font-semibold text-foreground">
              Conteúdo do Payload
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A listagem usa a data cadastrada no campo Data e mostra a
              atualização automática do Payload quando a notícia é alterada.
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <EmptyState config={config} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-5">
              {featuredPost && (
                <PostCard config={config} featured post={featuredPost} />
              )}

              {remainingPosts.map((post) => (
                <PostCard config={config} key={post.id} post={post} />
              ))}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-40 space-y-6 border-l border-border pl-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                    Navegação
                  </p>
                  <nav className="mt-3 grid gap-2">
                    {Object.values(editorialConfigs).map((item) => (
                      <Link
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted hover:text-elinsa-primary",
                          item.collection === collection
                            ? "bg-elinsa-light text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
                            : "text-muted-foreground",
                        )}
                        href={item.href}
                        key={item.collection}
                      >
                        {item.navLabel}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="rounded-md border border-border bg-muted/35 p-4">
                  <p className="text-3xl font-black text-elinsa-primary">
                    {posts.length}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {posts.length === 1
                      ? "notícia publicada"
                      : "notícias publicadas"}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}

export async function EditorialArticlePage({
  collection,
  slug,
}: {
  collection: EditorialCollectionSlug;
  slug: string;
}) {
  const config = editorialConfigs[collection];
  const { isEnabled: isDraftMode } = await draftMode();
  const post = await getEditorialPost({
    collection,
    draft: isDraftMode,
    slug,
  });

  if (!post) {
    return notFound();
  }

  const headings = getHeadingsFromRichText(post.content);
  const readingMinutes = getReadingMinutes(post.content);
  const publishedDate = formatEditorialDate(post.publishedAt ?? post.createdAt);
  const updatedDate = formatEditorialDate(post.updatedAt);

  return (
    <div className="min-h-screen bg-background pt-28 text-foreground">
      {isDraftMode && (
        <div className="border-y border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
          Pré-visualização ativa
        </div>
      )}

      <EditorialStickyHeader config={config} />

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-elinsa-primary"
          href={config.href}
        >
          <ArrowLeft className="size-4" />
          Voltar para {config.navLabel}
        </Link>

        <header className="mt-7 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-md bg-elinsa-light px-3 py-2 font-semibold text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky">
              <FileText className="size-4" />
              {config.badge}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-elinsa-primary" />
              {publishedDate}
            </span>
            <span className="inline-flex items-center gap-2">
              <UserRound className="size-4 text-elinsa-primary" />
              {getAuthorName(post.author)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4 text-elinsa-primary" />
              {readingMinutes} min de leitura
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-normal text-elinsa-dark md:text-6xl dark:text-elinsa-sky">
            {post.title}
          </h1>

          {post.summary && (
            <p className="mt-5 max-w-3xl text-xl leading-8 text-muted-foreground">
              {post.summary}
            </p>
          )}

          {updatedDate && (
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="size-4 text-elinsa-primary" />
              Atualizado em {updatedDate}
            </p>
          )}
        </header>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14 md:px-8 lg:h-[calc(100dvh-18rem)] lg:min-h-[36rem]">
        <div className="grid h-full min-h-0 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:pr-8 lg:pb-12">
            <MobileTopics headings={headings} />
            <EditorialRichText data={post.content} />

            <div className="mt-14 border-t border-border pt-6">
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-elinsa-primary hover:text-elinsa-primary"
                href={config.href}
              >
                Ver todas
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>

          <TopicsAside headings={headings} />
        </div>
      </section>
    </div>
  );
}

function EditorialStickyHeader({
  config,
  count,
}: {
  config: EditorialConfig;
  count?: number;
}) {
  return (
    <div className="sticky top-20 z-40 border-y border-border bg-background/92 backdrop-blur-md md:top-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-elinsa-primary">
            {config.eyebrow}
          </p>
          <div className="flex items-center gap-3">
            <h2 className="truncate text-base font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
              {config.title}
            </h2>
            {typeof count === "number" && (
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                {count}
              </span>
            )}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto">
          {Object.values(editorialConfigs).map((item) => (
            <Link
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted hover:text-elinsa-primary",
                item.collection === config.collection
                  ? "bg-elinsa-light text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
                  : "text-muted-foreground",
              )}
              href={item.href}
              key={item.collection}
            >
              {item.navLabel}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function PostCard({
  config,
  featured = false,
  post,
}: {
  config: EditorialConfig;
  featured?: boolean;
  post: EditorialPost;
}) {
  const publishedDate = formatEditorialDate(post.publishedAt ?? post.createdAt);
  const updatedDate = formatEditorialDate(post.updatedAt);
  const href = post.slug ? `${config.href}/${post.slug}` : config.href;

  return (
    <Link
      className={cn(
        "group grid gap-5 rounded-md border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-elinsa-primary/55 hover:shadow-md md:grid-cols-[minmax(0,1fr)_auto]",
        featured && "border-elinsa-primary/35 bg-elinsa-light/45 p-6",
      )}
      href={href}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
          {featured && (
            <span className="rounded-md bg-elinsa-primary px-2 py-1 font-semibold text-white">
              Destaque
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-elinsa-primary" />
            {publishedDate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="size-3.5 text-elinsa-primary" />
            {getAuthorName(post.author)}
          </span>
        </div>

        <h2
          className={cn(
            "mt-4 font-black leading-tight tracking-normal text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky",
            featured ? "text-3xl md:text-4xl" : "text-2xl",
          )}
        >
          {post.title}
        </h2>

        {post.summary && (
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {post.summary}
          </p>
        )}

        {updatedDate && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <RefreshCw className="size-3.5 text-elinsa-primary" />
            Atualizado em {updatedDate}
          </p>
        )}
      </div>

      <div className="flex items-end justify-start md:justify-end">
        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors group-hover:border-elinsa-primary group-hover:text-elinsa-primary">
          Ler
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ config }: { config: EditorialConfig }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/35 px-6 py-14 text-center">
      <div className="mb-5 flex size-12 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky">
        <FileText className="size-6" />
      </div>
      <h2 className="text-2xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
        {config.emptyTitle}
      </h2>
      <p className="mt-3 max-w-md text-muted-foreground">
        {config.emptyDescription}
      </p>
    </div>
  );
}

function TopicsAside({ headings }: { headings: HeadingItem[] }) {
  return (
    <aside className="hidden min-h-0 border-l border-border pl-6 lg:block">
      <div className="max-h-full overflow-y-auto pb-6">
        <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          Tópicos
        </p>
        <TopicsNav headings={headings} />
      </div>
    </aside>
  );
}

function MobileTopics({ headings }: { headings: HeadingItem[] }) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 rounded-md border border-border bg-muted/35 p-4 lg:hidden">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Tópicos
      </p>
      <TopicsNav headings={headings} />
    </div>
  );
}

function TopicsNav({ headings }: { headings: HeadingItem[] }) {
  if (headings.length === 0) {
    return (
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Adicione títulos H2, H3 ou H4 no conteúdo para montar este índice.
      </p>
    );
  }

  return (
    <nav className="mt-3 grid gap-1">
      {headings.map((heading) => (
        <a
          className={cn(
            "rounded-md px-3 py-2 text-sm leading-5 text-muted-foreground transition-colors hover:bg-muted hover:text-elinsa-primary",
            heading.level === 3 && "ml-3 text-xs",
            heading.level === 4 && "ml-6 text-xs",
          )}
          href={`#${heading.id}`}
          key={heading.id}
        >
          {heading.title}
        </a>
      ))}
    </nav>
  );
}
