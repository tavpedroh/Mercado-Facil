import type { NextFunction, Request, Response } from "express";
import mongoose, { type PipelineStage } from "mongoose";
import Mercado from "../models/Mercado";
import Produto from "../models/Produto";
import { AppError } from "../middlewares/errorHandler";
import { escapeRegex } from "../validators/common";
import type {
  AtualizarProdutoInput,
  CriarProdutoInput,
  ListarProdutosQuery,
} from "../validators/produtoValidator";

async function resolverVinculoMercado(
  mercadoId?: string,
  mercadoNome?: string
): Promise<{ mercado: string; mercadoId?: mongoose.Types.ObjectId }> {
  if (mercadoId) {
    const mercadoDoc = await Mercado.findById(mercadoId);
    if (!mercadoDoc) {
      throw new AppError("Mercado informado em 'mercadoId' não foi encontrado.", 404);
    }
    return {
      mercado: mercadoDoc.nome,
      mercadoId: mercadoDoc._id,
    };
  }

  if (mercadoNome) {
    const mercadoDoc = await Mercado.findOne({
      nome: new RegExp(`^${escapeRegex(mercadoNome)}$`, "i"),
    });
    return {
      mercado: mercadoDoc ? mercadoDoc.nome : mercadoNome,
      mercadoId: mercadoDoc?._id,
    };
  }

  throw new AppError("Informe 'mercado' ou 'mercadoId'.", 400);
}

export async function listarProdutos(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.validated?.query as ListarProdutosQuery;
    const match: Record<string, unknown> = {};

    if (query.categoria) {
      match.categoria = new RegExp(`^${escapeRegex(query.categoria)}$`, "i");
    }

    if (query.mercadoId) {
      match.mercadoId = new mongoose.Types.ObjectId(query.mercadoId);
    } else if (query.mercado) {
      match.mercado = new RegExp(`^${escapeRegex(query.mercado)}$`, "i");
    }

    if (query.busca) {
      const regex = new RegExp(escapeRegex(query.busca), "i");
      match.$or = [{ nome: regex }, { descricao: regex }, { marca: regex }];
    }

    if (query.apenasComDesconto) {
      match.desconto = { $gt: 0 };
    }

    if (query.ativos) {
      const agora = new Date();
      const filtroValidade = {
        $or: [
          { validadeOferta: { $exists: false } },
          { validadeOferta: null },
          { validadeOferta: { $gte: agora } },
        ],
      };

      if (match.$or) {
        match.$and = [{ $or: match.$or }, filtroValidade];
        delete match.$or;
      } else {
        Object.assign(match, filtroValidade);
      }
    }

    const skip = (query.page - 1) * query.limit;

    const sortStage: Record<string, 1 | -1> =
      query.ordenar === "menor_preco"
        ? { precoFinal: 1, criadoEm: -1 }
        : query.ordenar === "maior_preco"
          ? { precoFinal: -1, criadoEm: -1 }
          : query.ordenar === "maior_desconto"
            ? { desconto: -1, precoFinal: 1 }
            : { criadoEm: -1 };

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $addFields: {
          precoFinal: {
            $round: [
              {
                $subtract: [
                  "$preco",
                  {
                    $divide: [
                      { $multiply: ["$preco", { $ifNull: ["$desconto", 0] }] },
                      100,
                    ],
                  },
                ],
              },
              2,
            ],
          },
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: query.limit },
    ];

    const [dados, total] = await Promise.all([
      Produto.aggregate(pipeline),
      Produto.countDocuments(match),
    ]);

    res.json({
      dados,
      paginacao: {
        total,
        pagina: query.page,
        limite: query.limit,
        totalPaginas: Math.max(1, Math.ceil(total / query.limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function buscarProdutoPorId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const produto = await Produto.findById(id).populate("mercadoId", "nome endereco localizacao");

    if (!produto) {
      throw new AppError("Produto não encontrado.", 404);
    }

    res.json(produto);
  } catch (err) {
    next(err);
  }
}

export async function criarProduto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dados = req.validated?.body as CriarProdutoInput;
    const vinculo = await resolverVinculoMercado(dados.mercadoId, dados.mercado);

    const novoProduto = await Produto.create({
      nome: dados.nome,
      descricao: dados.descricao,
      marca: dados.marca,
      unidade: dados.unidade,
      preco: dados.preco,
      desconto: dados.desconto,
      categoria: dados.categoria,
      mercado: vinculo.mercado,
      mercadoId: vinculo.mercadoId,
      imagemUrl: dados.imagemUrl || undefined,
      codigoBarras: dados.codigoBarras || undefined,
      validadeOferta: dados.validadeOferta,
    });

    res.status(201).json(novoProduto);
  } catch (err) {
    next(err);
  }
}

export async function atualizarProduto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const dados = req.validated?.body as AtualizarProdutoInput;

    const atualizacao: Record<string, unknown> = {};
    if (dados.nome !== undefined) atualizacao.nome = dados.nome;
    if (dados.descricao !== undefined) atualizacao.descricao = dados.descricao;
    if (dados.marca !== undefined) atualizacao.marca = dados.marca;
    if (dados.unidade !== undefined) atualizacao.unidade = dados.unidade;
    if (dados.preco !== undefined) atualizacao.preco = dados.preco;
    if (dados.desconto !== undefined) atualizacao.desconto = dados.desconto;
    if (dados.categoria !== undefined) atualizacao.categoria = dados.categoria;
    if (dados.imagemUrl !== undefined) atualizacao.imagemUrl = dados.imagemUrl || undefined;
    if (dados.codigoBarras !== undefined) {
      atualizacao.codigoBarras = dados.codigoBarras || undefined;
    }
    if (dados.validadeOferta !== undefined) {
      atualizacao.validadeOferta = dados.validadeOferta ?? undefined;
    }

    if (dados.mercadoId !== undefined || dados.mercado !== undefined) {
      const vinculo = await resolverVinculoMercado(dados.mercadoId, dados.mercado);
      atualizacao.mercado = vinculo.mercado;
      atualizacao.mercadoId = vinculo.mercadoId;
    }

    const produtoAtualizado = await Produto.findByIdAndUpdate(id, atualizacao, {
      new: true,
      runValidators: true,
    });

    if (!produtoAtualizado) {
      throw new AppError("Produto não encontrado.", 404);
    }

    res.json(produtoAtualizado);
  } catch (err) {
    next(err);
  }
}

export async function removerProduto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const produto = await Produto.findByIdAndDelete(id);

    if (!produto) {
      throw new AppError("Produto não encontrado.", 404);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
