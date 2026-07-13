import { Images } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { PageTransition } from "@/components/ui/page-transition";
import { type GalleryPhoto, getGalleryPhotos } from "@/lib/gallery";

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
          className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8"
        >
          <GalleryHeader photoCount={photos.length} />

          {photos.length > 0 ? (
            <GalleryGrid photos={photos} />
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
    <header className="relative mb-8 overflow-hidden border-b border-border pb-6 md:mb-10 md:pb-8">
      <div
        aria-hidden="true"
        className="absolute -right-12 top-0 size-36 rounded-full border border-elinsa-primary/15 md:size-52"
      />
      <div
        aria-hidden="true"
        className="absolute right-10 top-0 h-full w-px bg-linear-to-b from-transparent via-elinsa-primary/25 to-transparent"
      />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
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
          <p className="relative w-fit rounded-full border border-elinsa-primary/25 bg-elinsa-primary/8 px-3 py-1.5 text-xs font-semibold text-elinsa-dark dark:text-elinsa-sky">
            {photoCount} {photoCount === 1 ? "registro" : "registros"}
          </p>
        ) : null}
      </div>
    </header>
  );
}

function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <ol
      className="columns-1 gap-5 sm:columns-2 lg:columns-3"
      aria-label="Fotos da galeria"
    >
      {photos.map((photo, index) => {
        const descriptionId = `foto-${index + 1}-descricao`;

        return (
          <li className="mb-5 break-inside-avoid" key={photo.id}>
            <figure className="group overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-colors hover:border-elinsa-primary/45">
              <div className="overflow-hidden bg-muted">
                <Image
                  alt={photo.alt}
                  aria-describedby={descriptionId}
                  blurDataURL={photo.blurDataUrl}
                  className="h-auto w-full transition-transform duration-500 motion-safe:group-hover:scale-[1.015]"
                  height={photo.height}
                  placeholder={photo.blurDataUrl ? "blur" : "empty"}
                  preload={index === 0}
                  sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                  src={photo.url}
                  width={photo.width}
                />
              </div>

              <figcaption className="border-t border-border/70 px-4 py-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-elinsa-primary">
                  Registro {String(index + 1).padStart(2, "0")}
                </p>
                <p
                  className="mt-2 text-sm leading-6 text-muted-foreground"
                  id={descriptionId}
                >
                  {photo.description}
                </p>
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ol>
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
