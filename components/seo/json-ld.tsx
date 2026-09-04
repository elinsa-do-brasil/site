// Injeta o resultado de qualquer createXStructuredData (lib/structuredData.ts) como <script type="application/ld+json"> — usado nas páginas de artigo, vaga, home e marca.
import { serializeJsonLd } from "@/lib/structuredData";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized with HTML starts escaped.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
