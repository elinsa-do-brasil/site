"use client";

import { CursorPointer02Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image, { getImageProps } from "next/image";
import {
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { GalleryPhoto } from "@/lib/gallery";
import { cn } from "@/lib/utils";

const GALLERY_GRID_SIZES =
  "(min-width: 1536px) 486px, (min-width: 1024px) calc(33.333vw - 1.667rem), (min-width: 640px) calc(50vw - 1.375rem), calc(100vw - 1.5rem)";
const GALLERY_LIGHTBOX_SIZES =
  "(min-width: 1568px) 1152px, (min-width: 1024px) calc(100vw - 26rem), (min-width: 640px) calc(100vw - 2rem), calc(100vw - 1rem)";
const IMAGE_DECODE_TIMEOUT_MS = 1000;
const INTENT_WARMUP_DELAY_MS = 150;
const VIEWER_SPINNER_DELAY_MS = 250;

type ImageLoadState = "error" | "loading" | "ready";
type WarmupPriority = "high" | "low";
type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

const activeWarmups = new Map<string, HTMLImageElement>();
const warmedPhotos = new Set<string>();

type GalleryFeedPhotoProps = {
  index: number;
  onOpen: (trigger: HTMLButtonElement) => void;
  onSourceReady: (photoId: string, source: string) => void;
  photo: GalleryPhoto;
  totalPhotoCount: number;
};

export function GalleryFeedPhoto({
  index,
  onOpen,
  onSourceReady,
  photo,
  totalPhotoCount,
}: GalleryFeedPhotoProps) {
  const [loadState, setLoadState] = useState<ImageLoadState>("loading");
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastReportedSourceRef = useRef<string | null>(null);
  const warmupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reportLoadedImage = useCallback(
    (image: HTMLImageElement) => {
      if (!(image.complete && image.naturalWidth > 0)) {
        return;
      }

      setLoadState("ready");

      const source = image.currentSrc || image.src;

      if (source && source !== lastReportedSourceRef.current) {
        lastReportedSourceRef.current = source;
        onSourceReady(String(photo.id), source);
      }
    },
    [onSourceReady, photo.id],
  );

  const setImageRef = useCallback(
    (image: HTMLImageElement | null) => {
      imageRef.current = image;

      if (image) {
        reportLoadedImage(image);
      }
    },
    [reportLoadedImage],
  );

  const cancelWarmup = useCallback(() => {
    if (warmupTimerRef.current !== null) {
      clearTimeout(warmupTimerRef.current);
      warmupTimerRef.current = null;
    }
  }, []);

  const scheduleWarmup = useCallback(() => {
    cancelWarmup();

    if (!canSpeculativelyWarmGalleryImages()) {
      return;
    }

    warmupTimerRef.current = setTimeout(() => {
      warmupTimerRef.current = null;
      warmGalleryPhoto(photo, "low");
    }, INTENT_WARMUP_DELAY_MS);
  }, [cancelWarmup, photo]);

  useEffect(() => cancelWarmup, [cancelWarmup]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") {
      cancelWarmup();
    }

    warmGalleryPhoto(photo, "high");
  };

  const handleOpen = (trigger: HTMLButtonElement) => {
    cancelWarmup();

    if (imageRef.current) {
      reportLoadedImage(imageRef.current);
    }

    warmGalleryPhoto(photo, "high");
    onOpen(trigger);
  };

  const imageUnavailable = loadState === "error";

  return (
    <button
      aria-busy={loadState === "loading" || undefined}
      aria-haspopup="dialog"
      aria-label={
        imageUnavailable
          ? `Foto ${index + 1} indisponível: ${photo.alt}`
          : `Abrir foto ${index + 1} de ${totalPhotoCount}: ${photo.alt}`
      }
      className="group relative block w-full overflow-hidden rounded-xl bg-muted text-left shadow-sm outline-none ring-offset-2 ring-offset-background transition-[transform,box-shadow] duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-elinsa-primary motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
      data-image-state={loadState}
      data-orientation={photo.height > photo.width ? "vertical" : "horizontal"}
      data-slot="gallery-feed-photo"
      disabled={imageUnavailable}
      onBlur={cancelWarmup}
      onClick={(event) => handleOpen(event.currentTarget)}
      onFocus={scheduleWarmup}
      onPointerDown={handlePointerDown}
      onPointerEnter={scheduleWarmup}
      onPointerLeave={cancelWarmup}
      type="button"
    >
      <Skeleton
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 size-full rounded-none transition-opacity duration-200 motion-reduce:transition-none",
          loadState !== "loading" && "opacity-0",
        )}
      />

      <Image
        alt={photo.alt}
        blurDataURL={photo.blurDataUrl}
        className={cn(
          "h-auto w-full transition-opacity duration-300 motion-reduce:transition-none",
          loadState === "loading" && !photo.blurDataUrl && "opacity-0",
          imageUnavailable && "invisible",
        )}
        fetchPriority={index === 0 ? "high" : undefined}
        height={photo.height}
        loading={index === 0 ? "eager" : "lazy"}
        onError={() => setLoadState("error")}
        onLoad={(event) => reportLoadedImage(event.currentTarget)}
        placeholder={photo.blurDataUrl ? "blur" : "empty"}
        quality={100}
        ref={setImageRef}
        sizes={GALLERY_GRID_SIZES}
        src={photo.url}
        width={photo.width}
      />

      {imageUnavailable ? (
        <Empty
          aria-live="polite"
          className="absolute inset-0 rounded-none border-0 bg-muted p-4"
          role="status"
        >
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Image01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Imagem indisponível</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          />
          <Badge
            aria-hidden="true"
            className="pointer-events-none absolute right-3 bottom-3 translate-y-1 border-white/20 bg-black/55 p-4 text-xs font-semibold text-white opacity-0 shadow-sm backdrop-blur-md transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
            variant="outline"
          >
            <HugeiconsIcon icon={CursorPointer02Icon} strokeWidth={2} />
            Abrir
          </Badge>
        </>
      )}
    </button>
  );
}

type GalleryViewerImageProps = {
  adjacentPhotos: GalleryPhoto[];
  photo: GalleryPhoto;
  previewSrc?: string;
};

export function GalleryViewerImage({
  adjacentPhotos,
  photo,
  previewSrc,
}: GalleryViewerImageProps) {
  const [loadState, setLoadState] = useState<ImageLoadState>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);
  const decodedImageRef = useRef<HTMLImageElement | null>(null);
  const highResolutionContainerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (loadState !== "loading") {
      return;
    }

    const timer = setTimeout(
      () => setShowSpinner(true),
      VIEWER_SPINNER_DELAY_MS,
    );

    return () => clearTimeout(timer);
  }, [loadState]);

  useEffect(() => {
    if (
      loadState !== "ready" ||
      adjacentPhotos.length === 0 ||
      !canSpeculativelyWarmGalleryImages()
    ) {
      return;
    }

    return scheduleIdleGalleryWarmup(() => {
      for (const adjacentPhoto of adjacentPhotos) {
        warmGalleryPhoto(adjacentPhoto, "low");
      }
    });
  }, [adjacentPhotos, loadState]);

  const handleLoad = useCallback(async (image: HTMLImageElement) => {
    if (decodedImageRef.current === image) {
      return;
    }

    decodedImageRef.current = image;

    let decodeTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
      await Promise.race([
        image.decode(),
        new Promise<void>((resolve) => {
          decodeTimeout = setTimeout(resolve, IMAGE_DECODE_TIMEOUT_MS);
        }),
      ]);
    } catch {
      // Some browsers reject decode() even after a successful load.
    } finally {
      if (decodeTimeout) {
        clearTimeout(decodeTimeout);
      }
    }

    if (!mountedRef.current) {
      return;
    }

    setShowSpinner(false);
    setLoadState("ready");
  }, []);

  const handleError = useCallback(() => {
    setShowSpinner(false);
    setLoadState("error");
  }, []);

  useEffect(() => {
    if (loadState !== "loading") {
      return;
    }

    const checkNativeImageState = () => {
      const image = highResolutionContainerRef.current?.querySelector("img");

      if (!image?.complete) {
        return;
      }

      if (image.naturalWidth > 0) {
        void handleLoad(image);
        return;
      }

      if (image.currentSrc) {
        handleError();
      }
    };

    checkNativeImageState();
    const interval = setInterval(checkNativeImageState, 100);

    return () => clearInterval(interval);
  }, [handleError, handleLoad, loadState]);

  const retry = () => {
    setShowSpinner(false);
    setLoadState("loading");
    setRetryCount((currentRetryCount) => currentRetryCount + 1);
  };

  const showHighResolutionImage =
    loadState === "ready" || (!previewSrc && loadState === "loading");

  return (
    <>
      {previewSrc ? (
        <>
          {/* biome-ignore lint/performance/noImgElement: currentSrc is already a Next-optimized response and must be reused byte-for-byte from the browser cache. */}
          <img
            alt=""
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 size-full object-contain transition-opacity duration-200 motion-reduce:transition-none",
              loadState === "ready" && "opacity-0",
            )}
            data-slot="gallery-cached-preview"
            src={previewSrc}
          />
        </>
      ) : null}

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none",
          showHighResolutionImage ? "opacity-100" : "opacity-0",
        )}
        ref={highResolutionContainerRef}
      >
        <Image
          alt={photo.alt}
          blurDataURL={photo.blurDataUrl}
          className="object-contain"
          data-image-state={loadState}
          fetchPriority="high"
          fill
          key={`${photo.id}:${retryCount}`}
          loading="eager"
          onError={handleError}
          onLoad={(event) => void handleLoad(event.currentTarget)}
          placeholder={photo.blurDataUrl ? "blur" : "empty"}
          quality={100}
          sizes={GALLERY_LIGHTBOX_SIZES}
          src={photo.url}
        />
      </div>

      {loadState === "loading" && showSpinner ? (
        <Badge
          className="absolute top-1/2 left-1/2 -translate-1/2 shadow-lg"
          data-slot="gallery-viewer-loading"
          role="status"
          variant="secondary"
        >
          <Spinner aria-hidden="true" />
          Carregando imagem em alta resolução
        </Badge>
      ) : null}

      {loadState === "error" ? (
        <Alert
          className="absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2 shadow-xl"
          data-slot="gallery-viewer-error"
        >
          <AlertTitle>Não foi possível carregar a imagem completa</AlertTitle>
          <AlertDescription>
            A prévia permanece disponível. Tente carregar novamente.
          </AlertDescription>
          <Button
            className="mt-2 w-fit"
            onClick={retry}
            size="sm"
            type="button"
          >
            Tentar novamente
          </Button>
        </Alert>
      ) : null}
    </>
  );
}

function canSpeculativelyWarmGalleryImages() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;

  if (!connection) {
    return true;
  }

  return !(
    connection.saveData ||
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g"
  );
}

function warmGalleryPhoto(
  photo: GalleryPhoto,
  priority: WarmupPriority = "low",
) {
  if (typeof window === "undefined") {
    return;
  }

  const key = `${photo.id}:${photo.url}`;

  if (warmedPhotos.has(key)) {
    return;
  }

  const activeWarmup = activeWarmups.get(key);

  if (activeWarmup) {
    if (priority === "high") {
      activeWarmup.fetchPriority = "high";
    }

    return;
  }

  const { props } = getImageProps({
    alt: "",
    fill: true,
    quality: 100,
    sizes: GALLERY_LIGHTBOX_SIZES,
    src: photo.url,
  });
  const image = new window.Image();

  image.decoding = "async";
  image.fetchPriority = priority;
  image.loading = "eager";

  if (props.sizes) {
    image.sizes = props.sizes;
  }

  if (props.srcSet) {
    image.srcset = props.srcSet;
  }

  image.addEventListener(
    "load",
    () => {
      warmedPhotos.add(key);
      activeWarmups.delete(key);
    },
    { once: true },
  );
  image.addEventListener(
    "error",
    () => {
      activeWarmups.delete(key);
    },
    { once: true },
  );

  activeWarmups.set(key, image);
  image.src = props.src;
  void image.decode().catch(() => undefined);
}

function scheduleIdleGalleryWarmup(callback: () => void) {
  if (typeof window === "undefined") {
    return;
  }

  const requestIdleCallback = Reflect.get(window, "requestIdleCallback") as
    | typeof window.requestIdleCallback
    | undefined;
  const cancelIdleCallback = Reflect.get(window, "cancelIdleCallback") as
    | typeof window.cancelIdleCallback
    | undefined;

  if (requestIdleCallback) {
    const handle = requestIdleCallback(callback, { timeout: 1500 });

    return () => cancelIdleCallback?.(handle);
  }

  const handle = globalThis.setTimeout(callback, 200);

  return () => globalThis.clearTimeout(handle);
}
