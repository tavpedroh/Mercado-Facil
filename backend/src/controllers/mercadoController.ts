import type { NextFunction, Request, Response } from "express";
import Mercado from "../models/Mercado";
import Produto from "../models/Produto";
import { AppError } from "../middlewares/errorHandler";
import { escapeRegex } from "../validators/common";
import type {
  AtualizarMercadoInput,
  CriarMercadoInput,
  ListarMercadosQuery,
} from "../validators/mercadoValidator";

export async function listarMercados(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = (req.validated?.query ?? {}) as ListarMercadosQuery;
    const filtro: Record<string, unknown> = {};

    if (query.busca) {
      const regex = new RegExp(escapeRegex(query.busca), "i");
      filtro.$or = [{ nome: regex }, { endereco: regex }];
    }

    if (query.lat !== undefined && query.lng !== undefined) {
      const raioMetros = (query.raioKm ?? 10) * 1000;
      filtro.localizacao = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [query.lng, query.lat],
          },
          $maxDistance: raioMetros,
        },
      };
    }

    const consulta = Mercado.find(filtro);
    if (query.lat === undefined) {
      consulta.sort({ nome: 1 });
    }

    const mercados = await consulta.exec();
    res.json(mercados);
  } catch (err) {
    next(err);
  }
}

export async function buscarMercadoPorId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const mercado = await Mercado.findById(id);

    if (!mercado) {
      throw new AppError("Mercado não encontrado.", 404);
    }

    res.json(mercado);
  } catch (err) {
    next(err);
  }
}

export async function criarMercado(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dados = req.validated?.body as CriarMercadoInput;

    const novoMercado = await Mercado.create({
      nome: dados.nome,
      endereco: dados.endereco,
      telefone: dados.telefone,
      horarioFuncionamento: dados.horarioFuncionamento,
      logoUrl: dados.logoUrl || undefined,
      localizacao: {
        type: "Point",
        coordinates: [dados.coordenadas.lng, dados.coordenadas.lat],
      },
    });

    res.status(201).json(novoMercado);
  } catch (err) {
    next(err);
  }
}

export async function atualizarMercado(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const dados = req.validated?.body as AtualizarMercadoInput;

    const atualizacao: Record<string, unknown> = {};
    if (dados.nome !== undefined) atualizacao.nome = dados.nome;
    if (dados.endereco !== undefined) atualizacao.endereco = dados.endereco;
    if (dados.telefone !== undefined) atualizacao.telefone = dados.telefone;
    if (dados.horarioFuncionamento !== undefined) {
      atualizacao.horarioFuncionamento = dados.horarioFuncionamento;
    }
    if (dados.logoUrl !== undefined) {
      atualizacao.logoUrl = dados.logoUrl || undefined;
    }
    if (dados.coordenadas !== undefined) {
      atualizacao.localizacao = {
        type: "Point",
        coordinates: [dados.coordenadas.lng, dados.coordenadas.lat],
      };
    }

    const mercadoAtualizado = await Mercado.findByIdAndUpdate(id, atualizacao, {
      new: true,
      runValidators: true,
    });

    if (!mercadoAtualizado) {
      throw new AppError("Mercado não encontrado.", 404);
    }

    if (dados.nome !== undefined) {
      await Produto.updateMany(
        { mercadoId: mercadoAtualizado._id },
        { $set: { mercado: mercadoAtualizado.nome } }
      );
    }

    res.json(mercadoAtualizado);
  } catch (err) {
    next(err);
  }
}

export async function removerMercado(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const mercado = await Mercado.findById(id);

    if (!mercado) {
      throw new AppError("Mercado não encontrado.", 404);
    }

    const produtosVinculados = await Produto.countDocuments({
      $or: [{ mercadoId: mercado._id }, { mercado: mercado.nome }],
    });

    if (produtosVinculados > 0) {
      throw new AppError(
        `Não é possível remover este mercado pois existem ${produtosVinculados} produto(s) vinculados.`,
        409
      );
    }

    await mercado.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
