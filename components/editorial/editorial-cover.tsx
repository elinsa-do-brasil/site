"use client";

import { ImageNotFound01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useState } from "react";

type EditorialCoverProps = {
  alt: string;
  blurDataURL?: string | null;
  className?: string;
  sizes: string;
  src?: string | null;
};

export function EditorialCover({
  alt,
  blurDataURL,
  className,
  sizes,
  src,
}: EditorialCoverProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageSrc = src && !hasImageError ? src : null;

  return (
    <>
      <EditorialCoverFallback />
      {imageSrc ? (
        <Image
          alt={alt}
          blurDataURL={blurDataURL ?? undefined}
          className={className}
          fill
          onError={() => setHasImageError(true)}
          placeholder={blurDataURL ? "blur" : "empty"}
          sizes={sizes}
          src={imageSrc}
        />
      ) : null}
    </>
  );
}

function EditorialCoverFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#dff5fc_0%,#88c4d6_46%,#0c4b61_100%)] text-white dark:bg-[linear-gradient(145deg,#103746_0%,#0b2631_48%,#031018_100%)]"
    >
      <div className="flex flex-col items-center gap-3 text-center drop-shadow-[0_24px_42px_rgba(0,0,0,0.45)]">
        <span className="grid size-16 place-items-center rounded-xl border border-white/25 bg-white/12 backdrop-blur">
          <HugeiconsIcon icon={ImageNotFound01Icon} strokeWidth={2} />
        </span>
        <span className="text-xs font-semibold uppercase text-white/80">
          Imagem indisponível
        </span>
      </div>
    </div>
  );
}
