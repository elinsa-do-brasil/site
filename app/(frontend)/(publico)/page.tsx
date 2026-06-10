import type { Metadata } from "next";
import { connection } from "next/server";
import { CareChannelSection } from "@/components/homepage/care-channel-section";
import { CompanyValuesSection } from "@/components/homepage/company-values-section";
import { getImpactMetrics } from "@/components/homepage/home-data";
import { HomeFinalCtaSection } from "@/components/homepage/home-final-cta-section";
import { HomeHeroSection } from "@/components/homepage/home-hero-section";
import { OperationSection } from "@/components/homepage/operation-section";
import { PressNewsSection } from "@/components/homepage/press-news-section";
import { ProvidedServicesSection } from "@/components/homepage/provided-services-section";
import { Separator } from "@/components/ui/separator";
import { getEditorialPosts } from "@/lib/editorial";

const HOME_TITLE =
  "Elinsa do Brasil | Infraestrutura elétrica empresarial no Pará";
const HOME_DESCRIPTION =
  "Obras, manutenção e suporte operacional em infraestrutura elétrica para o Grupo Equatorial Energia, com bases regionais no Pará.";
const HOME_OG_IMAGE = {
  alt: "Equipe técnica da Elinsa em operação de infraestrutura elétrica",
  height: 941,
  url: "/images/eletricistas.webp",
  width: 1672,
};
const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  ...(siteUrl
    ? {
        alternates: {
          canonical: "/",
        },
        metadataBase: siteUrl,
      }
    : {}),
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    locale: "pt_BR",
    siteName: "Elinsa do Brasil",
    type: "website",
    ...(siteUrl
      ? {
          images: [HOME_OG_IMAGE],
          url: "/",
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    ...(siteUrl ? { images: [HOME_OG_IMAGE.url] } : {}),
  },
};

function getPublicSiteUrl() {
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (vercelUrl ? `https://${vercelUrl}` : "");

  if (!candidate) {
    return undefined;
  }

  const normalized = /^[a-z][a-z\d+\-.]*:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;

  try {
    return new URL(normalized);
  } catch {
    return undefined;
  }
}

export default async function Home() {
  await connection();

  const latestPressPosts = await getEditorialPosts("imprensa", { limit: 3 });
  const impactMetrics = getImpactMetrics();

  return (
    <div className="bg-background text-foreground">
      <HomeHeroSection impactMetrics={impactMetrics} />
      <Separator />
      <OperationSection />
      <Separator />
      <ProvidedServicesSection />
      <Separator />
      <CompanyValuesSection />
      <Separator />
      <CareChannelSection impactMetrics={impactMetrics} />
      <Separator />
      <PressNewsSection posts={latestPressPosts} />
      <Separator />
      <HomeFinalCtaSection />
    </div>
  );
}
