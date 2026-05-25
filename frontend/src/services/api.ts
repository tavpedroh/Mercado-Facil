const API_URL = "http://localhost:3000";
import { ProdutoData } from "../types/index";

export const buscarCategorias = async (): Promise<string[]> => {
  try {
    const resposta = await fetch(`${API_URL}/categorias`);
    if (!resposta.ok) throw new Error("Falha ao obter categorias");
    const dados = await resposta.json();
    return dados.map((cat: any) => cat.nome);
  } catch (erro) {
    console.error("Erro logístico em categorias:", erro);
    return [];
  }
};

export const buscarMercados = async (): Promise<string[]> => {
  try {
    const resposta = await fetch(`${API_URL}/mercados`);
    if (!resposta.ok) throw new Error("Falha ao obter mercados");
    const dados = await resposta.json();
    return dados.map((merc: any) => merc.nome);
  } catch (erro) {
    console.error("Erro logístico em mercados:", erro);
    return [];
  }
};

export const buscarProdutos = async (): Promise<ProdutoData[]> => {
  try {
    const resposta = await fetch(`${API_URL}/produtos`);
    if (!resposta.ok) throw new Error("Falha ao obter produtos");
    return await resposta.json();
  } catch (erro) {
    console.error("Erro logístico em produtos:", erro);
    return [];
  }
};