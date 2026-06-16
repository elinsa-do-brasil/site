import { Activity, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardTitle,
  Card as ShadcnCard,
} from "@/components/ui/card";
import {
  type EditorialPost,
  formatEditorialDate,
  getEditorialCoverImage,
  getPostSubjectValue,
  getReadingMinutes,
} from "@/lib/editorial";
import { getEditorialSubjectLabel } from "@/lib/editorial-subjects";
import { cn } from "@/lib/utils";
import Lampada from "@/public/images/lampada.webp";
import { HomeSection } from "./home-section";

type PressNewsSectionProps = {
  posts: EditorialPost[];
};

export function PressNewsSection({ posts }: PressNewsSectionProps) {
  const [featuredPost, ...secondaryPosts] = posts;

  return (
    <HomeSection headingId="imprensa-heading" tone="default">
      <header className="mb-10 max-w-3xl">
        <Badge text="Notícias" icon={Activity} />
        <h2
          id="imprensa-heading"
          className="text-3xl font-black leading-tight tracking-normal md:text-4xl"
        >
          Histórias que mostram a Elinsa em movimento.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          Acompanhe novidades, comunicados e iniciativas que dão contexto ao
          trabalho em campo e às decisões que sustentam a operação.
        </p>
        <Button variant="outline" size="xl" className="mt-6 bg-card" asChild>
          <Link href="/imprensa">
            Ver imprensa
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
      </header>

      {featuredPost ? (
        <div
          className={cn(
            "mx-auto grid max-w-6xl gap-5",
            secondaryPosts.length > 0 &&
              "lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)]",
          )}
        >
          <FeaturedPressNewsCard post={featuredPost} />

          {secondaryPosts.length > 0 ? (
            <div className="grid gap-5">
              {secondaryPosts.map((post) => (
                <CompactPressNewsCard key={post.id} post={post} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyPressNewsCard />
      )}
    </HomeSection>
  );
}

/** Keeps the news section useful even before public posts are available. */
function EmptyPressNewsCard() {
  return (
    <ShadcnCard className="rounded-xl border-dashed bg-muted/35 py-0">
      <CardContent className="py-14 text-center">
        <h3 className="text-2xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
          Nenhuma notícia publicada
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          As próximas notícias públicas aparecerão aqui automaticamente.
        </p>
      </CardContent>
    </ShadcnCard>
  );
}

function FeaturedPressNewsCard({ post }: { post: EditorialPost }) {
  const card = getPressNewsCardData(post);

  return (
    <Link className="group block h-full" href={card.href}>
      <ShadcnCard className="relative h-full min-h-[32rem] overflow-hidden rounded-3xl border-border/70 bg-elinsa-dark py-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-elinsa-primary/35 hover:shadow-xl hover:shadow-elinsa-primary/10">
        <Image
          src={card.coverImage?.url ?? Lampada}
          alt={card.coverImage?.alt ?? post.title}
          fill
          className="object-cover object-center transition duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 43rem, 100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,14,22,0.08)_0%,rgba(4,14,22,0.48)_42%,rgba(4,14,22,0.92)_100%)]" />

        <CardContent className="relative z-10 flex h-full min-h-[32rem] flex-col justify-end p-5 md:p-7">
          <SubjectBadge label={card.subjectLabel} variant="light" />
          <NewsMeta
            publishedDate={card.publishedDate}
            readingMinutes={card.readingMinutes}
            variant="light"
            className="mt-5"
          />

          <CardTitle className="mt-4 line-clamp-3 max-w-2xl text-3xl font-black leading-tight tracking-normal text-white transition-colors group-hover:text-elinsa-sky md:text-4xl">
            {post.title}
          </CardTitle>
          <CardDescription className="mt-3 line-clamp-3 max-w-xl text-base leading-7 text-white/78">
            {post.summary ??
              "Leia a notícia pública completa da Elinsa do Brasil."}
          </CardDescription>

          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur transition-colors group-hover:border-elinsa-sky/50 group-hover:text-elinsa-sky">
            Ler notícia
            <ArrowRight
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
              size={16}
            />
          </span>
        </CardContent>
      </ShadcnCard>
    </Link>
  );
}

function CompactPressNewsCard({ post }: { post: EditorialPost }) {
  const card = getPressNewsCardData(post);

  return (
    <Link className="group block h-full" href={card.href}>
      <ShadcnCard className="grid h-full overflow-hidden rounded-3xl border-border/70 bg-card py-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-elinsa-primary/35 hover:shadow-xl hover:shadow-elinsa-primary/10 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[12.5rem_minmax(0,1fr)]">
        <div className="relative min-h-48 overflow-hidden bg-elinsa-dark md:min-h-full lg:min-h-44 xl:min-h-full">
          <Image
            src={card.coverImage?.url ?? Lampada}
            alt={card.coverImage?.alt ?? post.title}
            fill
            className="object-cover object-center transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 13rem, (min-width: 1024px) 35vw, (min-width: 768px) 13rem, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,14,22,0.06)_0%,rgba(4,14,22,0.64)_100%)]" />
        </div>

        <CardContent className="flex min-h-full flex-col p-5">
          <SubjectBadge label={card.subjectLabel} />
          <NewsMeta
            publishedDate={card.publishedDate}
            readingMinutes={card.readingMinutes}
            className="mt-4"
          />

          <CardTitle className="mt-3 line-clamp-2 text-2xl font-black leading-tight tracking-normal text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky">
            {post.title}
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-2 text-base leading-7">
            {post.summary ??
              "Leia a notícia pública completa da Elinsa do Brasil."}
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
      </ShadcnCard>
    </Link>
  );
}

function SubjectBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "light";
}) {
  return (
    <ShadcnBadge
      className={cn(
        "w-fit rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur",
        variant === "light"
          ? "bg-white/90 text-elinsa-dark hover:bg-white"
          : "bg-elinsa-light/80 text-elinsa-dark hover:bg-elinsa-light dark:bg-elinsa-primary/15 dark:text-elinsa-sky",
      )}
    >
      {label}
    </ShadcnBadge>
  );
}

function NewsMeta({
  publishedDate,
  readingMinutes,
  variant = "default",
  className,
}: {
  publishedDate: string | null;
  readingMinutes: number;
  variant?: "default" | "light";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold",
        variant === "light" ? "text-white/72" : "text-muted-foreground",
        className,
      )}
    >
      {publishedDate ? (
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
      ) : null}
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

function getPressNewsCardData(post: EditorialPost) {
  return {
    coverImage: getEditorialCoverImage(post, "card"),
    href: post.slug ? `/imprensa/${post.slug}` : "/imprensa",
    publishedDate: formatEditorialDate(post.publishedAt ?? post.createdAt),
    readingMinutes: getReadingMinutes(post.content),
    subjectLabel: getEditorialSubjectLabel(getPostSubjectValue(post)),
  };
}
