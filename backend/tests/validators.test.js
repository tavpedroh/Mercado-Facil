"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const common_1 = require("../src/validators/common");
const categoriaValidator_1 = require("../src/validators/categoriaValidator");
const mercadoValidator_1 = require("../src/validators/mercadoValidator");
const produtoValidator_1 = require("../src/validators/produtoValidator");
(0, node_test_1.describe)("Validadores Zod e Utilitários", () => {
    (0, node_test_1.describe)("Comum", () => {
        (0, node_test_1.it)("objectIdSchema aceita ObjectId válido", () => {
            const result = common_1.objectIdSchema.safeParse("507f1f77bcf86cd799439011");
            strict_1.default.ok(result.success);
        });
        (0, node_test_1.it)("objectIdSchema rejeita ID curto", () => {
            const result = common_1.objectIdSchema.safeParse("507f1f77bcf86cd7");
            strict_1.default.ok(!result.success);
        });
        (0, node_test_1.it)("idParamSchema valida objeto com id", () => {
            const result = common_1.idParamSchema.safeParse({ id: "507f1f77bcf86cd799439011" });
            strict_1.default.ok(result.success);
        });
        (0, node_test_1.it)("escapeRegex escapa caracteres especiais", () => {
            strict_1.default.strictEqual((0, common_1.escapeRegex)("test*"), "test\\*");
            strict_1.default.strictEqual((0, common_1.escapeRegex)("$"), "\\$");
        });
    });
    (0, node_test_1.describe)("Categoria", () => {
        (0, node_test_1.it)("criarCategoriaSchema valida nome curto", () => {
            const result = categoriaValidator_1.criarCategoriaSchema.safeParse({ nome: "AB" });
            strict_1.default.ok(result.success);
        });
        (0, node_test_1.it)("criarCategoriaSchema rejeita nome muito curto", () => {
            const result = categoriaValidator_1.criarCategoriaSchema.safeParse({ nome: "A" });
            strict_1.default.ok(!result.success);
        });
        (0, node_test_1.it)("atualizarCategoriaSchema rejeita objeto vazio", () => {
            const result = categoriaValidator_1.atualizarCategoriaSchema.safeParse({});
            strict_1.default.ok(!result.success);
        });
    });
    (0, node_test_1.describe)("Mercado", () => {
        (0, node_test_1.it)("criarMercadoSchema valida coordenadas juntas", () => {
            const result = mercadoValidator_1.criarMercadoSchema.safeParse({
                nome: "Teste",
                coordenadas: { lat: -23.5, lng: -46.6 },
            });
            strict_1.default.ok(result.success);
        });
        (0, node_test_1.it)("criarMercadoSchema rejeita coordenadas separadas", () => {
            const result = mercadoValidator_1.criarMercadoSchema.safeParse({
                nome: "Teste",
                coordenadas: { lat: -23.5 },
            });
            strict_1.default.ok(!result.success);
        });
        (0, node_test_1.it)("criarMercadoSchema aceita logoUrl vazio", () => {
            const result = mercadoValidator_1.criarMercadoSchema.safeParse({ nome: "Teste", logoUrl: "" });
            strict_1.default.ok(result.success);
        });
        (0, node_test_1.it)("atualizarMercadoSchema rejeita objeto vazio", () => {
            const result = mercadoValidator_1.atualizarMercadoSchema.safeParse({});
            strict_1.default.ok(!result.success);
        });
        (0, node_test_1.it)("listarMercadosQuerySchema exige lat e lng juntos", () => {
            const result = mercadoValidator_1.listarMercadosQuerySchema.safeParse({ lat: -23.5 });
            strict_1.default.ok(!result.success);
        });
    });
    (0, node_test_1.describe)("Produto", () => {
        (0, node_test_1.it)("criarProdutoSchema exige mercado ou mercadoId", () => {
            const result = produtoValidator_1.criarProdutoSchema.safeParse({
                nome: "Produto",
                categoria: "Cat",
                mercado: "Mercado A",
                preco: 10.5,
            });
            strict_1.default.ok(result.success);
        });
        (0, node_test_1.it)("criarProdutoSchema rejeita sem mercado nem mercadoId", () => {
            const result = produtoValidator_1.criarProdutoSchema.safeParse({
                nome: "Produto",
                categoria: "Cat",
                preco: 10.5,
            });
            strict_1.default.ok(!result.success);
        });
        (0, node_test_1.it)("criarProdutoSchema valida codigoBarras", () => {
            const result = produtoValidator_1.criarProdutoSchema.safeParse({
                nome: "Produto",
                categoria: "Cat",
                mercado: "Mercado A",
                codigoBarras: "12345678",
                preco: 10.5,
            });
            strict_1.default.ok(result.success);
        });
        (0, node_test_1.it)("criarProdutoSchema rejeita codigoBarras curto", () => {
            const result = produtoValidator_1.criarProdutoSchema.safeParse({
                nome: "Produto",
                categoria: "Cat",
                mercado: "Mercado A",
                codigoBarras: "12345",
                preco: 10.5,
            });
            strict_1.default.ok(!result.success);
        });
        (0, node_test_1.it)("atualizarProdutoSchema rejeita objeto vazio", () => {
            const result = produtoValidator_1.atualizarProdutoSchema.safeParse({});
            strict_1.default.ok(!result.success);
        });
        (0, node_test_1.it)("listarProdutosQuerySchema valida paginação", () => {
            const result = produtoValidator_1.listarProdutosQuerySchema.safeParse({ page: 2, limit: 10 });
            strict_1.default.ok(result.success);
            strict_1.default.strictEqual(result.data.page, 2);
            strict_1.default.strictEqual(result.data.limit, 10);
        });
        (0, node_test_1.it)("listarProdutosQuerySchema valida ordenação", () => {
            const result = produtoValidator_1.listarProdutosQuerySchema.safeParse({ ordenar: "menor_preco" });
            strict_1.default.ok(result.success);
            strict_1.default.strictEqual(result.data.ordenar, "menor_preco");
        });
        (0, node_test_1.it)("listarProdutosQuerySchema valida booleanQuerySchema", () => {
            const result = produtoValidator_1.listarProdutosQuerySchema.safeParse({ apenasComDesconto: "true", ativos: "false" });
            strict_1.default.ok(result.success);
            strict_1.default.strictEqual(result.data.apenasComDesconto, true);
            strict_1.default.strictEqual(result.data.ativos, false);
        });
        (0, node_test_1.it)("listarProdutosQuerySchema valida defaults", () => {
            const result = produtoValidator_1.listarProdutosQuerySchema.safeParse({});
            strict_1.default.ok(result.success);
            strict_1.default.strictEqual(result.data.ordenar, "recentes");
            strict_1.default.strictEqual(result.data.page, 1);
            strict_1.default.strictEqual(result.data.limit, 50);
        });
        (0, node_test_1.it)("criarProdutoSchema valida imagemUrl vazio", () => {
            const result = produtoValidator_1.criarProdutoSchema.safeParse({
                nome: "Produto",
                categoria: "Cat",
                mercado: "Mercado A",
                imagemUrl: "",
                preco: 10.5,
            });
            strict_1.default.ok(result.success);
        });
    });
});
