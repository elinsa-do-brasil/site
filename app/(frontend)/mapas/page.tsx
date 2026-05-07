import type { Metadata } from "next";
import { MapasExplorer } from "@/components/maps/mapas-explorer";

export const metadata: Metadata = {
  title: "Mapas regionais - Elinsa",
  description:
    "Mapa operacional das regionais, bases e municípios atendidos pela Elinsa.",
};

export default function MapasPage() {
  return <MapasExplorer />;
}
