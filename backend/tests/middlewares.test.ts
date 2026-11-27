import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import { validate } from "../src/middlewares/validate";
import { AppError, notFoundHandler, errorHandler } from "../src/middlewares/errorHandler";
import { z, ZodError } from "zod";
import mongoose from "mongoose";

interface ErrorResponseBody {
  erro?: string;
  detalhes?: unknown;
}

function criarMockRes() {
  let statusCode = 200;
  let jsonBody: ErrorResponseBody | undefined;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: ErrorResponseBody) {
      jsonBody = body;
      return this;
    },
  } as unknown as Response;
  return { res, getStatus: () => statusCode, getBody: () => jsonBody };
}

describe("Middlewares", () => {
  afterEach(() => mock.restoreAll());

  describe("validate", () => {
    it("deve atualizar req.body e req.validated.body com sucesso", () => {
      const schema = z.object({ nome: z.string().trim() });
      const req = { body: { nome: "  João  " } } as unknown as Request;
      const res = {} as Response;
      let nextErro: unknown = "nao-chamado";
      const next: NextFunction = (err?: unknown) => {
        nextErro = err;
      };

      validate(schema, "body")(req, res, next);
      assert.strictEqual(nextErro, undefined);
      assert.strictEqual((req.body as { nome: string }).nome, "João");
      assert.strictEqual((req.validated?.body as { nome: string }).nome, "João");
    });

    it("deve passar erro Zod para o próximo quando o body é inválido", () => {
      const schema = z.object({ idade: z.number() });
      const req = { body: { idade: "não é número" } } as unknown as Request;
      const res = {} as Response;
      let erroCapturado: unknown;
      const next: NextFunction = (err?: unknown) => {
        erroCapturado = err;
      };

      validate(schema, "body")(req, res, next);
      assert.ok(erroCapturado instanceof ZodError);
    });

    it("deve atualizar req.validated.query com sucesso", () => {
      const schema = z.object({ pagina: z.coerce.number() });
      const req = { query: { pagina: "2" } } as unknown as Request;
      const res = {} as Response;
      let chamado = false;
      const next: NextFunction = (err?: unknown) => {
        assert.strictEqual(err, undefined);
        chamado = true;
      };

      validate(schema, "query")(req, res, next);
      assert.ok(chamado);
      assert.strictEqual((req.validated?.query as { pagina: number }).pagina, 2);
    });

    it("deve atualizar req.validated.params com sucesso", () => {
      const schema = z.object({ id: z.string() });
      const req = { params: { id: "123" } } as unknown as Request;
      const res = {} as Response;
      let chamado = false;
      const next: NextFunction = (err?: unknown) => {
        assert.strictEqual(err, undefined);
        chamado = true;
      };

      validate(schema, "params")(req, res, next);
      assert.ok(chamado);
      assert.strictEqual((req.validated?.params as { id: string }).id, "123");
    });

    it("deve passar erro Zod para o próximo quando os params são inválidos", () => {
      const schema = z.object({ id: z.string() });
      const req = { params: { id: 123 } } as unknown as Request;
      const res = {} as Response;
      let erroCapturado: unknown;
      const next: NextFunction = (err?: unknown) => {
        erroCapturado = err;
      };

      validate(schema, "params")(req, res, next);
      assert.ok(erroCapturado instanceof ZodError);
    });
  });

  describe("notFoundHandler", () => {
    it("deve retornar status 404 e mensagem com método e URL", () => {
      const req = { method: "GET", originalUrl: "/usuarios/1" } as unknown as Request;
      const mockRes = criarMockRes();
      notFoundHandler(req, mockRes.res);
      assert.strictEqual(mockRes.getStatus(), 404);
      assert.strictEqual(mockRes.getBody()?.erro, "Rota não encontrada: GET /usuarios/1");
    });
  });

  describe("errorHandler", () => {
    const req = {} as unknown as Request;
    const noopNext: NextFunction = () => {};

    it("deve retornar AppError com status e detalhes", () => {
      const mockRes = criarMockRes();
      const err = new AppError("Erro customizado", 404, { motivo: "não encontrado" });
      errorHandler(err, req, mockRes.res, noopNext);
      assert.strictEqual(mockRes.getStatus(), 404);
      assert.strictEqual(mockRes.getBody()?.erro, "Erro customizado");
      assert.deepStrictEqual(mockRes.getBody()?.detalhes, { motivo: "não encontrado" });
    });

    it("deve retornar AppError sem detalhes", () => {
      const mockRes = criarMockRes();
      const err = new AppError("Erro genérico", 400);
      errorHandler(err, req, mockRes.res, noopNext);
      assert.strictEqual(mockRes.getStatus(), 400);
      assert.strictEqual(mockRes.getBody()?.erro, "Erro genérico");
      assert.strictEqual(mockRes.getBody()?.detalhes, undefined);
    });

    it("deve retornar ZodError com status 400 e lista de issues", () => {
      const mockRes = criarMockRes();
      const parsed = z.object({ nome: z.string() }).safeParse({});
      assert.ok(!parsed.success);
      errorHandler(parsed.error, req, mockRes.res, noopNext);
      assert.strictEqual(mockRes.getStatus(), 400);
      assert.strictEqual(mockRes.getBody()?.erro, "Dados inválidos.");
      const detalhes = mockRes.getBody()?.detalhes as Array<{ campo: string; mensagem: string }>;
      assert.strictEqual(detalhes[0].campo, "nome");
      assert.ok(detalhes[0].mensagem.length > 0);
    });

    it("deve retornar mongoose.Error.ValidationError com status 400", () => {
      const mockRes = criarMockRes();
      const err = new mongoose.Error.ValidationError();
      err.addError("nome", new mongoose.Error.ValidatorError({ path: "nome", message: "Nome inválido" }));
      errorHandler(err, req, mockRes.res, noopNext);
      assert.strictEqual(mockRes.getStatus(), 400);
      assert.strictEqual(mockRes.getBody()?.erro, "Erro de validação nos dados.");
      const detalhes = mockRes.getBody()?.detalhes as Array<{ campo: string; mensagem: string }>;
      assert.strictEqual(detalhes[0].campo, "nome");
    });

    it("deve retornar mongoose.Error.CastError com status 400", () => {
      const mockRes = criarMockRes();
      const err = new mongoose.Error.CastError("ObjectId", "abc", "id");
      errorHandler(err, req, mockRes.res, noopNext);
      assert.strictEqual(mockRes.getStatus(), 400);
      assert.strictEqual(mockRes.getBody()?.erro, "Valor inválido para o campo 'id'.");
    });

    it("deve retornar erro Mongo 11000 com status 409", () => {
      const mockRes = criarMockRes();
      const err = { code: 11000, keyValue: { email: "test@example.com" } };
      errorHandler(err, req, mockRes.res, noopNext);
      assert.strictEqual(mockRes.getStatus(), 409);
      assert.strictEqual(
        mockRes.getBody()?.erro,
        "Já existe um registro cadastrado com este valor em 'email'."
      );
    });

    it("deve retornar SyntaxError com body como JSON malformado", () => {
      const mockRes = criarMockRes();
      const err = Object.assign(new SyntaxError("Unexpected token"), { body: '{"invalid": }' });
      errorHandler(err, req, mockRes.res, noopNext);
      assert.strictEqual(mockRes.getStatus(), 400);
      assert.strictEqual(mockRes.getBody()?.erro, "JSON malformado no corpo da requisição.");
    });

    it("deve retornar erro genérico com status 500", () => {
      const mockRes = criarMockRes();
      mock.method(console, "error", () => {});
      const err = new Error("Falha interna");
      errorHandler(err, req, mockRes.res, noopNext);
      assert.strictEqual(mockRes.getStatus(), 500);
      assert.strictEqual(mockRes.getBody()?.erro, "Erro interno do servidor.");
    });
  });
});
