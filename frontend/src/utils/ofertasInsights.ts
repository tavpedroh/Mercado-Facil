import { calcularPrecoFinal } from "./comparador.ts";
import type { Produto } from "../types/produto.ts";

export interface ClassificacaoValidade {
  status: "sem_validade" | "expirada" | "expira_hoje" | "ultimos_dias" | "ativa";
  diasRestantes: number | null;
  rotulo: string;
}

export function classificarValidadeOferta(
  validadeOferta?: string,
  agora: Date = new Date()
): ClassificacaoValidade {
  if (!validadeOferta) {
    return { status: "sem_validade", diasRestantes: null, rotulo: "Sem validade definida" };
  }

  const dataValidade = new Date(validadeOferta);
  if (Number.isNaN(dataValidade.getTime())) {
    return { status: "sem_validade", diasRestantes: null, rotulo: "Data inválida" };
  }

  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioValidade = new Date(
    dataValidade.getFullYear(),
    dataValidade.getMonth(),
    dataValidade.getDate()
  );

  const diferencaMs = inicioValidade.getTime() - inicioHoje.getTime();
  const diasRestantes = Math.round(diferencaMs / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    return { status: "expirada", diasRestantes, rotulo: "Oferta expirada" };
  }

  if (diasRestantes === 0) {
    return { status: "expira_hoje", diasRestantes: 0, rotulo: "Expira hoje" };
  }

  if (diasRestantes <= 3) {
    return { status: "ultimos_dias", diasRestantes, rotulo: "Últimos dias" };
  }

  return { status: "ativa", diasRestantes, rotulo: "Oferta ativa" };
}

export function calcularScoreOferta(
  produto: Produto,
  ofertasEquivalentes?: Produto[]
): number {
  const precoFinal = calcularPrecoFinal(produto);
  const descontoPercentual =
    produto.preco > 0
      ? Math.max(0, Math.min(100, ((produto.preco - precoFinal) / produto.preco) * 100))
      : 0;

  if (!ofertasEquivalentes || ofertasEquivalentes.length === 0) {
    return Math.max(0, Math.min(100, Math.round(descontoPercentual)));
  }

  const precosFinaisEquivalentes = ofertasEquivalentes.map(calcularPrecoFinal);
  const precoMedio =
    precosFinaisEquivalentes.reduce((acc, val) => acc + val, 0) / precosFinaisEquivalentes.length;

  if (precoMedio <= 0 || Number.isNaN(precoMedio)) {
    return Math.max(0, Math.min(100, Math.round(descontoPercentual)));
  }

  const pontosDesconto = Math.min(50, Math.round(descontoPercentual));
  const vantagemRelativa = (precoMedio - precoFinal) / precoMedio;
  const pontosVantagem = Math.max(-25, Math.min(50, Math.round(vantagemRelativa * 100)));

  return Math.max(0, Math.min(100, Math.round(25 + pontosDesconto * 0.5 + pontosVantagem)));
}

export function calcularPrecoPorUnidadeBase(
  produto: Pick<Produto, "nome" | "preco" | "desconto" | "precoFinal" | "unidade">
): { precoBase: number; unidadeBase: "kg" | "L" } | null {
  const nomeNormalizado = produto.nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const matchUnidade = nomeNormalizado.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml)\b/i);
  if (!matchUnidade) {
    return null;
  }

  const valorQuantidade = parseFloat(matchUnidade[1].replace(",", "."));
  const unidadeDetectada = matchUnidade[2].toLowerCase();
  const precoFinalProduto = calcularPrecoFinal(produto);

  if (Number.isNaN(valorQuantidade) || valorQuantidade <= 0) {
    return null;
  }

  let fatorConversao: number;
  let unidadeBase: "kg" | "L";

  switch (unidadeDetectada) {
    case "g":
      fatorConversao = valorQuantidade / 1000;
      unidadeBase = "kg";
      break;
    case "ml":
      fatorConversao = valorQuantidade / 1000;
      unidadeBase = "L";
      break;
    case "l":
      fatorConversao = valorQuantidade;
      unidadeBase = "L";
      break;
    case "kg":
      fatorConversao = valorQuantidade;
      unidadeBase = "kg";
      break;
    default:
      return null;
  }

  return {
    precoBase: Number((precoFinalProduto / fatorConversao).toFixed(2)),
    unidadeBase,
  };
}
