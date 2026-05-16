import {
  ArrowDownToLine,
  CheckCircle2,
  Download,
  FileImage,
  FolderOpenDot,
  Palette,
  SwatchBook,
} from "lucide-react";
import type { Metadata } from "next";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { downloadAsset } from "@/lib/download-asset";

export const metadata: Metadata = {
  title: "Kit de marca",
  description:
    "Cores, logos e assinaturas oficiais da Elinsa do Brasil para materiais institucionais e digitais.",
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

type BrandAssetFile = {
  format: AssetFormat;
  href: string;
};

type BrandAsset = {
  name: string;
  description: string;
  preview: string;
  previewAlt: string;
  previewClassName: string;
  imageClassName: string;
  files: BrandAssetFile[];
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

const brandAssets: BrandAsset[] = [
  createAsset({
    name: "Logo colorido",
    description: "Assinatura preferencial para fundos claros.",
    fileName: "logo-colorido",
    previewClassName: "bg-white",
    imageClassName: "max-h-32 w-full max-w-lg",
  }),
  createAsset({
    name: "Logo branco",
    description: "Assinatura para fundos escuros.",
    fileName: "logo-branco",
    previewClassName: "bg-brand-logo-white",
    imageClassName: "max-h-32 w-full max-w-lg",
  }),
  createAsset({
    name: "Logo preto",
    description: "Versão neutra para materiais monocromáticos.",
    fileName: "logo-preto",
    previewClassName: "bg-white",
    imageClassName: "max-h-32 w-full max-w-lg",
  }),
  createAsset({
    name: "Símbolo azul",
    description: "Uso compacto da identidade na cor principal.",
    fileName: "e-azul",
    previewClassName: "bg-white",
    imageClassName: "max-h-28 w-28",
  }),
  createAsset({
    name: "Símbolo branco",
    description: "Símbolo compacto para fundos escuros.",
    fileName: "e-branco",
    previewClassName: "bg-brand-logo-white",
    imageClassName: "max-h-28 w-28",
  }),
  createAsset({
    name: "Símbolo preto",
    description: "Símbolo monocromático para aplicações neutras.",
    fileName: "e-preto",
    previewClassName: "bg-white",
    imageClassName: "max-h-28 w-28",
  }),
];

function createAsset({
  name,
  description,
  fileName,
  previewClassName,
  imageClassName,
}: {
  name: string;
  description: string;
  fileName: string;
  previewClassName: string;
  imageClassName: string;
}): BrandAsset {
  return {
    name,
    description,
    preview: `/kit-de-marca/svg/${fileName}.svg`,
    previewAlt: `${name} da Elinsa`,
    previewClassName,
    imageClassName,
    files: assetFormats.map((format) => ({
      format,
      href: downloadAsset(`kit-de-marca/${format}/${fileName}.${format}`),
    })),
  };
}

function BrandImage({
  src,
  alt,
  className,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    // biome-ignore lint/performance/noImgElement: arquivos de marca precisam ser exibidos exatamente como estao no public.
    <img
      src={src}
      alt={alt}
      className={cn("h-auto object-contain", className)}
      loading={loading}
    />
  );
}

function ColorCard({ color }: { color: BrandColor }) {
  return (
    <Card className="gap-0 rounded-md border border-border bg-card py-0 shadow-sm ring-0">
      <CardHeader
        className={cn(
          "flex min-h-36 flex-col justify-between p-5",
          color.textClassName,
        )}
        style={{ backgroundColor: color.hex }}
      >
        <span className="text-sm font-semibold">{color.role}</span>
        <div>
          <h3 className="text-2xl font-black tracking-normal">{color.name}</h3>
          <p className="mt-1 font-mono text-sm font-bold">{color.hex}</p>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <dl className="grid gap-3 text-sm">
          <div className="grid gap-1">
            <dt className="font-bold text-foreground">RGB</dt>
            <dd className="wrap-break-word font-mono text-muted-foreground">
              {color.rgb}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-bold text-foreground">HSL</dt>
            <dd className="wrap-break-word font-mono text-muted-foreground">
              {color.hsl}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-bold text-foreground">OKLCH</dt>
            <dd className="wrap-break-word font-mono text-muted-foreground">
              {color.oklch}
            </dd>
          </div>
        </dl>
      </CardContent>
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
    <Button
      asChild
      variant="outline"
      className="h-10 justify-center gap-1.5 px-2"
    >
      <a
        href={file.href}
        download
        aria-label={`Baixar ${asset.name} em ${file.format.toUpperCase()}`}
      >
        <Download className="size-3.5 text-elinsa-primary" />
        <span className="font-bold uppercase">{file.format}</span>
      </a>
    </Button>
  );
}

function AssetCard({ asset }: { asset: BrandAsset }) {
  return (
    <Card className="gap-0 rounded-md border border-border bg-card py-0 shadow-sm ring-0">
      <CardContent
        className={cn(
          "flex min-h-56 items-center justify-center p-8",
          asset.previewClassName,
        )}
      >
        <BrandImage
          src={asset.preview}
          alt={asset.previewAlt}
          className={asset.imageClassName}
        />
      </CardContent>

      <Separator />

      <CardHeader className="grid gap-3 p-5 pb-0">
        <CardTitle className="text-xl font-black tracking-normal">
          {asset.name}
        </CardTitle>
        <CardDescription className="text-sm leading-6">
          {asset.description}
        </CardDescription>
        <Badge
          variant="outline"
          className="w-fit rounded-md border-elinsa-primary/25 bg-elinsa-light px-2.5 py-1 text-elinsa-dark dark:bg-elinsa-primary/15 dark:text-elinsa-sky"
        >
          4 formatos
        </Badge>
      </CardHeader>

      <CardFooter className="grid grid-cols-2 gap-1.5 p-4 sm:grid-cols-4">
        {asset.files.map((file) => (
          <DownloadButton
            key={`${asset.name}-${file.format}`}
            asset={asset}
            file={file}
          />
        ))}
      </CardFooter>
    </Card>
  );
}

export default function MarcaPage() {
  const featuredAsset = brandAssets[0];

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border bg-background px-6 pb-14 pt-28 md:px-8 md:pb-16 md:pt-32 min-h-dvh">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-elinsa-primary/20 bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-dark">
              <SwatchBook className="size-4" />
              Identidade visual
            </div>
            <h1 className="text-xl font-black leading-[0.98] tracking-normal text-elinsa-dark sm:text-5xl md:text-3xl dark:text-white">
              Kit de marca
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/80 md:text-xl md:leading-8">
              Cores e assinaturas reunidas para manter a marca consistente em
              apresentações, comunicados, propostas e materiais digitais.
            </p>
          </div>

          <Card className="mt-10 gap-0 rounded-md border border-border bg-card py-0 shadow-sm ring-0">
            <CardContent className="grid gap-0 p-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="flex min-h-72 items-center justify-center bg-white p-8 dark:bg-elinsa-dark md:p-12">
                <BrandImage
                  src="/kit-de-marca/svg/logo-colorido.svg"
                  alt="Logo colorido da Elinsa do Brasil"
                  className="max-h-36 w-full max-w-3xl dark:hidden"
                  loading="eager"
                />
                <BrandImage
                  src="/kit-de-marca/svg/logo-branco.svg"
                  alt="Logo branco da Elinsa do Brasil"
                  className="hidden max-h-36 w-full max-w-3xl dark:block"
                  loading="eager"
                />
              </div>

              <CardContent className="border-t border-border p-6 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-elinsa-primary">
                  <CheckCircle2 className="size-4" />
                  Guia rápido
                </div>
                <CardTitle className="mt-4 text-2xl font-black tracking-normal">
                  Contraste primeiro. Formato depois.
                </CardTitle>
                <CardDescription className="mt-3 text-base leading-7">
                  Use a marca colorida sobre fundos claros. Em fundos escuros,
                  prefira a versão branca. As variações para download estão
                  organizadas abaixo.
                </CardDescription>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Button size="lg" asChild className="h-9">
                    <a href="#logos">
                      <FolderOpenDot />
                      Ver arquivos
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="h-9">
                    <a href={downloadAsset("kit-de-marca/kit.7z")} download>
                      <Download />
                      Baixar kit
                    </a>
                  </Button>
                </div>
              </CardContent>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="cores" className="px-6 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-dark">
                <Palette className="size-4" />
                Cores
              </div>
              <h2 className="text-3xl font-black tracking-normal md:text-4xl">
                Paleta oficial
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              O azul Elinsa conduz a identidade. Os cinzas dão apoio para
              textos, fundos e composições que precisam de mais sobriedade.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {brandColors.map((color) => (
              <ColorCard key={color.hex} color={color} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="logos"
        className="border-y border-border bg-muted/35 px-6 py-16 md:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-elinsa-primary/20 bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-dark">
                <FileImage className="size-4 text-elinsa-primary" />
                Logos
              </div>
              <h2 className="text-3xl font-black tracking-normal md:text-4xl">
                Arquivos para download
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Baixe a assinatura adequada ao fundo e ao tipo de peça. As versões
              colorida, branca e preta ficam separadas para evitar improvisos.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {brandAssets.map((asset) => (
              <AssetCard key={asset.name} asset={asset} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
