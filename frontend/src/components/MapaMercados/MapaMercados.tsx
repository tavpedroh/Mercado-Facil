<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type { Coordenadas } from "../../types/produto";
import { calcularDistanciaKm } from "../../utils/comparador";
import "./MapaMercados.css";

export interface MercadoNoMapa {
  nome: string;
  coordenadas: Coordenadas;
  endereco?: string;
  horarioFuncionamento?: string;
  totalOfertas: number;
  maiorDesconto: number;
}

interface MapaMercadosProps {
  mercados: MercadoNoMapa[];
  coordenadasFoco: Coordenadas;
  mercadoSelecionado?: string | null;
  onSelecionarMercado?: (nomeMercado: string) => void;
}

let mapsLoaderPromise: Promise<typeof google> | null = null;

function carregarGoogleMaps(apiKey: string): Promise<typeof google> {
  if (!mapsLoaderPromise) {
    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["maps", "marker"],
    });
    mapsLoaderPromise = loader.load();
  }
  return mapsLoaderPromise;
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MapaMercados = ({
  mercados,
  coordenadasFoco,
  mercadoSelecionado,
  onSelecionarMercado,
}: MapaMercadosProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Array<google.maps.marker.AdvancedMarkerElement | google.maps.Marker>>(
    []
  );
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const coordenadasIniciaisRef = useRef(coordenadasFoco);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const [mapaPronto, setMapaPronto] = useState(false);
  const [erroMapa, setErroMapa] = useState<string | null>(null);
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState<Coordenadas | null>(null);
  const [buscandoGeo, setBuscandoGeo] = useState(false);
  const [erroGeo, setErroGeo] = useState<string | null>(null);

  const mercadosComDistancia = useMemo(() => {
    const lista = mercados.map((m) => ({
      ...m,
      distanciaKm: localizacaoUsuario
        ? calcularDistanciaKm(localizacaoUsuario, m.coordenadas)
        : null,
    }));

    if (localizacaoUsuario) {
      return lista.sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0));
    }
    return lista;
  }, [mercados, localizacaoUsuario]);

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let cancelado = false;

    carregarGoogleMaps(apiKey)
      .then(() => {
        if (cancelado || !mapContainerRef.current || mapInstanceRef.current) {
          return;
        }

        const opcoesMapa: google.maps.MapOptions = {
          center: coordenadasIniciaisRef.current,
          zoom: 15,
          ...(mapId ? { mapId } : {}),
        };

        mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, opcoesMapa);
        infoWindowRef.current = new google.maps.InfoWindow();
        setMapaPronto(true);
      })
      .catch((err) => {
        if (!cancelado) {
          console.error("Erro ao carregar Google Maps:", err);
          setErroMapa("Não foi possível carregar o mapa no momento.");
        }
      });

    return () => {
      cancelado = true;
    };
  }, [apiKey, mapId]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;
    if (!mapaPronto || !map || !infoWindow) {
      return;
    }

    // Limpa marcadores anteriores
    markersRef.current.forEach((marker) => {
      if ("setMap" in marker) {
        marker.setMap(null);
      } else {
        marker.map = null;
      }
    });
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    mercadosComDistancia.forEach((mercado) => {
      const conteudoInfo = `
        <div style="font-family: Arial, sans-serif; max-width: 220px;">
          <strong style="font-size: 14px; color: #1b5e20;">${escaparHtml(mercado.nome)}</strong>
          ${mercado.endereco ? `<p style="margin: 4px 0; font-size: 12px; color: #555;">${escaparHtml(mercado.endereco)}</p>` : ""}
          ${mercado.horarioFuncionamento ? `<p style="margin: 2px 0; font-size: 12px; color: #666;">${escaparHtml(mercado.horarioFuncionamento)}</p>` : ""}
          <p style="margin: 6px 0 0; font-size: 12px;">
            <strong>${mercado.totalOfertas}</strong> oferta(s)${mercado.maiorDesconto > 0 ? ` · até <strong>${mercado.maiorDesconto}% OFF</strong>` : ""}
          </p>
          ${mercado.distanciaKm !== null ? `<p style="margin: 2px 0 0; font-size: 12px; color: #1565c0;">A ${mercado.distanciaKm.toFixed(2)} km de você</p>` : ""}
        </div>
      `;

      let marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;
      if (mapId && google.maps.marker?.AdvancedMarkerElement) {
        marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: mercado.coordenadas,
          title: mercado.nome,
        });
        marker.addListener("click", () => {
          infoWindow.setContent(conteudoInfo);
          infoWindow.open({ anchor: marker, map });
          onSelecionarMercado?.(mercado.nome);
        });
      } else {
        marker = new google.maps.Marker({
          map,
          position: mercado.coordenadas,
          title: mercado.nome,
        });
        marker.addListener("click", () => {
          infoWindow.setContent(conteudoInfo);
          infoWindow.open({ anchor: marker, map });
          onSelecionarMercado?.(mercado.nome);
        });
      }

      markersRef.current.push(marker);
      bounds.extend(mercado.coordenadas);
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    if (localizacaoUsuario) {
      userMarkerRef.current = new google.maps.Marker({
        map,
        position: localizacaoUsuario,
        title: "Sua localização",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#1976d2",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      bounds.extend(localizacaoUsuario);
    }

    if (mercadoSelecionado) {
      map.panTo(coordenadasFoco);
      map.setZoom(16);
    } else if (mercadosComDistancia.length > 1) {
      map.fitBounds(bounds, 48);
    } else {
      map.panTo(coordenadasFoco);
      map.setZoom(15);
    }
  }, [
    mapaPronto,
    mercadosComDistancia,
    mercadoSelecionado,
    coordenadasFoco,
    localizacaoUsuario,
    mapId,
    onSelecionarMercado,
  ]);

  const handleUsarLocalizacao = () => {
    setErroGeo(null);
    if (!("geolocation" in navigator)) {
      setErroGeo("Seu navegador não suporta geolocalização.");
      return;
    }

    setBuscandoGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocalizacaoUsuario({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setBuscandoGeo(false);
      },
      () => {
        setErroGeo("Não foi possível obter sua localização. Verifique as permissões do navegador.");
        setBuscandoGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <section id="mapa" className="mapa-mercados">
      <div className="mapa-topo">
        <div>
          <h2>Localização dos Mercados{mercadoSelecionado ? ` — ${mercadoSelecionado}` : ""}</h2>
          <p className="mapa-subtitulo">
            Clique em um mercado para focar no mapa e filtrar suas ofertas.
          </p>
        </div>

        <button
          type="button"
          className="btn-geolocalizacao"
          onClick={handleUsarLocalizacao}
          disabled={buscandoGeo}
        >
          {buscandoGeo
            ? "Localizando..."
            : localizacaoUsuario
              ? "Atualizar minha localização"
              : "Usar minha localização"}
        </button>
      </div>

      {erroGeo && (
        <p className="mapa-aviso-geo" role="alert">
          {erroGeo}
        </p>
      )}

      {mercadosComDistancia.length > 0 && (
        <div className="mapa-cards-mercados">
          {mercadosComDistancia.map((mercado) => {
            const ativo = mercadoSelecionado === mercado.nome;
            return (
              <button
                key={mercado.nome}
                type="button"
                className={`card-mercado-mapa ${ativo ? "ativo" : ""}`}
                onClick={() => onSelecionarMercado?.(ativo ? "" : mercado.nome)}
              >
                <strong>{mercado.nome}</strong>
                {mercado.endereco && <span className="mercado-endereco">{mercado.endereco}</span>}
                <span className="mercado-meta">
                  {mercado.totalOfertas} oferta(s)
                  {mercado.maiorDesconto > 0 ? ` · até ${mercado.maiorDesconto}% OFF` : ""}
                </span>
                {mercado.distanciaKm !== null && (
                  <span className="mercado-distancia">
                    {mercado.distanciaKm.toFixed(2)} km de você
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!apiKey ? (
        <div className="mapa-placeholder">
          Configure <code>VITE_GOOGLE_MAPS_API_KEY</code> no arquivo <code>frontend/.env</code>{" "}
          para visualizar o mapa.
        </div>
      ) : erroMapa ? (
        <div className="mapa-placeholder">{erroMapa}</div>
      ) : (
        <div ref={mapContainerRef} className="mapa-canvas" />
      )}
    </section>
  );
};
=======
// // src/components/MapaMercados/MapaMercados.tsx
// import React, { useEffect, useRef } from "react";
// import { Loader } from "@googlemaps/js-api-loader";

// interface Coordenadas {
//   lat: number;
//   lng: number;
// }

// interface MapaMercadosProps {
//   coordenadas: Coordenadas;
// }

// const MapaMercados: React.FC<MapaMercadosProps> = ({ coordenadas }) => {
//   const mapRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const loader = new Loader({
//       apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
//       version: "weekly",
//       libraries: ["maps", "marker"],
//     });

//     loader.load().then(() => {
//       if (mapRef.current) {
//         const map = new google.maps.Map(mapRef.current, {
//           center: coordenadas,
//           zoom: 15,
//         });

//         new google.maps.marker.AdvancedMarkerElement({
//           map,
//           position: coordenadas,
//           title: "Mercado selecionado",
//         });
//       }
//     });
//   }, [coordenadas]);

//   return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
// };
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b

// export default MapaMercados;
