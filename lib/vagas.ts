import configPromise from "@payload-config";
import { getPayload, type Where } from "payload";
import { getVagaCidadeLabel, type VagaCidadeValue } from "@/lib/vaga-options";

export type VagaStatus = "aberta" | "fechada";

export type Vaga = {
  city: VagaCidadeValue | string;
  content?: null | unknown;
  createdAt?: string;
  id: number | string;
  jobStatus: VagaStatus;
  publishedAt?: null | string;
  sector: string;
  slug?: null | string;
  summary: string;
  title: string;
  updatedAt?: string;
};

export async function getVagasAbertas(): Promise<Vaga[]> {
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "vagas",
    depth: 0,
    draft: false,
    limit: 100,
    sort: "-publishedAt",
    where: {
      jobStatus: {
        equals: "aberta",
      },
    },
  });

  return docs as Vaga[];
}

export async function getVagaBySlug({
  draft,
  slug,
}: {
  draft: boolean;
  slug: string;
}): Promise<Vaga | null> {
  const payload = await getPayload({ config: configPromise });

  const where: Where = draft
    ? {
        slug: {
          equals: slug,
        },
      }
    : {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            jobStatus: {
              equals: "aberta",
            },
          },
        ],
      };

  const { docs } = await payload.find({
    collection: "vagas",
    depth: 0,
    draft,
    limit: 1,
    where,
  });

  return (docs[0] as Vaga | undefined) ?? null;
}

export function formatVagaDate(dateString: null | string | undefined) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date(dateString));
}

export function getVagaLocationLabel(vaga: Vaga) {
  return getVagaCidadeLabel(vaga.city);
}
