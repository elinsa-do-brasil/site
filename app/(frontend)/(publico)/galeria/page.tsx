import { Images } from "lucide-react";
import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { PageTransition } from "@/components/ui/page-transition";
import { getGalleryPhotos } from "@/lib/gallery";

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
  const photos = await getGalleryPhotos();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-24 text-foreground">
        <section
          aria-labelledby="galeria-heading"
          className="mx-auto w-full max-w-[96rem] px-3 py-6 sm:px-4 lg:px-6 lg:py-8"
        >
          <GalleryHeader photoCount={photos.length} />

          {photos.length > 0 ? (
            <GalleryExplorer photos={photos} />
          ) : (
            <GalleryEmptyState />
          )}
        </section>
      </div>
    </PageTransition>
  );
}

function GalleryHeader({ photoCount }: { photoCount: number }) {
  return (
    <header className="mb-5 flex flex-col gap-4 border-b border-border/70 pb-5 md:mb-6 md:flex-row md:items-end md:justify-between md:pb-6">
      <div className="max-w-2xl border-l-2 border-elinsa-primary pl-4 sm:pl-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-elinsa-primary">
          Operação em campo
        </p>
        <h1
          className="mt-1 text-3xl font-black leading-tight tracking-normal text-elinsa-dark md:text-4xl dark:text-elinsa-sky"
          id="galeria-heading"
        >
          Galeria de fotos
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
          {GALLERY_DESCRIPTION}
        </p>
      </div>

      {photoCount > 0 ? (
        <p className="w-fit rounded-full border border-elinsa-primary/25 bg-elinsa-primary/8 px-3 py-1.5 text-xs font-semibold text-elinsa-dark dark:text-elinsa-sky">
          {photoCount} {photoCount === 1 ? "registro" : "registros"}
        </p>
      ) : null}
    </header>
  );
}

function GalleryEmptyState() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/25 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-elinsa-primary shadow-sm">
        <Images aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-5 text-xl font-bold text-elinsa-dark dark:text-elinsa-sky">
        A galeria está sendo preparada
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Os próximos registros da operação serão publicados aqui.
      </p>
    </div>
  );
}
