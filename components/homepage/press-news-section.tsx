import { Activity, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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
import Lampada from "@/public/images/lampada.webp";

type PressNewsSectionProps = {
  posts: EditorialPost[];
};

export function PressNewsSection({ posts }: PressNewsSectionProps) {
  return (
    <section className="w-full bg-background px-6 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-end">
          <div>
            <Badge text="Notícias" icon={Activity} />
            <h2 className="text-3xl font-extrabold tracking-normal md:text-4xl">
              Últimas atualizações
            </h2>
          </div>
          <p className="border-l-3 border-elinsa-primary pl-6 text-lg text-muted-foreground md:pl-12">
            Acompanhe comunicados, novidades e atualizações sobre operações,
            equipes e iniciativas da Elinsa do Brasil.
          </p>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PressNewsCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-6xl">
          <ShadcnCard className="rounded-md border-dashed bg-muted/35">
            <CardContent className="py-12">
              <h3 className="text-2xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
                Nenhuma notícia publicada
              </h3>
              <p className="mt-3 max-w-xl text-muted-foreground">
                As próximas notícias públicas aparecerão aqui automaticamente.
              </p>
            </CardContent>
          </ShadcnCard>
        </div>
      )}

      <div className="mx-auto mt-10 max-w-6xl text-center">
        <Button variant="ghost" size="lg" asChild>
          <Link href="/imprensa">
            Ver todas as notícias
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function PressNewsCard({ post }: { post: EditorialPost }) {
  const href = post.slug ? `/imprensa/${post.slug}` : "/imprensa";
  const coverImage = getEditorialCoverImage(post, "card");
  const publishedDate = formatEditorialDate(post.publishedAt ?? post.createdAt);
  const readingMinutes = getReadingMinutes(post.content);
  const subjectLabel = getEditorialSubjectLabel(getPostSubjectValue(post));

  return (
    <Link className="group block h-full" href={href}>
      <ShadcnCard className="h-full overflow-hidden rounded-md border-border/70 py-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-elinsa-primary/35 hover:shadow-xl hover:shadow-elinsa-primary/10">
        <div className="relative aspect-16/10 overflow-hidden bg-elinsa-dark">
          <Image
            src={coverImage?.url ?? Lampada}
            alt={coverImage?.alt ?? post.title}
            fill
            className="object-cover object-center transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 22rem, (min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,14,22,0.08)_0%,rgba(4,14,22,0.78)_100%)]" />
          <ShadcnBadge className="absolute left-4 top-4 bg-white/92 text-elinsa-dark shadow-sm backdrop-blur hover:bg-white">
            {subjectLabel}
          </ShadcnBadge>
        </div>

        <CardHeader className="gap-3 p-5 pb-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
            {publishedDate && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-elinsa-primary" />
                {publishedDate}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-elinsa-primary" />
              {readingMinutes} min de leitura
            </span>
          </div>
          <CardTitle className="line-clamp-2 text-2xl font-black leading-tight tracking-normal text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-base leading-7">
            {post.summary ??
              "Leia a notícia pública completa da Elinsa do Brasil."}
          </CardDescription>
        </CardHeader>

        <CardFooter className="pb-5 pt-0">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky">
            Ler notícia
            <ArrowRight
              className="transition-transform group-hover:translate-x-1"
              size={16}
            />
          </span>
        </CardFooter>
      </ShadcnCard>
    </Link>
  );
}
