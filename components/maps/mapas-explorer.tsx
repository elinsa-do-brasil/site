"use client";

import {
  ArrowLeft,
  Building2,
  Check,
  CircleDot,
  Layers3,
  MapPin,
  Navigation,
} from "lucide-react";
import type { ExpressionSpecification } from "maplibre-gl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Map as MapComponent,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  useMap,
} from "@/components/ui/map";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Coordinates = [number, number];
type RegionalSlug = "centro" | "nordeste" | "oeste";
type ViewMode = "regional" | "base" | "municipio";

type Municipality = {
  slug: string;
  name: string;
};

type OperationalBase = {
  slug: string;
  name: string;
  color: string;
  marker: Coordinates;
  municipalities: Municipality[];
};

type Regional = {
  slug: RegionalSlug;
  name: string;
  description: string;
  center: Coordinates;
  color: string;
  bases: OperationalBase[];
};

type MunicipalityFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  Record<string, unknown>
>;

type MunicipalityFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  Record<string, unknown>
>;

type AggregatedMunicipality = {
  slug: string;
  name: string;
  features: MunicipalityFeature[];
};

type AggregatedBase = {
  slug: string;
  name: string;
  color: string;
  municipalities: AggregatedMunicipality[];
};

type AggregatedRegional = {
  slug: RegionalSlug;
  name: string;
  bases: AggregatedBase[];
};

const EMPTY_MUNICIPALITY_COLLECTION: MunicipalityFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const ACTIVE_SOURCE_ID = "mapas-active-source";
const ACTIVE_FILL_LAYER_ID = "mapas-active-fill";
const ACTIVE_LINE_LAYER_ID = "mapas-active-line";
const ACTIVE_LABEL_LAYER_ID = "mapas-active-label";
const DEFAULT_LAYER_COLOR = "#0ea5e9";
const BASE_COLOR_EXPRESSION: ExpressionSpecification = [
  "coalesce",
  ["get", "baseColor"],
  DEFAULT_LAYER_COLOR,
];
const MUNICIPALITY_NAME_EXPRESSION: ExpressionSpecification = [
  "get",
  "municipalityName",
];
const MUNICIPALITY_LABEL_SIZE_EXPRESSION: ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  4,
  10,
  7,
  12,
  10,
  15,
];

const CLEAN_MAP_STYLES = {
  light:
    "https://api.maptiler.com/maps/base-v4/style.json?key=7VhWIxgYriUJMk5Om7Pj",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
};

const REGIONALS: Regional[] = [
  {
    slug: "centro",
    name: "Centro",
    description: "Xingu e Transamazônica",
    center: [-52.8, -4.3],
    color: "#0ea5e9",
    bases: [
      {
        slug: "altamira",
        name: "Altamira",
        color: "#0ea5e9",
        marker: [-52.2335258, -3.2326965],
        municipalities: [
          { slug: "almeirim", name: "Almeirim" },
          { slug: "altamira", name: "Altamira" },
          { slug: "anapu", name: "Anapu" },
          { slug: "brasil-novo", name: "Brasil Novo" },
          { slug: "gurupa", name: "Gurupá" },
          { slug: "medicilandia", name: "Medicilândia" },
          { slug: "pacaja", name: "Pacajá" },
          { slug: "placas", name: "Placas" },
          { slug: "porto-de-moz", name: "Porto de Moz" },
          {
            slug: "senador-jose-porfirio",
            name: "Senador José Porfírio",
          },
          { slug: "uruara", name: "Uruará" },
          { slug: "vitoria-do-xingu", name: "Vitória do Xingu" },
        ],
      },
    ],
  },
  {
    slug: "nordeste",
    name: "Nordeste",
    description: "Baixo Tocantins, Capim e Guamá",
    center: [-48.1, -2.3],
    color: "#16a34a",
    bases: [
      {
        slug: "abaetetuba",
        name: "Abaetetuba",
        color: "#16a34a",
        marker: [-48.8729594, -1.7300199],
        municipalities: [
          { slug: "abaetetuba", name: "Abaetetuba" },
          { slug: "baiao", name: "Baião" },
          { slug: "barcarena", name: "Barcarena" },
          { slug: "cameta", name: "Cametá" },
          { slug: "igarape-miri", name: "Igarapé-Miri" },
          { slug: "limoreiro-do-ajuru", name: "Limoeiro do Ajuru" },
          { slug: "mocajuba", name: "Mocajuba" },
          { slug: "moju", name: "Moju" },
          { slug: "tailandia", name: "Tailândia" },
        ],
      },
      {
        slug: "paragominas",
        name: "Paragominas",
        color: "#f59e0b",
        marker: [-47.3835003, -2.9916131],
        municipalities: [
          { slug: "acara", name: "Acará" },
          { slug: "aurora-do-para", name: "Aurora do Pará" },
          { slug: "bujaru", name: "Bujaru" },
          { slug: "concordia-do-para", name: "Concórdia do Pará" },
          { slug: "ipixuna-do-para", name: "Ipixuna do Pará" },
          { slug: "mae-do-rio", name: "Mãe do Rio" },
          { slug: "paragominas", name: "Paragominas" },
          {
            slug: "sao-domingos-do-capim",
            name: "São Domingos do Capim",
          },
          { slug: "sao-miguel-do-guama", name: "São Miguel do Guamá" },
          { slug: "tome-acu", name: "Tomé-Açu" },
          { slug: "ulianopolis", name: "Ulianópolis" },
        ],
      },
    ],
  },
  {
    slug: "oeste",
    name: "Oeste",
    description: "Tapajós, Calha Norte e Baixo Amazonas",
    center: [-56.2, -3.1],
    color: "#8b5cf6",
    bases: [
      {
        slug: "itaituba",
        name: "Itaituba",
        color: "#8b5cf6",
        marker: [-55.9831, -4.2761],
        municipalities: [
          { slug: "aveiro", name: "Aveiro" },
          { slug: "itaituba", name: "Itaituba" },
          { slug: "jacareacanga", name: "Jacareacanga" },
          { slug: "novo-progresso", name: "Novo Progresso" },
          { slug: "ruropolis", name: "Rurópolis" },
          { slug: "trairao", name: "Trairão" },
        ],
      },
      {
        slug: "monte-alegre",
        name: "Monte Alegre",
        color: "#ef4444",
        marker: [-54.0742, -2.0008],
        municipalities: [
          { slug: "alenquer", name: "Alenquer" },
          { slug: "curua", name: "Curuá" },
          { slug: "faro", name: "Faro" },
          { slug: "juruti", name: "Juruti" },
          { slug: "monte-alegre", name: "Monte Alegre" },
          { slug: "obidos", name: "Óbidos" },
          { slug: "oriximina", name: "Oriximiná" },
          { slug: "prainha", name: "Prainha" },
          { slug: "terra-santa", name: "Terra Santa" },
        ],
      },
      {
        slug: "santarem",
        name: "Santarém",
        color: "#06b6d4",
        marker: [-54.7010172, -2.4329974],
        municipalities: [
          { slug: "belterra", name: "Belterra" },
          { slug: "curua", name: "Curuá" },
          { slug: "mojui-dos-campos", name: "Mojuí dos Campos" },
          { slug: "santarem", name: "Santarém" },
        ],
      },
    ],
  },
];

const TOTAL_BASES = REGIONALS.reduce(
  (total, regional) => total + regional.bases.length,
  0,
);

const TOTAL_ASSIGNMENTS = REGIONALS.reduce(
  (total, regional) =>
    total +
    regional.bases.reduce(
      (regionalTotal, base) => regionalTotal + base.municipalities.length,
      0,
    ),
  0,
);

export function MapasExplorer() {
  const [selectedRegionalSlug, setSelectedRegionalSlug] =
    useState<RegionalSlug>("centro");
  const [selectedBaseSlug, setSelectedBaseSlug] = useState("altamira");
  const [selectedMunicipalitySlug, setSelectedMunicipalitySlug] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<ViewMode>("regional");

  const selectedRegional =
    REGIONALS.find((regional) => regional.slug === selectedRegionalSlug) ??
    REGIONALS[0];
  const selectedBase =
    selectedRegional.bases.find((base) => base.slug === selectedBaseSlug) ??
    selectedRegional.bases[0];
  const selectedMunicipality =
    selectedBase.municipalities.find(
      (municipality) => municipality.slug === selectedMunicipalitySlug,
    ) ?? selectedBase.municipalities[0];

  const visibleBases =
    viewMode === "regional" ? selectedRegional.bases : [selectedBase];

  const regionalAssignments = selectedRegional.bases.reduce(
    (total, base) => total + base.municipalities.length,
    0,
  );

  const panelTitle =
    viewMode === "municipio"
      ? selectedMunicipality.name
      : viewMode === "base"
        ? selectedBase.name
        : `Regional ${selectedRegional.name}`;

  const panelDescription =
    viewMode === "municipio"
      ? `${selectedBase.name} · ${selectedRegional.name}`
      : viewMode === "base"
        ? `${selectedBase.municipalities.length} municípios atendidos`
        : `${selectedRegional.bases.length} bases · ${regionalAssignments} municípios atendidos`;

  function selectRegional(regional: Regional) {
    setSelectedRegionalSlug(regional.slug);
    setSelectedBaseSlug(regional.bases[0].slug);
    setSelectedMunicipalitySlug(null);
    setViewMode("regional");
  }

  function selectBase(base: OperationalBase) {
    setSelectedBaseSlug(base.slug);
    setSelectedMunicipalitySlug(null);
    setViewMode("base");
  }

  function selectMunicipality(municipality: Municipality) {
    setSelectedMunicipalitySlug(municipality.slug);
    setViewMode("municipio");
  }

  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[22rem_1fr]">
      <aside className="border-b border-border bg-card/95 lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col">
          <div className="space-y-5 p-4">
            <Button
              asChild
              variant="ghost"
              className="h-8 w-fit px-2 text-muted-foreground"
            >
              <Link href="/">
                <ArrowLeft className="size-4" />
                Home
              </Link>
            </Button>

            <div className="space-y-2">
              <Badge
                variant="outline"
                className="border-primary/25 bg-primary/10 text-primary"
              >
                Cobertura operacional
              </Badge>
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                Mapas regionais
              </h1>
              <p className="text-sm/relaxed text-muted-foreground">
                Regionais, bases e municípios atendidos pela Elinsa do Brasil.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <Card className="rounded-xl py-0" size="sm">
              <CardHeader className="border-b py-3">
                <CardTitle className="flex items-center gap-2">
                  <Layers3 className="size-4 text-primary" />
                  Regionais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 py-3">
                {REGIONALS.map((regional) => {
                  const isActive = selectedRegional.slug === regional.slug;

                  return (
                    <Button
                      key={regional.slug}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      className="h-auto min-h-16 flex-col items-start justify-between whitespace-normal px-2.5 py-2 text-left"
                      onClick={() => selectRegional(regional)}
                    >
                      <span className="font-semibold">{regional.name}</span>
                      <span
                        className={cn(
                          "text-[0.625rem]",
                          isActive
                            ? "text-primary-foreground/85"
                            : "text-muted-foreground",
                        )}
                      >
                        {regional.bases.length} bases
                      </span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-xl py-0" size="sm">
              <CardHeader className="border-b py-3">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  Bases
                </CardTitle>
                <CardDescription>
                  {selectedRegional.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 py-3">
                <Button
                  type="button"
                  variant={viewMode === "regional" ? "secondary" : "ghost"}
                  className="h-auto w-full justify-between whitespace-normal rounded-lg border border-border/70 px-3 py-2.5"
                  onClick={() => {
                    setSelectedMunicipalitySlug(null);
                    setViewMode("regional");
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Navigation className="size-4 text-primary" />
                    Regional inteira
                  </span>
                  <Badge variant="outline">{regionalAssignments}</Badge>
                </Button>

                {selectedRegional.bases.map((base) => {
                  const isActive =
                    selectedBase.slug === base.slug && viewMode !== "regional";

                  return (
                    <Button
                      key={base.slug}
                      type="button"
                      variant={isActive ? "secondary" : "ghost"}
                      className="h-auto w-full justify-between whitespace-normal rounded-lg border border-border/70 px-3 py-2.5"
                      onClick={() => selectBase(base)}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: base.color }}
                        />
                        <span className="truncate">{base.name}</span>
                      </span>
                      <Badge variant="outline">
                        {base.municipalities.length}
                      </Badge>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-xl py-0" size="sm">
              <CardHeader className="border-b py-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  Municípios
                </CardTitle>
                <CardDescription>{selectedBase.name}</CardDescription>
              </CardHeader>
              <CardContent className="grid max-h-72 gap-1.5 overflow-y-auto py-3 pr-2">
                <Button
                  type="button"
                  variant={viewMode === "base" ? "secondary" : "ghost"}
                  className="h-8 justify-between rounded-md px-2"
                  onClick={() => {
                    setSelectedMunicipalitySlug(null);
                    setViewMode("base");
                  }}
                >
                  <span>Todos da base</span>
                  {viewMode === "base" && <Check className="size-3.5" />}
                </Button>

                {selectedBase.municipalities.map((municipality) => {
                  const isActive =
                    viewMode === "municipio" &&
                    selectedMunicipality.slug === municipality.slug;

                  return (
                    <Button
                      key={municipality.slug}
                      type="button"
                      variant={isActive ? "secondary" : "ghost"}
                      className="h-8 justify-between rounded-md px-2"
                      onClick={() => selectMunicipality(municipality)}
                    >
                      <span className="truncate">{municipality.name}</span>
                      {isActive && <Check className="size-3.5" />}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-xl py-0" size="sm">
              <CardHeader className="py-3">
                <CardTitle>Inventário</CardTitle>
                <CardDescription>Visão consolidada da rota.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 pb-3">
                <Metric value={REGIONALS.length} label="regionais" />
                <Metric value={TOTAL_BASES} label="bases" />
                <Metric value={TOTAL_ASSIGNMENTS} label="municípios" />
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>

      <section className="flex min-h-[calc(100dvh-1px)] flex-col p-3 sm:p-4 lg:h-dvh">
        <Card className="relative min-h-[620px] flex-1 gap-0 overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-sm lg:min-h-0">
          <MapComponent
            attributionControl={false}
            center={selectedRegional.center}
            className="min-h-[620px] flex-1 lg:min-h-0"
            dragRotate={false}
            maxZoom={12}
            minZoom={4}
            pitchWithRotate={false}
            scrollZoom
            styles={CLEAN_MAP_STYLES}
            zoom={5.8}
          >
            <RegionalSelectionLayer
              regionalSlug={selectedRegional.slug}
              selectedBaseSlug={selectedBase.slug}
              selectedMunicipalitySlug={
                viewMode === "municipio" ? selectedMunicipality.slug : null
              }
              viewMode={viewMode}
            />
            {visibleBases.map((base) => (
              <BaseMarker
                key={base.slug}
                active={selectedBase.slug === base.slug}
                base={base}
                onSelect={() => selectBase(base)}
              />
            ))}
            <MapControls
              position="bottom-right"
              showCompass={false}
              showFullscreen
              showLocate={false}
              showZoom
            />
          </MapComponent>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3 sm:p-4">
            <Card className="ml-auto w-full max-w-md gap-0 rounded-xl border-border/70 bg-card/90 py-0 shadow-sm backdrop-blur-md">
              <CardHeader className="py-3">
                <CardTitle className="text-base">{panelTitle}</CardTitle>
                <CardDescription>{panelDescription}</CardDescription>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="border-primary/25 bg-primary/10 text-primary"
                  >
                    {getModeLabel(viewMode)}
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background px-2 py-2">
      <div className="text-lg font-semibold tracking-tight">{value}</div>
      <div className="text-[0.625rem] text-muted-foreground">{label}</div>
    </div>
  );
}

function BaseMarker({
  active,
  base,
  onSelect,
}: {
  active: boolean;
  base: OperationalBase;
  onSelect: () => void;
}) {
  return (
    <MapMarker
      latitude={base.marker[1]}
      longitude={base.marker[0]}
      onClick={onSelect}
    >
      <MarkerContent>
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-full border-2 border-background text-white shadow-lg transition-transform",
            active && "scale-110",
          )}
          style={{ backgroundColor: base.color }}
        >
          <CircleDot className="size-4" />
        </div>
      </MarkerContent>
      <MarkerTooltip>
        <div className="space-y-0.5">
          <p className="font-medium">{base.name}</p>
          <p className="text-[0.625rem] opacity-80">
            {base.municipalities.length} municípios
          </p>
        </div>
      </MarkerTooltip>
    </MapMarker>
  );
}

function RegionalSelectionLayer({
  regionalSlug,
  selectedBaseSlug,
  selectedMunicipalitySlug,
  viewMode,
}: {
  regionalSlug: RegionalSlug;
  selectedBaseSlug: string;
  selectedMunicipalitySlug: string | null;
  viewMode: ViewMode;
}) {
  const { map, isLoaded } = useMap();
  const [regionalMap, setRegionalMap] = useState<AggregatedRegional | null>(
    null,
  );
  const collection = useMemo(
    () =>
      regionalMap?.slug === regionalSlug
        ? buildSelectionCollection(regionalMap, {
            selectedBaseSlug,
            selectedMunicipalitySlug,
            viewMode,
          })
        : EMPTY_MUNICIPALITY_COLLECTION,
    [
      regionalMap,
      regionalSlug,
      selectedBaseSlug,
      selectedMunicipalitySlug,
      viewMode,
    ],
  );
  const collectionRef = useRef<MunicipalityFeatureCollection>(
    EMPTY_MUNICIPALITY_COLLECTION,
  );
  const viewModeRef = useRef<ViewMode>(viewMode);
  const syncLayerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRegionalMap() {
      setRegionalMap(null);

      try {
        const response = await fetch(
          `/regionais/agregados/${regionalSlug}.json`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Regional indisponível: ${regionalSlug}`);
        }

        const data = (await response.json()) as unknown;

        if (!controller.signal.aborted && isAggregatedRegional(data)) {
          setRegionalMap(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
        }
      }
    }

    loadRegionalMap();

    return () => {
      controller.abort();
    };
  }, [regionalSlug]);

  useEffect(() => {
    collectionRef.current = collection;
    viewModeRef.current = viewMode;
    syncLayerRef.current?.();
  }, [collection, viewMode]);

  useEffect(() => {
    if (!map || !isLoaded) {
      return;
    }

    const mapInstance = map;

    function syncLayer() {
      if (!mapInstance.isStyleLoaded()) {
        return;
      }

      const source = mapInstance.getSource(ACTIVE_SOURCE_ID) as
        | { setData: (data: MunicipalityFeatureCollection) => void }
        | undefined;

      if (source) {
        source.setData(collectionRef.current);
      } else {
        mapInstance.addSource(ACTIVE_SOURCE_ID, {
          type: "geojson",
          data: collectionRef.current,
        });
      }

      if (!mapInstance.getLayer(ACTIVE_FILL_LAYER_ID)) {
        mapInstance.addLayer({
          id: ACTIVE_FILL_LAYER_ID,
          type: "fill",
          source: ACTIVE_SOURCE_ID,
          paint: {
            "fill-color": BASE_COLOR_EXPRESSION,
            "fill-opacity": getFillOpacity(viewModeRef.current),
          },
        });
      } else {
        mapInstance.setPaintProperty(
          ACTIVE_FILL_LAYER_ID,
          "fill-opacity",
          getFillOpacity(viewModeRef.current),
        );
      }

      if (!mapInstance.getLayer(ACTIVE_LINE_LAYER_ID)) {
        mapInstance.addLayer({
          id: ACTIVE_LINE_LAYER_ID,
          type: "line",
          source: ACTIVE_SOURCE_ID,
          paint: {
            "line-color": BASE_COLOR_EXPRESSION,
            "line-opacity": 0.95,
            "line-width": getLineWidth(viewModeRef.current),
          },
        });
      } else {
        mapInstance.setPaintProperty(
          ACTIVE_LINE_LAYER_ID,
          "line-width",
          getLineWidth(viewModeRef.current),
        );
      }

      if (!mapInstance.getLayer(ACTIVE_LABEL_LAYER_ID)) {
        mapInstance.addLayer({
          id: ACTIVE_LABEL_LAYER_ID,
          type: "symbol",
          source: ACTIVE_SOURCE_ID,
          layout: {
            "symbol-placement": "point",
            "text-allow-overlap": shouldForceLabels(viewModeRef.current),
            "text-field": MUNICIPALITY_NAME_EXPRESSION,
            "text-ignore-placement": shouldForceLabels(viewModeRef.current),
            "text-size": MUNICIPALITY_LABEL_SIZE_EXPRESSION,
          },
          paint: {
            "text-color": BASE_COLOR_EXPRESSION,
            "text-halo-blur": 0.5,
            "text-halo-color": "rgba(255, 255, 255, 0.95)",
            "text-halo-width": 2.5,
            "text-opacity": getLabelOpacity(viewModeRef.current),
          },
        });
      } else {
        mapInstance.setLayoutProperty(
          ACTIVE_LABEL_LAYER_ID,
          "text-allow-overlap",
          shouldForceLabels(viewModeRef.current),
        );
        mapInstance.setLayoutProperty(
          ACTIVE_LABEL_LAYER_ID,
          "text-ignore-placement",
          shouldForceLabels(viewModeRef.current),
        );
        mapInstance.setPaintProperty(
          ACTIVE_LABEL_LAYER_ID,
          "text-opacity",
          getLabelOpacity(viewModeRef.current),
        );
      }
    }

    syncLayerRef.current = syncLayer;
    syncLayer();
    mapInstance.on("styledata", syncLayer);

    return () => {
      syncLayerRef.current = null;
      mapInstance.off("styledata", syncLayer);

      try {
        if (mapInstance.getLayer(ACTIVE_LABEL_LAYER_ID)) {
          mapInstance.removeLayer(ACTIVE_LABEL_LAYER_ID);
        }
        if (mapInstance.getLayer(ACTIVE_LINE_LAYER_ID)) {
          mapInstance.removeLayer(ACTIVE_LINE_LAYER_ID);
        }
        if (mapInstance.getLayer(ACTIVE_FILL_LAYER_ID)) {
          mapInstance.removeLayer(ACTIVE_FILL_LAYER_ID);
        }
        if (mapInstance.getSource(ACTIVE_SOURCE_ID)) {
          mapInstance.removeSource(ACTIVE_SOURCE_ID);
        }
      } catch {
        // MapLibre may clear layers while switching styles.
      }
    };
  }, [map, isLoaded]);

  useEffect(() => {
    if (!map || !isLoaded || collection.features.length === 0) {
      return;
    }

    const bounds = getGeoJsonBounds([collection]);

    if (!bounds) {
      return;
    }

    map.fitBounds(bounds, {
      duration: 700,
      maxZoom: viewMode === "municipio" ? 9.4 : viewMode === "base" ? 8.3 : 6.4,
      padding:
        window.innerWidth < 768
          ? 36
          : { top: 88, right: 88, bottom: 72, left: 88 },
    });
  }, [map, isLoaded, collection, viewMode]);

  return null;
}

function buildSelectionCollection(
  regionalMap: AggregatedRegional,
  selection: {
    selectedBaseSlug: string;
    selectedMunicipalitySlug: string | null;
    viewMode: ViewMode;
  },
): MunicipalityFeatureCollection {
  const bases =
    selection.viewMode === "regional"
      ? regionalMap.bases
      : regionalMap.bases.filter(
          (base) => base.slug === selection.selectedBaseSlug,
        );
  const features = bases.flatMap((base) =>
    base.municipalities.flatMap((municipality) => {
      if (
        selection.viewMode === "municipio" &&
        municipality.slug !== selection.selectedMunicipalitySlug
      ) {
        return [];
      }

      return municipality.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          baseColor: base.color,
          baseName: base.name,
          baseSlug: base.slug,
          municipalityName: municipality.name,
          municipalitySlug: municipality.slug,
          regionalName: regionalMap.name,
          regionalSlug: regionalMap.slug,
        },
      }));
    }),
  );

  return {
    type: "FeatureCollection",
    features,
  };
}

function isAggregatedRegional(value: unknown): value is AggregatedRegional {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.slug === "string" &&
    typeof record.name === "string" &&
    Array.isArray(record.bases)
  );
}

function getFillOpacity(viewMode: ViewMode) {
  return viewMode === "municipio" ? 0.34 : 0.24;
}

function getLineWidth(viewMode: ViewMode) {
  return viewMode === "municipio" ? 3 : 2.4;
}

function getLabelOpacity(viewMode: ViewMode) {
  return viewMode === "regional" ? 0.82 : 0.95;
}

function shouldForceLabels(viewMode: ViewMode) {
  return viewMode !== "regional";
}

function getModeLabel(viewMode: ViewMode) {
  if (viewMode === "municipio") {
    return "Município";
  }

  if (viewMode === "base") {
    return "Base";
  }

  return "Regional";
}

type MutableBounds = {
  maxLat: number;
  maxLng: number;
  minLat: number;
  minLng: number;
};

function getGeoJsonBounds(
  geoJsons: unknown[],
): [[number, number], [number, number]] | null {
  const bounds: MutableBounds = {
    maxLat: Number.NEGATIVE_INFINITY,
    maxLng: Number.NEGATIVE_INFINITY,
    minLat: Number.POSITIVE_INFINITY,
    minLng: Number.POSITIVE_INFINITY,
  };

  for (const geoJson of geoJsons) {
    collectGeoJsonCoordinates(geoJson, bounds);
  }

  if (
    !Number.isFinite(bounds.minLng) ||
    !Number.isFinite(bounds.minLat) ||
    !Number.isFinite(bounds.maxLng) ||
    !Number.isFinite(bounds.maxLat)
  ) {
    return null;
  }

  return [
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat],
  ];
}

function collectGeoJsonCoordinates(value: unknown, bounds: MutableBounds) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectGeoJsonCoordinates(item, bounds);
    }
    return;
  }

  const record = value as Record<string, unknown>;

  if ("coordinates" in record) {
    extendBoundsFromCoordinates(record.coordinates, bounds);
  }

  if (Array.isArray(record.features)) {
    for (const feature of record.features) {
      collectGeoJsonCoordinates(feature, bounds);
    }
  }

  if (record.geometry) {
    collectGeoJsonCoordinates(record.geometry, bounds);
  }

  if (Array.isArray(record.geometries)) {
    for (const geometry of record.geometries) {
      collectGeoJsonCoordinates(geometry, bounds);
    }
  }
}

function extendBoundsFromCoordinates(value: unknown, bounds: MutableBounds) {
  if (!Array.isArray(value)) {
    return;
  }

  if (isCoordinate(value)) {
    const [lng, lat] = value;

    bounds.minLng = Math.min(bounds.minLng, lng);
    bounds.maxLng = Math.max(bounds.maxLng, lng);
    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
    return;
  }

  for (const child of value) {
    extendBoundsFromCoordinates(child, bounds);
  }
}

function isCoordinate(value: unknown[]): value is [number, number] {
  return (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}
