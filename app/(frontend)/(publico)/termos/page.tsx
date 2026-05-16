import { Button } from "@/components/ui/button";
import { ArrowRight, TextAlignStart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso - Elinsa",
  description:
    "Condições gerais para uso do site, canais públicos e portal interno da Elinsa do Brasil.",
};

const updatedAt = "16 de maio de 2026";

const topics = [
  { id: "aceitacao", title: "Aceitação" },
  { id: "uso-autorizado", title: "Uso autorizado" },
  { id: "portal-interno", title: "Portal interno" },
  { id: "canais-publicos", title: "Canais públicos" },
  { id: "condutas", title: "Condutas vedadas" },
  { id: "disponibilidade", title: "Disponibilidade" },
  { id: "contato", title: "Contato" },
];

const forbidden = [
  "Tentar acessar áreas, contas ou dados sem autorização.",
  "Inserir conteúdo ilícito, abusivo, falso ou incompatível com o canal usado.",
  "Automatizar requisições, burlar limites ou prejudicar a disponibilidade do serviço.",
  "Copiar marcas, textos, interfaces ou materiais da Elinsa sem autorização.",
];

function Section({
  children,
  id,
  title,
}: {
  children: React.ReactNode;
  id: string;
  title: string;
}) {
  return (
    <section className="scroll-mt-28 border-t border-border py-10" id={id}>
      <h2 className="text-2xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-base leading-8 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function TopicsAside() {
  return (
    <aside className="hidden border-l border-border pl-6 lg:sticky lg:top-28 lg:block lg:self-start">
      <div className="py-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          <TextAlignStart size="14" /> Nesta página
        </p>
        <nav className="mt-3 grid gap-1">
          {topics.map((topic) => (
            <a
              className="rounded-md px-3 py-2 text-sm leading-5 text-muted-foreground transition-colors hover:text-elinsa-primary"
              href={`#${topic.id}`}
              key={topic.id}
            >
              {topic.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default function TermosPage() {
  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border pb-14 pt-28 md:pb-16 md:pt-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-4xl">
            <h1 className="mt-4 text-2xl font-black tracking-normal text-elinsa-dark sm:text-2xl md:text-3xl dark:text-elinsa-sky">
              Termos de Uso
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              Estes termos regulam o uso do site público, dos formulários, do
              canal de denúncias e do portal interno da Elinsa do Brasil.
            </p>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">
              Última atualização: {updatedAt}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <main>
          <Section id="aceitacao" title="Aceitação dos termos">
            <p>
              Ao acessar ou utilizar o site, os formulários públicos, o canal de
              denúncias ou o portal interno, você concorda com estes Termos de
              Uso e com a{" "}
              <Link
                className="font-bold text-elinsa-primary transition-colors hover:text-elinsa-dark dark:hover:text-white"
                href="/privacidade"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </Section>

          <Section id="uso-autorizado" title="Uso autorizado">
            <p>
              O site público pode ser usado para consultar informações
              institucionais, vagas, mapas, imprensa, contato e demais canais
              disponibilizados pela Elinsa.
            </p>
            <p>
              O acesso ao portal interno é restrito a pessoas convidadas ou
              autorizadas. A Elinsa pode revisar permissões, limitar acessos e
              encerrar sessões quando necessário para segurança ou operação.
            </p>
          </Section>

          <Section id="portal-interno" title="Portal interno">
            <p>
              Usuários do portal devem manter credenciais em sigilo, usar dados
              verdadeiros, sair de sessões em dispositivos compartilhados e
              comunicar suspeitas de acesso indevido.
            </p>
            <p>
              O portal pode usar senha, verificação de e-mail, passkey, provedor
              corporativo e registros de sessão para proteger contas e fluxos
              internos.
            </p>
          </Section>

          <Section id="canais-publicos" title="Canais públicos">
            <p>
              Mensagens de contato, candidaturas, solicitações e denúncias devem
              ser enviadas com boa-fé e finalidade compatível com o canal
              escolhido.
            </p>
            <p>
              No canal de denúncias, relate fatos relevantes para análise ética
              ou de conduta. Relatos falsos, abusivos ou enviados para
              prejudicar terceiros podem gerar medidas cabíveis.
            </p>
          </Section>

          <Section id="condutas" title="Condutas vedadas">
            <p>Não é permitido:</p>
            <ul className="list-disc space-y-2 pl-6">
              {forbidden.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section id="disponibilidade" title="Disponibilidade e alterações">
            <p>
              A Elinsa pode alterar funcionalidades, conteúdos, permissões,
              rotas e integrações para manutenção, segurança, melhoria
              operacional ou cumprimento de obrigações legais.
            </p>
            <p>
              O site e o portal podem depender de serviços de terceiros, conexão
              do usuário e infraestrutura externa. Indisponibilidades
              temporárias podem ocorrer.
            </p>
            <p>
              Estes termos podem ser atualizados. A versão publicada nesta
              página substitui versões anteriores a partir da data indicada.
            </p>
          </Section>

          <Section id="contato" title="Contato">
            <p>
              Dúvidas sobre estes termos podem ser encaminhadas pelo canal de
              contato da Elinsa.
            </p>
            <p>
              <Button variant={"link"} size={"lg"} className="px-0 text-base" asChild>
                <Link
                  href="/contato"
                >
                  Acessar formulário de contato <ArrowRight />
              </Link>
              </Button>
            </p>
          </Section>
        </main>

        <TopicsAside />
      </div>
    </div>
  );
}
