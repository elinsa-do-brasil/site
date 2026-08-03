import { connection } from "next/server";
import { CareChannelSection } from "@/components/homepage/care-channel-section";
import { CompanyValuesSection } from "@/components/homepage/company-values-section";
import { getImpactMetrics } from "@/components/homepage/home-data";
import { HomeFinalCtaSection } from "@/components/homepage/home-final-cta-section";
import { HomeHeroSection } from "@/components/homepage/home-hero-section";
import { OperationSection } from "@/components/homepage/operation-section";
import { PressNewsSection } from "@/components/homepage/press-news-section";
import { ProvidedServicesSection } from "@/components/homepage/provided-services-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Separator } from "@/components/ui/separator";
import { getEditorialPosts } from "@/lib/editorial";
import { createPageMetadata } from "@/lib/seo";
import { createHomeStructuredData } from "@/lib/structured-data";

const HOME_TITLE = "Infraestrutura elétrica no Pará | Elinsa do Brasil";
const HOME_DESCRIPTION =
  "Obras, manutenção e suporte operacional em infraestrutura elétrica para o Grupo Equatorial Energia, com bases regionais no Pará.";

export const metadata = createPageMetadata({
  absoluteTitle: true,
  description: HOME_DESCRIPTION,
  image: {
    alt: "Equipe técnica da Elinsa em operação de infraestrutura elétrica",
    height: 941,
    url: "/images/eletricistas.webp",
    width: 1672,
  },
  path: "/",
  title: HOME_TITLE,
});

export default async function Home() {
  await connection();

  const latestPressPosts = await getEditorialPosts("imprensa", { limit: 3 });
  const impactMetrics = getImpactMetrics();

  return (
    <div className="bg-background text-foreground">
      <JsonLd data={createHomeStructuredData()} />
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
