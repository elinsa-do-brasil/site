import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  ImageIcon,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialRichText } from "@/components/editorial/editorial-rich-text";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  type EditorialCollectionSlug,
  type EditorialConfig,
  type EditorialPost,
  editorialConfigs,
  formatEditorialDate,
  formatEditorialShortDate,
  getAuthorName,
  getEditorialCoverImage,
  getEditorialPost,
  getEditorialPosts,
  getHeadingsFromRichText,
  getPostSubjectValue,
  getReadingMinutes,
  getSubjectCounts,
  type HeadingItem,
} from "@/lib/editorial";
import {
  type EditorialSubjectValue,
  getEditorialSubjectLabel,
} from "@/lib/editorial-subjects";
import { cn } from "@/lib/utils";

export async function EditorialIndex({
  collection,
  subject,
}: {
  collection: EditorialCollectionSlug;
  subject?: EditorialSubjectValue | null;
}) {
  const config = editorialConfigs[collection];
  const allPosts = await getEditorialPosts(collection);
  const posts = subject
    ? allPosts.filter((post) => getPostSubjectValue(post) === subject)
    : allPosts;
  const subjectCounts = getSubjectCounts(allPosts);

  return (
    <div className="min-h-screen bg-background pt-24 text-foreground">
      <section className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
        <div className="mb-8 min-w-0">
          <p className="text-sm font-semibold uppercase tracking-normal text-elinsa-primary">
            {config.eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight tracking-normal text-elinsa-dark md:text-5xl dark:text-elinsa-sky">
            {config.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            {config.description}
          </p>
        </div>

        {allPosts.length === 0 ? (
          <EmptyState config={config} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="min-w-0">
              {posts.length === 0 ? (
                <EmptyState config={config} />
              ) : (
                <BentoGrid className="mx-0 max-w-none gap-4 md:auto-rows-[24rem] md:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post, index) => (
                    <PostCard
                      config={config}
                      featured={index === 0}
                      key={post.id}
                      post={post}
                    />
                  ))}
                </BentoGrid>
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28 border-l border-border pl-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                    Assuntos
                  </p>
                  <nav className="mt-3 grid gap-2">
                    <Link
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted hover:text-elinsa-primary",
                        !subject
                          ? "bg-elinsa-light text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
                          : "text-muted-foreground",
                      )}
                      href={config.href}
                    >
                      <span>Todos</span>
                    </Link>

                    {subjectCounts.map((item) => (
                      <Link
                        className={cn(
                          "flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted hover:text-elinsa-primary",
                          item.value === subject
                            ? "bg-elinsa-light text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
                            : "text-muted-foreground",
                        )}
                        href={`${config.href}?assunto=${item.value}`}
                        key={item.value}
                      >
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </nav>
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
    <div className="min-h-screen bg-background pt-24 text-foreground">
      {isDraftMode && (
        <div className="border-y border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
          Pré-visualização ativa
        </div>
      )}

      <section className="mx-auto max-w-6xl px-6 py-6 md:px-8 md:py-8">
        <div className="mb-8 max-w-4xl">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-elinsa-primary"
            href={config.href}
          >
            <ArrowLeft className="size-4" />
            Voltar para {config.navLabel}
          </Link>

          <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal text-elinsa-dark md:text-4xl dark:text-elinsa-sky">
            {post.title}
          </h1>

          {post.summary && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
              {post.summary}
            </p>
          )}

          <p
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground",
              post.summary ? "mt-3" : "mt-5",
            )}
          >
            <Clock3 className="size-4 text-elinsa-primary" />
            {readingMinutes} min de leitura
          </p>

          <div className="mt-5 space-y-2 border-y border-border py-4 text-sm text-muted-foreground">
            <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-elinsa-primary" />
                Publicado em{" "}
                <time className="font-semibold text-foreground">
                  {publishedDate}
                </time>
              </span>

              {updatedDate && (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="size-4 text-elinsa-primary" />
                  Atualizado em{" "}
                  <time className="font-semibold text-foreground">
                    {updatedDate}
                  </time>
                </span>
              )}
            </p>

            <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="inline-flex items-center gap-2">
                <FileText className="size-4 text-elinsa-primary" />
                Assunto{" "}
                <span className="font-semibold text-foreground">
                  {getEditorialSubjectLabel(getPostSubjectValue(post))}
                </span>
              </span>

              <span className="inline-flex items-center gap-2">
                <UserRound className="size-4 text-elinsa-primary" />
                Por{" "}
                <span className="font-semibold text-foreground">
                  {getAuthorName(post.author)}
                </span>
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="min-w-0 pb-12 lg:pr-8">
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

function PostCard({
  config,
  featured = false,
  post,
}: {
  config: EditorialConfig;
  featured?: boolean;
  post: EditorialPost;
}) {
  const publishedDate = formatEditorialShortDate(
    post.publishedAt ?? post.createdAt,
  );
  const href = post.slug ? `${config.href}/${post.slug}` : config.href;
  const coverImage = getEditorialCoverImage(post, featured ? "hero" : "card");
  const subjectLabel = getEditorialSubjectLabel(getPostSubjectValue(post));
  const readingMinutes = getReadingMinutes(post.content);

  return (
    <Link
      className={cn("block min-w-0", featured && "md:col-span-2")}
      href={href}
    >
      <BentoGridItem
        className={cn(
          "group h-full overflow-hidden rounded-md border-border/80 bg-card p-0 shadow-sm hover:-translate-y-0.5 hover:border-elinsa-primary/55 hover:shadow-lg",
          featured && "border-elinsa-primary/25",
        )}
        description={
          <div className="space-y-4 px-5 pb-5">
            {post.summary && (
              <p
                className={cn(
                  "line-clamp-2 text-sm leading-6 text-muted-foreground",
                  featured && "md:max-w-2xl",
                )}
              >
                {post.summary}
              </p>
            )}

            <span className="inline-flex items-center gap-2 text-sm font-semibold text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky">
              Ler notícia
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        }
        header={
          <div
            className={cn(
              "relative min-h-40 overflow-hidden bg-elinsa-light/55",
              featured ? "md:min-h-48" : "md:min-h-44",
            )}
          >
            {coverImage ? (
              <Image
                alt={coverImage.alt}
                className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                fill
                sizes={
                  featured
                    ? "(min-width: 1280px) 42rem, (min-width: 768px) 66vw, 100vw"
                    : "(min-width: 1280px) 21rem, (min-width: 768px) 50vw, 100vw"
                }
                src={coverImage.url}
              />
            ) : (
              <FallbackCover config={config} subjectLabel={subjectLabel} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-elinsa-dark/55 via-elinsa-dark/10 to-transparent" />
            <Badge className="absolute left-4 top-4 rounded-md bg-background/90 px-2.5 py-1 text-elinsa-dark shadow-sm backdrop-blur-md">
              {subjectLabel}
            </Badge>
          </div>
        }
        title={
          <div className="space-y-3 px-5 pt-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-elinsa-primary" />
                {publishedDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5 text-elinsa-primary" />
                {readingMinutes} min
              </span>
            </div>
            <h2
              className={cn(
                "line-clamp-2 font-black leading-tight tracking-normal text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky",
                featured ? "text-2xl md:text-3xl" : "text-xl",
              )}
            >
              {post.title}
            </h2>
          </div>
        }
      />
    </Link>
  );
}

function FallbackCover({
  config,
  subjectLabel,
}: {
  config: EditorialConfig;
  subjectLabel: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-[linear-gradient(135deg,rgba(35,166,224,0.18),rgba(5,81,103,0.1)_46%,rgba(255,255,255,0.75))] p-5 dark:bg-[linear-gradient(135deg,rgba(35,166,224,0.2),rgba(5,81,103,0.34)_46%,rgba(8,14,18,0.82))]">
      <div className="flex size-11 items-center justify-center rounded-md border border-white/55 bg-white/70 text-elinsa-dark shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:text-elinsa-sky">
        <ImageIcon className="size-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-elinsa-primary">
          {config.navLabel}
        </p>
        <p className="mt-1 text-sm font-semibold text-elinsa-dark/80 dark:text-elinsa-sky/80">
          {subjectLabel}
        </p>
      </div>
    </div>
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
    <aside className="hidden border-l border-border pl-6 lg:sticky lg:top-40 lg:block lg:self-start">
      <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto pb-6">
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
