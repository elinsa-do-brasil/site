import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckListIcon,
  Clock03Icon,
  InboxIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/ui/page-transition";
import { auth } from "@/lib/auth";
import { requireCommitteeAccess, requireUserId } from "@/lib/comite/access";
import {
  getReportCountsByStatus,
  listReportSummaries,
  REPORT_SUMMARY_STATUS_FILTERS,
  type ReportSummaryStatusFilter,
} from "@/lib/reports/repository";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const REPORTS_PER_PAGE = 20;
const STATUS_FILTER_LABELS: Record<ReportSummaryStatusFilter, string> = {
  new: "novas",
  in_progress: "em andamento",
  finished: "finalizadas",
};

type ComitePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComitePage({ searchParams }: ComitePageProps) {
  const params = await searchParams;
  const search = normalizeSearchParam(getSingleParam(params.q));
  const statusFilter = normalizeStatusFilter(getSingleParam(params.status));
  const page = parsePage(getSingleParam(params.page));
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = requireUserId(session?.user.id);
  await requireCommitteeAccess(userId);
  const [counts, reportPage] = await Promise.all([
    getReportCountsByStatus(),
    listReportSummaries({
      page,
      pageSize: REPORTS_PER_PAGE,
      protocolSearch: search,
      statusFilter,
    }),
  ]);
  const reports = reportPage.items;
  const inProgressCount =
    (counts.opened ?? 0) +
    (counts.triage ?? 0) +
    (counts.review ?? 0) +
    (counts.in_review ?? 0) +
    (counts.investigation ?? 0) +
    (counts.waiting_information ?? 0);
  const finishedCount =
    (counts.completed ?? 0) + (counts.closed ?? 0) + (counts.archived ?? 0);

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <PageHeader
          description="Central de triagem, análise e acompanhamento das denúncias recebidas."
          eyebrow="Governança & ética"
          navigation={
            <PageHeaderNavigation label="Navegação do comitê">
              <Button className="shrink-0" size="sm" variant="outline" asChild>
                <Link href="/portal" transitionTypes={["nav-back"]}>
                  Voltar ao portal
                </Link>
              </Button>
            </PageHeaderNavigation>
          }
          title="Comitê de Ética"
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <main className="min-w-0">
            <form
              action="/portal/comite-de-etica"
              className="mb-4 grid gap-2 rounded-md border bg-card p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              {statusFilter && (
                <input name="status" type="hidden" value={statusFilter} />
              )}
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-4 text-muted-foreground"
                  strokeWidth={2}
                />
                <Input
                  className="h-9 pl-8 text-sm"
                  defaultValue={search}
                  name="q"
                  placeholder="Buscar por protocolo"
                />
              </div>
              <div className="flex gap-2">
                <Button className="h-9" type="submit">
                  Buscar
                </Button>
                {search && (
                  <Button className="h-9" variant="outline" asChild>
                    <Link href={buildCommitteeHref({ statusFilter })}>
                      Limpar
                    </Link>
                  </Button>
                )}
              </div>
            </form>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                {reportPage.total} denúncia(s) encontrada(s) · página{" "}
                {reportPage.page} de {reportPage.totalPages}
                {statusFilter
                  ? ` · filtro: ${STATUS_FILTER_LABELS[statusFilter]}`
                  : ""}
              </span>
              <Pagination
                page={reportPage.page}
                search={search}
                statusFilter={statusFilter}
                totalPages={reportPage.totalPages}
              />
            </div>

            <section
              aria-label="Denúncias recebidas"
              className="overflow-hidden rounded-md border bg-card shadow-sm"
            >
              {reports.length > 0 ? (
                <div className="divide-y">
                  {reports.map((report) => (
                    <Link
                      aria-label={`Ver denúncia ${report.protocol}`}
                      key={report.id}
                      href={`/portal/comite-de-etica/${report.id}`}
                      transitionTypes={["nav-forward"]}
                      className="group grid gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-center"
                    >
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <ReportStatusBadge status={report.status} />
                        </div>
                        <p className="font-mono text-base font-semibold tracking-tight group-hover:text-elinsa-primary">
                          {report.protocol}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {report.category}
                        </p>
                      </div>
                      <dl className="flex flex-col gap-2 text-xs text-muted-foreground sm:grid sm:grid-cols-2 lg:flex">
                        <ReportDate label="Recebida" value={report.createdAt} />
                        <ReportDate
                          label="Atualizada"
                          value={report.updatedAt}
                        />
                      </dl>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-10 text-center">
                  <HugeiconsIcon
                    icon={InboxIcon}
                    className="mx-auto mb-3 size-8 text-muted-foreground/70"
                    strokeWidth={2}
                  />
                  <p className="text-sm text-muted-foreground">
                    {search || statusFilter
                      ? "Nenhuma denúncia encontrada com esses filtros."
                      : "Nenhuma denúncia recebida ainda."}
                  </p>
                </div>
              )}
            </section>

            <div className="mt-4 flex justify-end">
              <Pagination
                page={reportPage.page}
                search={search}
                statusFilter={statusFilter}
                totalPages={reportPage.totalPages}
              />
            </div>
          </main>

          <aside className="grid gap-3 lg:sticky lg:top-24">
            <MetricCard
              active={statusFilter === "new"}
              href={buildCommitteeHref({
                search,
                statusFilter: statusFilter === "new" ? undefined : "new",
              })}
              icon={<HugeiconsIcon icon={InboxIcon} strokeWidth={2} />}
              label="Novas"
              value={counts.new ?? 0}
            />
            <MetricCard
              active={statusFilter === "in_progress"}
              href={buildCommitteeHref({
                search,
                statusFilter:
                  statusFilter === "in_progress" ? undefined : "in_progress",
              })}
              icon={<HugeiconsIcon icon={Clock03Icon} strokeWidth={2} />}
              label="Em andamento"
              value={inProgressCount}
            />
            <MetricCard
              active={statusFilter === "finished"}
              href={buildCommitteeHref({
                search,
                statusFilter:
                  statusFilter === "finished" ? undefined : "finished",
              })}
              icon={<HugeiconsIcon icon={CheckListIcon} strokeWidth={2} />}
              label="Finalizadas"
              value={finishedCount}
            />
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}

function MetricCard({
  active,
  href,
  icon,
  label,
  value,
}: {
  active: boolean;
  href: string;
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={
        active ? `Remover filtro: ${label}` : `Filtrar denúncias: ${label}`
      }
      className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      href={href}
    >
      <Card
        className={cn(
          "rounded-md border-border/80 py-0 shadow-sm transition-colors hover:bg-muted/35 hover:ring-elinsa-primary/30",
          active && "bg-elinsa-primary/5 ring-elinsa-primary/40",
        )}
      >
        <CardContent className="flex items-center justify-between gap-3 py-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="text-elinsa-primary">{icon}</span>
            {label}
          </span>
          <span className="text-2xl font-semibold leading-none">{value}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

function ReportDate({ label, value }: { label: string; value: Date }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">
        {formatDate(value)}
      </dd>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function Pagination({
  page,
  search,
  statusFilter,
  totalPages,
}: {
  page: number;
  search: string;
  statusFilter: ReportSummaryStatusFilter | undefined;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        aria-disabled={page <= 1}
        className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
        size="sm"
        variant="outline"
        asChild
      >
        <Link
          href={buildCommitteeHref({
            page: page - 1,
            search,
            statusFilter,
          })}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            data-icon="inline-start"
            strokeWidth={2}
          />
          Anterior
        </Link>
      </Button>
      <Button
        aria-disabled={page >= totalPages}
        className={
          page >= totalPages ? "pointer-events-none opacity-50" : undefined
        }
        size="sm"
        variant="outline"
        asChild
      >
        <Link
          href={buildCommitteeHref({
            page: page + 1,
            search,
            statusFilter,
          })}
        >
          Próxima
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            data-icon="inline-end"
            strokeWidth={2}
          />
        </Link>
      </Button>
    </div>
  );
}

function buildCommitteeHref({
  page,
  search,
  statusFilter,
}: {
  page?: number;
  search?: string;
  statusFilter?: ReportSummaryStatusFilter;
}) {
  const params = new URLSearchParams();

  if (search) {
    params.set("q", search);
  }

  if (statusFilter) {
    params.set("status", statusFilter);
  }

  if (typeof page === "number" && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/portal/comite-de-etica?${query}` : "/portal/comite-de-etica";
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeSearchParam(value: string) {
  return value.trim().slice(0, 200);
}

function normalizeStatusFilter(
  value: string,
): ReportSummaryStatusFilter | undefined {
  return REPORT_SUMMARY_STATUS_FILTERS.includes(
    value as ReportSummaryStatusFilter,
  )
    ? (value as ReportSummaryStatusFilter)
    : undefined;
}

function parsePage(value: string) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}
