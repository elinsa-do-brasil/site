import { ArrowRight, TextAlignStart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a Elinsa do Brasil trata dados pessoais no site, nos canais públicos e no portal interno.",
};

const updatedAt = "16 de maio de 2026";

const topics = [
  { id: "dados-tratados", title: "Dados que tratamos" },
  { id: "finalidades", title: "Finalidades" },
  { id: "bases-legais", title: "Bases legais" },
  { id: "cookies", title: "Cookies e armazenamento" },
  { id: "terceiros", title: "Serviços técnicos" },
  { id: "seguranca", title: "Segurança e retenção" },
  { id: "direitos", title: "Direitos do titular" },
  { id: "contato", title: "Contato" },
];

const rights = [
  "Confirmar se há tratamento de dados pessoais.",
  "Acessar, corrigir ou atualizar dados pessoais.",
  "Solicitar anonimização, bloqueio ou eliminação quando aplicável.",
  "Pedir informações sobre compartilhamento com terceiros.",
  "Revogar consentimento, quando o tratamento depender dessa base legal.",
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

export default function PrivacidadePage() {
  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border pb-14 pt-28 md:pb-16 md:pt-32">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="max-w-4xl">
            <h1 className="mt-4 text-2xl font-black tracking-normal text-elinsa-dark sm:text-2xl md:text-3xl dark:text-elinsa-sky">
              Política de Privacidade
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              A Elinsa do Brasil trata dados pessoais para manter seus canais
              digitais, responder solicitações, operar o portal interno e
              proteger o acesso às informações institucionais.
            </p>

            <p className="mt-4 text-sm font-semibold text-muted-foreground">
              Última atualização: {updatedAt}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <main>
          <Section id="dados-tratados" title="Dados que tratamos">
            <p>
              Os dados tratados dependem do canal utilizado e da relação do
              usuário com a Elinsa.
            </p>

            <ul className="list-inside list-disc flex flex-col gap-2">
              <li>
                Nos <strong>canais de contato</strong>, podemos receber
                informações como nome, e-mail, telefone, empresa, assunto e
                mensagem enviada. Esses dados são usados para responder
                solicitações, registrar atendimentos e dar continuidade à
                comunicação iniciada pelo usuário.
              </li>
              <li>
                No portal interno, tratamos dados de cadastro, autenticação,
                sessões, organizações, equipes, endereço IP, navegador e
                registros técnicos necessários para administrar acessos, manter
                a segurança e operar as funcionalidades do sistema.
              </li>
              <li>
                No canal de denúncias, as informações enviadas são tratadas para
                receber, registrar e apurar relatos conforme os procedimentos
                internos da Elinsa. Quando a denúncia é realizada de forma
                anônima, adotamos medidas técnicas para preservar a identidade
                do denunciante, incluindo remoção de identificadores antes do
                envio, ausência de vínculo com contas autenticadas ou sessões do
                portal e proteção criptográfica do conteúdo. Quando o
                denunciante opta por se identificar, tratamos os dados de nome e
                contato fornecidos voluntariamente para comunicação,
                acompanhamento do caso e condução da apuração. O acesso às
                informações é restrito a pessoas autorizadas responsáveis pelo
                tratamento da denúncia.
              </li>
              <li>
                Alguns fornecedores podem tratar dados necessários para hospedar
                o site, manter banco de dados, autenticar usuários, medir
                desempenho e disponibilizar recursos operacionais, como serviços
                de mapas para exibição de localizações institucionais.
              </li>
            </ul>
          </Section>

          <Section id="finalidades" title="Para que usamos os dados">
            <p>
              Usamos dados pessoais para responder contatos, permitir acesso ao
              portal interno, manter sessões autenticadas, proteger contas,
              prevenir uso indevido, registrar atividades administrativas e
              melhorar a estabilidade dos serviços digitais.
            </p>

            <p>
              Também usamos informações técnicas para funcionamento do site,
              preferências de interface, métricas de desempenho, segurança da
              aplicação e exibição de mapas.
            </p>
          </Section>

          <Section id="bases-legais" title="Bases legais">
            <p>
              O tratamento de dados pessoais é realizado com fundamento nas
              bases legais aplicáveis da LGPD, especialmente execução de
              contrato ou procedimentos relacionados, cumprimento de obrigação
              legal, exercício regular de direitos, legítimo interesse,
              segurança e prevenção à fraude.
            </p>

            <p>
              Quando determinada atividade depender de consentimento, ele será
              solicitado de forma específica e poderá ser revogado pelo titular
              nos termos da LGPD.
            </p>
          </Section>

          <Section id="cookies" title="Cookies, sessões e armazenamento local">
            <p>
              Usamos cookies, sessões e armazenamento local para manter o
              usuário autenticado, proteger o acesso ao portal, lembrar
              preferências de interface e garantir o funcionamento adequado do
              site.
            </p>

            <p>
              A preferência de tema pode ser salva no navegador. Cookies de
              sessão e registros técnicos podem ser usados para autenticação,
              segurança, prevenção de abuso e administração de acesso.
            </p>
          </Section>

          <Section id="terceiros" title="Serviços técnicos">
            <p>
              Alguns fornecedores podem tratar dados necessários para hospedar o
              site, manter banco de dados, enviar mensagens, autenticar
              usuários, medir desempenho e carregar mapas.
            </p>

            <p>
              Entre esses serviços podem estar provedores de infraestrutura,
              autenticação, e-mail, métricas técnicas e mapas, como Vercel e
              MapTiler, sempre de acordo com a finalidade necessária para
              operação do serviço.
            </p>
          </Section>

          <Section id="seguranca" title="Segurança e retenção">
            <p>
              A Elinsa utiliza controles de acesso, autenticação, registros
              técnicos e criptografia quando aplicável para reduzir riscos de
              acesso não autorizado, perda, alteração indevida ou uso
              incompatível dos dados.
            </p>

            <p>
              Os dados são mantidos pelo tempo necessário para cumprir
              finalidades operacionais, legais, contratuais, de segurança ou
              defesa de direitos. Após esse período, podem ser eliminados,
              anonimizados ou preservados apenas nas hipóteses permitidas pela
              LGPD.
            </p>
          </Section>

          <Section id="direitos" title="Direitos do titular">
            <p>Você pode solicitar, gratuitamente e nos termos da LGPD:</p>

            <ul className="list-disc space-y-2 pl-6">
              {rights.map((right) => (
                <li key={right}>{right}</li>
              ))}
            </ul>
          </Section>

          <Section id="contato" title="Contato">
            <p>
              Para dúvidas sobre privacidade ou solicitações relacionadas a
              dados pessoais, use o canal de contato da Elinsa.
            </p>

            <p>
              <Button
                variant={"link"}
                size={"lg"}
                className="px-0 text-base"
                asChild
              >
                <Link href="/contato">
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
