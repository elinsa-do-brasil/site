import { MapasExplorer } from "@/components/maps/mapas-explorer";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Mapas regionais",
  description:
    "Explore as regionais, bases operacionais e municípios atendidos pela Elinsa do Brasil no Pará.",
  path: "/mapas",
});

export default function MapasPage() {
  return <MapasExplorer />;
}
