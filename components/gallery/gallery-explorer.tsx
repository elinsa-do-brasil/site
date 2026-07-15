"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download, MousePointerClick } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getDocsUrl } from "@/lib/docs-url";
import type { GalleryPage, GalleryPhoto } from "@/lib/gallery";

const GALLERY_GRID_SIZES =
  "(min-width: 1536px) 486px, (min-width: 1024px) calc(33.333vw - 1.667rem), (min-width: 640px) calc(50vw - 1.375rem), calc(100vw - 1.5rem)";
const GALLERY_LIGHTBOX_SIZES =
  "(min-width: 1568px) 1152px, (min-width: 1024px) calc(100vw - 26rem), (min-width: 640px) calc(100vw - 2rem), calc(100vw - 1rem)";

type GalleryExplorerProps = {
  initialPage: GalleryPage;
};

type LoadState = "error" | "idle" | "loading";

type PaginationState = Pick<
  GalleryPage,
  "hasNextPage" | "nextPage" | "totalDocs"
>;

export function GalleryExplorer({ initialPage }: GalleryExplorerProps) {
  const [photos, setPhotos] = useState(initialPage.photos);
  const [pagination, setPagination] = useState<PaginationState>({
    hasNextPage: initialPage.hasNextPage,
    nextPage: initialPage.nextPage,
    totalDocs: initialPage.totalDocs,
  });
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadedIdsRef = useRef(
    new Set(initialPage.photos.map((photo) => String(photo.id))),
  );
  const loadMorePromiseRef = useRef<Promise<GalleryPhoto[]> | null>(null);
  const paginationRef = useRef<PaginationState>(pagination);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedPhoto =
    selectedIndex === null ? undefined : photos[selectedIndex];
  const totalPhotoCount = Math.max(pagination.totalDocs, photos.length);

  const loadMore = useCallback(() => {
    if (loadMorePromiseRef.current) {
      return loadMorePromiseRef.current;
    }

    const currentPagination = paginationRef.current;

    if (!currentPagination.hasNextPage || currentPagination.nextPage === null) {
      return Promise.resolve<GalleryPhoto[]>([]);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoadState("loading");

    const request = fetch(`/api/gallery?page=${currentPagination.nextPage}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Não foi possível carregar a próxima página.");
        }

        const data: unknown = await response.json();

        if (!isGalleryPage(data)) {
          throw new Error("A resposta da galeria é inválida.");
        }

        return data;
      })
      .then((page) => {
        const newPhotos = page.photos.filter((photo) => {
          const id = String(photo.id);

          if (loadedIdsRef.current.has(id)) {
            return false;
          }

          loadedIdsRef.current.add(id);
          return true;
        });
        const nextPagination = {
          hasNextPage: page.hasNextPage,
          nextPage: page.nextPage,
          totalDocs: page.totalDocs,
        };

        if (newPhotos.length > 0) {
          setPhotos((currentPhotos) => [...currentPhotos, ...newPhotos]);
        }

        paginationRef.current = nextPagination;
        setPagination(nextPagination);
        setLoadState("idle");

        return newPhotos;
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadState("error");
        }

        return [];
      })
      .finally(() => {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        loadMorePromiseRef.current = null;
      });

    loadMorePromiseRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !pagination.hasNextPage || loadState !== "idle") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      {
        rootMargin: "300px 0px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore, loadState, pagination.hasNextPage]);

  const closePhoto = useCallback(() => {
    setSelectedIndex(null);

    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const showPreviousPhoto = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || currentIndex <= 0) {
        return currentIndex;
      }

      return currentIndex - 1;
    });
  }, []);

  const showNextPhoto = useCallback(() => {
    if (selectedIndex === null) {
      return;
    }

    if (selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      return;
    }

    if (!pagination.hasNextPage) {
      return;
    }

    const lastLoadedIndex = photos.length - 1;

    void loadMore().then((newPhotos) => {
      if (newPhotos.length === 0) {
        return;
      }

      setSelectedIndex((currentIndex) =>
        currentIndex === lastLoadedIndex ? currentIndex + 1 : currentIndex,
      );
    });
  }, [loadMore, pagination.hasNextPage, photos.length, selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null || totalPhotoCount < 2) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousPhoto();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNextPhoto, showPreviousPhoto, totalPhotoCount]);

  const openPhoto = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setSelectedIndex(index);
  };

  const canShowPrevious = selectedIndex !== null && selectedIndex > 0;
  const canShowNext =
    selectedIndex !== null &&
    (selectedIndex < photos.length - 1 || pagination.hasNextPage);
  const isLoadingNext =
    loadState === "loading" && selectedIndex === photos.length - 1;

  return (
    <Dialog
      open={selectedIndex !== null}
      onOpenChange={(open) => {
        if (!open) {
          closePhoto();
        }
      }}
    >
      <ol
        aria-label="Fotos da galeria"
        className="columns-1 gap-3 sm:columns-2 lg:columns-3 lg:gap-4 max-w-6xl mx-auto px-4"
      >
        {photos.map((photo, index) => (
          <li className="mb-3 break-inside-avoid lg:mb-4" key={photo.id}>
            <button
              aria-haspopup="dialog"
              aria-label={`Abrir foto ${index + 1} de ${totalPhotoCount}: ${photo.alt}`}
              className="group relative block w-full overflow-hidden rounded-xl bg-muted text-left shadow-sm outline-none ring-offset-2 ring-offset-background transition-[transform,box-shadow] duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-elinsa-primary motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
              data-orientation={
                photo.height > photo.width ? "vertical" : "horizontal"
              }
              onClick={(event) => openPhoto(index, event.currentTarget)}
              type="button"
            >
              <Image
                alt={photo.alt}
                blurDataURL={photo.blurDataUrl}
                className="h-auto w-full"
                fetchPriority={index === 0 ? "high" : undefined}
                height={photo.height}
                loading={index === 0 ? "eager" : "lazy"}
                placeholder={photo.blurDataUrl ? "blur" : "empty"}
                quality={100}
                sizes={GALLERY_GRID_SIZES}
                src={photo.url}
                width={photo.width}
              />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              />
              <Badge
                aria-hidden="true"
                className="pointer-events-none absolute right-3 bottom-3 translate-y-1 border-white/20 bg-black/55 p-4 text-xs font-semibold text-white opacity-0 shadow-sm backdrop-blur-md transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                variant="outline"
              >
                <MousePointerClick size={24} />
                Abrir
              </Badge>
            </button>
          </li>
        ))}
      </ol>

      {pagination.hasNextPage ? (
        <div aria-hidden="true" className="h-px" ref={sentinelRef} />
      ) : null}

      {loadState === "loading" ? (
        <div className="mt-4" data-slot="gallery-loading-more">
          <p aria-live="polite" className="sr-only">
            Carregando mais fotos.
          </p>
          <GalleryLoadingSkeleton />
        </div>
      ) : null}

      {loadState === "error" ? (
        <div
          className="mt-5 flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/25 px-4 py-5 text-center sm:flex-row sm:justify-center sm:text-left"
          role="alert"
        >
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar mais fotos.
          </p>
          <Button
            onClick={() => void loadMore()}
            size="sm"
            type="button"
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {selectedPhoto && selectedIndex !== null ? (
        <DialogContent
          className="z-[120] isolate h-[calc(100dvh-1rem)] max-h-[64rem] w-[calc(100%-1rem)] max-w-[96rem] gap-0 overflow-hidden rounded-xl border-border-strong bg-[#080a0c] p-0 text-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:rounded-2xl dark:bg-surface-panel"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
          }}
          overlayClassName="z-[110] bg-black/90 backdrop-blur-md"
          showCloseButton={false}
        >
          <figure
            className="grid h-full min-h-0 grid-rows-[minmax(10rem,1fr)_minmax(10rem,42dvh)] lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-1"
            data-slot="gallery-viewer"
          >
            <div
              className="relative min-h-0 overflow-hidden bg-[#080a0c] dark:bg-surface-panel"
              data-slot="gallery-photo-stage"
            >
              <Image
                alt={selectedPhoto.alt}
                blurDataURL={selectedPhoto.blurDataUrl}
                className="object-contain"
                fetchPriority="high"
                fill
                key={selectedPhoto.id}
                loading="eager"
                placeholder={selectedPhoto.blurDataUrl ? "blur" : "empty"}
                quality={100}
                sizes={GALLERY_LIGHTBOX_SIZES}
                src={selectedPhoto.url}
              />

              <Badge
                aria-hidden="true"
                className="absolute top-3 left-3 z-20 h-8 border-white/15 bg-black/55 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md sm:top-4 sm:left-4"
                variant="outline"
              >
                {selectedIndex + 1} de {totalPhotoCount}
              </Badge>

              <div className="absolute top-3 right-3 z-20 flex items-center gap-2 sm:top-4 sm:right-4">
                <Button
                  asChild
                  className="rounded-full shadow-lg"
                  size="icon-sm"
                  variant="outline"
                >
                  <a
                    aria-label={`Baixar foto ${selectedIndex + 1} de ${totalPhotoCount} no tamanho original`}
                    download
                    href={selectedPhoto.url}
                  >
                    <Download />
                  </a>
                </Button>

                <DialogClose asChild>
                  <Button
                    aria-label="Fechar visualização"
                    className="rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md hover:bg-black/80 hover:text-white focus-visible:border-white focus-visible:ring-white/50"
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                  </Button>
                </DialogClose>
              </div>

              {totalPhotoCount > 1 ? (
                <>
                  <Button
                    aria-keyshortcuts="ArrowLeft"
                    aria-label="Foto anterior"
                    className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md hover:bg-black/80 hover:text-white focus-visible:border-white focus-visible:ring-white/50 sm:left-4"
                    disabled={!canShowPrevious}
                    onClick={showPreviousPhoto}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                  </Button>
                  <Button
                    aria-keyshortcuts="ArrowRight"
                    aria-label="Próxima foto"
                    className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md hover:bg-black/80 hover:text-white focus-visible:border-white focus-visible:ring-white/50 sm:right-4"
                    disabled={!canShowNext || isLoadingNext}
                    onClick={showNextPhoto}
                    size="icon-lg"
                    type="button"
                    variant="ghost"
                  >
                    {isLoadingNext ? (
                      <Spinner aria-hidden="true" />
                    ) : (
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                    )}
                  </Button>
                </>
              ) : null}
            </div>

            <figcaption
              className="flex min-h-0 flex-col overflow-y-auto border-border-strong border-t bg-[#dce6ea] text-foreground lg:border-t-0 lg:border-l dark:bg-surface-panel"
              data-slot="gallery-description-panel"
            >
              <div className="p-5 sm:p-7 lg:p-8">
                <DialogTitle className="mt-2 text-lg font-bold text-elinsa-dark dark:text-elinsa-sky">
                  Na imagem
                  <span className="sr-only">: {selectedPhoto.alt}</span>
                </DialogTitle>
                <DialogDescription className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {selectedPhoto.description}
                </DialogDescription>

                <p aria-atomic="true" aria-live="polite" className="sr-only">
                  Foto {selectedIndex + 1} de {totalPhotoCount}:{" "}
                  {selectedPhoto.alt}
                </p>
              </div>

              <p className="mt-auto hidden border-t border-border px-8 py-5 text-xs leading-5 text-muted-foreground lg:block">
                Pretende usar esta imagem? Por favor, confira a nossa{" "}
                <a
                  className="font-semibold text-elinsa-dark underline decoration-elinsa-dark/30 underline-offset-4 transition-colors hover:text-elinsa-sky hover:decoration-elinsa-sky/50 dark:text-elinsa-sky dark:decoration-elinsa-sky/30 dark:hover:text-white/80 dark:hover:decoration-text-white/80"
                  href={getDocsUrl("/pt/licencas/licenca-de-uso-imagens")}
                >
                  licença de uso de imagens
                </a>{" "}
                para mais informações.
              </p>
            </figcaption>
          </figure>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function GalleryLoadingSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="columns-1 gap-3 sm:columns-2 lg:columns-3 lg:gap-4"
    >
      <Skeleton className="mb-3 aspect-[4/3] w-full rounded-xl lg:mb-4" />
      <Skeleton className="mb-3 aspect-[3/4] w-full rounded-xl lg:mb-4" />
      <Skeleton className="mb-3 aspect-[16/10] w-full rounded-xl lg:mb-4" />
    </div>
  );
}

function isGalleryPage(value: unknown): value is GalleryPage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const page = value as Partial<GalleryPage>;

  return (
    Array.isArray(page.photos) &&
    typeof page.hasNextPage === "boolean" &&
    (page.nextPage === null || typeof page.nextPage === "number") &&
    typeof page.page === "number" &&
    typeof page.totalDocs === "number" &&
    typeof page.totalPages === "number"
  );
}
