import { describe, it, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  listarProdutos,
  cadastrarProduto,
  atualizarProduto,
  removerProduto,
  listarMercados,
  cadastrarMercado,
  listarCategorias,
  cadastrarCategoria,
} from "../src/services/api.ts";
import type {
  NovoProdutoPayload,
  NovoMercadoPayload,
  NovaCategoriaPayload,
} from "../src/types/produto.ts";

const mockFetch = async (url: string, init?: RequestInit): Promise<Response> => {
  const method = (init?.method ?? "GET").toUpperCase();
  const isJson = method === "POST" || method === "PATCH";
  const payload = isJson ? JSON.parse(init?.body as string) : null;

  if (url.includes("/produtos") && method === "GET") {
    const res = {
      dados: [{ _id: "1", nome: "Produto A", preco: 10, categoria: "cat1", mercado: "m1" }],
      paginacao: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
    };
    return new Response(JSON.stringify(res), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (url.includes("/produtos") && method === "POST") {
    return new Response(JSON.stringify(payload), { status: 201, headers: { "Content-Type": "application/json" } });
  }

  if (url.includes("/produtos") && method === "PATCH") {
    return new Response(JSON.stringify({ ...payload, _id: "1", nome: "Atualizado", preco: payload.preco }), { status: 200 });
  }

  if (url.includes("/produtos") && method === "DELETE") {
    return new Response(null, { status: 204 });
  }

  if (url.includes("/mercados") && method === "POST") {
    return new Response(JSON.stringify({ _id: "m2", nome: payload.nome }), { status: 201 });
  }

  if (url.includes("/categorias") && method === "POST") {
    return new Response(JSON.stringify({ _id: "c2", nome: payload.nome }), { status: 201 });
  }

  if (url.includes("/mercados") && method === "GET") {
    return new Response(JSON.stringify([{ _id: "m1", nome: "Mercado A" }]), { status: 200 });
  }

  if (url.includes("/categorias") && method === "GET") {
    return new Response(JSON.stringify([{ _id: "c1", nome: "Categoria A" }]), { status: 200 });
  }

  return new Response(JSON.stringify({ erro: "Not Found" }), { status: 404 });
};

const originalFetch = globalThis.fetch;

describe("API Client Tests", () => {
  beforeEach(() => {
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("listarProdutos retorna array direto quando não há paginação", async () => {
    const res = await listarProdutos();
    assert.ok(Array.isArray(res));
    assert.strictEqual(res.length, 1);
  });

  it("listarProdutos retorna array extraído de objeto paginado", async () => {
    const res = await listarProdutos({ page: 1, limit: 10 });
    assert.ok(Array.isArray(res));
    assert.strictEqual(res.length, 1);
  });

  it("listarProdutos ignora parâmetros vazios na query string", async () => {
    const res = await listarProdutos({ busca: "", categoria: undefined });
    assert.ok(Array.isArray(res));
  });

  it("cadastrarProduto retorna o produto criado com status 201", async () => {
    const payload: NovoProdutoPayload = { nome: "Teste", preco: 50, categoria: "cat1", mercado: "m1" };
    const res = await cadastrarProduto(payload);
    assert.strictEqual(res.nome, "Teste");
    assert.strictEqual(res.preco, 50);
  });

  it("atualizarProduto retorna o produto atualizado", async () => {
    const payload = { preco: 100 };
    const res = await atualizarProduto("1", payload);
    assert.strictEqual(res.preco, 100);
    assert.strictEqual(res.nome, "Atualizado");
  });

  it("removerProduto retorna void sem corpo e sem erro", async () => {
    await removerProduto("1");
    assert.ok(true);
  });

  it("listarMercados retorna array de mercados", async () => {
    const res = await listarMercados();
    assert.ok(Array.isArray(res));
    assert.strictEqual(res.length, 1);
  });

  it("cadastrarMercado retorna o mercado criado", async () => {
    const payload: NovoMercadoPayload = { nome: "Mercado X" };
    const res = await cadastrarMercado(payload);
    assert.strictEqual(res.nome, "Mercado X");
  });

  it("listarCategorias retorna array de categorias", async () => {
    const res = await listarCategorias();
    assert.ok(Array.isArray(res));
    assert.strictEqual(res.length, 1);
  });

  it("cadastrarCategoria retorna a categoria criada", async () => {
    const payload: NovaCategoriaPayload = { nome: "Cat X" };
    const res = await cadastrarCategoria(payload);
    assert.strictEqual(res.nome, "Cat X");
  });

  it("Trata erro de resposta não JSON com fallback HTTP status", async () => {
    globalThis.fetch = async () => new Response("Not JSON", { status: 500 });
    await assert.rejects(
      () => listarProdutos(),
      (err: Error) => {
        assert.ok(err.message.includes("HTTP 500"));
        return true;
      }
    );
  });

  it("Trata erro de API com detalhes formatados", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ erro: "Erro", detalhes: [{ campo: "preco", mensagem: "Inválido" }] }), { status: 400 });
    await assert.rejects(
      () => cadastrarProduto({ nome: "X", preco: 0, categoria: "cat1", mercado: "m1" }),
      (err: Error) => {
        assert.ok(err.message.includes("preco: Inválido"));
        return true;
      }
    );
  });
});
