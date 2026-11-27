import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Produto } from "../types/produto";
import { obterIdProduto } from "../utils/comparador";

export interface FavoritosContextValue {
  favoritosIds: Set<string>;
  totalFavoritos: number;
  ehFavorito: (produto: Produto) => boolean;
  alternarFavorito: (produto: Produto) => void;
  limparFavoritos: () => void;
}

const STORAGE_KEY = "mercadofacil:favoritos:v1";

const FavoritosContext = createContext<FavoritosContextValue | null>(null);

function carregarDoStorage(): Set<string> {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return new Set();
    const parsed = JSON.parse(salvo);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((item: unknown): item is string => typeof item === "string"));
    }
  } catch {
    // Ignora erros de parsing ou acesso ao localStorage
  }
  return new Set();
}

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [favoritosIds, setFavoritosIds] = useState<Set<string>>(carregarDoStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favoritosIds)));
    } catch {
      // Ignora erro de quota no localStorage
    }
  }, [favoritosIds]);

  const value = useMemo<FavoritosContextValue>(() => {
    const ehFavorito = (produto: Produto) => favoritosIds.has(obterIdProduto(produto));

    const alternarFavorito = (produto: Produto) => {
      const id = obterIdProduto(produto);
      setFavoritosIds((prev) => {
        const proximo = new Set(prev);
        if (proximo.has(id)) {
          proximo.delete(id);
        } else {
          proximo.add(id);
        }
        return proximo;
      });
    };

    const limparFavoritos = () => {
      setFavoritosIds(new Set());
    };

    return {
      favoritosIds,
      totalFavoritos: favoritosIds.size,
      ehFavorito,
      alternarFavorito,
      limparFavoritos,
    };
  }, [favoritosIds]);

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavoritos(): FavoritosContextValue {
  const ctx = useContext(FavoritosContext);
  if (!ctx) {
    throw new Error("useFavoritos deve ser usado dentro de FavoritosProvider.");
  }
  return ctx;
}
