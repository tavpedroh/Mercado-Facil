import type { NextFunction, Request, Response } from "express";
import Produto from "../models/Produto";
import Mercado from "../models/Mercado";
import Categorias from "../models/Categorias";

export interface ProdutoResumoInput {
  nome?: string;
  preco: number;
  desconto?: number;
  categoria: string;
  mercado: string;
  validadeOferta?: Date | null;
}

export interface ResumoCatalogo {
  totalProdutos: number;
  totalOfertasAtivas: number;
  totalComDesconto: number;
  totalMercados: number;
  totalCategorias: number;
  descontoMedio: number;
  maioresDescontos: Array<{
    nome?: string;
    categoria: string;
    mercado: string;
    desconto: number;
  }>;
  porCategoria: Array<{ categoria: string; total: number; precoMedio: number }>;
  rankingMercados: Array<{
    mercado: string;
    totalOfertas: number;
    descontoMedio: number;
    precoMedio: number;
  }>;
}

export function calcularResumoCatalogo(
  produtos: ProdutoResumoInput[],
  totalMercados: number,
  totalCategorias: number,
  agora: Date = new Date()
): ResumoCatalogo {
  const totalProdutos = produtos.length;
  const ofertasAtivas = produtos.filter(
    (p) => !p.validadeOferta || new Date(p.validadeOferta) >= agora
  );
  const totalOfertasAtivas = ofertasAtivas.length;

  const comDesconto = produtos.filter((p) => (p.desconto ?? 0) > 0);
  const totalComDesconto = comDesconto.length;

  const ativasComDesconto = ofertasAtivas.filter((p) => (p.desconto ?? 0) > 0);
  const descontoMedio =
    ativasComDesconto.length > 0
      ? Number(
          (
            ativasComDesconto.reduce((acc, p) => acc + (p.desconto ?? 0), 0) /
            ativasComDesconto.length
          ).toFixed(2)
        )
      : 0;

  const maioresDescontos = [...comDesconto]
    .sort((a, b) => (b.desconto ?? 0) - (a.desconto ?? 0))
    .slice(0, 5)
    .map((p) => ({
      ...(p.nome ? { nome: p.nome } : {}),
      categoria: p.categoria,
      mercado: p.mercado,
      desconto: Number((p.desconto ?? 0).toFixed(2)),
    }));

  const mapCategoria = new Map<string, { total: number; precoTotal: number }>();
  for (const p of produtos) {
    const atual = mapCategoria.get(p.categoria) ?? { total: 0, precoTotal: 0 };
    atual.total += 1;
    atual.precoTotal += p.preco;
    mapCategoria.set(p.categoria, atual);
  }

  const porCategoria = Array.from(mapCategoria.entries())
    .map(([categoria, { total, precoTotal }]) => ({
      categoria,
      total,
      precoMedio: Number((precoTotal / total).toFixed(2)),
    }))
    .sort((a, b) => a.categoria.localeCompare(b.categoria));

  const mapMercado = new Map<
    string,
    { totalOfertas: number; descontoTotal: number; precoTotal: number }
  >();
  for (const p of produtos) {
    const atual = mapMercado.get(p.mercado) ?? {
      totalOfertas: 0,
      descontoTotal: 0,
      precoTotal: 0,
    };
    atual.totalOfertas += 1;
    atual.descontoTotal += p.desconto ?? 0;
    atual.precoTotal += p.preco;
    mapMercado.set(p.mercado, atual);
  }

  const rankingMercados = Array.from(mapMercado.entries())
    .map(([mercado, { totalOfertas, descontoTotal, precoTotal }]) => ({
      mercado,
      totalOfertas,
      descontoMedio: Number((descontoTotal / totalOfertas).toFixed(2)),
      precoMedio: Number((precoTotal / totalOfertas).toFixed(2)),
    }))
    .sort((a, b) => {
      if (b.descontoMedio !== a.descontoMedio) return b.descontoMedio - a.descontoMedio;
      return a.precoMedio - b.precoMedio;
    });

  return {
    totalProdutos,
    totalOfertasAtivas,
    totalComDesconto,
    totalMercados,
    totalCategorias,
    descontoMedio,
    maioresDescontos,
    porCategoria,
    rankingMercados,
  };
}

export async function obterResumoEstatisticas(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [produtos, totalMercados, totalCategorias] = await Promise.all([
      Produto.find().lean(),
      Mercado.countDocuments(),
      Categorias.countDocuments(),
    ]);

    const resumo = calcularResumoCatalogo(
      produtos as ProdutoResumoInput[],
      totalMercados,
      totalCategorias
    );

    res.json(resumo);
  } catch (err) {
    next(err);
  }
}
