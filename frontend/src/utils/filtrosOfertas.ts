import type { Produto } from "../types/produto.ts";
import { calcularPrecoFinal, obterIdProduto } from "./comparador.ts";

export interface CriteriosFiltroOfertas {
  busca?: string;
  categoria?: string;
  mercado?: string;
  apenasPromocoes?: boolean;
  apenasAtivas?: boolean;
  apenasFavoritos?: boolean;
  favoritosIds?: ReadonlySet<string>;
  precoMin?: number;
  precoMax?: number;
  ordenar?:
    | "recentes"
    | "menor_preco"
    | "maior_preco"
    | "maior_desconto"
    | "nome_asc"
    | "nome_desc";
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filtrarEOrdenarOfertas(
  produtos: Produto[],
  criterios: CriteriosFiltroOfertas,
  agora: Date = new Date()
): Produto[] {
  const agoraTimestamp = agora.getTime();
  const termoBusca = criterios.busca ? normalizarTexto(criterios.busca.trim()) : "";

  return produtos
    .map((produto) => ({
      produto,
      precoFinal: calcularPrecoFinal(produto),
      idProduto: obterIdProduto(produto),
    }))
    .filter(({ produto, precoFinal, idProduto }) => {
      if (termoBusca) {
        const textoProduto = normalizarTexto(
          `${produto.nome} ${produto.marca ?? ""} ${produto.descricao ?? ""} ${produto.mercado}`
        );
        if (!textoProduto.includes(termoBusca)) return false;
      }

      if (criterios.categoria && produto.categoria !== criterios.categoria) {
        return false;
      }

      if (criterios.mercado && produto.mercado !== criterios.mercado) {
        return false;
      }

      if (criterios.apenasPromocoes && !(produto.desconto && produto.desconto > 0)) {
        return false;
      }

      if (criterios.apenasAtivas && produto.validadeOferta) {
        const validade = new Date(produto.validadeOferta).getTime();
        if (!Number.isNaN(validade) && validade < agoraTimestamp) {
          return false;
        }
      }

      if (criterios.apenasFavoritos) {
        const idsFavoritos = criterios.favoritosIds ?? new Set<string>();
        if (!idsFavoritos.has(idProduto)) return false;
      }

      if (typeof criterios.precoMin === "number" && precoFinal < criterios.precoMin) {
        return false;
      }

      if (typeof criterios.precoMax === "number" && precoFinal > criterios.precoMax) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const itemA = a.produto;
      const itemB = b.produto;

      switch (criterios.ordenar) {
        case "recentes": {
          const dataA = itemA.criadoEm ? new Date(itemA.criadoEm).getTime() : 0;
          const dataB = itemB.criadoEm ? new Date(itemB.criadoEm).getTime() : 0;
          return dataB - dataA;
        }
        case "menor_preco":
          return a.precoFinal - b.precoFinal;
        case "maior_preco":
          return b.precoFinal - a.precoFinal;
        case "maior_desconto":
          return (itemB.desconto ?? 0) - (itemA.desconto ?? 0);
        case "nome_asc":
          return itemA.nome.localeCompare(itemB.nome, "pt-BR");
        case "nome_desc":
          return itemB.nome.localeCompare(itemA.nome, "pt-BR");
        default:
          return 0;
      }
    })
    .map(({ produto }) => produto);
}
