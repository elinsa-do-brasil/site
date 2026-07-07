import {
  Code2,
  ExternalLink,
  Heart,
  PackageOpen,
  Scale,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Licenças de código aberto - Elinsa",
  description:
    "Reconhecimento das bibliotecas e ferramentas de código aberto usadas no site da Elinsa.",
};

type LicenseItem = {
  name: string;
  version: string;
  license: string;
  url?: string;
};

const runtimeDependencies: LicenseItem[] = [
  {
    name: "@better-auth/passkey",
    version: "1.6.11",
    license: "MIT",
    url: "https://www.better-auth.com/docs/plugins/passkey",
  },
  {
    name: "@hookform/resolvers",
    version: "5.2.2",
    license: "MIT",
    url: "https://react-hook-form.com",
  },
  {
    name: "@hugeicons/core-free-icons",
    version: "4.1.1",
    license: "MIT",
    url: "https://hugeicons.com",
  },
  {
    name: "@hugeicons/react",
    version: "1.1.6",
    license: "MIT",
    url: "https://hugeicons.com",
  },
  {
    name: "@payloadcms/db-postgres",
    version: "3.84.1",
    license: "MIT",
    url: "https://payloadcms.com",
  },
  {
    name: "@payloadcms/email-resend",
    version: "3.84.1",
    license: "MIT",
    url: "https://payloadcms.com",
  },
  {
    name: "@payloadcms/next",
    version: "3.84.1",
    license: "MIT",
    url: "https://payloadcms.com",
  },
  {
    name: "@payloadcms/richtext-lexical",
    version: "3.84.1",
    license: "MIT",
    url: "https://payloadcms.com",
  },
  {
    name: "@azure/storage-blob",
    version: "12.33.0",
    license: "MIT",
    url: "https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/storage/storage-blob",
  },
  {
    name: "@payloadcms/storage-azure",
    version: "3.85.1",
    license: "MIT",
    url: "https://payloadcms.com",
  },
  {
    name: "@payloadcms/translations",
    version: "3.84.1",
    license: "MIT",
    url: "https://payloadcms.com",
  },
  {
    name: "@tabler/icons-react",
    version: "3.42.0",
    license: "MIT",
    url: "https://tabler.io/icons",
  },
  {
    name: "@vercel/speed-insights",
    version: "2.0.0",
    license: "Apache-2.0",
    url: "https://vercel.com/docs/speed-insights",
  },
  {
    name: "better-auth",
    version: "1.6.10",
    license: "MIT",
    url: "https://better-auth.com",
  },
  {
    name: "class-variance-authority",
    version: "0.7.1",
    license: "Apache-2.0",
    url: "https://github.com/joe-bell/cva#readme",
  },
  {
    name: "clsx",
    version: "2.1.1",
    license: "MIT",
    url: "https://github.com/lukeed/clsx",
  },
  {
    name: "dotted-map",
    version: "3.1.0",
    license: "MIT",
    url: "https://github.com/NTag/dotted-map",
  },
  {
    name: "drizzle-orm",
    version: "0.45.2",
    license: "Apache-2.0",
    url: "https://orm.drizzle.team",
  },
  {
    name: "lucide-react",
    version: "1.14.0",
    license: "ISC",
    url: "https://lucide.dev",
  },
  {
    name: "maplibre-gl",
    version: "5.24.0",
    license: "BSD-3-Clause",
    url: "https://maplibre.org/",
  },
  {
    name: "motion",
    version: "12.38.0",
    license: "MIT",
    url: "https://github.com/motiondivision/motion",
  },
  {
    name: "next",
    version: "16.2.4",
    license: "MIT",
    url: "https://nextjs.org",
  },
  {
    name: "next-themes",
    version: "0.4.6",
    license: "MIT",
    url: "https://github.com/pacocoursey/next-themes.git",
  },
  {
    name: "payload",
    version: "3.84.1",
    license: "MIT",
    url: "https://payloadcms.com",
  },
  {
    name: "pg",
    version: "8.20.0",
    license: "MIT",
    url: "https://node-postgres.com",
  },
  {
    name: "radix-ui",
    version: "1.4.3",
    license: "MIT",
    url: "https://radix-ui.com/primitives",
  },
  {
    name: "react",
    version: "19.2.5",
    license: "MIT",
    url: "https://react.dev/",
  },
  {
    name: "react-dom",
    version: "19.2.5",
    license: "MIT",
    url: "https://react.dev/",
  },
  {
    name: "react-hook-form",
    version: "7.75.0",
    license: "MIT",
    url: "https://react-hook-form.com",
  },
  {
    name: "react-icons",
    version: "5.6.0",
    license: "MIT",
    url: "https://github.com/react-icons/react-icons#readme",
  },
  {
    name: "resend",
    version: "6.12.3",
    license: "MIT",
    url: "https://resend.com",
  },
  {
    name: "shadcn",
    version: "4.6.0",
    license: "MIT",
    url: "https://github.com/shadcn-ui/ui.git",
  },
  {
    name: "sharp",
    version: "0.34.5",
    license: "Apache-2.0",
    url: "https://sharp.pixelplumbing.com",
  },
  {
    name: "sonner",
    version: "2.0.7",
    license: "MIT",
    url: "https://sonner.emilkowal.ski",
  },
  {
    name: "tailwind-merge",
    version: "3.5.0",
    license: "MIT",
    url: "https://github.com/dcastil/tailwind-merge",
  },
  {
    name: "tw-animate-css",
    version: "1.4.0",
    license: "MIT",
    url: "https://github.com/Wombosvideo/tw-animate-css#readme",
  },
  {
    name: "zod",
    version: "4.4.3",
    license: "MIT",
    url: "https://zod.dev",
  },
];

const developmentDependencies: LicenseItem[] = [
  {
    name: "@biomejs/biome",
    version: "2.4.14",
    license: "MIT/Apache-2.0",
    url: "https://biomejs.dev",
  },
  {
    name: "@tailwindcss/postcss",
    version: "4.2.4",
    license: "MIT",
    url: "https://tailwindcss.com",
  },
  {
    name: "@types/node",
    version: "25.6.0",
    license: "MIT",
    url: "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node",
  },
  {
    name: "@types/pg",
    version: "8.20.0",
    license: "MIT",
    url: "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/pg",
  },
  {
    name: "@types/react",
    version: "19.2.14",
    license: "MIT",
    url: "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react",
  },
  {
    name: "@types/react-dom",
    version: "19.2.3",
    license: "MIT",
    url: "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-dom",
  },
  {
    name: "babel-plugin-react-compiler",
    version: "1.0.0",
    license: "MIT",
    url: "https://github.com/facebook/react.git",
  },
  {
    name: "drizzle-kit",
    version: "0.31.10",
    license: "MIT",
    url: "https://orm.drizzle.team",
  },
  {
    name: "tailwindcss",
    version: "4.2.4",
    license: "MIT",
    url: "https://tailwindcss.com",
  },
  {
    name: "tsx",
    version: "4.21.0",
    license: "MIT",
    url: "https://tsx.is",
  },
  {
    name: "typescript",
    version: "6.0.3",
    license: "Apache-2.0",
    url: "https://www.typescriptlang.org/",
  },
];

const allDependencies = [...runtimeDependencies, ...developmentDependencies];
const licenseFamilies = Array.from(
  new Set(allDependencies.map((dependency) => dependency.license)),
).sort();

function packageUrl(item: LicenseItem) {
  return (
    item.url ?? `https://www.npmjs.com/package/${encodeURIComponent(item.name)}`
  );
}

function LicenseList({
  items,
  title,
  description,
}: {
  items: LicenseItem[];
  title: string;
  description: string;
}) {
  return (
    <section className="px-6 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-normal md:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
          <p className="text-sm font-semibold text-elinsa-primary">
            {items.length} pacotes
          </p>
        </div>

        <Card className="gap-0 overflow-hidden rounded-md border border-border bg-card py-0 text-foreground shadow-sm ring-0">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_8rem_10rem_5rem] gap-4 border-b border-border bg-muted/45 px-4 py-3 text-xs font-bold uppercase tracking-normal text-muted-foreground md:grid">
            <span>Projeto</span>
            <span>Versão</span>
            <span>Licença</span>
            <span className="text-right">Fonte</span>
          </div>

          <div className="divide-y divide-border">
            {items.map((item) => (
              <article
                key={item.name}
                className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.5fr)_8rem_10rem_5rem] md:items-center md:gap-4"
              >
                <h3 className="min-w-0 break-words font-bold tracking-normal">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground md:text-base">
                  {item.version}
                </p>
                <p className="w-fit rounded-md bg-elinsa-light px-2.5 py-1 text-sm font-bold text-elinsa-dark">
                  {item.license}
                </p>
                <a
                  href={packageUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir fonte de ${item.name}`}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-elinsa-primary hover:text-elinsa-primary md:justify-self-end"
                >
                  <ExternalLink className="size-4" />
                </a>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function LicencasPage() {
  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border bg-background px-6 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-elinsa-primary/20 bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-dark">
              <Scale className="size-4" />
              Licenças do site
            </div>
            <h1 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-4xl font-black leading-[0.98] tracking-normal text-elinsa-dark sm:text-5xl md:text-7xl dark:text-white">
              <span>Nós</span>
              <span aria-label="coração azul" role="img">
                💙
              </span>
              <span>código aberto</span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-foreground/80 md:text-xl md:leading-8">
              Este site é construído sobre bibliotecas, ferramentas e
              comunidades que compartilham conhecimento. Esta página reconhece
              os projetos de código aberto usados diretamente na aplicação.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Card className="gap-0 border border-border bg-card p-5 text-foreground shadow-sm ring-0">
              <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark">
                <PackageOpen className="size-5" />
              </div>
              <p className="text-3xl font-black text-elinsa-primary">
                {allDependencies.length}
              </p>
              <h2 className="mt-2 font-bold">pacotes diretos</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Dependências declaradas no projeto.
              </p>
            </Card>

            <Card className="gap-0 border border-border bg-card p-5 text-foreground shadow-sm ring-0">
              <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark">
                <ShieldCheck className="size-5" />
              </div>
              <p className="text-3xl font-black text-elinsa-primary">
                {licenseFamilies.length}
              </p>
              <h2 className="mt-2 font-bold">Famílias de licença</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {licenseFamilies.join(", ")}.
              </p>
            </Card>

            <Card className="gap-0 border border-border bg-card p-5 text-foreground shadow-sm ring-0">
              <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark">
                <Heart className="size-5 fill-current" />
              </div>
              <p className="text-3xl font-black text-elinsa-primary">
                Obrigado
              </p>
              <h2 className="mt-2 font-bold">à comunidade</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Autores e mantenedores tornam este trabalho possível.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/35 px-6 py-12 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[0.75fr_1.25fr] md:items-center">
          {/* <div className="inline-flex w-fit items-center gap-2 rounded-md bg-background px-3 py-2 text-sm font-semibold text-muted-foreground"> */}
          <div className="mb-4 w-fit inline-flex items-center gap-2 rounded-md border border-border bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-primary">
            <Code2 className="size-4 text-elinsa-primary" />
            Transparência
          </div>
          <p className="text-lg leading-8 text-muted-foreground">
            A lista abaixo é informativa e foi baseada nos metadados dos pacotes
            instalados. Os termos completos de cada licença devem ser
            consultados nos respectivos pacotes, repositórios ou sites oficiais.
          </p>
        </div>
      </section>

      <LicenseList
        title="Dependências da aplicação"
        description="Bibliotecas usadas diretamente para interface, renderização, conteúdo, mapas, imagens e experiência do site."
        items={runtimeDependencies}
      />

      <LicenseList
        title="Ferramentas de desenvolvimento"
        description="Pacotes usados para tipagem, compilação, formatação, CSS e suporte ao desenvolvimento."
        items={developmentDependencies}
      />
    </div>
  );
}
