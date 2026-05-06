"use client";

import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Map as MapComponent,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  useMap,
} from "@/components/ui/map";

interface BaseLocationProps {
  lng: number;
  lat: number;
  tooltip?: string;
}

interface BaseMapProps {
  geoJsonUrl: string;
  center: [number, number];
  zoom?: number;
  color?: string;
  fillColor?: string;
  title: string;
  description?: string;
  baseLocation?: BaseLocationProps;
  cleanMap?: boolean;
  href?: string;
}

function GeoJsonLayer({
  url,
  color = "#0ea5e9",
  fillColor = "#e2e8f0",
}: {
  url: string;
  color?: string;
  fillColor?: string;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map) return;

    const sourceId = `source-${url}`;
    const fillLayerId = `fill-${url}`;
    const lineLayerId = `line-${url}`;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: url,
      });
    }

    if (!map.getLayer(fillLayerId)) {
      map.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": fillColor,
          "fill-opacity": 0.03,
        },
      });
    }

    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 2,
        },
      });
    }

    return () => {
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, isLoaded, url, color, fillColor]);

  return null;
}

export function BaseMapCard({
  geoJsonUrl,
  center,
  zoom,
  color = "#0ea5e9", // borda azul
  fillColor = "#0ea5e9", // preenchimento azul (vai ficar translúcido)
  title,
  description,
  baseLocation,
  cleanMap = true,
  href,
}: BaseMapProps) {
  // Se tem localização base, um zoom de rua (ex: 14) fica melhor. Caso não passe zoom explícito, usa 14 ou 9.
  const effectiveZoom = zoom ?? (baseLocation ? 14 : 9);

  const cleanStyles = cleanMap
    ? {
        light:
          "https://api.maptiler.com/maps/base-v4/style.json?key=7VhWIxgYriUJMk5Om7Pj",
        dark: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
      }
    : undefined;

  return (
    <Card className="relative overflow-hidden w-full h-100 font-sans group">
      {/* Container expandido e movido para cima para compensar o gradiente inferior e deixar o pino bem visível */}
      <div className="absolute left-0 right-0 -top-30 h-130">
        <MapComponent
          center={baseLocation ? [baseLocation.lng, baseLocation.lat] : center}
          zoom={effectiveZoom}
          styles={cleanStyles}
          attributionControl={false}
        >
          {/* Opacidade menor (0.15) para permitir ver ruas e satélite no fundo */}
          <GeoJsonLayer url={geoJsonUrl} color={color} fillColor={fillColor} />

          {baseLocation && (
            <MapMarker longitude={baseLocation.lng} latitude={baseLocation.lat}>
              <MarkerContent>
                <div className="relative flex h-5 w-5 cursor-pointer">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-primary border-2 border-white"></span>
                </div>
              </MarkerContent>
              {baseLocation.tooltip && (
                <MarkerTooltip>
                  <p className="font-medium text-sm">{baseLocation.tooltip}</p>
                </MarkerTooltip>
              )}
            </MapMarker>
          )}
        </MapComponent>
      </div>

      {/* Gradiente subindo (da base pro topo) usando variáveis do tema */}
      <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/60 to-transparent pointer-events-none transition-opacity duration-200" />

      {/* Conteúdo sobreposto */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3 pointer-events-none">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground text-sm md:text-base">
              {description}
            </p>
          )}
        </div>

        <Button size={"lg"} className="w-fit pointer-events-auto" asChild>
          <a href={href || "#"} target="_blank" rel="noopener noreferrer">
            <MapPin /> Como chegar
          </a>
        </Button>
      </div>
    </Card>
  );
}
