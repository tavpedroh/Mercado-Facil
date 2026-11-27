import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatarMoeda,
  calcularPrecoFinal,
  gerarChaveComparacao,
  obterIdProduto,
  construirMapaComparacoes,
  calcularDistanciaKm,
} from "../src/utils/comparador.ts";
import type { Produto, Coordenadas } from "../src/types/produto.ts";

describe("Comparador de Ofertas", () => {
  it("formatarMoeda deve retornar string com R$ e vírgula decimal", () => {
    const valor1 = formatarMoeda(10.5);
    assert.match(valor1, /^R\$\s*10,50$/);
    const valor2 = formatarMoeda(0);
    assert.match(valor2, /^R\$\s*0,00$/);
    const valor3 = formatarMoeda(1000);
    assert.match(valor3, /^R\$\s*1\.000,00$/);
  });

  it("calcularPrecoFinal retorna precoFinal explícito se válido", () => {
    const p: Pick<Produto, "preco" | "desconto" | "precoFinal"> = {
      preco: 100,
      desconto: 10,
      precoFinal: 90,
    };
    assert.strictEqual(calcularPrecoFinal(p), 90);
  });

  it("calcularPrecoFinal ignora precoFinal NaN e calcula via desconto", () => {
    const p: Pick<Produto, "preco" | "desconto" | "precoFinal"> = {
      preco: 100,
      desconto: 10,
      precoFinal: NaN,
    };
    assert.strictEqual(calcularPrecoFinal(p), 90);
  });

  it("calcularPrecoFinal trata desconto 0 ou negativo como sem desconto", () => {
    assert.strictEqual(calcularPrecoFinal({ preco: 100, desconto: 0 }), 100);
    assert.strictEqual(calcularPrecoFinal({ preco: 100, desconto: -5 }), 100);
  });

  it("gerarChaveComparacao prioriza codigoBarras com prefixo ean:", () => {
    const p: Pick<Produto, "nome" | "codigoBarras"> = {
      nome: "Arroz",
      codigoBarras: "1234567890123",
    };
    assert.strictEqual(gerarChaveComparacao(p), "ean:1234567890123");
  });

  it("gerarChaveComparacao normaliza nome sem acentos e pontuação", () => {
    const p: Pick<Produto, "nome" | "codigoBarras"> = {
      nome: "Café Torrado & Moído!",
      codigoBarras: undefined,
    };
    assert.strictEqual(gerarChaveComparacao(p), "cafe torrado moido");
  });

  it("obterIdProduto usa _id se existir", () => {
    const p: Produto = {
      _id: "123",
      nome: "Arroz",
      mercado: "Mercado A",
      categoria: "Alimentos",
      preco: 10,
    };
    assert.strictEqual(obterIdProduto(p), "123");
  });

  it("obterIdProduto usa fallback com chave e mercado", () => {
    const p: Produto = {
      _id: undefined,
      nome: "Arroz",
      mercado: "Mercado A",
      categoria: "Alimentos",
      preco: 10,
    };
    assert.strictEqual(obterIdProduto(p), "arroz::mercado a");
  });

  it("construirMapaComparacoes ignora produto em mercado único", () => {
    const produtos: Produto[] = [
      { nome: "Arroz", preco: 10, mercado: "A", codigoBarras: "111", categoria: "Alimentos" },
      { nome: "Arroz", preco: 12, mercado: "A", codigoBarras: "111", categoria: "Alimentos" },
    ];
    const mapa = construirMapaComparacoes(produtos);
    assert.strictEqual(mapa.size, 0);
  });

  it("construirMapaComparacoes agrupa mercados, ordena e calcula economia", () => {
    const produtos: Produto[] = [
      { nome: "Arroz", preco: 10, mercado: "A", codigoBarras: "111", categoria: "Alimentos" },
      { nome: "Arroz", preco: 8, mercado: "B", codigoBarras: "111", categoria: "Alimentos" },
      { nome: "Arroz", preco: 12, mercado: "C", codigoBarras: "111", categoria: "Alimentos" },
    ];
    const mapa = construirMapaComparacoes(produtos);
    const item = mapa.get("ean:111");
    assert.ok(item);
    assert.strictEqual(item?.menorPreco, 8);
    assert.strictEqual(item?.maiorPreco, 12);
    assert.strictEqual(item?.economiaMaxima, 4);
    assert.strictEqual(item?.mercadoMaisBarato, "B");
  });

  it("calcularDistanciaKm retorna 0 para mesmo ponto", () => {
    const origem: Coordenadas = { lat: -23.5505, lng: -46.6333 };
    const destino: Coordenadas = { lat: -23.5505, lng: -46.6333 };
    assert.strictEqual(calcularDistanciaKm(origem, destino), 0);
  });

  it("calcularDistanciaKm SP para RJ está entre 350 e 365 km", () => {
    const sp: Coordenadas = { lat: -23.5505, lng: -46.6333 };
    const rio: Coordenadas = { lat: -22.9068, lng: -43.1729 };
    const dist = calcularDistanciaKm(sp, rio);
    assert.ok(dist >= 350 && dist <= 365);
  });
});
