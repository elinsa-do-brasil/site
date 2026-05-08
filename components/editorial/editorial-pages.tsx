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
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialRichText } from "@/components/editorial/editorial-rich-text";
import { Badge } from "@/components/ui/badge";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

type SubjectCount = ReturnType<typeof getSubjectCounts>[number];

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
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            <div className="mb-5 md:mb-6">
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-elinsa-dark md:text-5xl dark:text-elinsa-sky">
                {config.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                {config.description}
              </p>
            </div>

            {allPosts.length === 0 ? (
              <EmptyState config={config} />
            ) : (
              <div className="min-w-0">
                {posts.length === 0 ? (
                  <EmptyState config={config} />
                ) : (
                  <BentoGrid className="mx-0 max-w-none gap-4 md:auto-rows-[30rem] md:grid-cols-2">
                    {posts.map((post) => (
                      <PostCard config={config} key={post.id} post={post} />
                    ))}
                  </BentoGrid>
                )}
              </div>
            )}
          </div>

          <SubjectsAside
            config={config}
            subject={subject}
            subjectCounts={subjectCounts}
          />
        </div>
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

function PostCard({
  config,
  post,
}: {
  config: EditorialConfig;
  post: EditorialPost;
}) {
  const publishedDate = formatEditorialShortDate(
    post.publishedAt ?? post.createdAt,
  );
  const href = post.slug ? `${config.href}/${post.slug}` : config.href;
  const coverImage = getEditorialCoverImage(post, "card");
  const subjectLabel = getEditorialSubjectLabel(getPostSubjectValue(post));
  const readingMinutes = getReadingMinutes(post.content);

  return (
    <Link className="group block min-w-0" href={href}>
      <Card className="relative h-full min-h-[30rem] gap-0 overflow-hidden rounded-md border-border/80 bg-elinsa-dark py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:border-elinsa-primary/55 hover:shadow-lg">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#145061,#061a22_58%,#0c2b36)]" />
          {coverImage ? (
            <Image
              alt={coverImage.alt}
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
              fill
              sizes="(min-width: 1280px) 22rem, (min-width: 768px) 50vw, 100vw"
              src={coverImage.url}
            />
          ) : (
            <FallbackCover />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,81,103,0.06)_0%,rgba(4,18,25,0.18)_38%,rgba(4,18,25,0.9)_100%)]" />
        </div>

        <CardContent className="relative z-10 flex h-full flex-col justify-between p-5">
          <Badge className="w-fit rounded-md bg-white/90 px-2.5 py-1 text-elinsa-dark shadow-sm backdrop-blur-md">
            {subjectLabel}
          </Badge>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/78">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-elinsa-primary" />
                {publishedDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5 text-elinsa-primary" />
                {readingMinutes} min
              </span>
            </div>
            <h2 className="line-clamp-2 text-2xl font-black leading-tight tracking-normal text-white transition-colors group-hover:text-elinsa-sky">
              {post.title}
            </h2>
            {post.summary && (
              <p className="line-clamp-2 text-sm leading-6 text-white/76">
                {post.summary}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SubjectsAside({
  config,
  subject,
  subjectCounts,
}: {
  config: EditorialConfig;
  subject?: EditorialSubjectValue | null;
  subjectCounts: SubjectCount[];
}) {
  return (
    <aside className="border-border lg:sticky lg:top-28 lg:self-start lg:border-l lg:pl-6">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Assuntos
      </p>
      <nav className="mt-3 flex flex-wrap gap-2 lg:grid">
        <Button
          asChild
          className={cn(
            "h-auto justify-start rounded-md px-3 py-2 text-sm font-semibold lg:w-full",
            !subject
              ? "bg-elinsa-light text-elinsa-dark hover:bg-elinsa-light dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
              : "text-muted-foreground hover:text-elinsa-primary",
          )}
          variant="ghost"
        >
          <Link href={config.href}>Todos</Link>
        </Button>

        {subjectCounts.map((item) => (
          <Button
            asChild
            className={cn(
              "h-auto justify-start rounded-md px-3 py-2 text-sm font-semibold lg:w-full",
              item.value === subject
                ? "bg-elinsa-light text-elinsa-dark hover:bg-elinsa-light dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
                : "text-muted-foreground hover:text-elinsa-primary",
            )}
            key={item.value}
            variant="ghost"
          >
            <Link href={`${config.href}?assunto=${item.value}`}>
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </aside>
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
