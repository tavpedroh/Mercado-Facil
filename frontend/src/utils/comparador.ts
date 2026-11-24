import type { Coordenadas, Produto } from "../types/produto";

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function calcularPrecoFinal(produto: Pick<Produto, "preco" | "desconto" | "precoFinal">): number {
  if (typeof produto.precoFinal === "number" && !Number.isNaN(produto.precoFinal)) {
    return produto.precoFinal;
  }
  const desconto = typeof produto.desconto === "number" && produto.desconto > 0 ? produto.desconto : 0;
  return Number((produto.preco - (produto.preco * desconto) / 100).toFixed(2));
}

export function gerarChaveComparacao(produto: Pick<Produto, "nome" | "codigoBarras">): string {
  if (produto.codigoBarras && produto.codigoBarras.trim()) {
    return `ean:${produto.codigoBarras.trim()}`;
  }
  return produto.nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function obterIdProduto(produto: Produto): string {
  if (produto._id) return produto._id;
  return `${gerarChaveComparacao(produto)}::${produto.mercado.toLowerCase()}`;
}

export interface ComparacaoOferta {
  chave: string;
  nomeReferencia: string;
  ofertas: Array<{
    produto: Produto;
    precoFinal: number;
  }>;
  menorPreco: number;
  maiorPreco: number;
  economiaMaxima: number;
  mercadoMaisBarato: string;
}

export function construirMapaComparacoes(produtos: Produto[]): Map<string, ComparacaoOferta> {
  const grupos = new Map<string, Produto[]>();

  for (const produto of produtos) {
    const chave = gerarChaveComparacao(produto);
    if (!chave) continue;
    const lista = grupos.get(chave) ?? [];
    lista.push(produto);
    grupos.set(chave, lista);
  }

  const comparacoes = new Map<string, ComparacaoOferta>();

  for (const [chave, itens] of grupos.entries()) {
    const mercadosDistintos = new Set(itens.map((i) => i.mercado));
    if (mercadosDistintos.size < 2) continue;

    const ofertasOrdenadas = itens
      .map((produto) => ({
        produto,
        precoFinal: calcularPrecoFinal(produto),
      }))
      .sort((a, b) => a.precoFinal - b.precoFinal);

    const menor = ofertasOrdenadas[0];
    const maior = ofertasOrdenadas[ofertasOrdenadas.length - 1];
    const economiaMaxima = Number((maior.precoFinal - menor.precoFinal).toFixed(2));

    comparacoes.set(chave, {
      chave,
      nomeReferencia: menor.produto.nome,
      ofertas: ofertasOrdenadas,
      menorPreco: menor.precoFinal,
      maiorPreco: maior.precoFinal,
      economiaMaxima,
      mercadoMaisBarato: menor.produto.mercado,
    });
  }

  return comparacoes;
}

export function calcularDistanciaKm(origem: Coordenadas, destino: Coordenadas): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(destino.lat - origem.lat);
  const dLng = toRad(destino.lng - origem.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origem.lat)) *
      Math.cos(toRad(destino.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}
