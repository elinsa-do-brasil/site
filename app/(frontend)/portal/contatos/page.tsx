import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactsTable } from "@/app/(frontend)/portal/contatos/_components/contacts-table";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/ui/page-transition";
import { assertCanAccessContacts } from "@/lib/contacts/permissions";
import { listContacts } from "@/lib/contacts/queries";
import {
  CONTACT_STATUS_VALUES,
  type ContactStatus,
  contactStatusLabels,
  contactStatusSchema,
} from "@/lib/contacts/validators";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contatos recebidos",
};

type ContactsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalContatosPage({
  searchParams,
}: ContactsPageProps) {
  await assertCanAccessContacts();

  const params = await searchParams;
  const search = getSingleParam(params.search);
  const status = parseStatus(getSingleParam(params.status));
  const page = parsePage(getSingleParam(params.page));
  const result = await listContacts({
    page,
    search,
    status,
  });
  const { pagination } = result;

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <PageHeader
          description="Consulte e acompanhe mensagens enviadas pelo formulário público."
          eyebrow="Relacionamento"
          navigation={
            <PageHeaderNavigation label="Navegação de contatos">
              <Button className="shrink-0" size="sm" variant="outline" asChild>
                <Link href="/portal" transitionTypes={["nav-back"]}>
                  Voltar ao portal
                </Link>
              </Button>
            </PageHeaderNavigation>
          }
          title="Contatos recebidos"
        />

        <form
          action="/portal/contatos"
          className="mb-5 grid gap-3 rounded-md border bg-card p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_12rem_auto_auto]"
        >
          <div className="relative">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
            <label className="sr-only" htmlFor="contacts-search">
              Buscar contatos
            </label>
            <Input
              className="pl-8"
              defaultValue={search}
              id="contacts-search"
              name="search"
              placeholder="Buscar por nome, e-mail, empresa, assunto ou mensagem"
            />
          </div>
          <label className="sr-only" htmlFor="contacts-status">
            Filtrar por status
          </label>
          <select
            className="h-9 rounded-md border border-input bg-input/20 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            defaultValue={status ?? ""}
            id="contacts-status"
            name="status"
          >
            <option value="">Todos os status</option>
            {CONTACT_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {contactStatusLabels[value]}
              </option>
            ))}
          </select>
          <Button type="submit">Filtrar</Button>
          <Button variant="outline" asChild>
            <Link href="/portal/contatos">Limpar</Link>
          </Button>
        </form>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {pagination.total} contato(s) encontrado(s) · página{" "}
            {pagination.page} de {pagination.totalPages}
          </span>
          <Pagination
            page={pagination.page}
            search={search}
            status={status}
            totalPages={pagination.totalPages}
          />
        </div>

        <ContactsTable contacts={result.contacts} />

        <div className="mt-4 flex justify-end">
          <Pagination
            page={pagination.page}
            search={search}
            status={status}
            totalPages={pagination.totalPages}
          />
        </div>
      </div>
    </PageTransition>
  );
}

function Pagination({
  page,
  search,
  status,
  totalPages,
}: {
  page: number;
  search?: string;
  status?: ContactStatus;
  totalPages: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        aria-disabled={page <= 1}
        className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
        size="sm"
        variant="outline"
        asChild
      >
        <Link href={buildContactsHref({ page: page - 1, search, status })}>
          <ChevronLeft className="size-3" />
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
        <Link href={buildContactsHref({ page: page + 1, search, status })}>
          Próxima
          <ChevronRight className="size-3" />
        </Link>
      </Button>
    </div>
  );
}

function buildContactsHref({
  page,
  search,
  status,
}: {
  page: number;
  search?: string;
  status?: ContactStatus;
}) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  const query = params.toString();
  return query ? `/portal/contatos?${query}` : "/portal/contatos";
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parsePage(value: string) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseStatus(value: string) {
  if (!value) return undefined;

  const parsed = contactStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
