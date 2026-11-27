"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const validate_1 = require("../src/middlewares/validate");
const errorHandler_1 = require("../src/middlewares/errorHandler");
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
function criarMockRes() {
    let statusCode = 200;
    let jsonBody;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            jsonBody = body;
            return this;
        },
    };
    return { res, getStatus: () => statusCode, getBody: () => jsonBody };
}
(0, node_test_1.describe)("Middlewares", () => {
    (0, node_test_1.afterEach)(() => node_test_1.mock.restoreAll());
    (0, node_test_1.describe)("validate", () => {
        (0, node_test_1.it)("deve atualizar req.body e req.validated.body com sucesso", () => {
            const schema = zod_1.z.object({ nome: zod_1.z.string().trim() });
            const req = { body: { nome: "  João  " } };
            const res = {};
            let nextErro = "nao-chamado";
            const next = (err) => {
                nextErro = err;
            };
            (0, validate_1.validate)(schema, "body")(req, res, next);
            strict_1.default.strictEqual(nextErro, undefined);
            strict_1.default.strictEqual(req.body.nome, "João");
            strict_1.default.strictEqual((req.validated?.body).nome, "João");
        });
        (0, node_test_1.it)("deve passar erro Zod para o próximo quando o body é inválido", () => {
            const schema = zod_1.z.object({ idade: zod_1.z.number() });
            const req = { body: { idade: "não é número" } };
            const res = {};
            let erroCapturado;
            const next = (err) => {
                erroCapturado = err;
            };
            (0, validate_1.validate)(schema, "body")(req, res, next);
            strict_1.default.ok(erroCapturado instanceof zod_1.ZodError);
        });
        (0, node_test_1.it)("deve atualizar req.validated.query com sucesso", () => {
            const schema = zod_1.z.object({ pagina: zod_1.z.coerce.number() });
            const req = { query: { pagina: "2" } };
            const res = {};
            let chamado = false;
            const next = (err) => {
                strict_1.default.strictEqual(err, undefined);
                chamado = true;
            };
            (0, validate_1.validate)(schema, "query")(req, res, next);
            strict_1.default.ok(chamado);
            strict_1.default.strictEqual((req.validated?.query).pagina, 2);
        });
        (0, node_test_1.it)("deve atualizar req.validated.params com sucesso", () => {
            const schema = zod_1.z.object({ id: zod_1.z.string() });
            const req = { params: { id: "123" } };
            const res = {};
            let chamado = false;
            const next = (err) => {
                strict_1.default.strictEqual(err, undefined);
                chamado = true;
            };
            (0, validate_1.validate)(schema, "params")(req, res, next);
            strict_1.default.ok(chamado);
            strict_1.default.strictEqual((req.validated?.params).id, "123");
        });
        (0, node_test_1.it)("deve passar erro Zod para o próximo quando os params são inválidos", () => {
            const schema = zod_1.z.object({ id: zod_1.z.string() });
            const req = { params: { id: 123 } };
            const res = {};
            let erroCapturado;
            const next = (err) => {
                erroCapturado = err;
            };
            (0, validate_1.validate)(schema, "params")(req, res, next);
            strict_1.default.ok(erroCapturado instanceof zod_1.ZodError);
        });
    });
    (0, node_test_1.describe)("notFoundHandler", () => {
        (0, node_test_1.it)("deve retornar status 404 e mensagem com método e URL", () => {
            const req = { method: "GET", originalUrl: "/usuarios/1" };
            const mockRes = criarMockRes();
            (0, errorHandler_1.notFoundHandler)(req, mockRes.res);
            strict_1.default.strictEqual(mockRes.getStatus(), 404);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "Rota não encontrada: GET /usuarios/1");
        });
    });
    (0, node_test_1.describe)("errorHandler", () => {
        const req = {};
        const noopNext = () => { };
        (0, node_test_1.it)("deve retornar AppError com status e detalhes", () => {
            const mockRes = criarMockRes();
            const err = new errorHandler_1.AppError("Erro customizado", 404, { motivo: "não encontrado" });
            (0, errorHandler_1.errorHandler)(err, req, mockRes.res, noopNext);
            strict_1.default.strictEqual(mockRes.getStatus(), 404);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "Erro customizado");
            strict_1.default.deepStrictEqual(mockRes.getBody()?.detalhes, { motivo: "não encontrado" });
        });
        (0, node_test_1.it)("deve retornar AppError sem detalhes", () => {
            const mockRes = criarMockRes();
            const err = new errorHandler_1.AppError("Erro genérico", 400);
            (0, errorHandler_1.errorHandler)(err, req, mockRes.res, noopNext);
            strict_1.default.strictEqual(mockRes.getStatus(), 400);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "Erro genérico");
            strict_1.default.strictEqual(mockRes.getBody()?.detalhes, undefined);
        });
        (0, node_test_1.it)("deve retornar ZodError com status 400 e lista de issues", () => {
            const mockRes = criarMockRes();
            const parsed = zod_1.z.object({ nome: zod_1.z.string() }).safeParse({});
            strict_1.default.ok(!parsed.success);
            (0, errorHandler_1.errorHandler)(parsed.error, req, mockRes.res, noopNext);
            strict_1.default.strictEqual(mockRes.getStatus(), 400);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "Dados inválidos.");
            const detalhes = mockRes.getBody()?.detalhes;
            strict_1.default.strictEqual(detalhes[0].campo, "nome");
            strict_1.default.ok(detalhes[0].mensagem.length > 0);
        });
        (0, node_test_1.it)("deve retornar mongoose.Error.ValidationError com status 400", () => {
            const mockRes = criarMockRes();
            const err = new mongoose_1.default.Error.ValidationError();
            err.addError("nome", new mongoose_1.default.Error.ValidatorError({ path: "nome", message: "Nome inválido" }));
            (0, errorHandler_1.errorHandler)(err, req, mockRes.res, noopNext);
            strict_1.default.strictEqual(mockRes.getStatus(), 400);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "Erro de validação nos dados.");
            const detalhes = mockRes.getBody()?.detalhes;
            strict_1.default.strictEqual(detalhes[0].campo, "nome");
        });
        (0, node_test_1.it)("deve retornar mongoose.Error.CastError com status 400", () => {
            const mockRes = criarMockRes();
            const err = new mongoose_1.default.Error.CastError("ObjectId", "abc", "id");
            (0, errorHandler_1.errorHandler)(err, req, mockRes.res, noopNext);
            strict_1.default.strictEqual(mockRes.getStatus(), 400);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "Valor inválido para o campo 'id'.");
        });
        (0, node_test_1.it)("deve retornar erro Mongo 11000 com status 409", () => {
            const mockRes = criarMockRes();
            const err = { code: 11000, keyValue: { email: "test@example.com" } };
            (0, errorHandler_1.errorHandler)(err, req, mockRes.res, noopNext);
            strict_1.default.strictEqual(mockRes.getStatus(), 409);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "Já existe um registro cadastrado com este valor em 'email'.");
        });
        (0, node_test_1.it)("deve retornar SyntaxError com body como JSON malformado", () => {
            const mockRes = criarMockRes();
            const err = Object.assign(new SyntaxError("Unexpected token"), { body: '{"invalid": }' });
            (0, errorHandler_1.errorHandler)(err, req, mockRes.res, noopNext);
            strict_1.default.strictEqual(mockRes.getStatus(), 400);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "JSON malformado no corpo da requisição.");
        });
        (0, node_test_1.it)("deve retornar erro genérico com status 500", () => {
            const mockRes = criarMockRes();
            node_test_1.mock.method(console, "error", () => { });
            const err = new Error("Falha interna");
            (0, errorHandler_1.errorHandler)(err, req, mockRes.res, noopNext);
            strict_1.default.strictEqual(mockRes.getStatus(), 500);
            strict_1.default.strictEqual(mockRes.getBody()?.erro, "Erro interno do servidor.");
        });
    });
});
