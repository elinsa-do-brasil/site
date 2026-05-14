import {
  ArrowRight,
  BookOpen,
  FileText,
  LayoutGrid,
  Link2,
  Newspaper,
  QrCode,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { canListReports } from "@/lib/comite/access";
import {
  type EditorialPost,
  formatEditorialShortDate,
  getEditorialCoverImage,
  getEditorialPosts,
  getReadingMinutes,
} from "@/lib/editorial";
import {
  getAvailableInternalTools,
  type InternalTool,
  requireInternalAccess,
} from "@/lib/organization/access";
import { getReportCountsByStatus } from "@/lib/reports/repository";

export const dynamic = "force-dynamic";

export default async function InternoDashboardPage() {
  const context = await requireInternalAccess();
  const [availableTools, latestBlogPosts, canSeeReports] = await Promise.all([
    getAvailableInternalTools(context),
    getLatestBlogPosts(),
    canListReports(context.userId),
  ]);
  const reportCounts = canSeeReports ? await getReportCountsByStatus() : null;
  const adminLinks = getAdminLinks(context);

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Portal interno</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Ferramentas internas
              </h2>
              <p className="text-xs text-muted-foreground">
                Atalhos disponíveis para suas equipes e funções.
              </p>
            </div>
            <Badge variant="outline">{availableTools.length} ativa(s)</Badge>
          </div>

          {availableTools.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {availableTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <Card className="rounded-md border-dashed bg-card/70 py-10">
              <CardContent className="text-center text-muted-foreground">
                <LayoutGrid className="mx-auto mb-3 size-8 text-muted-foreground/70" />
                <p className="text-sm">
                  Nenhuma ferramenta interna foi disponibilizada para o seu
                  perfil.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <PortalSidebar
          adminLinks={adminLinks}
          canSeeReports={canSeeReports}
          latestBlogPosts={latestBlogPosts}
          reportCounts={reportCounts}
        />
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: InternalTool }) {
  return (
    <Card className="min-h-40 rounded-md border-border/80 py-0 shadow-sm transition hover:border-elinsa-primary/40 hover:shadow-md">
      <CardHeader className="gap-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-elinsa-primary/10 text-elinsa-primary">
            <ToolIcon tool={tool} />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">{tool.label}</CardTitle>
            <CardDescription className="mt-1 line-clamp-3">
              {tool.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between gap-3 border-t py-3">
        <span className="truncate text-xs text-muted-foreground">
          {tool.teamName ? `Equipe ${tool.teamName}` : "Portal interno"}
        </span>
        <Button size="sm" asChild>
          <Link href={tool.href}>
            Abrir
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PortalSidebar({
  adminLinks,
  canSeeReports,
  latestBlogPosts,
  reportCounts,
}: {
  adminLinks: AdminLink[];
  canSeeReports: boolean;
  latestBlogPosts: EditorialPost[];
  reportCounts: Record<string, number> | null;
}) {
  return (
    <aside className="rounded-md border bg-card p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
      {adminLinks.length > 0 && (
        <SidebarSection
          icon={<ShieldCheck className="size-4" />}
          title="Administração"
        >
          <div className="grid gap-2">
            {adminLinks.map((item) => (
              <Button
                asChild
                className="h-auto justify-between px-3 py-2.5"
                key={item.href}
                variant="secondary"
              >
                <Link href={item.href}>
                  <span className="inline-flex min-w-0 items-center gap-2">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            ))}
          </div>
        </SidebarSection>
      )}

      {canSeeReports && (
        <>
          {adminLinks.length > 0 && <Separator className="my-4" />}
          <SidebarSection
            icon={<FileText className="size-4" />}
            title="Comitê de Ética"
          >
            <div className="grid grid-cols-3 gap-2">
              <ReportMetric label="novas" value={reportCounts?.new ?? 0} />
              <ReportMetric
                label="em análise"
                value={reportCounts?.in_review ?? 0}
              />
              <ReportMetric
                label="encerradas"
                value={reportCounts?.closed ?? 0}
              />
            </div>
            <Button asChild className="mt-3 w-full justify-between" size="sm">
              <Link href="/portal/comite-de-etica/denuncias">
                Ver denúncias
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </SidebarSection>
        </>
      )}

      {(adminLinks.length > 0 || canSeeReports) && (
        <Separator className="my-4" />
      )}
      <SidebarSection
        icon={<Newspaper className="size-4" />}
        title="Últimas do blog"
      >
        <div className="grid gap-3">
          {latestBlogPosts.map((post) => (
            <BlogPostLink key={post.id} post={post} />
          ))}
          {latestBlogPosts.length === 0 && (
            <p className="rounded-md border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
              Nenhuma notícia interna publicada.
            </p>
          )}
        </div>
        <Button
          asChild
          className="mt-3 w-full justify-between"
          size="sm"
          variant="outline"
        >
          <Link href="/portal/blog">
            Ver blog
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </SidebarSection>
    </aside>
  );
}

function SidebarSection({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span className="text-elinsa-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ReportMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/35 px-2 py-3 text-center">
      <p className="text-xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-[0.68rem] leading-tight text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function BlogPostLink({ post }: { post: EditorialPost }) {
  const href = post.slug ? `/portal/blog/${post.slug}` : "/portal/blog";
  const coverImage = getEditorialCoverImage(post, "thumbnail");
  const readingMinutes = getReadingMinutes(post.content);

  return (
    <Link
      className="group grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 rounded-md border bg-background/70 p-2 transition hover:border-elinsa-primary/45 hover:bg-background"
      href={href}
    >
      <div className="relative min-h-20 overflow-hidden rounded-md bg-muted">
        {coverImage ? (
          <Image
            alt={coverImage.alt}
            className="object-cover transition duration-300 group-hover:scale-105"
            fill
            sizes="72px"
            src={coverImage.url}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <BookOpen className="size-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 py-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-elinsa-primary">
          {post.title}
        </h3>
        {post.summary && (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
            {post.summary}
          </p>
        )}
        <p className="mt-2 text-[0.68rem] text-muted-foreground">
          {formatEditorialShortDate(post.publishedAt ?? post.createdAt)} ·{" "}
          {readingMinutes} min
        </p>
      </div>
    </Link>
  );
}

function ToolIcon({ tool }: { tool: InternalTool }) {
  const text = `${tool.id} ${tool.label}`.toLowerCase();

  if (text.includes("qr")) return <QrCode className="size-5" />;
  if (text.includes("link")) return <Link2 className="size-5" />;
  if (text.includes("comit")) return <ShieldCheck className="size-5" />;
  if (text.includes("ti")) return <Wrench className="size-5" />;

  return <LayoutGrid className="size-5" />;
}

type AdminLink = {
  href: string;
  icon: ReactNode;
  label: string;
};

function getAdminLinks(context: {
  isOrgAdmin: boolean;
  isTeamLeader: boolean;
}): AdminLink[] {
  const links: AdminLink[] = [];

  if (context.isOrgAdmin) {
    links.push({
      href: "/portal/gestao/organizacao",
      icon: <ShieldCheck className="size-3.5" />,
      label: "Da organização",
    });
  }

  if (context.isOrgAdmin || context.isTeamLeader) {
    links.push(
      {
        href: "/portal/gestao/equipes",
        icon: <UsersRound className="size-3.5" />,
        label: "Das equipes",
      },
      {
        href: "/portal/gestao/ferramentas",
        icon: <Wrench className="size-3.5" />,
        label: "Ferramentas",
      },
    );
  }

  return links;
}

async function getLatestBlogPosts() {
  const posts = await getEditorialPosts("blog");
  return posts.slice(0, 3);
}
