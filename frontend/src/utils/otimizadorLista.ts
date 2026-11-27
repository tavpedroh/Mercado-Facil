import type { Produto } from "../types/produto.ts";
import {
  calcularPrecoFinal,
  formatarMoeda,
  gerarChaveComparacao,
} from "./comparador.ts";

export interface ItemCompraSimples {
  produto: Produto;
  quantidade: number;
}

export interface AnaliseOrcamentoResultado {
  total: number;
  orcamentoMaximo: number;
  dentroDoOrcamento: boolean;
  saldoOuExcesso: number;
  percentualUtilizado: number;
}

export function analisarOrcamento(
  itens: ItemCompraSimples[],
  orcamentoMaximo: number
): AnaliseOrcamentoResultado {
  const total = Number(
    itens
      .reduce((acumulador, item) => {
        return acumulador + calcularPrecoFinal(item.produto) * item.quantidade;
      }, 0)
      .toFixed(2)
  );

  const dentroDoOrcamento = total <= orcamentoMaximo;
  const saldoOuExcesso = Number(
    (dentroDoOrcamento ? orcamentoMaximo - total : total - orcamentoMaximo).toFixed(2)
  );
  const percentualUtilizado =
    orcamentoMaximo > 0 ? Number(((total / orcamentoMaximo) * 100).toFixed(2)) : 0;

  return {
    total,
    orcamentoMaximo,
    dentroDoOrcamento,
    saldoOuExcesso,
    percentualUtilizado,
  };
}

export interface OtimizacaoMercadosResultado {
  mercadosSelecionados: string[];
  total: number;
  itensEncontrados: number;
  totalItens: number;
  alocacao: Record<string, ItemCompraSimples[]>;
}

function gerarCombinacoes<T>(elementos: T[], tamanho: number): T[][] {
  if (tamanho === 0) return [[]];
  if (elementos.length < tamanho) return [];
  const resultado: T[][] = [];

  function backtrack(inicio: number, atual: T[]) {
    if (atual.length === tamanho) {
      resultado.push([...atual]);
      return;
    }
    for (let i = inicio; i < elementos.length; i++) {
      atual.push(elementos[i]);
      backtrack(i + 1, atual);
      atual.pop();
    }
  }

  backtrack(0, []);
  return resultado;
}

export function otimizarPorLimiteMercados(
  itens: ItemCompraSimples[],
  catalogo: Produto[],
  maxMercados: number
): OtimizacaoMercadosResultado {
  const mapaItens = new Map<string, ItemCompraSimples>();
  for (const item of itens) {
    const chave = gerarChaveComparacao(item.produto);
    if (!chave) continue;
    const existente = mapaItens.get(chave);
    if (!existente) {
      mapaItens.set(chave, { produto: item.produto, quantidade: item.quantidade });
    } else {
      existente.quantidade += item.quantidade;
    }
  }

  const itensUnicos = Array.from(mapaItens.entries());
  const totalItens = itensUnicos.length;

  if (totalItens === 0 || maxMercados <= 0) {
    return {
      mercadosSelecionados: [],
      total: 0,
      itensEncontrados: 0,
      totalItens,
      alocacao: {},
    };
  }

  const ofertasPorChave = new Map<string, Produto[]>();
  const mercadosDisponiveis = new Set<string>();

  for (const p of catalogo) {
    const chave = gerarChaveComparacao(p);
    if (!chave) continue;
    const lista = ofertasPorChave.get(chave) ?? [];
    lista.push(p);
    ofertasPorChave.set(chave, lista);
    mercadosDisponiveis.add(p.mercado);
  }

  const listaMercados = Array.from(mercadosDisponiveis).sort();
  if (listaMercados.length === 0) {
    return {
      mercadosSelecionados: [],
      total: 0,
      itensEncontrados: 0,
      totalItens,
      alocacao: {},
    };
  }

  const limiteEfetivo = Math.min(maxMercados, listaMercados.length);
  let melhorResultado: OtimizacaoMercadosResultado | null = null;

  for (let k = 1; k <= limiteEfetivo; k++) {
    const combinacoes = gerarCombinacoes(listaMercados, k);

    for (const conjunto of combinacoes) {
      const permitidos = new Set(conjunto);
      const alocacao: Record<string, ItemCompraSimples[]> = {};
      const usados = new Set<string>();
      let total = 0;
      let itensEncontrados = 0;

      for (const [chave, item] of itensUnicos) {
        const candidatos = (ofertasPorChave.get(chave) ?? []).filter((p) =>
          permitidos.has(p.mercado)
        );
        if (candidatos.length === 0) continue;

        const melhor = candidatos.reduce((menor, atual) =>
          calcularPrecoFinal(atual) < calcularPrecoFinal(menor) ? atual : menor
        );

        const precoUnit = calcularPrecoFinal(melhor);
        total += precoUnit * item.quantidade;
        itensEncontrados += 1;
        usados.add(melhor.mercado);

        const listaMercado = alocacao[melhor.mercado] ?? [];
        listaMercado.push({ produto: melhor, quantidade: item.quantidade });
        alocacao[melhor.mercado] = listaMercado;
      }

      const candidatoResultado: OtimizacaoMercadosResultado = {
        mercadosSelecionados: Array.from(usados).sort(),
        total: Number(total.toFixed(2)),
        itensEncontrados,
        totalItens,
        alocacao,
      };

      const ehMelhor =
        !melhorResultado ||
        candidatoResultado.itensEncontrados > melhorResultado.itensEncontrados ||
        (candidatoResultado.itensEncontrados === melhorResultado.itensEncontrados &&
          candidatoResultado.total < melhorResultado.total) ||
        (candidatoResultado.itensEncontrados === melhorResultado.itensEncontrados &&
          candidatoResultado.total === melhorResultado.total &&
          candidatoResultado.mercadosSelecionados.length <
            melhorResultado.mercadosSelecionados.length);

      if (ehMelhor) {
        melhorResultado = candidatoResultado;
      }
    }
  }

  return (
    melhorResultado ?? {
      mercadosSelecionados: [],
      total: 0,
      itensEncontrados: 0,
      totalItens,
      alocacao: {},
    }
  );
}

export function exportarListaParaTexto(
  itens: ItemCompraSimples[],
  titulo?: string
): string {
  const linhas: string[] = [];

  if (titulo) {
    linhas.push(`🛒 ${titulo}`);
    linhas.push("");
  }

  const agrupamentoPorMercado = new Map<
    string,
    Array<{ nome: string; quantidade: number; precoUnitario: number }>
  >();

  for (const item of itens) {
    const mercado = item.produto.mercado || "Mercado não informado";
    const listaMercado = agrupamentoPorMercado.get(mercado) ?? [];
    const precoUnitario = calcularPrecoFinal(item.produto);
    const existente = listaMercado.find(
      (l) => l.nome === item.produto.nome && l.precoUnitario === precoUnitario
    );

    if (existente) {
      existente.quantidade += item.quantidade;
    } else {
      listaMercado.push({
        nome: item.produto.nome,
        quantidade: item.quantidade,
        precoUnitario,
      });
    }

    agrupamentoPorMercado.set(mercado, listaMercado);
  }

  const mercadosOrdenados = Array.from(agrupamentoPorMercado.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
    .map(([mercado, itensDoMercado]) => ({
      mercado,
      itens: itensDoMercado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    }));

  for (const grupo of mercadosOrdenados) {
    linhas.push(`🏪 ${grupo.mercado}`);

    let subtotalGrupo = 0;
    for (const itemDoGrupo of grupo.itens) {
      const precoTotalItem = Number((itemDoGrupo.precoUnitario * itemDoGrupo.quantidade).toFixed(2));
      subtotalGrupo += precoTotalItem;
      linhas.push(
        `   • ${itemDoGrupo.nome} (${itemDoGrupo.quantidade}x) — ${formatarMoeda(precoTotalItem)}`
      );
    }

    linhas.push(`   💰 Subtotal: ${formatarMoeda(subtotalGrupo)}`);
  }

  const totalGeral = itens.reduce(
    (acc, item) => acc + calcularPrecoFinal(item.produto) * item.quantidade,
    0
  );
  linhas.push("");
  linhas.push(`💵 TOTAL GERAL: ${formatarMoeda(totalGeral)}`);

  return linhas.join("\n");
}
