import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  RefreshCw,
  TextAlignStart,
  UserRound,
} from "lucide-react";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialRichText } from "@/components/editorial/editorial-rich-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  type EditorialCollectionSlug,
  type EditorialConfig,
  type EditorialPost,
  editorialConfigs,
  formatEditorialDate,
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

type SubjectCount = ReturnType<typeof getSubjectCounts>[number];

export async function EditorialIndex({
  collection,
  subject,
}: {
  collection: EditorialCollectionSlug;
  subject?: EditorialSubjectValue | null;
}) {
  const config = editorialConfigs[collection];
  const isPortalCollection = collection === "blog";
  const allPosts = await getEditorialPosts(collection);
  const posts = subject
    ? allPosts.filter((post) => getPostSubjectValue(post) === subject)
    : allPosts;
  const subjectCounts = getSubjectCounts(allPosts);

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        !isPortalCollection && "pt-24",
      )}
    >
      <section className={cn("mx-auto max-w-6xl", !isPortalCollection)}>
        <EditorialIndexHeader
          config={config}
          subject={subject}
          subjectCounts={subjectCounts}
        />

        {allPosts.length === 0 ? (
          <EmptyState config={config} />
        ) : (
          <div className="min-w-0">
            {posts.length === 0 ? (
              <EmptyState config={config} />
            ) : (
              <EditorialPostShowcase config={config} posts={posts} />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function EditorialIndexHeader({
  config,
  subject,
  subjectCounts,
}: {
  config: EditorialConfig;
  subject?: EditorialSubjectValue | null;
  subjectCounts: SubjectCount[];
}) {
  return (
    <header className="mb-5 border-b border-border pb-4 md:mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 lg:max-w-md">
          <h1 className="max-w-2xl text-2xl font-black leading-tight tracking-normal text-elinsa-dark md:text-3xl dark:text-elinsa-sky">
            {config.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            {config.description}
          </p>
        </div>

        <SubjectFilterNav
          config={config}
          subject={subject}
          subjectCounts={subjectCounts}
        />
      </div>
    </header>
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
  const isPortalCollection = collection === "blog";
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
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        !isPortalCollection && "pt-24",
      )}
    >
      {isDraftMode && (
        <div className="border-y border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
          Pré-visualização ativa
        </div>
      )}

      <section
        className={cn(
          "mx-auto max-w-6xl px-6 md:px-8",
          !isPortalCollection && "py-6 md:py-8",
        )}
      >
        <Button
          asChild
          className="-ml-2 h-8 gap-2 px-2 text-sm font-semibold text-muted-foreground hover:text-elinsa-primary"
          variant="ghost"
        >
          <Link href={config.href}>
            <ArrowLeft className="size-4" />
            Voltar para {config.navLabel}
          </Link>
        </Button>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <div className="mb-8 max-w-4xl">
              <h1 className="text-3xl font-black leading-tight tracking-normal text-elinsa-dark md:text-4xl dark:text-elinsa-sky">
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

              <div className="mt-5 text-sm text-muted-foreground">
                <Separator />
                <div className="space-y-2 py-4">
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
                <Separator />
              </div>
            </div>

            <article className="min-w-0 pb-12 lg:pr-8">
              <MobileTopics headings={headings} />
              <EditorialRichText data={post.content} />

              <div className="mt-14 border-t border-border pt-6">
                <Button
                  asChild
                  className="gap-2 text-sm font-semibold hover:border-elinsa-primary hover:text-elinsa-primary"
                  variant="outline"
                >
                  <Link href={config.href}>
                    Ver todas
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </article>
          </div>

          <TopicsAside headings={headings} />
        </div>
      </section>
    </div>
  );
}

function EditorialPostShowcase({
  config,
  posts,
}: {
  config: EditorialConfig;
  posts: EditorialPost[];
}) {
  const [featuredPost, ...secondaryPosts] = posts;
  const primarySecondaryPosts = secondaryPosts.slice(0, 3);
  const additionalPosts = secondaryPosts.slice(3);

  if (!featuredPost) {
    return <EmptyState config={config} />;
  }

  const hasSecondaryPosts = primarySecondaryPosts.length > 0;

  return (
    <div className={cn("space-y-5", !hasSecondaryPosts && "max-w-5xl")}>
      <div
        className={cn(
          "grid gap-5",
          hasSecondaryPosts &&
            "xl:grid-cols-[minmax(0,1.12fr)_minmax(24rem,0.88fr)]",
        )}
      >
        <FeaturedPostCard config={config} post={featuredPost} />

        {hasSecondaryPosts ? (
          <div className="grid gap-5">
            {primarySecondaryPosts.map((post) => (
              <CompactPostCard config={config} key={post.id} post={post} />
            ))}
          </div>
        ) : null}
      </div>

      {additionalPosts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {additionalPosts.map((post) => (
            <CompactPostCard config={config} key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FeaturedPostCard({
  config,
  post,
}: {
  config: EditorialConfig;
  post: EditorialPost;
}) {
  const card = getPostCardData(config, post);

  return (
    <Link className="group block h-full min-w-0" href={card.href}>
      <Card className="relative h-full min-h-[30rem] overflow-hidden rounded-3xl border-border/70 bg-elinsa-dark py-0 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-elinsa-primary/40 hover:shadow-xl hover:shadow-elinsa-primary/10 md:min-h-[34rem]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#145061,#061a22_58%,#0c2b36)]" />
          {card.coverImage ? (
            <Image
              alt={card.coverImage.alt}
              blurDataURL={card.coverImage.blurDataUrl}
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
              fill
              placeholder={card.coverImage.blurDataUrl ? "blur" : "empty"}
              sizes="(min-width: 1280px) 48rem, (min-width: 1024px) 62vw, 100vw"
              src={card.coverImage.url}
            />
          ) : (
            <FallbackCover />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,14,22,0.08)_0%,rgba(4,14,22,0.44)_42%,rgba(4,14,22,0.94)_100%)]" />
        </div>

        <CardContent className="relative z-10 flex h-full min-h-[30rem] flex-col justify-end p-5 md:min-h-[34rem] md:p-7 lg:p-8">
          <Badge className="w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-elinsa-dark shadow-sm backdrop-blur-md hover:bg-white">
            {card.subjectLabel}
          </Badge>
          <PostMeta
            publishedDate={card.publishedDate}
            readingMinutes={card.readingMinutes}
            variant="light"
            className="mt-5"
          />

          <CardTitle className="mt-4 line-clamp-3 max-w-3xl text-3xl font-black leading-tight tracking-normal text-white transition-colors group-hover:text-elinsa-sky md:text-4xl lg:text-5xl">
            {post.title}
          </CardTitle>
          <CardDescription className="mt-4 line-clamp-3 max-w-3xl text-base leading-7 text-white/80 md:text-lg md:leading-8">
            {post.summary ?? "Leia a notícia completa da Elinsa do Brasil."}
          </CardDescription>

          <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur transition-colors group-hover:border-elinsa-sky/50 group-hover:text-elinsa-sky">
            Ler notícia
            <ArrowRight
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
              size={16}
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function CompactPostCard({
  config,
  post,
}: {
  config: EditorialConfig;
  post: EditorialPost;
}) {
  const card = getPostCardData(config, post);

  return (
    <Link className="group block h-full min-w-0" href={card.href}>
      <Card className="grid h-full overflow-hidden rounded-3xl border-border/70 bg-card py-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-elinsa-primary/35 hover:shadow-xl hover:shadow-elinsa-primary/10 sm:grid-cols-[12rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="relative min-h-48 overflow-hidden bg-elinsa-dark sm:min-h-full">
          {card.coverImage ? (
            <Image
              alt={card.coverImage.alt}
              blurDataURL={card.coverImage.blurDataUrl}
              className="absolute inset-0 size-full object-cover object-center transition duration-500 group-hover:scale-105"
              fill
              placeholder={card.coverImage.blurDataUrl ? "blur" : "empty"}
              sizes="(min-width: 1280px) 13rem, (min-width: 640px) 12rem, 100vw"
              src={card.coverImage.url}
            />
          ) : (
            <FallbackCover />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,14,22,0.06)_0%,rgba(4,14,22,0.64)_100%)]" />
        </div>

        <CardContent className="flex min-h-full flex-col p-5">
          <Badge className="w-fit rounded-full bg-elinsa-light/80 px-3 py-1 text-xs font-bold text-elinsa-dark shadow-sm backdrop-blur hover:bg-elinsa-light dark:bg-elinsa-primary/15 dark:text-elinsa-sky">
            {card.subjectLabel}
          </Badge>
          <PostMeta
            publishedDate={card.publishedDate}
            readingMinutes={card.readingMinutes}
            className="mt-4"
          />

          <CardTitle className="mt-3 line-clamp-2 text-2xl font-black leading-tight tracking-normal text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky">
            {post.title}
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-2 text-base leading-7 text-muted-foreground">
            {post.summary ?? "Leia a notícia completa da Elinsa do Brasil."}
          </CardDescription>

          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky">
            Ler notícia
            <ArrowRight
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
              size={16}
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function PostMeta({
  className,
  publishedDate,
  readingMinutes,
  variant = "default",
}: {
  className?: string;
  publishedDate: string;
  readingMinutes: number;
  variant?: "default" | "light";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold",
        variant === "light" ? "text-white/78" : "text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays
          aria-hidden="true"
          className={cn(
            "size-3.5",
            variant === "light" ? "text-elinsa-sky" : "text-elinsa-primary",
          )}
        />
        {publishedDate}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3
          aria-hidden="true"
          className={cn(
            "size-3.5",
            variant === "light" ? "text-elinsa-sky" : "text-elinsa-primary",
          )}
        />
        {readingMinutes} min de leitura
      </span>
    </div>
  );
}

function getPostCardData(config: EditorialConfig, post: EditorialPost) {
  return {
    coverImage: getEditorialCoverImage(post, "card"),
    href: post.slug ? `${config.href}/${post.slug}` : config.href,
    publishedDate: formatEditorialDate(post.publishedAt ?? post.createdAt),
    readingMinutes: getReadingMinutes(post.content),
    subjectLabel: getEditorialSubjectLabel(getPostSubjectValue(post)),
  };
}

function SubjectFilterNav({
  config,
  subject,
  subjectCounts,
}: {
  config: EditorialConfig;
  subject?: EditorialSubjectValue | null;
  subjectCounts: SubjectCount[];
}) {
  return (
    <nav
      aria-label="Filtrar por assunto"
      className="min-w-0 lg:ml-auto lg:shrink-0"
    >
      <p className="mb-1.5 text-[0.65rem] font-semibold uppercase leading-4 tracking-normal text-muted-foreground">
        Assuntos
      </p>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:grid md:w-fit md:grid-cols-[repeat(4,minmax(7.5rem,max-content))] md:gap-x-2 md:gap-y-1.5 md:overflow-visible">
        <Button
          asChild
          className={cn(
            "h-8 shrink-0 justify-center rounded-full px-2.5 text-xs font-semibold md:w-full",
            !subject
              ? "bg-elinsa-light text-elinsa-dark hover:bg-elinsa-light dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
              : "text-muted-foreground hover:bg-muted/60 hover:text-elinsa-primary",
          )}
          variant="ghost"
        >
          <Link href={config.href}>Todos</Link>
        </Button>

        {subjectCounts.map((item) => (
          <Button
            asChild
            className={cn(
              "h-8 shrink-0 justify-center rounded-full px-2.5 text-xs font-semibold md:w-full",
              item.value === subject
                ? "bg-elinsa-light text-elinsa-dark hover:bg-elinsa-light dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
                : "text-muted-foreground hover:bg-muted/60 hover:text-elinsa-primary",
            )}
            key={item.value}
            variant="ghost"
          >
            <Link href={`${config.href}?assunto=${item.value}`}>
              {item.label}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}

function FallbackCover() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#dff5fc_0%,#88c4d6_46%,#0c4b61_100%)] dark:bg-[linear-gradient(145deg,#103746_0%,#0b2631_48%,#031018_100%)]">
      <div className="relative text-white drop-shadow-[0_24px_42px_rgba(0,0,0,0.45)]">
        <LightningSvg />
      </div>
    </div>
  );
}

function LightningSvg() {
  return (
    <svg aria-hidden="true" className="size-28" fill="none" viewBox="0 0 96 96">
      <path
        d="M53.7 6 18 53.8h25.4L37.9 90 78 38.3H50.8L53.7 6Z"
        fill="currentColor"
        opacity="0.96"
      />
      <path
        d="M53.7 6 18 53.8h25.4L37.9 90 78 38.3H50.8L53.7 6Z"
        stroke="rgba(255,255,255,0.58)"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function EmptyState({ config }: { config: EditorialConfig }) {
  return (
    <Card className="min-h-80 justify-center rounded-md border-dashed bg-muted/35 py-14 text-center">
      <CardContent className="flex flex-col items-center px-6">
        <div className="mb-5 flex size-12 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky">
          <FileText className="size-6" />
        </div>
        <h2 className="text-2xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
          {config.emptyTitle}
        </h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          {config.emptyDescription}
        </p>
      </CardContent>
    </Card>
  );
}

function TopicsAside({ headings }: { headings: HeadingItem[] }) {
  return (
    <aside className="hidden border-l border-border pl-6 lg:sticky lg:top-28 lg:block lg:self-start">
      <div className="pb-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          <TextAlignStart size="14" /> Nesta página
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
    <Card className="mb-8 rounded-md bg-muted/35 py-4 lg:hidden">
      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          Tópicos
        </p>
        <TopicsNav headings={headings} />
      </CardContent>
    </Card>
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
        <Button
          asChild
          className={cn(
            "h-auto justify-start rounded-md px-3 py-2 text-left text-sm leading-5 text-muted-foreground hover:text-elinsa-primary",
            heading.level === 3 && "ml-3 text-xs",
            heading.level === 4 && "ml-6 text-xs",
          )}
          key={heading.id}
          variant="ghost"
        >
          <a href={`#${heading.id}`}>{heading.title}</a>
        </Button>
      ))}
    </nav>
  );
}
