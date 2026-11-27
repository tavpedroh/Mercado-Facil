import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  analisarOrcamento,
  otimizarPorLimiteMercados,
  exportarListaParaTexto,
  type ItemCompraSimples,
} from "../src/utils/otimizadorLista.ts";
import type { Produto } from "../src/types/produto.ts";

describe("Otimizador de Lista", () => {
  const produtoA: Produto = {
    nome: "Arroz",
    preco: 10,
    desconto: 0,
    categoria: "Grãos",
    mercado: "Mercado A",
  };
  const produtoB: Produto = {
    nome: "Feijão",
    preco: 8,
    desconto: 0,
    categoria: "Grãos",
    mercado: "Mercado B",
  };
  const produtoC: Produto = {
    nome: "Leite",
    preco: 5,
    desconto: 10,
    categoria: "Laticínios",
    mercado: "Mercado A",
  };

  it("analisarOrcamento retorna dentro do orçamento quando total é menor ou igual ao limite", () => {
    const itens: ItemCompraSimples[] = [{ produto: produtoA, quantidade: 2 }];
    const resultado = analisarOrcamento(itens, 50);
    assert.strictEqual(resultado.dentroDoOrcamento, true);
    assert.strictEqual(resultado.total, 20);
    assert.strictEqual(resultado.saldoOuExcesso, 30);
    assert.strictEqual(resultado.percentualUtilizado, 40);
  });

  it("analisarOrcamento retorna acima do orçamento quando total excede limite", () => {
    const itens: ItemCompraSimples[] = [{ produto: produtoA, quantidade: 10 }];
    const resultado = analisarOrcamento(itens, 50);
    assert.strictEqual(resultado.dentroDoOrcamento, false);
    assert.strictEqual(resultado.saldoOuExcesso, 50);
    assert.strictEqual(resultado.percentualUtilizado, 200);
  });

  it("analisarOrcamento lida com lista vazia retornando zero", () => {
    const resultado = analisarOrcamento([], 100);
    assert.strictEqual(resultado.total, 0);
    assert.strictEqual(resultado.dentroDoOrcamento, true);
    assert.strictEqual(resultado.percentualUtilizado, 0);
  });

  it("otimizarPorLimiteMercados combina 2 mercados para reduzir custo frente a 1 mercado", () => {
    const catalogo: Produto[] = [
      { nome: "Arroz", preco: 20, categoria: "Grãos", mercado: "Mercado A" },
      { nome: "Feijão", preco: 15, categoria: "Grãos", mercado: "Mercado A" },
      { nome: "Arroz", preco: 25, categoria: "Grãos", mercado: "Mercado B" },
      { nome: "Feijão", preco: 8, categoria: "Grãos", mercado: "Mercado B" },
      { nome: "Arroz", preco: 30, categoria: "Grãos", mercado: "Mercado C" },
      { nome: "Feijão", preco: 12, categoria: "Grãos", mercado: "Mercado C" },
    ];
    const itens: ItemCompraSimples[] = [
      { produto: produtoA, quantidade: 1 },
      { produto: produtoB, quantidade: 1 },
    ];

    const umMercado = otimizarPorLimiteMercados(itens, catalogo, 1);
    const doisMercados = otimizarPorLimiteMercados(itens, catalogo, 2);

    assert.strictEqual(umMercado.mercadosSelecionados.length, 1);
    assert.strictEqual(umMercado.mercadosSelecionados[0], "Mercado B");
    assert.strictEqual(umMercado.total, 33);

    assert.strictEqual(doisMercados.mercadosSelecionados.length, 2);
    assert.strictEqual(doisMercados.total, 28);
    assert.ok(doisMercados.total < umMercado.total);
  });

  it("otimizarPorLimiteMercados retorna resultado vazio para itens vazios", () => {
    const resultado = otimizarPorLimiteMercados([], [], 2);
    assert.strictEqual(resultado.totalItens, 0);
    assert.deepStrictEqual(resultado.alocacao, {});
  });

  it("exportarListaParaTexto inclui título, agrupa por mercado e exibe total geral", () => {
    const itens: ItemCompraSimples[] = [
      { produto: produtoA, quantidade: 2 },
      { produto: produtoC, quantidade: 1 },
      { produto: produtoB, quantidade: 1 },
    ];
    const texto = exportarListaParaTexto(itens, "Compra da Semana");
    assert.ok(texto.startsWith("🛒 Compra da Semana"));
    assert.ok(texto.includes("🏪 Mercado A"));
    assert.ok(texto.includes("🏪 Mercado B"));
    assert.ok(texto.includes("Arroz (2x)"));
    assert.ok(texto.includes("💰 Subtotal:"));
    assert.ok(texto.includes("💵 TOTAL GERAL:"));
  });
});
