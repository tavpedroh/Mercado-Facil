import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { calcularResumoCatalogo } from "../src/controllers/estatisticasController";

describe("F2.3 — Testes unitários de estatísticas do catálogo", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("deve retornar resumo vazio e sem erros para lista vazia", () => {
    const resultado = calcularResumoCatalogo([], 0, 0);
    assert.strictEqual(resultado.totalProdutos, 0);
    assert.strictEqual(resultado.totalOfertasAtivas, 0);
    assert.strictEqual(resultado.totalComDesconto, 0);
    assert.strictEqual(resultado.descontoMedio, 0);
    assert.deepStrictEqual(resultado.maioresDescontos, []);
    assert.deepStrictEqual(resultado.porCategoria, []);
    assert.deepStrictEqual(resultado.rankingMercados, []);
  });

  it("deve calcular totalProdutos corretamente", () => {
    const produtos = Array.from({ length: 10 }, (_, i) => ({
      preco: 10 + i,
      desconto: 5,
      categoria: "Eletrônicos",
      mercado: "SP",
      validadeOferta: null,
    }));
    const resultado = calcularResumoCatalogo(produtos, 2, 3);
    assert.strictEqual(resultado.totalProdutos, 10);
  });

  it("deve filtrar corretamente ofertas ativas vs expiradas", () => {
    const agora = new Date();
    const produtos = [
      { preco: 100, desconto: 10, categoria: "A", mercado: "X", validadeOferta: null }, // Ativa
      { preco: 200, desconto: 20, categoria: "B", mercado: "Y", validadeOferta: new Date(agora.getTime() - 86400000) }, // Expirada
      { preco: 300, desconto: 30, categoria: "C", mercado: "Z", validadeOferta: new Date(agora.getTime() + 86400000) }, // Ativa
    ];
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.totalOfertasAtivas, 2);
  });

  it("deve calcular totalComDesconto apenas para itens com desconto > 0", () => {
    const produtos = [
      { preco: 50, desconto: 0, categoria: "A", mercado: "X" },
      { preco: 60, desconto: 10, categoria: "B", mercado: "Y" },
      { preco: 70, desconto: 20, categoria: "C", mercado: "Z" },
    ];
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.totalComDesconto, 2);
  });

  it("deve calcular descontoMedio ponderado apenas sobre ofertas ativas com desconto", () => {
    const agora = new Date();
    const produtos = [
      { preco: 100, desconto: 10, categoria: "A", mercado: "X", validadeOferta: null }, // Ativa, tem desconto
      { preco: 200, desconto: 50, categoria: "B", mercado: "Y", validadeOferta: new Date(agora.getTime() - 86400000) }, // Expirada, ignora para média
    ];
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.descontoMedio, 10.00);
  });

  it("deve retornar top 5 maioresDescontos ordenados corretamente", () => {
    const produtos = Array.from({ length: 7 }, (_, i) => ({
      preco: 10 + i,
      desconto: (i % 3 === 0 ? 20 : 10), // Alternar descontos para testar ordenação
      categoria: "Teste",
      mercado: "SP",
    }));
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.maioresDescontos.length, 5);
    assert.strictEqual(resultado.maioresDescontos[0].desconto, 20.00);
    assert.strictEqual(resultado.maioresDescontos[4].desconto, 10.00);
  });

  it("deve agrupar corretamente porCategoria e ordenar alfabeticamente", () => {
    const produtos = [
      { preco: 100, desconto: 5, categoria: "Zebra", mercado: "A" },
      { preco: 200, desconto: 10, categoria: "Alpha", mercado: "B" },
      { preco: 300, desconto: 15, categoria: "Beta", mercado: "C" },
    ];
    const resultado = calcularResumoCatalogo(produtos, 1, 2);
    assert.strictEqual(resultado.porCategoria[0].categoria, "Alpha");
    assert.strictEqual(resultado.porCategoria[1].categoria, "Beta");
    assert.strictEqual(resultado.porCategoria[2].categoria, "Zebra");
  });

  it("deve calcular precoMedio por categoria corretamente", () => {
    const produtos = [
      { preco: 100, desconto: 5, categoria: "A", mercado: "X" },
      { preco: 200, desconto: 10, categoria: "A", mercado: "Y" },
    ];
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.porCategoria[0].precoMedio, 150.00);
  });

  it("deve agrupar corretamente porMercado e ordenar por descontoMedio desc", () => {
    const produtos = [
      { preco: 100, desconto: 20, categoria: "A", mercado: "SP" }, // Desconto alto
      { preco: 50, desconto: 5, categoria: "B", mercado: "RJ" },   // Desconto baixo
    ];
    const resultado = calcularResumoCatalogo(produtos, 2, 1);
    assert.strictEqual(resultado.rankingMercados[0].mercado, "SP");
    assert.strictEqual(resultado.rankingMercados[1].mercado, "RJ");
  });

  it("deve ordenar rankingMercados secundariamente por precoMedio asc em caso de empate", () => {
    const produtos = [
      { preco: 100, desconto: 20, categoria: "A", mercado: "Mercado Caro", validadeOferta: null },
      { preco: 50, desconto: 20, categoria: "B", mercado: "Mercado Barato", validadeOferta: null },
    ];
    const resultado = calcularResumoCatalogo(produtos, 2, 2);
    assert.strictEqual(resultado.rankingMercados[0].mercado, "Mercado Barato");
    assert.strictEqual(resultado.rankingMercados[0].precoMedio, 50);
    assert.strictEqual(resultado.rankingMercados[1].mercado, "Mercado Caro");
    assert.strictEqual(resultado.rankingMercados[1].precoMedio, 100);
    assert.strictEqual(resultado.totalMercados, 2);
    assert.strictEqual(resultado.totalCategorias, 2);
  });

  it("deve retornar descontoMedio 0 quando há produtos ativos sem desconto", () => {
    const produtos = [{ preco: 30, desconto: 0, categoria: "A", mercado: "X", validadeOferta: null }];
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.descontoMedio, 0);
    assert.strictEqual(resultado.totalOfertasAtivas, 1);
  });

  it("deve lidar com produtos sem validadeOferta definindo como ativos", () => {
    const produtos = [
      { preco: 100, desconto: 10, categoria: "A", mercado: "X" }, // Sem validade
      { preco: 200, desconto: 20, categoria: "B", mercado: "Y", validadeOferta: null }, // Null explícito
    ];
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.totalOfertasAtivas, 2);
  });

  it("deve formatar corretamente valores numéricos com toFixed(2)", () => {
    const produtos = [
      { preco: 10.333, desconto: 5.6789, categoria: "A", mercado: "X" },
    ];
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.descontoMedio.toFixed(2), "5.68"); // Verificação indireta via string ou number
    assert.deepStrictEqual(resultado.maioresDescontos[0].desconto, 5.68);
  });

  it("deve ignorar produtos com desconto <= 0 no cálculo de maioresDescontos", () => {
    const produtos = [
      { preco: 100, desconto: -5, categoria: "A", mercado: "X" }, // Negativo
      { preco: 200, desconto: 0, categoria: "B", mercado: "Y" },   // Zero
      { preco: 300, desconto: 10, categoria: "C", mercado: "Z" },  // Positivo
    ];
    const resultado = calcularResumoCatalogo(produtos, 1, 1);
    assert.strictEqual(resultado.maioresDescontos.length, 1);
    assert.strictEqual(resultado.maioresDescontos[0].desconto, 10.00);
  });
});
