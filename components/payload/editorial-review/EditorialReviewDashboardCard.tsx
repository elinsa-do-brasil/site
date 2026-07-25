import { createLocalReq, type ServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import { getEditorialReviewSummary } from "../../../lib/payload/editorial-review.ts";
import { canPublish } from "../../../lib/payload/rbac.ts";
import "./styles.scss";

export async function EditorialReviewDashboardCard({
  payload,
  user,
}: ServerProps) {
  if (!canPublish(user)) {
    return null;
  }

  const href = formatAdminURL({
    adminRoute: payload.config.routes.admin,
    path: "/pendencias-editoriais",
  });

  try {
    const req = await createLocalReq({ user }, payload);
    const summary = await getEditorialReviewSummary({ req });

    return (
      <section
        aria-labelledby="editorial-review-card-title"
        className="editorial-review-card"
        data-testid="editorial-review-card"
      >
        <div className="editorial-review-card__content">
          <div>
            <p className="editorial-review-card__eyebrow">Revisão</p>
            <h2 id="editorial-review-card-title">Pendências editoriais</h2>
          </div>
          <p className="editorial-review-card__total">
            {summary.totalDocs > 0
              ? `${summary.totalDocs} ${summary.totalDocs === 1 ? "item aguarda" : "itens aguardam"} revisão`
              : "Nenhuma pendência editorial"}
          </p>
          <dl className="editorial-review-card__breakdown">
            <div>
              <dt>Blog</dt>
              <dd>{summary.breakdown.blog}</dd>
            </div>
            <div>
              <dt>Imprensa</dt>
              <dd>{summary.breakdown.imprensa}</dd>
            </div>
            <div>
              <dt>Vagas</dt>
              <dd>{summary.breakdown.vagas}</dd>
            </div>
          </dl>
        </div>
        <a className="editorial-review-card__link" href={href}>
          Ver pendências
          <span aria-hidden="true">→</span>
        </a>
      </section>
    );
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: "Falha ao carregar o resumo de pendências editoriais.",
    });

    return (
      <section
        aria-labelledby="editorial-review-card-title"
        className="editorial-review-card editorial-review-card--error"
        data-testid="editorial-review-card"
      >
        <div className="editorial-review-card__content">
          <p className="editorial-review-card__eyebrow">Revisão</p>
          <h2 id="editorial-review-card-title">Pendências editoriais</h2>
          <p>Não foi possível carregar as pendências agora.</p>
        </div>
        <a className="editorial-review-card__link" href={href}>
          Tentar novamente
          <span aria-hidden="true">→</span>
        </a>
      </section>
    );
  }
}
