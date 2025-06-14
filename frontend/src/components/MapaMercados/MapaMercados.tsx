// src/components/MapaMercados/MapaMercados.tsx
import React, { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Coordenadas {
  lat: number;
  lng: number;
}

interface MapaMercadosProps {
  coordenadas: Coordenadas;
}

const MapaMercados: React.FC<MapaMercadosProps> = ({ coordenadas }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["maps", "marker"],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: coordenadas,
          zoom: 15,
        });

        new google.maps.marker.AdvancedMarkerElement({
          map,
          position: coordenadas,
          title: "Mercado selecionado",
        });
      }
    });
  }, [coordenadas]);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default MapaMercados;
