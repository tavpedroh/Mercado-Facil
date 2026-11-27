import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filtrarEOrdenarOfertas } from "../src/utils/filtrosOfertas.ts";
import type { Produto } from "../src/types/produto.ts";

function criarProduto(overrides: Partial<Produto> & { nome: string }): Produto {
  return {
    _id: overrides._id ?? overrides.nome.toLowerCase(),
    nome: overrides.nome,
    descricao: overrides.descricao ?? "Descrição padrão",
    marca: overrides.marca ?? "Marca X",
    unidade: overrides.unidade ?? "un",
    preco: overrides.preco ?? 10,
    desconto: overrides.desconto ?? 0,
    categoria: overrides.categoria ?? "Alimentos",
    mercado: overrides.mercado ?? "Mercado A",
    validadeOferta: overrides.validadeOferta,
    criadoEm: overrides.criadoEm,
  };
}

describe("F5.3 — Testes unitários de filtragem e ordenação avançada", () => {
  const agora = new Date(2026, 4, 10, 12, 0, 0);

  it("retorna array vazio para lista vazia e mantém todos sem critérios", () => {
    assert.deepStrictEqual(filtrarEOrdenarOfertas([], {}), []);
    const produtos = [
      criarProduto({ nome: "Açúcar" }),
      criarProduto({ nome: "Arroz" }),
    ];
    assert.deepStrictEqual(filtrarEOrdenarOfertas(produtos, {}), produtos);
  });

  it("realiza busca case-insensitive e sem acentos", () => {
    const acucar = criarProduto({ nome: "Açúcar Cristal" });
    const arroz = criarProduto({ nome: "Arroz Branco" });
    assert.deepStrictEqual(
      filtrarEOrdenarOfertas([acucar, arroz], { busca: "acucar" }),
      [acucar]
    );
  });

  it("filtra por categoria, mercado e apenasPromocoes", () => {
    const p1 = criarProduto({ nome: "Açúcar", categoria: "Culinária", mercado: "Mercado A", desconto: 0 });
    const p2 = criarProduto({ nome: "Leite", categoria: "Laticínios", mercado: "Mercado B", desconto: 15 });

    assert.deepStrictEqual(filtrarEOrdenarOfertas([p1, p2], { categoria: "Culinária" }), [p1]);
    assert.deepStrictEqual(filtrarEOrdenarOfertas([p1, p2], { mercado: "Mercado B" }), [p2]);
    assert.deepStrictEqual(filtrarEOrdenarOfertas([p1, p2], { apenasPromocoes: true }), [p2]);
  });

  it("filtra apenas ofertas ativas excluindo ofertas vencidas", () => {
    const vencido = criarProduto({
      nome: "Iogurte",
      validadeOferta: new Date(2026, 4, 1).toISOString(),
    });
    const ativo = criarProduto({
      nome: "Leite",
      validadeOferta: new Date(2026, 4, 20).toISOString(),
    });
    const semValidade = criarProduto({ nome: "Arroz" });

    assert.deepStrictEqual(
      filtrarEOrdenarOfertas([vencido, ativo, semValidade], { apenasAtivas: true }, agora),
      [ativo, semValidade]
    );
  });

  it("filtra apenas favoritos usando ReadonlySet de IDs", () => {
    const p1 = criarProduto({ _id: "fav-1", nome: "Açúcar" });
    const p2 = criarProduto({ _id: "fav-2", nome: "Leite" });

    assert.deepStrictEqual(
      filtrarEOrdenarOfertas([p1, p2], { apenasFavoritos: true, favoritosIds: new Set(["fav-1"]) }),
      [p1]
    );
  });

  it("filtra faixa de preço considerando precoFinal com desconto", () => {
    const p1 = criarProduto({ nome: "Caro", preco: 20, desconto: 0 }); // 20
    const p2 = criarProduto({ nome: "Promo", preco: 12, desconto: 25 }); // 9

    assert.deepStrictEqual(
      filtrarEOrdenarOfertas([p1, p2], { precoMin: 8, precoMax: 12 }),
      [p2]
    );
  });

  it("ordena por menor_preco, maior_desconto e nome_asc sem mutar o array original", () => {
    const p1 = criarProduto({ nome: "Zebra", preco: 20, desconto: 10 }); // 18
    const p2 = criarProduto({ nome: "Avestruz", preco: 10, desconto: 50 }); // 5
    const originais = [p1, p2];

    const porPreco = filtrarEOrdenarOfertas(originais, { ordenar: "menor_preco" });
    const porDesconto = filtrarEOrdenarOfertas(originais, { ordenar: "maior_desconto" });
    const porNome = filtrarEOrdenarOfertas(originais, { ordenar: "nome_asc" });

    assert.strictEqual(porPreco[0].nome, "Avestruz");
    assert.strictEqual(porDesconto[0].nome, "Avestruz");
    assert.strictEqual(porNome[0].nome, "Avestruz");
    assert.strictEqual(originais[0].nome, "Zebra");
  });
});
