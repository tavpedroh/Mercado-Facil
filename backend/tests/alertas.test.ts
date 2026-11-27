import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import {
  criarAlertaSchema,
  atualizarAlertaSchema,
  listarAlertasQuerySchema,
} from "../src/validators/alertaValidator";
import {
  atualizarAlerta,
  buscarAlertaPorId,
  calcularPrecoComDesconto,
  criarAlerta,
  removerAlerta,
  verificarAlertasDisparados,
} from "../src/controllers/alertaController";
import AlertaPreco from "../src/models/AlertaPreco";
import Produto from "../src/models/Produto";
import { AppError } from "../src/middlewares/errorHandler";

function criarMockRes() {
  let statusCode = 200;
  let body: unknown = undefined;
  let sent = false;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: unknown) {
      body = data;
      sent = true;
      return this;
    },
    send() {
      sent = true;
      return this;
    },
  } as unknown as Response;
  return { res, getStatus: () => statusCode, getBody: () => body, foiEnviado: () => sent };
}

function criarMockNext() {
  let erro: unknown = null;
  const next: NextFunction = (err?: unknown) => {
    erro = err ?? null;
  };
  return { next, getError: () => erro };
}

describe("F1.5 — Testes unitários de validadores e controller de alertas", () => {
  afterEach(() => mock.restoreAll());

  describe("Validadores (alertaValidator.ts)", () => {
    it("criarAlertaSchema aceita dados válidos completos e aplica default ativo=true", () => {
      const parsed = criarAlertaSchema.parse({
        termoProduto: "Arroz 5kg",
        precoAlvo: 21.5,
        email: "user@test.com",
      });
      assert.strictEqual(parsed.termoProduto, "Arroz 5kg");
      assert.strictEqual(parsed.precoAlvo, 21.5);
      assert.strictEqual(parsed.ativo, true);
    });

    it("criarAlertaSchema rejeita precoAlvo <= 0, termo curto e email inválido", () => {
      assert.throws(
        () => criarAlertaSchema.parse({ termoProduto: "Arroz", precoAlvo: -1 }),
        /Preço alvo deve ser maior que zero/
      );
      assert.throws(
        () => criarAlertaSchema.parse({ termoProduto: "A", precoAlvo: 10 }),
        /Termo do produto deve ter pelo menos 2/
      );
      assert.throws(
        () => criarAlertaSchema.parse({ termoProduto: "Arroz", precoAlvo: 10, email: "invalido" }),
        /E-mail inválido/
      );
    });

    it("criarAlertaSchema aceita email vazio ou omitido", () => {
      const comVazio = criarAlertaSchema.parse({ termoProduto: "Arroz", precoAlvo: 15, email: "" });
      const semEmail = criarAlertaSchema.parse({ termoProduto: "Arroz", precoAlvo: 15 });
      assert.strictEqual(comVazio.email, "");
      assert.strictEqual(semEmail.email, undefined);
    });

    it("atualizarAlertaSchema rejeita objeto vazio e aceita atualização parcial", () => {
      assert.throws(() => atualizarAlertaSchema.parse({}), /Informe ao menos um campo/);
      const parsed = atualizarAlertaSchema.parse({ precoAlvo: 19.9 });
      assert.strictEqual(parsed.precoAlvo, 19.9);
    });

    it("listarAlertasQuerySchema converte ativo string para boolean e preserva busca", () => {
      const parsed = listarAlertasQuerySchema.parse({ ativo: "true", busca: "Arroz" });
      assert.strictEqual(parsed.ativo, true);
      assert.strictEqual(parsed.busca, "Arroz");
    });
  });

  describe("Controller de Alertas (alertaController.ts)", () => {
    it("calcularPrecoComDesconto arredonda corretamente para 2 casas", () => {
      assert.strictEqual(calcularPrecoComDesconto(20, 15), 17);
      assert.strictEqual(calcularPrecoComDesconto(10, 0), 10);
    });

    it("criarAlerta retorna status 201 e o alerta criado", async () => {
      const mockData = { _id: "67890", termoProduto: "Arroz", precoAlvo: 20 };
      mock.method(AlertaPreco, "create", async () => mockData as never);

      const req = {
        validated: { body: { termoProduto: "Arroz", precoAlvo: 20, email: "" } },
      } as unknown as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();

      await criarAlerta(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.strictEqual(mockRes.getStatus(), 201);
      assert.deepStrictEqual(mockRes.getBody(), mockData);
    });

    it("buscarAlertaPorId e atualizarAlerta encaminham AppError 404 quando ausente", async () => {
      mock.method(AlertaPreco, "findById", async () => null);
      mock.method(AlertaPreco, "findByIdAndUpdate", async () => null);

      const req = {
        validated: { params: { id: "507f1f77bcf86cd799439011" }, body: { precoAlvo: 18 } },
      } as unknown as Request;

      const r1 = criarMockRes();
      const n1 = criarMockNext();
      await buscarAlertaPorId(req, r1.res, n1.next);
      assert.ok(n1.getError() instanceof AppError);
      assert.strictEqual((n1.getError() as AppError).statusCode, 404);

      const r2 = criarMockRes();
      const n2 = criarMockNext();
      await atualizarAlerta(req, r2.res, n2.next);
      assert.ok(n2.getError() instanceof AppError);
      assert.strictEqual((n2.getError() as AppError).statusCode, 404);
    });

    it("removerAlerta responde 204 quando removido e AppError 404 quando não existe", async () => {
      const req = {
        validated: { params: { id: "507f1f77bcf86cd799439011" } },
      } as unknown as Request;

      mock.method(AlertaPreco, "findByIdAndDelete", async () => ({ _id: "1" }) as never);
      const r1 = criarMockRes();
      const n1 = criarMockNext();
      await removerAlerta(req, r1.res, n1.next);
      assert.strictEqual(n1.getError(), null);
      assert.strictEqual(r1.getStatus(), 204);
      assert.ok(r1.foiEnviado());

      mock.restoreAll();
      mock.method(AlertaPreco, "findByIdAndDelete", async () => null);
      const r2 = criarMockRes();
      const n2 = criarMockNext();
      await removerAlerta(req, r2.res, n2.next);
      assert.ok(n2.getError() instanceof AppError);
      assert.strictEqual((n2.getError() as AppError).statusCode, 404);
    });

    it("verificarAlertasDisparados retorna apenas alertas atingidos por precoFinal <= precoAlvo", async () => {
      const alertas = [
        { _id: "a1", termoProduto: "Arroz", precoAlvo: 20, categoria: "Alimentos", ativo: true },
        { _id: "a2", termoProduto: "Café", precoAlvo: 10, ativo: true },
      ];
      const produtos = [
        {
          _id: "p1",
          nome: "Arroz Tipo 1 5kg",
          preco: 25,
          desconto: 24, // precoFinal = 19.00 <= 20
          categoria: "Alimentos",
          mercado: "Mercado A",
        },
        {
          _id: "p2",
          nome: "Café Tradicional",
          preco: 18,
          desconto: 10, // precoFinal = 16.20 > 10 (não dispara)
          categoria: "Bebidas",
          mercado: "Mercado B",
        },
      ];

      mock.method(AlertaPreco, "find", async () => alertas as never);
      mock.method(Produto, "find", async () => produtos as never);

      const req = {} as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();

      await verificarAlertasDisparados(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      const body = mockRes.getBody() as Array<{
        alerta: { _id: string };
        melhorPreco: number;
        ofertasCompativeis: Array<{ _id: string; precoFinal: number }>;
      }>;
      assert.strictEqual(body.length, 1);
      assert.strictEqual(body[0].alerta._id, "a1");
      assert.strictEqual(body[0].melhorPreco, 19);
      assert.strictEqual(body[0].ofertasCompativeis.length, 1);
      assert.strictEqual(body[0].ofertasCompativeis[0]._id, "p1");
    });

    it("verificarAlertasDisparados retorna lista vazia quando não há alertas ativos", async () => {
      mock.method(AlertaPreco, "find", async () => [] as never);
      const req = {} as Request;
      const mockRes = criarMockRes();
      const { next, getError } = criarMockNext();

      await verificarAlertasDisparados(req, mockRes.res, next);
      assert.strictEqual(getError(), null);
      assert.deepStrictEqual(mockRes.getBody(), []);
    });
  });
});
