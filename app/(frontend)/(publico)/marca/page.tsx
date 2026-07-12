import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  CheckCircle2,
  Circle,
  CircleHelp,
  Download,
  FileImage,
  Moon,
  Palette,
  Sun,
  SwatchBook,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import {
  ContentSection,
  ContentSectionIntro,
} from "@/components/content-section";
import { SectionEyebrow } from "@/components/section-eyebrow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { downloadAsset } from "@/lib/download-asset";
import { cn } from "@/lib/utils";
import { ColorCopyButton } from "./_components/color-copy-button";

const BRAND_PAGE_TITLE = "Kit de marca: logos e cores oficiais";
const BRAND_PAGE_SOCIAL_TITLE = `${BRAND_PAGE_TITLE} | Elinsa`;
const BRAND_PAGE_DESCRIPTION =
  "Baixe o kit de marca da Elinsa do Brasil com logos e símbolos em SVG, PNG, WebP e AVIF, paleta oficial e orientações de aplicação.";

export const metadata: Metadata = {
  title: BRAND_PAGE_TITLE,
  description: BRAND_PAGE_DESCRIPTION,
  keywords: [
    "kit de marca Elinsa",
    "logo Elinsa do Brasil",
    "identidade visual Elinsa",
    "guia de marca Elinsa",
    "cores oficiais Elinsa",
    "logo Elinsa SVG",
    "logo Elinsa PNG",
    "símbolo Elinsa",
  ],
  alternates: {
    canonical: "/marca",
  },
  openGraph: {
    title: BRAND_PAGE_SOCIAL_TITLE,
    description: BRAND_PAGE_DESCRIPTION,
    locale: "pt_BR",
    siteName: "Elinsa do Brasil",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: BRAND_PAGE_SOCIAL_TITLE,
    description: BRAND_PAGE_DESCRIPTION,
  },
};

type BrandColor = {
  name: string;
  role: string;
  hex: string;
  oklch: string;
  rgb: string;
  hsl: string;
  textClassName: string;
};

type AssetFormat = "svg" | "png" | "webp" | "avif";
type AssetKind = "logo" | "symbol";

type BrandAssetFile = {
  format: AssetFormat;
  href: string;
};

type BrandAsset = {
  kind: AssetKind;
  name: string;
  description: string;
  preview: string;
  previewAlt: string;
  previewClassName: string;
  imageClassName: string;
  files: BrandAssetFile[];
};

type UsageRule = {
  title: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type BrandFaq = {
  question: string;
  answer: string;
};

const assetFormats: AssetFormat[] = ["svg", "png", "webp", "avif"];

const brandColors: BrandColor[] = [
  {
    name: "Azul Elinsa",
    role: "Cor principal",
    hex: "#24A3DD",
    oklch: "oklch(0.6764 0.1338 234.74)",
    rgb: "rgb(36, 163, 221)",
    hsl: "hsl(199 73% 50%)",
    textClassName: "text-white",
  },
  {
    name: "Cinza",
    role: "Cor de apoio",
    hex: "#555658",
    oklch: "oklch(0.4529 0.0035 264.53)",
    rgb: "rgb(85, 86, 88)",
    hsl: "hsl(220 2% 34%)",
    textClassName: "text-white",
  },
  {
    name: "Cinza claro",
    role: "Cor de apoio",
    hex: "#B5B7B9",
    oklch: "oklch(0.7784 0.0036 247.87)",
    rgb: "rgb(181, 183, 185)",
    hsl: "hsl(210 3% 72%)",
    textClassName: "text-slate-950",
  },
];

const usageRules: UsageRule[] = [
  {
    title: "Logo colorido",
    label: "Fundo claro",
    description:
      "É a versão principal para apresentações, documentos e peças com fundo claro ou neutro.",
    icon: Sun,
  },
  {
    title: "Logo branco",
    label: "Fundo escuro",
    description:
      "Use quando o fundo oferecer contraste suficiente para preservar a leitura da marca.",
    icon: Moon,
  },
  {
    title: "Logo preto",
    label: "Aplicação sem cor",
    description:
      "Reserve para materiais monocromáticos e documentos que não comportem a versão colorida.",
    icon: Circle,
  },
];

const brandFaqs: BrandFaq[] = [
  {
    question: "Qual versão do logo devo usar em cada fundo?",
    answer:
      "Use o logo colorido sobre fundos claros ou neutros, o logo branco sobre fundos escuros e o logo preto em materiais monocromáticos ou sem aplicação de cor.",
  },
  {
    question: "Quando usar o logo completo ou apenas o símbolo?",
    answer:
      "Prefira o logo completo quando a identificação da Elinsa precisar estar explícita. Use o símbolo em espaços reduzidos ou quando o contexto já deixar claro qual é a marca.",
  },
  {
    question: "Qual formato devo baixar?",
    answer:
      "SVG mantém a qualidade em qualquer escala e é indicado para edição e produção gráfica. PNG funciona bem em apresentações e documentos; WebP e AVIF são alternativas otimizadas para páginas e produtos digitais.",
  },
  {
    question: "O arquivo branco parece vazio. Ele está correto?",
    answer:
      "Sim. A arte é branca e tem fundo transparente, por isso pode desaparecer em um visualizador branco. Aplique-a sobre um fundo escuro para conferir e usar a versão corretamente.",
  },
  {
    question: "Posso mudar as cores, proporções ou os elementos do logo?",
    answer:
      "Não. Use uma das versões oficiais sem recolorir, esticar, girar, remontar ou reposicionar seus elementos. Assim, a assinatura mantém proporção, contraste e reconhecimento.",
  },
  {
    question: "O que vem no kit completo e como abro o arquivo?",
    answer:
      "O pacote reúne os três logos completos e os três símbolos em SVG, PNG, WebP e AVIF. Ele é fornecido em formato .7z e deve ser aberto com um descompactador compatível; os arquivos também podem ser baixados individualmente nesta página.",
  },
];

const brandAssets: BrandAsset[] = [
  createAsset({
    kind: "logo",
    name: "Logo colorido",
    description: "Versão principal para fundos claros e neutros.",
    fileName: "logo-colorido",
    previewClassName: "bg-white",
    imageClassName: "max-h-32 w-full max-w-lg",
  }),
  createAsset({
    kind: "logo",
    name: "Logo branco",
    description: "Versão de alto contraste para fundos escuros.",
    fileName: "logo-branco",
    previewClassName: "bg-elinsa-dark",
    imageClassName: "max-h-32 w-full max-w-lg",
  }),
  createAsset({
    kind: "logo",
    name: "Logo preto",
    description: "Versão para aplicações monocromáticas.",
    fileName: "logo-preto",
    previewClassName: "bg-white",
    imageClassName: "max-h-32 w-full max-w-lg",
  }),
  createAsset({
    kind: "symbol",
    name: "Símbolo azul",
    description: "Identificação compacta na cor principal.",
    fileName: "e-azul",
    previewClassName: "bg-white",
    imageClassName: "max-h-28 w-28",
  }),
  createAsset({
    kind: "symbol",
    name: "Símbolo branco",
    description: "Identificação compacta para fundos escuros.",
    fileName: "e-branco",
    previewClassName: "bg-elinsa-dark",
    imageClassName: "max-h-28 w-28",
  }),
  createAsset({
    kind: "symbol",
    name: "Símbolo preto",
    description: "Identificação compacta em uma única cor.",
    fileName: "e-preto",
    previewClassName: "bg-white",
    imageClassName: "max-h-28 w-28",
  }),
];

function createAsset({
  kind,
  name,
  description,
  fileName,
  previewClassName,
  imageClassName,
}: {
  kind: AssetKind;
  name: string;
  description: string;
  fileName: string;
  previewClassName: string;
  imageClassName: string;
}): BrandAsset {
  return {
    kind,
    name,
    description,
    preview: `/kit-de-marca/svg/${fileName}.svg`,
    previewAlt: `${name} da Elinsa do Brasil`,
    previewClassName,
    imageClassName,
    files: assetFormats.map((format) => ({
      format,
      href: downloadAsset(`kit-de-marca/${format}/${fileName}.${format}`),
    })),
  };
}

export default function MarcaPage() {
  const logos = brandAssets.filter((asset) => asset.kind === "logo");
  const symbols = brandAssets.filter((asset) => asset.kind === "symbol");

  return (
    <div className="bg-background text-foreground">
      <BrandHero />
      <UsageSection />
      <ColorsSection />
      <AssetsSection logos={logos} symbols={symbols} />
      <FaqSection />
    </div>
  );
}

function BrandHero() {
  return (
    <section
      aria-labelledby="marca-heading"
      className="relative isolate overflow-hidden border-b border-border bg-background pb-14 pt-28 md:pb-16 md:pt-32"
    >
      <div
        aria-hidden="true"
        className="absolute -right-28 top-16 -z-10 size-80 rounded-full bg-elinsa-primary/10 blur-3xl md:size-112"
      />
      <div
        aria-hidden="true"
        className="absolute right-[8%] top-0 -z-10 h-full w-px bg-linear-to-b from-transparent via-elinsa-primary/20 to-transparent"
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-16">
        <div className="max-w-2xl">
          <SectionEyebrow
            className="mb-5"
            text="Identidade visual oficial"
            icon={SwatchBook}
            variant="stamp"
          />
          <h1
            id="marca-heading"
            className="text-balance text-4xl font-black leading-none tracking-normal text-elinsa-dark sm:text-5xl md:text-6xl dark:text-white"
          >
            Kit de marca
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-foreground/80 md:text-lg md:leading-8">
            Baixe os arquivos oficiais da Elinsa para apresentações, propostas,
            comunicados e materiais digitais. Escolha a versão pelo contraste e
            o formato pelo destino da peça.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              className="bg-elinsa-primary text-white hover:bg-elinsa-dark"
              size="xl"
            >
              <a href={downloadAsset("kit-de-marca/kit.7z")} download>
                <Download aria-hidden="true" />
                Baixar kit completo
              </a>
            </Button>
            <Button
              asChild
              className="bg-background/80"
              size="xl"
              variant="outline"
            >
              <a href="#arquivos">
                Explorar arquivos
                <ArrowDown aria-hidden="true" data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>

        <BrandStage />
      </div>
    </section>
  );
}

function BrandStage() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div
        aria-hidden="true"
        className="absolute -bottom-5 -left-5 size-28 rounded-3xl border border-elinsa-primary/20 bg-elinsa-light/70 dark:bg-elinsa-primary/10"
      />
      <Card
        className="relative gap-0 overflow-hidden rounded-3xl border-border/70 bg-card py-0 shadow-xl shadow-elinsa-dark/10 ring-1 ring-border/50"
        variant="panel"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
          <span className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Assinatura principal
          </span>
          <Badge
            className="border-elinsa-primary/25 bg-elinsa-primary/10 text-elinsa-dark dark:text-elinsa-sky"
            variant="outline"
          >
            Uso oficial
          </Badge>
        </div>

        <div className="relative flex min-h-80 items-center justify-center overflow-hidden bg-white p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 size-64 rounded-full border-[38px] border-elinsa-primary/8"
          />
          <BrandImage
            alt="Elinsa do Brasil, Ampergroup"
            className="relative z-10 max-h-40 w-full max-w-2xl"
            kind="logo"
            preload
            src="/kit-de-marca/svg/logo-colorido.svg"
          />
        </div>

        <div className="grid grid-cols-3 border-t border-border/70 bg-card">
          {brandColors.map((color) => (
            <div
              className="flex items-center gap-2.5 border-r border-border/70 px-4 py-4 last:border-r-0"
              key={color.hex}
            >
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full ring-2 ring-border/60 ring-offset-2 ring-offset-card"
                style={{ backgroundColor: color.hex }}
              />
              <span
                className="truncate font-mono text-[0.68rem] font-semibold text-muted-foreground sm:text-xs"
                translate="no"
              >
                {color.hex}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function UsageSection() {
  return (
    <ContentSection
      className="scroll-mt-24 py-14 lg:py-16"
      headingId="uso-heading"
      id="uso"
      tone="muted"
    >
      <ContentSectionIntro
        aside={
          <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
            <strong className="text-foreground">Preserve a assinatura.</strong>{" "}
            Não recolora, distorça ou remonte os elementos. Use uma das versões
            prontas abaixo.
          </p>
        }
        badge="Aplicação"
        description="Defina o fundo antes de escolher o arquivo. Essa decisão garante contraste e evita adaptações improvisadas."
        headingId="uso-heading"
        icon={CheckCircle2}
        marker="01"
        title={
          <span className="text-balance">Escolha primeiro pelo contraste.</span>
        }
        variant="specification"
      />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {usageRules.map((rule, index) => (
          <UsageCard index={index + 1} key={rule.title} rule={rule} />
        ))}
      </div>
    </ContentSection>
  );
}

function UsageCard({ index, rule }: { index: number; rule: UsageRule }) {
  const Icon = rule.icon;

  return (
    <Card className="relative h-full rounded-xl border-border/70 bg-card py-0 shadow-sm shadow-elinsa-dark/5 transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/35 dark:hover:bg-elinsa-primary/10">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-11 items-center justify-center rounded-md bg-elinsa-primary/10 text-elinsa-primary">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            0{index}
          </span>
        </div>
        <p className="mt-7 text-xs font-black tracking-[0.14em] text-elinsa-primary uppercase">
          {rule.label}
        </p>
        <h3 className="mt-2 text-xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
          {rule.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {rule.description}
        </p>
      </CardContent>
    </Card>
  );
}

function ColorsSection() {
  return (
    <ContentSection
      className="scroll-mt-24"
      headingId="cores-heading"
      id="cores"
    >
      <ContentSectionIntro
        aside={
          <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
            Copie os códigos em HEX, RGB, HSL ou OKLCH para usar em ferramentas
            de design, apresentações e interfaces digitais.
          </p>
        }
        badge="Paleta oficial"
        description="O azul identifica a Elinsa. Os cinzas sustentam textos, fundos e composições que pedem mais neutralidade."
        headingId="cores-heading"
        icon={Palette}
        marker="02"
        title={
          <span className="text-balance">
            Três cores, uma identidade consistente.
          </span>
        }
        variant="signal"
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brandColors.map((color) => (
          <ColorCard color={color} key={color.hex} />
        ))}
      </div>
    </ContentSection>
  );
}

function ColorCard({ color }: { color: BrandColor }) {
  return (
    <Card className="h-full gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-sm shadow-elinsa-dark/5">
      <div
        className={cn(
          "relative flex min-h-52 flex-col justify-between overflow-hidden p-5",
          color.textClassName,
        )}
        style={{ backgroundColor: color.hex }}
      >
        <span className="w-fit rounded-full border border-current/20 bg-black/10 px-3 py-1 text-xs font-bold">
          {color.role}
        </span>
        <div
          aria-hidden="true"
          className="absolute -right-14 -top-14 size-44 rounded-full border-[28px] border-current/10"
        />
        <div className="relative">
          <h3 className="text-pretty text-2xl font-black tracking-normal">
            {color.name}
          </h3>
        </div>
      </div>

      <CardContent className="grid gap-3 p-5">
        <ColorCode label="HEX" value={color.hex} />
        <ColorCode label="RGB" value={color.rgb} />
        <ColorCode label="HSL" value={color.hsl} />
        <ColorCode label="OKLCH" value={color.oklch} />
      </CardContent>
    </Card>
  );
}

function ColorCode({ label, value }: { label: string; value: string }) {
  return <ColorCopyButton label={label} value={value} />;
}

function AssetsSection({
  logos,
  symbols,
}: {
  logos: BrandAsset[];
  symbols: BrandAsset[];
}) {
  return (
    <ContentSection
      className="scroll-mt-24"
      headingId="arquivos-heading"
      id="arquivos"
      tone="muted"
    >
      <ContentSectionIntro
        badge="Arquivos oficiais"
        description="Baixe cada versão em SVG, PNG, WebP ou AVIF. Escolha o arquivo adequado ao software e ao destino da peça."
        headingId="arquivos-heading"
        icon={FileImage}
        marker="03"
        title={
          <span className="text-balance">
            Encontre a versão pronta para usar.
          </span>
        }
        variant="editorial"
      />

      <AssetGroup
        assets={logos}
        description="Para peças institucionais em que o nome Elinsa do Brasil e o vínculo Ampergroup precisam aparecer por completo."
        id="logos-completos"
        title="Logos completos"
      />
      <AssetGroup
        assets={symbols}
        className="mt-14 border-t border-border/80 pt-12"
        description="Para espaços reduzidos e aplicações em que a marca já está identificada pelo contexto."
        id="simbolos-compactos"
        title="Símbolos compactos"
      />
    </ContentSection>
  );
}

function FaqSection() {
  return (
    <ContentSection
      className="scroll-mt-24"
      containerClassName="max-w-6xl"
      headingId="faq-heading"
      id="faq"
    >
      <ContentSectionIntro
        badge="Perguntas frequentes"
        description="Respostas rápidas para escolher o arquivo certo, preservar a assinatura e aproveitar todos os formatos disponíveis."
        headingId="faq-heading"
        icon={CircleHelp}
        marker="04"
        title={
          <span className="text-balance">Dúvidas sobre o kit de marca?</span>
        }
        variant="compact"
      />

      <Accordion className="mt-10" collapsible type="single">
        {brandFaqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index + 1}`}>
            <AccordionTrigger className="px-4 py-4 sm:px-5">
              <span className="pr-2 text-sm font-bold text-foreground md:text-base">
                {faq.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-5 sm:px-3">
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                {faq.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ContentSection>
  );
}

function AssetGroup({
  assets,
  className,
  description,
  id,
  title,
}: {
  assets: BrandAsset[];
  className?: string;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("mt-12", className)}>
      <div className="mb-6 max-w-3xl border-l-2 border-elinsa-primary pl-4 sm:pl-5">
        <h3
          id={id}
          className="text-balance text-2xl font-black tracking-normal"
        >
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
          {description}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <AssetCard asset={asset} key={asset.name} />
        ))}
      </div>
    </section>
  );
}

function AssetCard({ asset }: { asset: BrandAsset }) {
  return (
    <Card className="group h-full gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-sm shadow-elinsa-dark/5 transition duration-200 hover:-translate-y-0.5 hover:border-elinsa-primary/40 hover:shadow-lg hover:shadow-elinsa-primary/8">
      <CardContent
        className={cn(
          "relative flex min-h-60 items-center justify-center overflow-hidden p-8",
          asset.previewClassName,
        )}
      >
        <span className="absolute left-4 top-4 rounded-full border border-black/10 bg-white/90 px-2.5 py-1 text-[0.65rem] font-black tracking-[0.12em] text-elinsa-dark uppercase shadow-sm">
          {asset.kind === "logo" ? "Logo" : "Símbolo"}
        </span>
        <BrandImage
          alt={asset.previewAlt}
          className={cn(
            "transition-transform duration-300 group-hover:scale-[1.025]",
            asset.imageClassName,
          )}
          kind={asset.kind}
          src={asset.preview}
        />
      </CardContent>

      <CardHeader className="border-t border-border/70 px-5 pb-0 pt-5">
        <CardTitle className="text-xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
          {asset.name}
        </CardTitle>
        <CardDescription className="mt-1 text-sm leading-6">
          {asset.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto grid grid-cols-2 gap-2 p-5 pt-4 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4">
        {asset.files.map((file) => (
          <DownloadButton asset={asset} file={file} key={file.format} />
        ))}
      </CardFooter>
    </Card>
  );
}

function DownloadButton({
  asset,
  file,
}: {
  asset: BrandAsset;
  file: BrandAssetFile;
}) {
  return (
    <Button asChild className="h-9 px-2" size="sm" variant="outline">
      <a
        aria-label={`Baixar ${asset.name} em ${file.format.toUpperCase()}`}
        download
        href={file.href}
      >
        <Download aria-hidden="true" className="size-3.5 text-elinsa-primary" />
        <span className="font-bold uppercase">{file.format}</span>
      </a>
    </Button>
  );
}

function BrandImage({
  alt,
  className,
  kind,
  preload = false,
  src,
}: {
  alt: string;
  className?: string;
  kind: AssetKind;
  preload?: boolean;
  src: string;
}) {
  const isSymbol = kind === "symbol";

  return (
    <Image
      alt={alt}
      className={cn("h-auto object-contain", className)}
      height={isSymbol ? 512 : 1073}
      preload={preload}
      src={src}
      unoptimized
      width={isSymbol ? 512 : 1920}
    />
  );
}
