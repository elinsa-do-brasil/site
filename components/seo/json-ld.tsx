import { serializeJsonLd } from "@/lib/structured-data";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized with HTML starts escaped.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
