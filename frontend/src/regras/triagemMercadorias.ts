import { ProdutoData } from "../types";

// FUNIL 1: Unificação pelo Menor Valor
export const reterApenasMenorPreco = (lista: ProdutoData[]): ProdutoData[] => {
  const agrupado: { [nome: string]: ProdutoData } = {};

  lista.forEach((produto) => {
    const precoEfetivoAtual = produto.preco * (1 - (produto.desconto || 0) / 100);
    const produtoExistente = agrupado[produto.nome];

    if (!produtoExistente) {
      agrupado[produto.nome] = produto;
    } else {
      const precoEfetivoExistente = produtoExistente.preco * (1 - (produtoExistente.desconto || 0) / 100);
      if (precoEfetivoAtual < precoEfetivoExistente) {
        agrupado[produto.nome] = produto;
      }
    }
  });
  return (Object as any).values(agrupado);
};

// FUNIL 2: O Corte pelas Escolhas do Leitor
export const aplicarFiltros = (
  lista: ProdutoData[], 
  categoriaDesejada: string | null, 
  mercadoDesejado: string | null
): ProdutoData[] => {
  return lista.filter((produto) => {
    return (
      (!categoriaDesejada || produto.categoria === categoriaDesejada) &&
      (!mercadoDesejado || produto.mercado === mercadoDesejado)
    );
  });
};

// FUNIL 3: A Organização da Fila
export const aplicarOrdenacao = (lista: ProdutoData[], ordem: string): ProdutoData[] => {
  return [...lista].sort((a, b) => {
    if (ordem === "nome-asc") return a.nome.localeCompare(b.nome);
    if (ordem === "nome-desc") return b.nome.localeCompare(a.nome);
    
    if (ordem === "preco-asc") {
      const precoA = a.preco * (1 - (a.desconto || 0) / 100);
      const precoB = b.preco * (1 - (b.desconto || 0) / 100);
      return precoA - precoB;
    }
    if (ordem === "preco-desc") {
      const precoA = a.preco * (1 - (a.desconto || 0) / 100);
      const precoB = b.preco * (1 - (b.desconto || 0) / 100);
      return precoB - precoA;
    }
    if (ordem === "desconto-desc") {
      const descontoA = a.desconto || 0;
      const descontoB = b.desconto || 0;
      return descontoB - descontoA;
    }
    return 0; 
  });
};