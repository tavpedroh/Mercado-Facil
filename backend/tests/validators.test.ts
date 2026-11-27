import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { objectIdSchema, idParamSchema, escapeRegex } from "../src/validators/common";
import { criarCategoriaSchema, atualizarCategoriaSchema } from "../src/validators/categoriaValidator";
import {
  criarMercadoSchema,
  atualizarMercadoSchema,
  listarMercadosQuerySchema,
} from "../src/validators/mercadoValidator";
import {
  criarProdutoSchema,
  atualizarProdutoSchema,
  listarProdutosQuerySchema,
} from "../src/validators/produtoValidator";

describe("Validadores Zod e Utilitários", () => {
  describe("Comum", () => {
    it("objectIdSchema aceita ObjectId válido", () => {
      const result = objectIdSchema.safeParse("507f1f77bcf86cd799439011");
      assert.ok(result.success);
    });

    it("objectIdSchema rejeita ID curto", () => {
      const result = objectIdSchema.safeParse("507f1f77bcf86cd7");
      assert.ok(!result.success);
    });

    it("idParamSchema valida objeto com id", () => {
      const result = idParamSchema.safeParse({ id: "507f1f77bcf86cd799439011" });
      assert.ok(result.success);
    });

    it("escapeRegex escapa caracteres especiais", () => {
      assert.strictEqual(escapeRegex("test*"), "test\\*");
      assert.strictEqual(escapeRegex("$"), "\\$");
    });
  });

  describe("Categoria", () => {
    it("criarCategoriaSchema valida nome curto", () => {
      const result = criarCategoriaSchema.safeParse({ nome: "AB" });
      assert.ok(result.success);
    });

    it("criarCategoriaSchema rejeita nome muito curto", () => {
      const result = criarCategoriaSchema.safeParse({ nome: "A" });
      assert.ok(!result.success);
    });

    it("atualizarCategoriaSchema rejeita objeto vazio", () => {
      const result = atualizarCategoriaSchema.safeParse({});
      assert.ok(!result.success);
    });
  });

  describe("Mercado", () => {
    it("criarMercadoSchema valida coordenadas juntas", () => {
      const result = criarMercadoSchema.safeParse({
        nome: "Teste",
        coordenadas: { lat: -23.5, lng: -46.6 },
      });
      assert.ok(result.success);
    });

    it("criarMercadoSchema rejeita coordenadas separadas", () => {
      const result = criarMercadoSchema.safeParse({
        nome: "Teste",
        coordenadas: { lat: -23.5 },
      });
      assert.ok(!result.success);
    });

    it("criarMercadoSchema aceita logoUrl vazio", () => {
      const result = criarMercadoSchema.safeParse({ nome: "Teste", logoUrl: "" });
      assert.ok(result.success);
    });

    it("atualizarMercadoSchema rejeita objeto vazio", () => {
      const result = atualizarMercadoSchema.safeParse({});
      assert.ok(!result.success);
    });

    it("listarMercadosQuerySchema exige lat e lng juntos", () => {
      const result = listarMercadosQuerySchema.safeParse({ lat: -23.5 });
      assert.ok(!result.success);
    });
  });

  describe("Produto", () => {
    it("criarProdutoSchema exige mercado ou mercadoId", () => {
      const result = criarProdutoSchema.safeParse({
        nome: "Produto",
        categoria: "Cat",
        mercado: "Mercado A",
        preco: 10.5,
      });
      assert.ok(result.success);
    });

    it("criarProdutoSchema rejeita sem mercado nem mercadoId", () => {
      const result = criarProdutoSchema.safeParse({
        nome: "Produto",
        categoria: "Cat",
        preco: 10.5,
      });
      assert.ok(!result.success);
    });

    it("criarProdutoSchema valida codigoBarras", () => {
      const result = criarProdutoSchema.safeParse({
        nome: "Produto",
        categoria: "Cat",
        mercado: "Mercado A",
        codigoBarras: "12345678",
        preco: 10.5,
      });
      assert.ok(result.success);
    });

    it("criarProdutoSchema rejeita codigoBarras curto", () => {
      const result = criarProdutoSchema.safeParse({
        nome: "Produto",
        categoria: "Cat",
        mercado: "Mercado A",
        codigoBarras: "12345",
        preco: 10.5,
      });
      assert.ok(!result.success);
    });

    it("atualizarProdutoSchema rejeita objeto vazio", () => {
      const result = atualizarProdutoSchema.safeParse({});
      assert.ok(!result.success);
    });

    it("listarProdutosQuerySchema valida paginação", () => {
      const result = listarProdutosQuerySchema.safeParse({ page: 2, limit: 10 });
      assert.ok(result.success);
      assert.strictEqual(result.data.page, 2);
      assert.strictEqual(result.data.limit, 10);
    });

    it("listarProdutosQuerySchema valida ordenação", () => {
      const result = listarProdutosQuerySchema.safeParse({ ordenar: "menor_preco" });
      assert.ok(result.success);
      assert.strictEqual(result.data.ordenar, "menor_preco");
    });

    it("listarProdutosQuerySchema valida booleanQuerySchema", () => {
      const result = listarProdutosQuerySchema.safeParse({ apenasComDesconto: "true", ativos: "false" });
      assert.ok(result.success);
      assert.strictEqual(result.data.apenasComDesconto, true);
      assert.strictEqual(result.data.ativos, false);
    });

    it("listarProdutosQuerySchema valida defaults", () => {
      const result = listarProdutosQuerySchema.safeParse({});
      assert.ok(result.success);
      assert.strictEqual(result.data.ordenar, "recentes");
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 50);
    });

    it("criarProdutoSchema valida imagemUrl vazio", () => {
      const result = criarProdutoSchema.safeParse({
        nome: "Produto",
        categoria: "Cat",
        mercado: "Mercado A",
        imagemUrl: "",
        preco: 10.5,
      });
      assert.ok(result.success);
    });
  });
});
