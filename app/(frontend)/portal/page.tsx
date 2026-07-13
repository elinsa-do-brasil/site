import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  FileText,
  icons,
  LayoutGrid,
  Newspaper,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatAdminName } from "@/components/admin/GestaoPageHeader";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
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
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <PageHeader
          description="Ferramentas, atualizações e áreas de gestão disponíveis para a sua conta."
          eyebrow="Área de trabalho"
          meta={
            <Badge variant="outline">
              {availableTools.length} ferramentas ativas
            </Badge>
          }
          title="Portal interno"
        />

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
    </PageTransition>
  );
}

function ToolCard({ tool }: { tool: InternalTool }) {
  const isExternal = tool.href.startsWith("https://");
  const supportsPageTransition = isPageTransitionTarget(tool.href);
  const teamLabel = tool.teamName
    ? `Equipe ${formatAdminName(tool.teamName)}`
    : "Portal interno";

  return (
    <Link
      aria-label={`Abrir ${tool.label}`}
      className="group block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elinsa-primary/40"
      href={tool.href}
      rel={isExternal ? "noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
      transitionTypes={
        !isExternal && supportsPageTransition ? ["nav-forward"] : undefined
      }
    >
      <Card className="flex h-full min-h-44 overflow-hidden rounded-md border-border/80 bg-card/95 py-0 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-elinsa-primary/45 group-hover:shadow-md">
        <CardHeader className="flex-1 gap-4 px-4 pt-4 pb-5">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-elinsa-primary/15 bg-elinsa-primary/10 text-elinsa-primary transition group-hover:bg-elinsa-primary group-hover:text-primary-foreground">
              <ToolIcon tool={tool} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-tight">
                {tool.label}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-3 leading-relaxed">
                {tool.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-auto flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3">
          <span className="min-w-0 truncate text-xs font-medium text-muted-foreground">
            {teamLabel}
          </span>
          <span
            className={buttonVariants({
              className:
                "h-7 shrink-0 gap-1.5 px-2.5 text-xs transition group-hover:bg-elinsa-primary/90",
              size: "sm",
            })}
          >
            Abrir
            {isExternal ? (
              <ExternalLink className="size-3" />
            ) : (
              <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
            )}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function isPageTransitionTarget(href: string) {
  return [
    "/configuracoes",
    "/imprensa",
    "/portal/blog",
    "/portal/comite-de-etica",
    "/portal/contatos",
    "/portal/gestao/convites",
    "/portal/gestao/equipes",
    "/portal/gestao/ferramentas",
    "/portal/gestao/organizacao",
    "/portal/mercurio",
    "/vagas",
  ].some((path) => href === path || href.startsWith(`${path}/`));
}

function ToolIcon({ tool }: { tool: InternalTool }) {
  const Icon = icons[getToolIconName(tool)] ?? LayoutGrid;

  return <Icon aria-hidden="true" className="size-5" />;
}

function getToolIconName(tool: InternalTool): keyof typeof icons {
  if (tool.icon && tool.icon in icons) {
    return tool.icon as keyof typeof icons;
  }

  const text = `${tool.id} ${tool.label}`.toLowerCase();

  if (text.includes("qr")) return "QrCode";
  if (text.includes("link")) return "Link2";
  if (text.includes("assinatura") || text.includes("email")) {
    return "Mail";
  }
  if (text.includes("comit")) return "ShieldCheck";
  if (text.includes("contato")) return "Inbox";
  if (
    text.includes("blog") ||
    text.includes("payload") ||
    text.includes("cms")
  ) {
    return "PanelsTopLeft";
  }
  if (text.includes("ti")) return "Wrench";

  return "LayoutGrid";
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
  const inProgressReports =
    (reportCounts?.opened ?? 0) +
    (reportCounts?.triage ?? 0) +
    (reportCounts?.review ?? 0) +
    (reportCounts?.in_review ?? 0) +
    (reportCounts?.investigation ?? 0) +
    (reportCounts?.waiting_information ?? 0);
  const finishedReports =
    (reportCounts?.completed ?? 0) +
    (reportCounts?.closed ?? 0) +
    (reportCounts?.archived ?? 0);

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
                <Link href={item.href} transitionTypes={["nav-forward"]}>
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
              <ReportMetric label="em andamento" value={inProgressReports} />
              <ReportMetric label="finalizadas" value={finishedReports} />
            </div>
            <Button asChild className="mt-3 w-full justify-between" size="sm">
              <Link
                href="/portal/comite-de-etica"
                transitionTypes={["nav-forward"]}
              >
                Abrir comitê
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
          <Link href="/portal/blog" transitionTypes={["nav-forward"]}>
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
      transitionTypes={["nav-forward"]}
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
