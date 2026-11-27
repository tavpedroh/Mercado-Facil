import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response, NextFunction } from "express";
import Mercado from "../src/models/Mercado";
import Produto from "../src/models/Produto";
import Categorias from "../src/models/Categorias";
import {
  listarMercados,
  removerMercado,
  atualizarMercado,
  criarMercado,
  buscarMercadoPorId,
} from "../src/controllers/mercadoController";
import {
  listarCategorias,
  buscarCategoriaPorId,
  removerCategoria,
} from "../src/controllers/categoriaController";
import { criarProduto } from "../src/controllers/produtoController";
import { AppError } from "../src/middlewares/errorHandler";

function criarMockRes() {
  let statusCode = 200;
  let responseBody: unknown = undefined;
  let enviado = false;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      responseBody = body;
      enviado = true;
      return this;
    },
    send() {
      enviado = true;
      return this;
    },
  } as unknown as Response;

  return {
    res,
    getStatus: () => statusCode,
    getBody: () => responseBody,
    foiEnviado: () => enviado,
  };
}

function criarMockNext() {
  let capturedError: unknown = null;
  const next: NextFunction = (err?: unknown) => {
    capturedError = err ?? null;
  };
  return { next, getError: () => capturedError };
}

describe("Testes de Regras de Negócio - Controllers", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  describe("MercadoController", () => {
    it("removerMercado deve encaminhar AppError 404 quando o mercado não existe", async () => {
      const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "findById", async () => null);

      await removerMercado(req, mockRes.res, next);
      const err = getError();
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 404);
    });

    it("removerMercado deve encaminhar AppError 409 quando há produtos vinculados", async () => {
      const mercadoMock = { _id: "507f1f77bcf86cd799439011", nome: "Mercado A" };
      const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "findById", async () => mercadoMock as never);
      mock.method(Produto, "countDocuments", async () => 5 as never);

      await removerMercado(req, mockRes.res, next);
      const err = getError();
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 409);
    });

    it("removerMercado deve remover e responder 204 quando não há produtos vinculados", async () => {
      let deletado = false;
      const mercadoMock = {
        _id: "507f1f77bcf86cd799439011",
        nome: "Mercado A",
        deleteOne: async () => {
          deletado = true;
        },
      };
      const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "findById", async () => mercadoMock as never);
      mock.method(Produto, "countDocuments", async () => 0 as never);

      await removerMercado(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.ok(deletado);
      assert.strictEqual(mockRes.getStatus(), 204);
      assert.ok(mockRes.foiEnviado());
    });

    it("atualizarMercado deve sincronizar nome nos produtos vinculados", async () => {
      const mercadoAtualizado = { _id: "507f1f77bcf86cd799439011", nome: "Mercado Novo" };
      const req = {
        validated: {
          params: { id: "507f1f77bcf86cd799439011" },
          body: { nome: "Mercado Novo" },
        },
      } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "findByIdAndUpdate", async () => mercadoAtualizado as never);
      const updateManyMock = mock.method(Produto, "updateMany", async () => ({ modifiedCount: 2 }) as never);

      await atualizarMercado(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.strictEqual(updateManyMock.mock.callCount(), 1);
      assert.deepStrictEqual(mockRes.getBody(), mercadoAtualizado);
    });

    it("atualizarMercado deve encaminhar AppError 404 quando mercado não encontrado", async () => {
      const req = {
        validated: {
          params: { id: "507f1f77bcf86cd799439011" },
          body: { nome: "Mercado Novo" },
        },
      } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "findByIdAndUpdate", async () => null);

      await atualizarMercado(req, mockRes.res, next);
      const err = getError();
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 404);
    });

    it("buscarMercadoPorId deve encaminhar AppError 404 quando mercado não existe", async () => {
      const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "findById", async () => null);

      await buscarMercadoPorId(req, mockRes.res, next);
      const err = getError();
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 404);
    });

    it("criarMercado deve retornar 201 ao criar um novo mercado", async () => {
      const criado = { _id: "507f1f77bcf86cd799439011", nome: "Novo Mercado" };
      const req = {
        validated: { body: { nome: "Novo Mercado", coordenadas: { lat: -23.55, lng: -46.63 } } },
      } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "create", async () => criado as never);

      await criarMercado(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.strictEqual(mockRes.getStatus(), 201);
      assert.deepStrictEqual(mockRes.getBody(), criado);
    });

    it("listarMercados deve retornar lista de mercados ordenada", async () => {
      const lista = [{ _id: "1", nome: "Mercado A" }];
      const req = { validated: { query: {} } } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "find", () => ({ sort() { return this; }, exec: async () => lista }) as never);

      await listarMercados(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.deepStrictEqual(mockRes.getBody(), lista);
    });
  });

  describe("CategoriaController", () => {
    it("buscarCategoriaPorId deve encaminhar AppError 404 quando categoria não existe", async () => {
      const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Categorias, "findById", async () => null);

      await buscarCategoriaPorId(req, mockRes.res, next);
      const err = getError();
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 404);
    });

    it("removerCategoria deve retornar 204 ao remover categoria existente", async () => {
      const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Categorias, "findByIdAndDelete", async () => ({ _id: "id1", nome: "Bebidas" }) as never);

      await removerCategoria(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.strictEqual(mockRes.getStatus(), 204);
    });

    it("listarCategorias deve retornar a lista ordenada", async () => {
      const lista = [{ _id: "1", nome: "Alimentos" }];
      const req = {} as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Categorias, "find", () => ({ sort: async () => lista }) as never);

      await listarCategorias(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.deepStrictEqual(mockRes.getBody(), lista);
    });
  });

  describe("ProdutoController", () => {
    it("criarProduto deve encaminhar AppError 404 se o mercadoId informado não existe", async () => {
      const req = {
        validated: {
          body: {
            nome: "Arroz",
            preco: 25.9,
            desconto: 0,
            unidade: "kg",
            categoria: "Alimentos",
            mercadoId: "507f1f77bcf86cd799439011",
          },
        },
      } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "findById", async () => null);

      await criarProduto(req, mockRes.res, next);
      const err = getError();
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.statusCode, 404);
    });

    it("criarProduto deve retornar 201 ao criar produto resolvendo mercado por nome", async () => {
      const criado = { _id: "prod1", nome: "Arroz", mercado: "Mercado Nome" };
      const req = {
        validated: {
          body: {
            nome: "Arroz",
            preco: 25.9,
            desconto: 10,
            unidade: "kg",
            categoria: "Alimentos",
            mercado: "Mercado Nome",
          },
        },
      } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();
      mock.method(Mercado, "findOne", async () => ({ _id: "507f1f77bcf86cd799439011", nome: "Mercado Nome" }) as never);
      mock.method(Produto, "create", async () => criado as never);

      await criarProduto(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.strictEqual(mockRes.getStatus(), 201);
      assert.deepStrictEqual(mockRes.getBody(), criado);
    });
  });
});
