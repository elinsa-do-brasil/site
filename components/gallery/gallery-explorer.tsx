"use client";

import { ChevronLeft, ChevronRight, Download, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GalleryPhoto } from "@/lib/gallery";

type GalleryExplorerProps = {
  photos: GalleryPhoto[];
};

export function GalleryExplorer({ photos }: GalleryExplorerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedPhoto =
    selectedIndex === null ? undefined : photos[selectedIndex];

  const closePhoto = useCallback(() => {
    setSelectedIndex(null);

    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const showPreviousPhoto = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || photos.length < 2) {
        return currentIndex;
      }

      return (currentIndex - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const showNextPhoto = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || photos.length < 2) {
        return currentIndex;
      }

      return (currentIndex + 1) % photos.length;
    });
  }, [photos.length]);

  useEffect(() => {
    if (selectedIndex === null || photos.length < 2) {
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
  }, [photos.length, selectedIndex, showNextPhoto, showPreviousPhoto]);

  const openPhoto = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setSelectedIndex(index);
  };

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
        className="columns-1 gap-3 sm:columns-2 lg:columns-3 lg:gap-4"
      >
        {photos.map((photo, index) => (
          <li className="mb-3 break-inside-avoid lg:mb-4" key={photo.id}>
            <button
              aria-haspopup="dialog"
              aria-label={`Abrir foto ${index + 1} de ${photos.length}: ${photo.alt}`}
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
                decoding="async"
                height={photo.height}
                placeholder={photo.blurDataUrl ? "blur" : "empty"}
                preload={index === 0}
                sizes="(min-width: 1536px) 500px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                src={photo.url}
                width={photo.width}
              />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-sm backdrop-blur-md transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                <Expand className="size-3.5" />
                Abrir
              </span>
            </button>
          </li>
        ))}
      </ol>

      {selectedPhoto && selectedIndex !== null ? (
        <DialogContent
          className="z-[120] h-[calc(100dvh-1rem)] max-h-[64rem] w-[calc(100%-1rem)] max-w-[96rem] gap-0 overflow-hidden rounded-xl border-white/10 bg-neutral-950 p-0 text-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:rounded-2xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
          }}
          overlayClassName="z-[110] bg-black/90 backdrop-blur-md"
          showCloseButton={false}
        >
          <figure className="grid h-full min-h-0 grid-rows-[minmax(10rem,1fr)_minmax(10rem,42dvh)] lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-1">
            <div className="relative min-h-0 overflow-hidden bg-[#080a0c] ring-1 ring-inset ring-white/10 dark:bg-surface-panel dark:ring-white/15">
              <Image
                alt={selectedPhoto.alt}
                blurDataURL={selectedPhoto.blurDataUrl}
                className="object-contain"
                fill
                key={selectedPhoto.id}
                loading="eager"
                placeholder={selectedPhoto.blurDataUrl ? "blur" : "empty"}
                sizes="(min-width: 1024px) calc(100vw - 24rem), 100vw"
                src={selectedPhoto.url}
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-linear-to-b from-black/70 to-transparent"
              />

              <p
                aria-hidden="true"
                className="absolute top-3 left-3 z-20 rounded-full border border-white/15 bg-black/55 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md sm:top-4 sm:left-4"
              >
                {selectedIndex + 1} de {photos.length}
              </p>

              <div className="absolute top-3 right-3 z-20 flex items-center gap-2 sm:top-4 sm:right-4">
                <a
                  aria-label={`Baixar foto ${selectedIndex + 1} de ${photos.length} no tamanho original`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/95 px-4 text-sm font-semibold text-elinsa-dark shadow-lg outline-none backdrop-blur-md transition-colors hover:bg-elinsa-light hover:text-elinsa-dark focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/60"
                  download
                  href={selectedPhoto.url}
                >
                  <Download aria-hidden="true" className="size-4" />
                  Baixar
                </a>

                <DialogClose asChild>
                  <Button
                    aria-label="Fechar visualização"
                    className="size-11 rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md hover:bg-black/80 hover:text-white focus-visible:border-white focus-visible:ring-white/50"
                    size="icon-lg"
                    type="button"
                    variant="ghost"
                  >
                    <X aria-hidden="true" className="size-5" />
                  </Button>
                </DialogClose>
              </div>

              {photos.length > 1 ? (
                <>
                  <Button
                    aria-keyshortcuts="ArrowLeft"
                    aria-label="Foto anterior"
                    className="absolute top-1/2 left-3 z-20 size-11 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md hover:bg-black/80 hover:text-white focus-visible:border-white focus-visible:ring-white/50 sm:left-4"
                    onClick={showPreviousPhoto}
                    size="icon-lg"
                    type="button"
                    variant="ghost"
                  >
                    <ChevronLeft aria-hidden="true" className="size-6" />
                  </Button>
                  <Button
                    aria-keyshortcuts="ArrowRight"
                    aria-label="Próxima foto"
                    className="absolute top-1/2 right-3 z-20 size-11 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur-md hover:bg-black/80 hover:text-white focus-visible:border-white focus-visible:ring-white/50 sm:right-4"
                    onClick={showNextPhoto}
                    size="icon-lg"
                    type="button"
                    variant="ghost"
                  >
                    <ChevronRight aria-hidden="true" className="size-6" />
                  </Button>
                </>
              ) : null}
            </div>

            <figcaption className="flex min-h-0 flex-col overflow-y-auto bg-background text-foreground">
              <div className="p-5 sm:p-7 lg:p-8">
                <DialogTitle className="mt-2 text-xl font-bold text-elinsa-dark sm:text-2xl dark:text-elinsa-sky">
                  Nesta foto
                  <span className="sr-only">: {selectedPhoto.alt}</span>
                </DialogTitle>
                <DialogDescription className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {selectedPhoto.description}
                </DialogDescription>

                <p aria-atomic="true" aria-live="polite" className="sr-only">
                  Foto {selectedIndex + 1} de {photos.length}:{" "}
                  {selectedPhoto.alt}
                </p>
              </div>

              {photos.length > 1 ? (
                <p className="mt-auto hidden border-t border-border px-8 py-5 text-xs leading-5 text-muted-foreground lg:block">
                  Use as setas esquerda e direita do teclado para navegar entre
                  as fotos.
                </p>
              ) : null}
            </figcaption>
          </figure>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
