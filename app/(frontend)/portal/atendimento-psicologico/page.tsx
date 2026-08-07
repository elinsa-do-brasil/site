import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckListIcon,
  Clock03Icon,
  InboxIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { PsychologicalCareExportButton } from "@/components/psychological-care/psychological-care-export-button";
import { PsychologicalCareStatusBadge } from "@/components/psychological-care/psychological-care-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/ui/page-transition";
import { requirePsychologicalCarePanelAccess } from "@/lib/psychological-care/access";
import { getSaoPauloYearMonth } from "@/lib/psychological-care/export";
import {
  getPsychologicalCareRequestCountsByStatus,
  listPsychologicalCareRequestSummaries,
} from "@/lib/psychological-care/repository";
import {
  PSYCHOLOGICAL_CARE_SUMMARY_STATUS_FILTERS,
  type PsychologicalCareSummaryStatusFilter,
} from "@/lib/psychological-care/status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const REQUESTS_PER_PAGE = 20;
const STATUS_FILTER_LABELS: Record<
  PsychologicalCareSummaryStatusFilter,
  string
> = {
  new: "novas",
  in_progress: "em andamento",
  finished: "encerradas",
};

type PsychologicalCarePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PsychologicalCarePage({
  searchParams,
}: PsychologicalCarePageProps) {
  await requirePsychologicalCarePanelAccess();

  const params = await searchParams;
  const search = normalizeSearchParam(getSingleParam(params.q));
  const statusFilter = normalizeStatusFilter(getSingleParam(params.status));
  const page = parsePage(getSingleParam(params.page));
  const [counts, requestPage] = await Promise.all([
    getPsychologicalCareRequestCountsByStatus(),
    listPsychologicalCareRequestSummaries({
      page,
      pageSize: REQUESTS_PER_PAGE,
      protocolSearch: search,
      statusFilter,
    }),
  ]);
  const inProgressCount =
    (counts.triage ?? 0) +
    (counts.contact_in_progress ?? 0) +
    (counts.scheduled ?? 0);
  const finishedCount = (counts.completed ?? 0) + (counts.cancelled ?? 0);
  const { year: defaultExportYear, month: defaultExportMonth } =
    getSaoPauloYearMonth(new Date());

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <PageHeader
          description="Central restrita para análise e acompanhamento das solicitações de atendimento psicológico."
          eyebrow="Saúde & acolhimento"
          navigation={
            <PageHeaderNavigation label="Navegação do atendimento psicológico">
              <Button className="shrink-0" size="sm" variant="outline" asChild>
                <Link href="/portal" transitionTypes={["nav-back"]}>
                  Voltar ao portal
                </Link>
              </Button>
            </PageHeaderNavigation>
          }
          title="Atendimento psicológico"
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <main className="min-w-0">
            <form
              action="/portal/atendimento-psicologico"
              className="mb-4 grid gap-2 rounded-md border bg-card p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              {statusFilter && (
                <input name="status" type="hidden" value={statusFilter} />
              )}
              <div className="relative">
                <HugeiconsIcon
                  className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-4 text-muted-foreground"
                  icon={Search01Icon}
                  strokeWidth={2}
                />
                <Input
                  aria-label="Buscar solicitações por protocolo"
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
                    <Link href={buildPanelHref({ statusFilter })}>Limpar</Link>
                  </Button>
                )}
              </div>
            </form>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card p-3 shadow-sm">
              <div className="min-w-0">
                <p className="text-sm font-medium">Exportar mês em CSV</p>
                <p className="text-xs text-muted-foreground">
                  Inclui todas as solicitações recebidas no mês, independente
                  dos filtros de busca e status acima.
                </p>
              </div>
              <PsychologicalCareExportButton
                defaultMonth={defaultExportMonth}
                defaultYear={defaultExportYear}
              />
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                {requestPage.total} solicitação(ões) encontrada(s) · página{" "}
                {requestPage.page} de {requestPage.totalPages}
                {statusFilter
                  ? ` · filtro: ${STATUS_FILTER_LABELS[statusFilter]}`
                  : ""}
              </span>
              <Pagination
                page={requestPage.page}
                search={search}
                statusFilter={statusFilter}
                totalPages={requestPage.totalPages}
              />
            </div>

            <section
              aria-label="Solicitações de atendimento psicológico"
              className="overflow-hidden rounded-md border bg-card shadow-sm"
            >
              {requestPage.items.length > 0 ? (
                <div className="divide-y">
                  {requestPage.items.map((request) => (
                    <Link
                      aria-label={`Ver solicitação ${request.protocol}`}
                      className="group grid gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center"
                      href={`/portal/atendimento-psicologico/${request.id}`}
                      key={request.id}
                      prefetch={false}
                      transitionTypes={["nav-forward"]}
                    >
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <PsychologicalCareStatusBadge
                            status={request.status}
                          />
                        </div>
                        <p className="font-mono text-base font-semibold tracking-tight group-hover:text-elinsa-primary">
                          {request.protocol}
                        </p>
                      </div>
                      <dl className="flex flex-col gap-2 text-xs text-muted-foreground sm:grid sm:grid-cols-2 lg:flex">
                        <RequestDate
                          label="Recebida"
                          value={request.createdAt}
                        />
                        <RequestDate
                          label="Atualizada"
                          value={request.updatedAt}
                        />
                      </dl>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-10 text-center">
                  <HugeiconsIcon
                    className="mx-auto mb-3 size-8 text-muted-foreground/70"
                    icon={InboxIcon}
                    strokeWidth={2}
                  />
                  <p className="text-sm text-muted-foreground">
                    {search || statusFilter
                      ? "Nenhuma solicitação encontrada com esses filtros."
                      : "Nenhuma solicitação recebida ainda."}
                  </p>
                </div>
              )}
            </section>

            <div className="mt-4 flex justify-end">
              <Pagination
                page={requestPage.page}
                search={search}
                statusFilter={statusFilter}
                totalPages={requestPage.totalPages}
              />
            </div>
          </main>

          <aside className="grid gap-3 lg:sticky lg:top-24">
            <MetricCard
              active={statusFilter === "new"}
              href={buildPanelHref({
                search,
                statusFilter: statusFilter === "new" ? undefined : "new",
              })}
              icon={<HugeiconsIcon icon={InboxIcon} strokeWidth={2} />}
              label="Novas"
              value={counts.new ?? 0}
            />
            <MetricCard
              active={statusFilter === "in_progress"}
              href={buildPanelHref({
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
              href={buildPanelHref({
                search,
                statusFilter:
                  statusFilter === "finished" ? undefined : "finished",
              })}
              icon={<HugeiconsIcon icon={CheckListIcon} strokeWidth={2} />}
              label="Encerradas"
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
        active ? `Remover filtro: ${label}` : `Filtrar solicitações: ${label}`
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
          <span className="text-2xl leading-none font-semibold">{value}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

function RequestDate({ label, value }: { label: string; value: Date }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">
        {formatDate(value)}
      </dd>
    </div>
  );
}

function Pagination({
  page,
  search,
  statusFilter,
  totalPages,
}: {
  page: number;
  search: string;
  statusFilter: PsychologicalCareSummaryStatusFilter | undefined;
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
          href={buildPanelHref({
            page: page - 1,
            search,
            statusFilter,
          })}
        >
          <HugeiconsIcon
            data-icon="inline-start"
            icon={ArrowLeft01Icon}
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
          href={buildPanelHref({
            page: page + 1,
            search,
            statusFilter,
          })}
        >
          Próxima
          <HugeiconsIcon
            data-icon="inline-end"
            icon={ArrowRight01Icon}
            strokeWidth={2}
          />
        </Link>
      </Button>
    </div>
  );
}

function buildPanelHref({
  page,
  search,
  statusFilter,
}: {
  page?: number;
  search?: string;
  statusFilter?: PsychologicalCareSummaryStatusFilter;
}) {
  const params = new URLSearchParams();

  if (search) params.set("q", search);
  if (statusFilter) params.set("status", statusFilter);
  if (typeof page === "number" && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query
    ? `/portal/atendimento-psicologico?${query}`
    : "/portal/atendimento-psicologico";
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeSearchParam(value: string) {
  return value.trim().slice(0, 200);
}

function normalizeStatusFilter(
  value: string,
): PsychologicalCareSummaryStatusFilter | undefined {
  return PSYCHOLOGICAL_CARE_SUMMARY_STATUS_FILTERS.includes(
    value as PsychologicalCareSummaryStatusFilter,
  )
    ? (value as PsychologicalCareSummaryStatusFilter)
    : undefined;
}

function parsePage(value: string) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
