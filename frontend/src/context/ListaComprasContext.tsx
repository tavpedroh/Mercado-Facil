import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Produto } from "../types/produto";
import { obterIdProduto } from "../utils/comparador";

export interface ItemListaCompras {
  id: string;
  produto: Produto;
  quantidade: number;
}

interface ListaComprasContextValue {
  itens: ItemListaCompras[];
  totalUnidades: number;
  adicionarItem: (produto: Produto) => void;
  atualizarQuantidade: (id: string, quantidade: number) => void;
  removerItem: (id: string) => void;
  limparLista: () => void;
  obterQuantidade: (produto: Produto) => number;
}

const STORAGE_KEY = "mercadofacil:lista-compras:v1";

const ListaComprasContext = createContext<ListaComprasContextValue | null>(null);

function carregarDoStorage(): ItemListaCompras[] {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return [];
    const parsed = JSON.parse(salvo);
    return Array.isArray(parsed) ? (parsed as ItemListaCompras[]) : [];
  } catch {
    return [];
  }
}

export function ListaComprasProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemListaCompras[]>(carregarDoStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    } catch {
      // ignora erro de quota no localStorage
    }
  }, [itens]);

  const value = useMemo<ListaComprasContextValue>(() => {
    const adicionarItem = (produto: Produto) => {
      const id = obterIdProduto(produto);
      setItens((prev) => {
        const existente = prev.find((item) => item.id === id);
        if (existente) {
          return prev.map((item) =>
            item.id === id ? { ...item, produto, quantidade: item.quantidade + 1 } : item
          );
        }
        return [...prev, { id, produto, quantidade: 1 }];
      });
    };

    const atualizarQuantidade = (id: string, quantidade: number) => {
      setItens((prev) => {
        if (quantidade <= 0) {
          return prev.filter((item) => item.id !== id);
        }
        return prev.map((item) => (item.id === id ? { ...item, quantidade } : item));
      });
    };

    const removerItem = (id: string) => {
      setItens((prev) => prev.filter((item) => item.id !== id));
    };

    const limparLista = () => {
      setItens([]);
    };

    const obterQuantidade = (produto: Produto) => {
      const id = obterIdProduto(produto);
      return itens.find((item) => item.id === id)?.quantidade ?? 0;
    };

    const totalUnidades = itens.reduce((acc, item) => acc + item.quantidade, 0);

    return {
      itens,
      totalUnidades,
      adicionarItem,
      atualizarQuantidade,
      removerItem,
      limparLista,
      obterQuantidade,
    };
  }, [itens]);

  return <ListaComprasContext.Provider value={value}>{children}</ListaComprasContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useListaCompras(): ListaComprasContextValue {
  const ctx = useContext(ListaComprasContext);
  if (!ctx) {
    throw new Error("useListaCompras deve ser usado dentro de ListaComprasProvider.");
  }
  return ctx;
}
