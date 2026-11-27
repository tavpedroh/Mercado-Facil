import type { NextFunction, Request, Response } from "express";
import AlertaPreco from "../models/AlertaPreco";
import Produto from "../models/Produto";
import { AppError } from "../middlewares/errorHandler";
import { escapeRegex } from "../validators/common";
import type {
  AtualizarAlertaInput,
  CriarAlertaInput,
  ListarAlertasQuery,
} from "../validators/alertaValidator";

export function calcularPrecoComDesconto(preco: number, desconto?: number): number {
  const valorDesconto = typeof desconto === "number" && desconto > 0 ? desconto : 0;
  return Number((preco - (preco * valorDesconto) / 100).toFixed(2));
}

export async function listarAlertas(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = (req.validated?.query ?? {}) as ListarAlertasQuery;
    const filtros: Record<string, unknown> = {};

    if (query.ativo !== undefined) {
      filtros.ativo = query.ativo;
    }

    if (query.busca) {
      const regex = new RegExp(escapeRegex(query.busca), "i");
      filtros.$or = [
        { termoProduto: regex },
        { categoria: regex },
        { mercadoPreferido: regex },
      ];
    }

    const alertas = await AlertaPreco.find(filtros).sort({ createdAt: -1 });
    res.json(alertas);
  } catch (err) {
    next(err);
  }
}

export async function buscarAlertaPorId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const alerta = await AlertaPreco.findById(id);

    if (!alerta) {
      throw new AppError("Alerta não encontrado.", 404);
    }

    res.json(alerta);
  } catch (err) {
    next(err);
  }
}

export async function criarAlerta(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dados = req.validated?.body as CriarAlertaInput;
    const novoAlerta = await AlertaPreco.create({
      ...dados,
      email: dados.email || undefined,
    });

    res.status(201).json(novoAlerta);
  } catch (err) {
    next(err);
  }
}

export async function atualizarAlerta(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const dados = req.validated?.body as AtualizarAlertaInput;

    const atualizacao: Record<string, unknown> = { ...dados };
    if (dados.email !== undefined) {
      atualizacao.email = dados.email || undefined;
    }

    const alertaAtualizado = await AlertaPreco.findByIdAndUpdate(id, atualizacao, {
      new: true,
      runValidators: true,
    });

    if (!alertaAtualizado) {
      throw new AppError("Alerta não encontrado.", 404);
    }

    res.json(alertaAtualizado);
  } catch (err) {
    next(err);
  }
}

export async function removerAlerta(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const alertaRemovido = await AlertaPreco.findByIdAndDelete(id);

    if (!alertaRemovido) {
      throw new AppError("Alerta não encontrado.", 404);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function verificarAlertasDisparados(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const agora = new Date();
    const alertasAtivos = await AlertaPreco.find({ ativo: true });

    if (alertasAtivos.length === 0) {
      res.json([]);
      return;
    }

    const produtosAtivos = await Produto.find({
      $or: [
        { validadeOferta: { $exists: false } },
        { validadeOferta: null },
        { validadeOferta: { $gte: agora } },
      ],
    });

    const listaResultados = [];

    for (const alerta of alertasAtivos) {
      const regexTermo = new RegExp(escapeRegex(alerta.termoProduto), "i");
      const categoriaAlvo = alerta.categoria?.trim().toLowerCase();
      const mercadoAlvo = alerta.mercadoPreferido?.trim().toLowerCase();

      const ofertasCompativeis = produtosAtivos
        .map((produto) => ({
          produto,
          precoFinal: calcularPrecoComDesconto(produto.preco, produto.desconto),
        }))
        .filter(({ produto, precoFinal }) => {
          const textoMatch =
            regexTermo.test(produto.nome) ||
            regexTermo.test(produto.marca || "") ||
            regexTermo.test(produto.descricao || "");

          if (!textoMatch) return false;
          if (categoriaAlvo && produto.categoria.trim().toLowerCase() !== categoriaAlvo) {
            return false;
          }
          if (mercadoAlvo && produto.mercado.trim().toLowerCase() !== mercadoAlvo) {
            return false;
          }

          return precoFinal <= alerta.precoAlvo;
        })
        .sort((a, b) => a.precoFinal - b.precoFinal);

      if (ofertasCompativeis.length === 0) {
        continue;
      }

      const melhorPreco = ofertasCompativeis[0].precoFinal;

      listaResultados.push({
        alerta,
        ofertasCompativeis: ofertasCompativeis.map(({ produto, precoFinal }) => ({
          _id: produto._id,
          nome: produto.nome,
          marca: produto.marca,
          mercado: produto.mercado,
          categoria: produto.categoria,
          preco: produto.preco,
          desconto: produto.desconto || 0,
          precoFinal,
          validadeOferta: produto.validadeOferta
            ? new Date(produto.validadeOferta).toISOString()
            : null,
        })),
        melhorPreco,
      });
    }

    res.json(listaResultados);
  } catch (err) {
    next(err);
  }
}
