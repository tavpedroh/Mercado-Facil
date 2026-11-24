import type { NextFunction, Request, Response } from "express";
import Categorias from "../models/Categorias";
import { AppError } from "../middlewares/errorHandler";
import type {
  AtualizarCategoriaInput,
  CriarCategoriaInput,
} from "../validators/categoriaValidator";

export async function listarCategorias(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categorias = await Categorias.find().sort({ nome: 1 });
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

export async function buscarCategoriaPorId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const categoria = await Categorias.findById(id);

    if (!categoria) {
      throw new AppError("Categoria não encontrada.", 404);
    }

    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

export async function criarCategoria(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dados = req.validated?.body as CriarCategoriaInput;
    const novaCategoria = await Categorias.create({
      nome: dados.nome,
      descricao: dados.descricao,
    });
    res.status(201).json(novaCategoria);
  } catch (err) {
    next(err);
  }
}

export async function atualizarCategoria(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const dados = req.validated?.body as AtualizarCategoriaInput;

    const categoriaAtualizada = await Categorias.findByIdAndUpdate(id, dados, {
      new: true,
      runValidators: true,
    });

    if (!categoriaAtualizada) {
      throw new AppError("Categoria não encontrada.", 404);
    }

    res.json(categoriaAtualizada);
  } catch (err) {
    next(err);
  }
}

export async function removerCategoria(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.validated?.params as { id: string };
    const categoria = await Categorias.findByIdAndDelete(id);

    if (!categoria) {
      throw new AppError("Categoria não encontrada.", 404);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
