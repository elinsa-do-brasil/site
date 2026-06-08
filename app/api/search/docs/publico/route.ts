import { createFromSource } from "fumadocs-core/search/server";
import { publicDocs } from "@/lib/source";

export const revalidate = false;

export const { staticGET: GET } = createFromSource(publicDocs, {
  language: "portuguese",
});
