"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const Mercado_1 = __importDefault(require("../src/models/Mercado"));
const Produto_1 = __importDefault(require("../src/models/Produto"));
const Categorias_1 = __importDefault(require("../src/models/Categorias"));
const mercadoController_1 = require("../src/controllers/mercadoController");
const categoriaController_1 = require("../src/controllers/categoriaController");
const produtoController_1 = require("../src/controllers/produtoController");
const errorHandler_1 = require("../src/middlewares/errorHandler");
function criarMockRes() {
    let statusCode = 200;
    let responseBody = undefined;
    let enviado = false;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            responseBody = body;
            enviado = true;
            return this;
        },
        send() {
            enviado = true;
            return this;
        },
    };
    return {
        res,
        getStatus: () => statusCode,
        getBody: () => responseBody,
        foiEnviado: () => enviado,
    };
}
function criarMockNext() {
    let capturedError = null;
    const next = (err) => {
        capturedError = err ?? null;
    };
    return { next, getError: () => capturedError };
}
(0, node_test_1.describe)("Testes de Regras de Negócio - Controllers", () => {
    (0, node_test_1.afterEach)(() => {
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.describe)("MercadoController", () => {
        (0, node_test_1.it)("removerMercado deve encaminhar AppError 404 quando o mercado não existe", async () => {
            const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "findById", async () => null);
            await (0, mercadoController_1.removerMercado)(req, mockRes.res, next);
            const err = getError();
            strict_1.default.ok(err instanceof errorHandler_1.AppError);
            strict_1.default.strictEqual(err.statusCode, 404);
        });
        (0, node_test_1.it)("removerMercado deve encaminhar AppError 409 quando há produtos vinculados", async () => {
            const mercadoMock = { _id: "507f1f77bcf86cd799439011", nome: "Mercado A" };
            const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "findById", async () => mercadoMock);
            node_test_1.mock.method(Produto_1.default, "countDocuments", async () => 5);
            await (0, mercadoController_1.removerMercado)(req, mockRes.res, next);
            const err = getError();
            strict_1.default.ok(err instanceof errorHandler_1.AppError);
            strict_1.default.strictEqual(err.statusCode, 409);
        });
        (0, node_test_1.it)("removerMercado deve remover e responder 204 quando não há produtos vinculados", async () => {
            let deletado = false;
            const mercadoMock = {
                _id: "507f1f77bcf86cd799439011",
                nome: "Mercado A",
                deleteOne: async () => {
                    deletado = true;
                },
            };
            const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "findById", async () => mercadoMock);
            node_test_1.mock.method(Produto_1.default, "countDocuments", async () => 0);
            await (0, mercadoController_1.removerMercado)(req, mockRes.res, next);
            strict_1.default.strictEqual(getError(), null);
            strict_1.default.ok(deletado);
            strict_1.default.strictEqual(mockRes.getStatus(), 204);
            strict_1.default.ok(mockRes.foiEnviado());
        });
        (0, node_test_1.it)("atualizarMercado deve sincronizar nome nos produtos vinculados", async () => {
            const mercadoAtualizado = { _id: "507f1f77bcf86cd799439011", nome: "Mercado Novo" };
            const req = {
                validated: {
                    params: { id: "507f1f77bcf86cd799439011" },
                    body: { nome: "Mercado Novo" },
                },
            };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "findByIdAndUpdate", async () => mercadoAtualizado);
            const updateManyMock = node_test_1.mock.method(Produto_1.default, "updateMany", async () => ({ modifiedCount: 2 }));
            await (0, mercadoController_1.atualizarMercado)(req, mockRes.res, next);
            strict_1.default.strictEqual(getError(), null);
            strict_1.default.strictEqual(updateManyMock.mock.callCount(), 1);
            strict_1.default.deepStrictEqual(mockRes.getBody(), mercadoAtualizado);
        });
        (0, node_test_1.it)("atualizarMercado deve encaminhar AppError 404 quando mercado não encontrado", async () => {
            const req = {
                validated: {
                    params: { id: "507f1f77bcf86cd799439011" },
                    body: { nome: "Mercado Novo" },
                },
            };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "findByIdAndUpdate", async () => null);
            await (0, mercadoController_1.atualizarMercado)(req, mockRes.res, next);
            const err = getError();
            strict_1.default.ok(err instanceof errorHandler_1.AppError);
            strict_1.default.strictEqual(err.statusCode, 404);
        });
        (0, node_test_1.it)("buscarMercadoPorId deve encaminhar AppError 404 quando mercado não existe", async () => {
            const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "findById", async () => null);
            await (0, mercadoController_1.buscarMercadoPorId)(req, mockRes.res, next);
            const err = getError();
            strict_1.default.ok(err instanceof errorHandler_1.AppError);
            strict_1.default.strictEqual(err.statusCode, 404);
        });
        (0, node_test_1.it)("criarMercado deve retornar 201 ao criar um novo mercado", async () => {
            const criado = { _id: "507f1f77bcf86cd799439011", nome: "Novo Mercado" };
            const req = {
                validated: { body: { nome: "Novo Mercado", coordenadas: { lat: -23.55, lng: -46.63 } } },
            };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "create", async () => criado);
            await (0, mercadoController_1.criarMercado)(req, mockRes.res, next);
            strict_1.default.strictEqual(getError(), null);
            strict_1.default.strictEqual(mockRes.getStatus(), 201);
            strict_1.default.deepStrictEqual(mockRes.getBody(), criado);
        });
        (0, node_test_1.it)("listarMercados deve retornar lista de mercados ordenada", async () => {
            const lista = [{ _id: "1", nome: "Mercado A" }];
            const req = { validated: { query: {} } };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "find", () => ({ sort() { return this; }, exec: async () => lista }));
            await (0, mercadoController_1.listarMercados)(req, mockRes.res, next);
            strict_1.default.strictEqual(getError(), null);
            strict_1.default.deepStrictEqual(mockRes.getBody(), lista);
        });
    });
    (0, node_test_1.describe)("CategoriaController", () => {
        (0, node_test_1.it)("buscarCategoriaPorId deve encaminhar AppError 404 quando categoria não existe", async () => {
            const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Categorias_1.default, "findById", async () => null);
            await (0, categoriaController_1.buscarCategoriaPorId)(req, mockRes.res, next);
            const err = getError();
            strict_1.default.ok(err instanceof errorHandler_1.AppError);
            strict_1.default.strictEqual(err.statusCode, 404);
        });
        (0, node_test_1.it)("removerCategoria deve retornar 204 ao remover categoria existente", async () => {
            const req = { validated: { params: { id: "507f1f77bcf86cd799439011" } } };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Categorias_1.default, "findByIdAndDelete", async () => ({ _id: "id1", nome: "Bebidas" }));
            await (0, categoriaController_1.removerCategoria)(req, mockRes.res, next);
            strict_1.default.strictEqual(getError(), null);
            strict_1.default.strictEqual(mockRes.getStatus(), 204);
        });
        (0, node_test_1.it)("listarCategorias deve retornar a lista ordenada", async () => {
            const lista = [{ _id: "1", nome: "Alimentos" }];
            const req = {};
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Categorias_1.default, "find", () => ({ sort: async () => lista }));
            await (0, categoriaController_1.listarCategorias)(req, mockRes.res, next);
            strict_1.default.strictEqual(getError(), null);
            strict_1.default.deepStrictEqual(mockRes.getBody(), lista);
        });
    });
    (0, node_test_1.describe)("ProdutoController", () => {
        (0, node_test_1.it)("criarProduto deve encaminhar AppError 404 se o mercadoId informado não existe", async () => {
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
            };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "findById", async () => null);
            await (0, produtoController_1.criarProduto)(req, mockRes.res, next);
            const err = getError();
            strict_1.default.ok(err instanceof errorHandler_1.AppError);
            strict_1.default.strictEqual(err.statusCode, 404);
        });
        (0, node_test_1.it)("criarProduto deve retornar 201 ao criar produto resolvendo mercado por nome", async () => {
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
            };
            const mockRes = criarMockRes();
            const { next, getError } = criarMockNext();
            node_test_1.mock.method(Mercado_1.default, "findOne", async () => ({ _id: "507f1f77bcf86cd799439011", nome: "Mercado Nome" }));
            node_test_1.mock.method(Produto_1.default, "create", async () => criado);
            await (0, produtoController_1.criarProduto)(req, mockRes.res, next);
            strict_1.default.strictEqual(getError(), null);
            strict_1.default.strictEqual(mockRes.getStatus(), 201);
            strict_1.default.deepStrictEqual(mockRes.getBody(), criado);
        });
    });
});
