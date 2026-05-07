"use client";

import { BaseMapCard } from "./base";

export function MapAbaetetuba() {
  return (
    <BaseMapCard
      title="Abaetetuba"
      description="Base administrativa e operacional"
      geoJsonUrl="/json/abaetetuba.json"
      center={[-48.8844, -1.7214]}
      zoom={14}
      baseLocation={{
        lng: -48.8729594,
        lat: -1.7300199,
        tooltip: "Base de Abaetetuba",
      }}
      href="https://maps.app.goo.gl/UYxUTgUphxujP4z47"
    />
  );
}

export function MapAltamira() {
  return (
    <BaseMapCard
      title="Altamira"
      description="Base administrativa e operacional"
      geoJsonUrl="/json/altamira.json"
      center={[-52.2069, -3.2033]}
      zoom={16}
      baseLocation={{
        lng: -52.2335258,
        lat: -3.2326965,
        tooltip: "Base de Altamira",
      }}
      href="https://maps.app.goo.gl/UpNypwUHdpw7Y1g66"
    />
  );
}

export function MapBelem() {
  return (
    <BaseMapCard
      title="Belém"
      description="Base administrativa e operacional"
      geoJsonUrl="/json/belem.json"
      center={[-48.4902, -1.455]}
      zoom={10}
    />
  );
}

export function MapParagominas() {
  return (
    <BaseMapCard
      title="Paragominas"
      description="Base administrativa e operacional"
      geoJsonUrl="/json/paragominas.json"
      center={[-47.4833, -2.9972]}
      zoom={16}
      baseLocation={{
        lng: -47.3835003,
        lat: -2.9916131,
        tooltip: "Base de Paragominas",
      }}
      href="https://maps.app.goo.gl/TecvQ1H1gBg3bWUX8"
    />
  );
}

export function MapSantarem() {
  return (
    <BaseMapCard
      title="Santarém"
      description="Base administrativa e operacional"
      geoJsonUrl="/json/santarem.json"
      center={[-54.7119, -2.4431]}
      zoom={16}
      baseLocation={{
        lng: -54.7010172,
        lat: -2.4329974,
        tooltip: "Base de Santarém",
      }}
      href="https://maps.app.goo.gl/g3y6ZPsqnGk6gV159"
    />
  );
}
