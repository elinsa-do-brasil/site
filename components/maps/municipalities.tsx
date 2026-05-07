"use client";

import { mapAsset } from "@/lib/map-assets";
import { BaseMapCard } from "./base";

type MunicipalityMapProps = {
  className?: string;
  eyebrow?: string;
};

export function MapAbaetetuba({
  className,
  eyebrow = "Regional Nordeste",
}: MunicipalityMapProps = {}) {
  return (
    <BaseMapCard
      title="Abaetetuba"
      description="Base administrativa e operacional"
      geoJsonUrl={mapAsset("regionais/nordeste/abaetetuba/abaetetuba.json")}
      center={[-48.8844, -1.7214]}
      zoom={16}
      color="#16a34a"
      fillColor="#16a34a"
      baseLocation={{
        lng: -48.8729594,
        lat: -1.7300199,
        tooltip: "Base de Abaetetuba",
      }}
      href="https://maps.app.goo.gl/UYxUTgUphxujP4z47"
      className={className}
      eyebrow={eyebrow}
      accentClassName="bg-emerald-500"
    />
  );
}

export function MapAltamira({
  className,
  eyebrow = "Regional Centro",
}: MunicipalityMapProps = {}) {
  return (
    <BaseMapCard
      title="Altamira"
      description="Base administrativa e operacional"
      geoJsonUrl={mapAsset("regionais/centro/altamira/altamira.json")}
      center={[-52.2069, -3.2033]}
      zoom={16}
      color="#eab308"
      fillColor="#eab308"
      baseLocation={{
        lng: -52.2335258,
        lat: -3.2326965,
        tooltip: "Base de Altamira",
      }}
      href="https://maps.app.goo.gl/UpNypwUHdpw7Y1g66"
      className={className}
      eyebrow={eyebrow}
      accentClassName="bg-yellow-500"
    />
  );
}

export function MapBelem({
  className,
  eyebrow = "Polo corporativo",
}: MunicipalityMapProps = {}) {
  return (
    <BaseMapCard
      title="Belém"
      description="Centro corporativo e base administrativa"
      geoJsonUrl={mapAsset("belem.json")}
      center={[-48.4902, -1.455]}
      zoom={16}
      baseLocation={{
        lng: -48.450434,
        lat: -1.33781,
        tooltip: "Base de Belém",
      }}
      href="https://maps.app.goo.gl/qrW1xwEADM4CaQHL9"
      className={className}
      eyebrow={eyebrow}
      accentClassName="bg-elinsa-primary"
    />
  );
}

export function MapParagominas({
  className,
  eyebrow = "Regional Nordeste",
}: MunicipalityMapProps = {}) {
  return (
    <BaseMapCard
      title="Paragominas"
      description="Base administrativa e operacional"
      geoJsonUrl={mapAsset("regionais/nordeste/paragominas/paragominas.json")}
      center={[-47.4833, -2.9972]}
      zoom={15}
      color="#ef4444"
      fillColor="#ef4444"
      baseLocation={{
        lng: -47.3835003,
        lat: -2.9916131,
        tooltip: "Base de Paragominas",
      }}
      href="https://maps.app.goo.gl/TecvQ1H1gBg3bWUX8"
      className={className}
      eyebrow={eyebrow}
      accentClassName="bg-red-500"
    />
  );
}

export function MapSantarem({
  className,
  eyebrow = "Regional Oeste",
}: MunicipalityMapProps = {}) {
  return (
    <BaseMapCard
      title="Santarém"
      description="Base administrativa e operacional"
      geoJsonUrl={mapAsset("regionais/oeste/santarem/santarem.json")}
      center={[-54.7119, -2.4431]}
      zoom={16}
      baseLocation={{
        lng: -54.7010172,
        lat: -2.4329974,
        tooltip: "Base de Santarém",
      }}
      href="https://maps.app.goo.gl/g3y6ZPsqnGk6gV159"
      className={className}
      eyebrow={eyebrow}
      accentClassName="bg-cyan-500"
    />
  );
}

export function MapItaituba({
  className,
  eyebrow = "Regional Oeste",
}: MunicipalityMapProps = {}) {
  return (
    <BaseMapCard
      title="Itaituba"
      description="Base administrativa e operacional"
      geoJsonUrl={mapAsset("regionais/oeste/itaituba/itaituba.json")}
      center={[-55.9831, -4.2761]}
      zoom={16}
      color="#8b5cf6"
      fillColor="#8b5cf6"
      baseLocation={{
        lng: -55.9831,
        lat: -4.2761,
        tooltip: "Base de Itaituba",
      }}
      href="https://www.google.com/maps/search/?api=1&query=-4.2761,-55.9831"
      className={className}
      eyebrow={eyebrow}
      accentClassName="bg-violet-500"
    />
  );
}

export function MapMonteAlegre({
  className,
  eyebrow = "Regional Oeste",
}: MunicipalityMapProps = {}) {
  return (
    <BaseMapCard
      title="Monte Alegre"
      description="Base administrativa e operacional"
      geoJsonUrl={mapAsset("regionais/oeste/monte-alegre/monte-alegre.json")}
      center={[-54.0742, -2.0008]}
      zoom={16}
      color="#f59e0b"
      fillColor="#f59e0b"
      baseLocation={{
        lng: -54.0742,
        lat: -2.0008,
        tooltip: "Base de Monte Alegre",
      }}
      href="https://www.google.com/maps/search/?api=1&query=-2.0008,-54.0742"
      className={className}
      eyebrow={eyebrow}
      accentClassName="bg-amber-500"
    />
  );
}
