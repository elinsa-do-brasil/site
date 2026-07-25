import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import {
  type EditorialReviewFilters,
  type EditorialReviewItem,
  getEditorialReviewQueue,
  parseEditorialReviewFilters,
} from "../../../lib/payload/editorial-review.ts";
import { canPublish } from "../../../lib/payload/rbac.ts";
import "./styles.scss";

const areaLabels = {
  blog: "Blog",
  imprensa: "Imprensa",
  vagas: "Vagas",
} as const;

function buildQueueURL({
  baseURL,
  filters,
  page,
}: {
  baseURL: string;
  filters: EditorialReviewFilters;
  page: number;
}): string {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }
  if (filters.area !== "todas") {
    params.set("area", filters.area);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `${baseURL}?${query}` : baseURL;
}

function formatUpdatedAt(value: string, locale: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StateBadge({ state }: Pick<EditorialReviewItem, "state">) {
  const label = state === "new" ? "Novo rascunho" : "Revisão pendente";

  return (
    <span
      className={`editorial-review-badge editorial-review-badge--${state}`}
      data-review-state={state}
    >
      {label}
    </span>
  );
}

function ReviewTemplate({
  children,
  props,
}: {
  children: React.ReactNode;
  props: AdminViewServerProps;
}) {
  const {
    i18n,
    initPageResult,
    locale,
    params,
    payload,
    permissions,
    searchParams,
    user,
    viewType,
  } = props;

  return (
    <DefaultTemplate
      className="editorial-review-template"
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      req={initPageResult.req}
      searchParams={searchParams}
      user={user}
      viewType={viewType}
      visibleEntities={initPageResult.visibleEntities}
    >
      {children}
    </DefaultTemplate>
  );
}

export async function EditorialReviewView(props: AdminViewServerProps) {
  const { i18n, initPageResult, payload, searchParams } = props;
  const req = initPageResult.req;
  const filters = parseEditorialReviewFilters(searchParams);
  const baseURL = formatAdminURL({
    adminRoute: payload.config.routes.admin,
    path: "/pendencias-editoriais",
  });

  if (!canPublish(req.user)) {
    return (
      <ReviewTemplate props={props}>
        <main className="editorial-review-view">
          <div className="editorial-review-state editorial-review-state--error">
            <h1>Acesso não autorizado</h1>
            <p>Seu perfil não pode consultar as pendências editoriais.</p>
          </div>
        </main>
      </ReviewTemplate>
    );
  }

  try {
    const queue = await getEditorialReviewQueue({
      req,
      searchParams,
    });
    const locale = i18n.language || "pt-BR";

    return (
      <ReviewTemplate props={props}>
        <main className="editorial-review-view">
          <header className="editorial-review-view__header">
            <div>
              <p className="editorial-review-view__eyebrow">Revisão</p>
              <h1>Pendências editoriais</h1>
              <p>
                Rascunhos novos e alterações que aguardam revisão. A publicação
                continua no documento original.
              </p>
            </div>
            <p aria-live="polite" className="editorial-review-view__count">
              {queue.totalDocs}{" "}
              {queue.totalDocs === 1 ? "pendência" : "pendências"}
            </p>
          </header>

          <form
            action={baseURL}
            className="editorial-review-filters"
            method="get"
          >
            <div className="editorial-review-filters__field">
              <label htmlFor="editorial-review-search">
                Pesquisar por título
              </label>
              <input
                defaultValue={filters.query}
                id="editorial-review-search"
                name="q"
                placeholder="Digite parte do título"
                type="search"
              />
            </div>
            <div className="editorial-review-filters__field">
              <label htmlFor="editorial-review-area">Área</label>
              <select
                defaultValue={filters.area}
                id="editorial-review-area"
                name="area"
              >
                <option value="todas">Todas</option>
                <option value="blog">Blog</option>
                <option value="imprensa">Imprensa</option>
                <option value="vagas">Vagas</option>
              </select>
            </div>
            <div className="editorial-review-filters__actions">
              <button type="submit">Filtrar</button>
              {(filters.query || filters.area !== "todas") && (
                <a href={baseURL}>Limpar filtros</a>
              )}
            </div>
          </form>

          {queue.items.length ? (
            <>
              <div className="editorial-review-table-wrap">
                <table className="editorial-review-table">
                  <caption className="editorial-review-visually-hidden">
                    Conteúdos que aguardam revisão editorial
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Estado</th>
                      <th scope="col">Título</th>
                      <th scope="col">Área</th>
                      <th scope="col">Última alteração por</th>
                      <th scope="col">Atualizado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.items.map((item) => (
                      <tr key={`${item.collection}:${item.id}`}>
                        <td data-label="Estado">
                          <StateBadge state={item.state} />
                        </td>
                        <td data-label="Título">
                          <a
                            className="editorial-review-table__title"
                            href={item.href}
                          >
                            {item.title}
                          </a>
                        </td>
                        <td data-label="Área">{areaLabels[item.collection]}</td>
                        <td data-label="Última alteração por">
                          {item.lastModifiedBy}
                        </td>
                        <td data-label="Atualizado em">
                          <time dateTime={item.updatedAt}>
                            {formatUpdatedAt(item.updatedAt, locale)}
                          </time>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {queue.totalPages > 1 ? (
                <nav
                  aria-label="Paginação das pendências editoriais"
                  className="editorial-review-pagination"
                >
                  {queue.page > 1 ? (
                    <a
                      href={buildQueueURL({
                        baseURL,
                        filters: queue.filters,
                        page: queue.page - 1,
                      })}
                    >
                      ← Anterior
                    </a>
                  ) : (
                    <span />
                  )}
                  <span>
                    Página {queue.page} de {queue.totalPages}
                  </span>
                  {queue.page < queue.totalPages ? (
                    <a
                      href={buildQueueURL({
                        baseURL,
                        filters: queue.filters,
                        page: queue.page + 1,
                      })}
                    >
                      Próxima →
                    </a>
                  ) : (
                    <span />
                  )}
                </nav>
              ) : null}
            </>
          ) : (
            <div className="editorial-review-state">
              <h2>Nenhuma pendência editorial</h2>
              <p>
                {filters.query || filters.area !== "todas"
                  ? "Nenhum rascunho corresponde aos filtros selecionados."
                  : "Todos os conteúdos estão publicados ou sem alterações pendentes."}
              </p>
            </div>
          )}
        </main>
      </ReviewTemplate>
    );
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: "Falha ao carregar as pendências editoriais.",
    });

    return (
      <ReviewTemplate props={props}>
        <main className="editorial-review-view">
          <div className="editorial-review-state editorial-review-state--error">
            <h1>Não foi possível carregar as pendências</h1>
            <p>
              Nenhum resultado parcial foi exibido. Recarregue a página para
              tentar novamente.
            </p>
          </div>
        </main>
      </ReviewTemplate>
    );
  }
}
