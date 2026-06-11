import {
  type JSXConvertersFunction,
  RichText,
} from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { createElement } from "react";
import {
  createHeadingId,
  getRichTextNodeText,
  isTrackedHeadingTag,
} from "@/lib/editorial";
import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

type RichTextData = Parameters<typeof RichText>[0]["data"];
type MediaSize = "large" | "normal" | "small";
type MediaAlignment = "center" | "left" | "right";
type PayloadMedia = {
  alt?: null | string;
  blurDataUrl?: null | string;
  captionsUrl?: null | string;
  filename?: null | string;
  height?: null | number;
  mimeType?: null | string;
  sizes?: null | Record<
    string,
    {
      height?: null | number;
      url?: null | string;
      width?: null | number;
    }
  >;
  url?: null | string;
  width?: null | number;
};
type UploadNode = {
  fields?: {
    alignment?: MediaAlignment | null;
    caption?: null | string;
    size?: MediaSize | null;
  };
  value?: PayloadMedia | number | string;
};
type YouTubeBlockNode = {
  fields?: {
    aspectRatio?: "16:9" | "1:1" | "4:3" | null;
    title?: null | string;
    url?: null | string;
  };
};

export function EditorialRichText({ data }: { data: unknown }) {
  return (
    <div className="min-w-0 text-[1.02rem] leading-8 text-foreground/82 [&>*:first-child]:mt-0 [&_a]:font-semibold [&_a]:text-elinsa-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-elinsa-primary/45 [&_blockquote]:pl-5 [&_blockquote]:text-foreground/70 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-40 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:tracking-normal [&_h2]:text-elinsa-dark dark:[&_h2]:text-elinsa-sky [&_h3]:mt-9 [&_h3]:mb-3 [&_h3]:scroll-mt-40 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:tracking-normal [&_h4]:mt-8 [&_h4]:mb-2 [&_h4]:scroll-mt-40 [&_h4]:text-xl [&_h4]:font-bold [&_hr]:my-10 [&_hr]:border-border [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_p]:max-w-3xl [&_strong]:text-foreground [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
      {data ? (
        <RichText
          converters={createEditorialConverters()}
          data={data as RichTextData}
          disableContainer
        />
      ) : (
        <p>Conteúdo em preparação.</p>
      )}
    </div>
  );
}

function createEditorialConverters(): JSXConvertersFunction {
  const usedHeadings = new Map<string, number>();

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const tag = isTrackedHeadingTag(node.tag) ? node.tag : "h2";
      const children = nodesToJSX({
        nodes: Array.isArray(node.children) ? node.children : [],
      });
      const title = getRichTextNodeText(node).trim();
      const id = title ? createHeadingId(title, usedHeadings) : undefined;

      return createElement(tag, id ? { id } : undefined, children);
    },
    relationship: () => null,
    upload: ({ node }: { node: unknown }) => renderUpload(node as UploadNode),
    blocks: {
      youtubeEmbed: ({ node }: { node: unknown }) =>
        renderYouTubeEmbed(node as YouTubeBlockNode),
    },
  });
}

function renderUpload(node: UploadNode) {
  const media = node.value;

  if (!media || typeof media !== "object") {
    return null;
  }

  const mimeType = media.mimeType || "";

  if (mimeType.startsWith("video/")) {
    return renderVideo(media, node.fields);
  }

  if (mimeType.startsWith("image/")) {
    return renderImage(media, node.fields);
  }

  if (!media.url) {
    return null;
  }

  return (
    <a href={media.url} rel="noopener noreferrer" target="_blank">
      {media.filename || "Abrir arquivo"}
    </a>
  );
}

function renderImage(media: PayloadMedia, fields: UploadNode["fields"] = {}) {
  const requestedSize = fields?.size || "normal";
  const sizeName =
    requestedSize === "large"
      ? "hero"
      : requestedSize === "small"
        ? "thumbnail"
        : "card";
  const sizedImage = media.sizes?.[sizeName];
  const src = sizedImage?.url || media.url;

  if (!src) {
    return null;
  }

  const width = sizedImage?.width || media.width || 1200;
  const height = sizedImage?.height || media.height || 675;
  const alt = media.alt || media.filename || "";

  return (
    <MediaFigure
      alignment={fields?.alignment}
      caption={fields?.caption}
      size={requestedSize}
    >
      <Image
        alt={alt}
        blurDataURL={media.blurDataUrl || undefined}
        className="h-auto w-full rounded-md border border-border/70 object-cover shadow-sm"
        height={height}
        placeholder={media.blurDataUrl ? "blur" : "empty"}
        sizes="(min-width: 1024px) 52rem, 100vw"
        src={src}
        width={width}
      />
    </MediaFigure>
  );
}

function renderVideo(media: PayloadMedia, fields: UploadNode["fields"] = {}) {
  if (!media.url) {
    return null;
  }

  return (
    <MediaFigure
      alignment={fields?.alignment}
      caption={fields?.caption || media.alt}
      size={fields?.size || "normal"}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: legendas VTT sao opcionais por midia e renderizadas quando cadastradas. */}
      <video
        aria-label={media.alt || media.filename || "Vídeo"}
        className="w-full rounded-md border border-border/70 bg-black shadow-sm"
        controls
        playsInline
        preload="metadata"
      >
        <source src={media.url} type={media.mimeType || undefined} />
        {media.captionsUrl ? (
          <track
            default
            kind="captions"
            label="Português"
            src={media.captionsUrl}
            srcLang="pt-BR"
          />
        ) : null}
        Seu navegador não suporta vídeo HTML5.
      </video>
    </MediaFigure>
  );
}

function renderYouTubeEmbed(node: YouTubeBlockNode) {
  const src = getYouTubeEmbedUrl(node.fields?.url || undefined);

  if (!src) {
    return null;
  }

  const aspectRatio = node.fields?.aspectRatio || "16:9";

  return (
    <MediaFigure alignment="center" size="large">
      <div
        className="relative w-full overflow-hidden rounded-md border border-border/70 bg-black shadow-sm"
        style={{ aspectRatio: aspectRatio.replace(":", " / ") }}
      >
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={src}
          title={node.fields?.title || "Vídeo do YouTube"}
        />
      </div>
    </MediaFigure>
  );
}

function MediaFigure({
  alignment = "center",
  caption,
  children,
  size = "normal",
}: {
  alignment?: MediaAlignment | null;
  caption?: null | string;
  children: React.ReactNode;
  size?: MediaSize | null;
}) {
  return (
    <figure
      className={cn(
        "my-8 min-w-0",
        size === "small" && "max-w-md",
        size === "normal" && "max-w-3xl",
        size === "large" && "max-w-5xl",
        alignment === "left" && "mr-auto",
        alignment === "right" && "ml-auto",
        (!alignment || alignment === "center") && "mx-auto",
      )}
    >
      {children}
      {caption ? (
        <figcaption className="mt-2 text-sm leading-6 text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
