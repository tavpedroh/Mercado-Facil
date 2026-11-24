import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

export class AppError extends Error {
  readonly statusCode: number;
  readonly detalhes?: unknown;

  constructor(mensagem: string, statusCode = 400, detalhes?: unknown) {
    super(mensagem);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.detalhes = detalhes;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    erro: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      erro: err.message,
      ...(err.detalhes !== undefined ? { detalhes: err.detalhes } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      erro: "Dados inválidos.",
      detalhes: err.issues.map((issue) => ({
        campo: issue.path.join(".") || "geral",
        mensagem: issue.message,
      })),
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      erro: "Erro de validação nos dados.",
      detalhes: Object.values(err.errors).map((e) => ({
        campo: e.path,
        mensagem: e.message,
      })),
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      erro: `Valor inválido para o campo '${err.path}'.`,
    });
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    const keyValue =
      "keyValue" in err ? (err as { keyValue?: Record<string, unknown> }).keyValue : undefined;
    const campo = keyValue ? Object.keys(keyValue)[0] : "registro";
    res.status(409).json({
      erro: `Já existe um registro cadastrado com este valor em '${campo}'.`,
    });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      erro: "JSON malformado no corpo da requisição.",
    });
    return;
  }

  console.error("Erro interno não tratado:", err);
  res.status(500).json({
    erro: "Erro interno do servidor.",
  });
}
