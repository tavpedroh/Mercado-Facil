import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  classificarValidadeOferta,
  calcularScoreOferta,
  calcularPrecoPorUnidadeBase,
} from "../src/utils/ofertasInsights.ts";
import type { Produto } from "../src/types/produto.ts";

describe("F4.2 — Insights de validade, score e preço unitário", () => {
  describe("classificarValidadeOferta", () => {
    const agora = new Date(2026, 4, 10, 12, 0, 0); // 10/05/2026

    it("retorna sem_validade quando ausente ou inválida", () => {
      assert.strictEqual(classificarValidadeOferta(undefined, agora).status, "sem_validade");
      assert.strictEqual(classificarValidadeOferta(undefined, agora).diasRestantes, null);
      assert.strictEqual(classificarValidadeOferta("data-invalida", agora).status, "sem_validade");
    });

    it("retorna expirada quando data é anterior ao dia atual", () => {
      const ontem = new Date(2026, 4, 9, 12, 0, 0).toISOString();
      const res = classificarValidadeOferta(ontem, agora);
      assert.strictEqual(res.status, "expirada");
      assert.strictEqual(res.diasRestantes, -1);
    });

    it("retorna expira_hoje quando data é no mesmo dia", () => {
      const hoje = new Date(2026, 4, 10, 18, 0, 0).toISOString();
      const res = classificarValidadeOferta(hoje, agora);
      assert.strictEqual(res.status, "expira_hoje");
      assert.strictEqual(res.diasRestantes, 0);
    });

    it("retorna ultimos_dias para 1 a 3 dias restantes e ativa para 4+ dias", () => {
      const emDoisDias = new Date(2026, 4, 12, 12, 0, 0).toISOString();
      const emCincoDias = new Date(2026, 4, 15, 12, 0, 0).toISOString();

      const resUltimos = classificarValidadeOferta(emDoisDias, agora);
      const resAtiva = classificarValidadeOferta(emCincoDias, agora);

      assert.strictEqual(resUltimos.status, "ultimos_dias");
      assert.strictEqual(resUltimos.diasRestantes, 2);
      assert.strictEqual(resAtiva.status, "ativa");
      assert.strictEqual(resAtiva.diasRestantes, 5);
    });
  });

  describe("calcularScoreOferta", () => {
    it("retorna score entre 0 e 100 e pontua melhor ofertas mais baratas/com maior desconto", () => {
      const barato: Produto = {
        nome: "Arroz 5kg",
        preco: 30,
        desconto: 30, // precoFinal = 21
        categoria: "Alimentos",
        mercado: "Mercado A",
      };
      const caro: Produto = {
        nome: "Arroz 5kg",
        preco: 32,
        desconto: 0, // precoFinal = 32
        categoria: "Alimentos",
        mercado: "Mercado B",
      };
      const equivalentes = [barato, caro];

      const scoreBarato = calcularScoreOferta(barato, equivalentes);
      const scoreCaro = calcularScoreOferta(caro, equivalentes);

      assert.ok(scoreBarato >= 0 && scoreBarato <= 100);
      assert.ok(scoreCaro >= 0 && scoreCaro <= 100);
      assert.ok(scoreBarato > scoreCaro);
    });

    it("sem equivalentes usa o desconto percentual dentro da faixa 0..100", () => {
      const produto: Produto = {
        nome: "Café 500g",
        preco: 20,
        desconto: 25,
        categoria: "Bebidas",
        mercado: "Mercado A",
      };
      assert.strictEqual(calcularScoreOferta(produto), 25);
    });
  });

  describe("calcularPrecoPorUnidadeBase", () => {
    it("calcula preço por kg para 500g e 5kg", () => {
      assert.deepStrictEqual(
        calcularPrecoPorUnidadeBase({ nome: "Café Torrado 500g", preco: 18, desconto: 0 }),
        { precoBase: 36, unidadeBase: "kg" }
      );
      assert.deepStrictEqual(
        calcularPrecoPorUnidadeBase({ nome: "Arroz Branco 5kg", preco: 25, desconto: 0 }),
        { precoBase: 5, unidadeBase: "kg" }
      );
    });

    it("calcula preço por L para 2L e 350ml", () => {
      assert.deepStrictEqual(
        calcularPrecoPorUnidadeBase({ nome: "Refrigerante Cola 2L", preco: 10, desconto: 10 }),
        { precoBase: 4.5, unidadeBase: "L" }
      );
      assert.deepStrictEqual(
        calcularPrecoPorUnidadeBase({ nome: "Lata 350ml", preco: 3.5, desconto: 0 }),
        { precoBase: 10, unidadeBase: "L" }
      );
    });

    it("retorna null quando não há medida reconhecível no nome", () => {
      assert.strictEqual(
        calcularPrecoPorUnidadeBase({ nome: "Escova Dental Macia", preco: 12, desconto: 0 }),
        null
      );
    });
  });
});
