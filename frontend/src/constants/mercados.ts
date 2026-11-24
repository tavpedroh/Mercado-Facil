import type { Coordenadas } from "../types/produto";

export const CATEGORIAS = ["Alimentos", "Bebidas", "Limpeza", "Higiene"] as const;

export const COORDENADAS_MERCADOS: Record<string, Coordenadas> = {
  "Mercado A": { lat: -23.5505, lng: -46.6333 },
  "Mercado B": { lat: -23.5511, lng: -46.6344 },
  "Mercado C": { lat: -23.5522, lng: -46.6355 },
};

export const MERCADOS = Object.keys(COORDENADAS_MERCADOS);

export const COORDENADAS_PADRAO: Coordenadas = {
  lat: -23.5505,
  lng: -46.6333,
};

export function buscarCoordenadaMercado(nome: string): Coordenadas | undefined {
  return COORDENADAS_MERCADOS[nome];
}
