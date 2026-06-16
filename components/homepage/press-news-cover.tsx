"use client";

import { Newspaper } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type PressNewsCoverImage = {
  alt?: null | string;
  url: string;
};

type PressNewsCoverProps = {
  image: null | PressNewsCoverImage;
  sizes: string;
  variant?: "default" | "featured";
};

export function PressNewsCover({
  image,
  sizes,
  variant = "default",
}: PressNewsCoverProps) {
  const [imageStatus, setImageStatus] = useState<
    "failed" | "idle" | "loaded" | "pending"
  >("pending");

  useEffect(() => {
    if (!image) {
      setImageStatus("failed");
      return;
    }

    setImageStatus("idle");

    const timeout = window.setTimeout(() => {
      setImageStatus((currentStatus) =>
        currentStatus === "loaded" ? currentStatus : "failed",
      );
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [image?.url, image]);

  if (!image || imageStatus === "failed" || imageStatus === "pending") {
    return <PressNewsCoverFallback variant={variant} />;
  }

  return (
    <Image
      alt={image.alt ?? ""}
      className={cn(
        "object-cover object-center",
        variant === "featured"
          ? "transition duration-700 group-hover:scale-105"
          : "transition duration-500 group-hover:scale-105",
      )}
      fill
      onError={() => setImageStatus("failed")}
      onLoad={() => setImageStatus("loaded")}
      sizes={sizes}
      src={image.url}
    />
  );
}

function PressNewsCoverFallback({
  variant = "default",
}: {
  variant?: "default" | "featured";
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-elinsa-dark">
      <Newspaper
        aria-hidden="true"
        className={cn(
          "text-white/25",
          variant === "featured" ? "size-28" : "size-20",
        )}
        strokeWidth={1.5}
      />
    </div>
  );
}
