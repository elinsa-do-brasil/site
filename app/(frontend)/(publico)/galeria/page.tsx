import { Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PageTransition } from "@/components/ui/page-transition";
import { getGalleryPage } from "@/lib/gallery";

const GALLERY_DESCRIPTION =
  "Registros das equipes, dos projetos e da operação da Elinsa do Brasil em campo.";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeria de fotos",
  description: GALLERY_DESCRIPTION,
  alternates: {
    canonical: "/galeria",
  },
  openGraph: {
    title: "Galeria de fotos | Elinsa",
    description: GALLERY_DESCRIPTION,
    locale: "pt_BR",
    siteName: "Elinsa do Brasil",
    type: "website",
  },
};

export default async function GaleriaPage() {
  const initialPage = await getGalleryPage();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-24 text-foreground">
        <div className="mx-auto w-full max-w-6xl px-4">
          <PageHeader
            description={GALLERY_DESCRIPTION}
            eyebrow="Operação em campo"
            meta={
              initialPage.totalDocs > 0 ? (
                <Badge variant="outline">
                  {initialPage.totalDocs}{" "}
                  {initialPage.totalDocs === 1 ? "registro" : "registros"}
                </Badge>
              ) : undefined
            }
            title="Galeria de fotos"
          />
        </div>

        <section
          aria-label="Fotos da galeria"
          className="mx-auto w-full max-w-[96rem] px-3 pb-12 sm:px-4 lg:px-6"
        >
          {initialPage.photos.length > 0 ? (
            <GalleryExplorer initialPage={initialPage} />
          ) : (
            <GalleryEmptyState />
          )}
        </section>
      </div>
    </PageTransition>
  );
}

function GalleryEmptyState() {
  return (
    <Empty className="min-h-80 border bg-muted/25">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Image01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>
          <h2>A galeria está sendo preparada</h2>
        </EmptyTitle>
        <EmptyDescription>
          Os próximos registros da operação serão publicados aqui.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
